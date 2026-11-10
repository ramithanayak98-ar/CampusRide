
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

    const [rides] = await pool.execute<RowDataPacket[]>(
      `SELECT
        r.ride_id,
        r.driver_id,
        u.full_name AS driver_name,
        u.email AS driver_email,
        r.pickup_location,
        r.destination,
        r.departure_time,
        r.total_seats,
        r.available_seats,
        r.cost_per_seat,
        r.status,
        v.vehicle_type,
        v.vehicle_number
      FROM rides r
      JOIN users u ON r.driver_id = u.user_id
      JOIN vehicles v ON r.vehicle_id = v.vehicle_id
      ORDER BY r.departure_time DESC`
    );

    return NextResponse.json({
      success: true,
      totalRides: rides.length,
      rides,
    });

  } catch (error) {
    console.error("Admin rides API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch rides." },
      { status: 500 }
    );
  }
}
