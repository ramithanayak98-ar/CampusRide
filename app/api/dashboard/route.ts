
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("campusride_token")?.value;

    if (!token || !process.env.SESSION_SECRET) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET)
    );

    const userId = Number(payload.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid user session." },
        { status: 401 }
      );
    }

    // Personal ride and booking statistics
    const [statsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM rides
         WHERE driver_id = ?) AS totalRides,

        (SELECT COUNT(*) FROM bookings
         WHERE passenger_id = ?) AS totalBookings,

        (SELECT COUNT(*) FROM bookings
         WHERE passenger_id = ?
         AND booking_status = 'confirmed') AS confirmedBookings,

        (SELECT COUNT(*) FROM bookings
         WHERE passenger_id = ?
         AND booking_status = 'cancelled') AS cancelledBookings`,
      [userId, userId, userId, userId]
    );

    // Monthly booking trends for the last six months
    const [monthlyRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        DATE_FORMAT(booked_at, '%Y-%m') AS monthKey,
        DATE_FORMAT(booked_at, '%b %Y') AS month,
        COUNT(*) AS total
       FROM bookings
       WHERE passenger_id = ?
       AND booked_at >= DATE_SUB(
         CURDATE(), INTERVAL 5 MONTH
       )
       GROUP BY monthKey, month
       ORDER BY monthKey ASC`,
      [userId]
    );

    // Most frequently booked routes by this student
    const [routeRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        r.pickup_location,
        r.destination,
        COUNT(*) AS totalBookings
       FROM bookings b
       JOIN rides r ON b.ride_id = r.ride_id
       WHERE b.passenger_id = ?
       GROUP BY r.pickup_location, r.destination
       ORDER BY totalBookings DESC
       LIMIT 5`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      stats: statsRows[0],
      monthlyBookings: monthlyRows,
      popularRoutes: routeRows,
    });

  } catch (error) {
    console.error("Dashboard analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard analytics.",
      },
      { status: 500 }
    );
  }
}
