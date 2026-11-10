
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

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
        { success: false, message: "Invalid session." },
        { status: 401 }
      );
    }

    // Verify the current role directly from MySQL
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT role FROM users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (rows[0].role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access only." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome, Admin!",
    });

  } catch (error) {
    console.error("Admin authorization error:", error);

    return NextResponse.json(
      { success: false, message: "Authentication failed." },
      { status: 401 }
    );
  }
}
