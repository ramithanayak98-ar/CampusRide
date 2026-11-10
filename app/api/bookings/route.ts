
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import clientPromise from "@/lib/mongodb";
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campusride_token")?.value;

  if (!token || !process.env.SESSION_SECRET) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = Number(payload.userId);

    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

// GET: Display the logged-in student's bookings
export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const [bookings] = await pool.execute<RowDataPacket[]>(
      `SELECT
        b.booking_id,
        b.seats_requested,
        b.booking_status,
        b.booked_at,
        r.pickup_location,
        r.destination,
        r.departure_time,
        r.cost_per_seat,
        u.full_name AS driver_name,
        v.vehicle_type,
        v.vehicle_number
      FROM bookings b
      JOIN rides r ON b.ride_id = r.ride_id
      JOIN users u ON r.driver_id = u.user_id
      JOIN vehicles v ON r.vehicle_id = v.vehicle_id
      WHERE b.passenger_id = ?
      ORDER BY b.booked_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load bookings." },
      { status: 500 }
    );
  }
}

// POST: Book seats on a ride
export async function POST(request: NextRequest) {
  let connection;
  let transactionStarted = false;

  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const rideId = Number(body.rideId);
    const seats = Number(body.seats);

    if (
      !Number.isInteger(rideId) ||
      rideId <= 0 ||
      !Number.isInteger(seats) ||
      seats < 1 ||
      seats > 8
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ride or seat count." },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [rideRows] = await connection.execute<RowDataPacket[]>(
      `SELECT ride_id, driver_id, available_seats, status, departure_time
       FROM rides
       WHERE ride_id = ?
       FOR UPDATE`,
      [rideId]
    );

    if (rideRows.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Ride not found." },
        { status: 404 }
      );
    }

    const ride = rideRows[0];

    if (Number(ride.driver_id) === userId) {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "You cannot book your own ride." },
        { status: 400 }
      );
    }

    if (
      ride.status !== "available" ||
      Number(ride.available_seats) < seats ||
      new Date(ride.departure_time).getTime() <= Date.now()
    ) {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Ride is unavailable or has insufficient seats.",
        },
        { status: 400 }
      );
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO bookings
       (ride_id, passenger_id, seats_requested, booking_status)
       VALUES (?, ?, ?, 'confirmed')`,
      [rideId, userId, seats]
    );

    const remainingSeats = Number(ride.available_seats) - seats;
    const newStatus = remainingSeats === 0 ? "full" : "available";

    await connection.execute(
      `UPDATE rides
       SET available_seats = ?, status = ?
       WHERE ride_id = ?`,
      [remainingSeats, newStatus, rideId]
    );

    await connection.commit();
    transactionStarted = false;

    // Record booking activity in MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("campusride");

      await db.collection("activities").insertOne({
        userId,
        type: "ride_booked",
        description: "Booked a ride",
        metadata: {
          rideId,
          bookingId: Number(result.insertId),
          seatsRequested: seats,
        },
        createdAt: new Date(),
      });
    } catch (mongoError) {
      console.error("Booking activity logging failed:", mongoError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ride booked successfully!",
        bookingId: result.insertId,
        remainingSeats,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }

    console.error("Create booking error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to complete booking." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}

// PATCH: Cancel a booking and return seats to the ride
export async function PATCH(request: NextRequest) {
  let connection;
  let transactionStarted = false;

  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const bookingId = Number(body.bookingId);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID." },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // Find and lock the passenger's booking
    const [bookingRows] = await connection.execute<RowDataPacket[]>(
      `SELECT booking_id, ride_id, seats_requested, booking_status
       FROM bookings
       WHERE booking_id = ? AND passenger_id = ?
       FOR UPDATE`,
      [bookingId, userId]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const booking = bookingRows[0];

    if (booking.booking_status !== "confirmed") {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "This booking is already cancelled." },
        { status: 400 }
      );
    }

    // Lock the corresponding ride
    const [rideRows] = await connection.execute<RowDataPacket[]>(
      `SELECT ride_id, total_seats, available_seats, status, departure_time
       FROM rides
       WHERE ride_id = ?
       FOR UPDATE`,
      [booking.ride_id]
    );

    if (rideRows.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Ride not found." },
        { status: 404 }
      );
    }

    const ride = rideRows[0];

    if (
      new Date(ride.departure_time).getTime() <= Date.now()
    ) {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "You cannot cancel after departure." },
        { status: 400 }
      );
    }

    if (ride.status !== "available" && ride.status !== "full") {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "This ride can no longer be changed." },
        { status: 400 }
      );
    }

    // Mark booking as cancelled
    await connection.execute(
      `UPDATE bookings
       SET booking_status = 'cancelled'
       WHERE booking_id = ?`,
      [bookingId]
    );

    // Return the booked seats
    const restoredSeats = Math.min(
      Number(ride.total_seats),
      Number(ride.available_seats) + Number(booking.seats_requested)
    );

    await connection.execute(
      `UPDATE rides
       SET available_seats = ?, status = 'available'
       WHERE ride_id = ?`,
      [restoredSeats, ride.ride_id]
    );

    await connection.commit();
    transactionStarted = false;

    // Record cancellation activity in MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("campusride");

      await db.collection("activities").insertOne({
        userId,
        type: "booking_cancelled",
        description: "Cancelled a booking",
        metadata: {
          rideId: Number(booking.ride_id),
          bookingId,
        },
        createdAt: new Date(),
      });
    } catch (mongoError) {
      console.error("Cancellation activity logging failed:", mongoError);
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully!",
      restoredSeats,
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }

    console.error("Cancel booking error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to cancel booking." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
