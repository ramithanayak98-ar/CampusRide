
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("campusride_token")?.value;
    const secret = process.env.SESSION_SECRET;

    if (!token || !secret) return false;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const userId = Number(payload.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return false;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT role FROM users WHERE user_id = ?",
      [userId]
    );

    return rows.length > 0 && rows[0].role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access only." },
        { status: 403 }
      );
    }

    const [bookings] = await pool.execute<RowDataPacket[]>(
      `SELECT
        b.booking_id,
        b.ride_id,
        b.seats_requested,
        b.booking_status,
        b.booked_at,

        passenger.user_id AS passenger_id,
        passenger.full_name AS passenger_name,
        passenger.email AS passenger_email,

        driver.user_id AS driver_id,
        driver.full_name AS driver_name,
        driver.email AS driver_email,

        r.pickup_location,
        r.destination,
        r.departure_time,
        r.cost_per_seat,

        v.vehicle_type,
        v.vehicle_number

      FROM bookings b

      JOIN rides r
        ON b.ride_id = r.ride_id

      JOIN users passenger
        ON b.passenger_id = passenger.user_id

      JOIN users driver
        ON r.driver_id = driver.user_id

      JOIN vehicles v
        ON r.vehicle_id = v.vehicle_id

      ORDER BY b.booked_at DESC`
    );

    return NextResponse.json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error("Admin bookings API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch bookings." },
      { status: 500 }
    );
  }
}
