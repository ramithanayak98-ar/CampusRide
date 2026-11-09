
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  let connection;

  try {
    // Check whether the student is logged in
    const cookieStore = await cookies();
    const token = cookieStore.get("campusride_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      throw new Error("SESSION_SECRET is missing.");
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const driverId = Number(payload.userId);

    if (!Number.isInteger(driverId) || driverId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid login session." },
        { status: 401 }
      );
    }

    // Read ride details
    const body = await request.json();

    const {
      pickup_location,
      destination,
      departure_date,
      departure_time,
      vehicle_type,
      vehicle_number,
      total_seats,
      cost_per_seat,
    } = body;

    if (
      !pickup_location?.trim() ||
      !destination?.trim() ||
      !departure_date ||
      !departure_time ||
      !vehicle_type ||
      !vehicle_number?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const seats = Number(total_seats);
    const cost = Number(cost_per_seat);

    if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
      return NextResponse.json(
        { success: false, message: "Seats must be between 1 and 8." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(cost) || cost < 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid cost per seat." },
        { status: 400 }
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(departure_date) ||
      !/^\d{2}:\d{2}$/.test(departure_time)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid departure date or time." },
        { status: 400 }
      );
    }

    const departureDateTime = `${departure_date} ${departure_time}:00`;

    // Connect to MySQL and start a transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check whether the vehicle already exists
    const [vehicleRows] = await connection.execute(
      `SELECT vehicle_id, owner_id
       FROM vehicles
       WHERE vehicle_number = ?`,
      [vehicle_number.trim().toUpperCase()]
    );

    const vehicles = vehicleRows as {
      vehicle_id: number;
      owner_id: number;
    }[];

    let vehicleId: number;

    if (vehicles.length > 0) {
      if (vehicles[0].owner_id !== driverId) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "This vehicle number is already registered to another user.",
          },
          { status: 409 }
        );
      }

      vehicleId = vehicles[0].vehicle_id;
    } else {
      const [vehicleResult] = await connection.execute(
        `INSERT INTO vehicles
         (owner_id, vehicle_number, vehicle_type, seat_capacity)
         VALUES (?, ?, ?, ?)`,
        [
          driverId,
          vehicle_number.trim().toUpperCase(),
          vehicle_type,
          seats,
        ]
      );

      vehicleId = (vehicleResult as ResultSetHeader).insertId;
    }

    // Save the ride
    const [rideResult] = await connection.execute(
      `INSERT INTO rides
       (
         driver_id,
         vehicle_id,
         pickup_location,
         destination,
         departure_time,
         total_seats,
         available_seats,
         cost_per_seat
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        driverId,
        vehicleId,
        pickup_location.trim(),
        destination.trim(),
        departureDateTime,
        seats,
        seats,
        cost,
      ]
    );

    const rideId = (rideResult as ResultSetHeader).insertId;

    await connection.commit();

    // Record ride activity in MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("campusride");

      await db.collection("activities").insertOne({
        userId: driverId,
        type: "ride_offered",
        description: "Offered a new ride",
        metadata: {
          rideId: Number(rideId),
          pickupLocation: pickup_location.trim(),
          destination: destination.trim(),
        },
        createdAt: new Date(),
      });
    } catch (mongoError) {
      console.error("Ride activity logging failed:", mongoError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ride published successfully!",
        rideId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Publish ride error:", error);

    return NextResponse.json(
      { success: false, message: "Could not publish ride. Please try again." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
