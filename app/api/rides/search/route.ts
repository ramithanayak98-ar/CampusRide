import { connection } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);

    const pickup = searchParams.get("pickup")?.trim();
    const destination = searchParams.get("destination")?.trim();
    const date = searchParams.get("date");

    if (!pickup || !destination || !date) {
      return NextResponse.json(
        { success: false, message: "Please provide all search details." },
        { status: 400 }
      );
    }

    const [rides] = await pool.execute(
      `SELECT
        r.ride_id,
        r.pickup_location,
        r.destination,
        r.departure_time,
        r.total_seats,
        r.available_seats,
        r.cost_per_seat,
        r.status,
        u.full_name AS driver_name,
        v.vehicle_type,
        v.vehicle_number
      FROM rides r
      JOIN users u ON r.driver_id = u.user_id
      JOIN vehicles v ON r.vehicle_id = v.vehicle_id
      WHERE LOWER(r.pickup_location) LIKE LOWER(?)
        AND LOWER(r.destination) LIKE LOWER(?)
        AND DATE(r.departure_time) = ?
        AND r.status = 'available'
        AND r.available_seats > 0
        AND r.departure_time >= NOW()
      ORDER BY r.departure_time ASC`,
      [`%${pickup}%`, `%${destination}%`, date]
    );

    return NextResponse.json({
      success: true,
      rides,
    });
  } catch (error) {
    console.error("Ride search error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to search rides." },
      { status: 500 }
    );
  }
}
