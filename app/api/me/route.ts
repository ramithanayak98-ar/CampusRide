import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("campusride_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not logged in" },
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

    const userId = Number(payload.userId);

if (!Number.isInteger(userId) || userId <= 0) {
  return NextResponse.json(
    { success: false, message: "Invalid user session" },
    { status: 401 }
  );
}
    const [rows] = await pool.execute(
      `SELECT user_id, full_name, email, role
       FROM users WHERE user_id = ?`,
      [userId]
    );

    const users = rows as {
      user_id: number;
      full_name: string;
      email: string;
      role: string;
    }[];

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: users[0],
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}