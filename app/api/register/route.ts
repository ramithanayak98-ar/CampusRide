
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { full_name, email, password } = body;

    // Check required fields
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Save student in MySQL
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES (?, ?, ?)`,
      [full_name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Student registered successfully!",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const dbError = error as { code?: string };

    if (dbError.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "This email is already registered." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
