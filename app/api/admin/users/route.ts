
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campusride_token")?.value;

  if (!token || !process.env.SESSION_SECRET) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET)
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

    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT user_id, full_name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch users." },
      { status: 500 }
    );
  }
}
