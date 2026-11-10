
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import pool from "@/lib/db";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT user_id, full_name, email, password_hash, role
       FROM users WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    const users = rows as {
      user_id: number;
      full_name: string;
      email: string;
      password_hash: string;
      role: string;
    }[];

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      throw new Error("SESSION_SECRET is missing.");
    }

    const token = await new SignJWT({
      userId: user.user_id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(secret));

    // Record successful login in MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("campusride");

      await db.collection("activities").insertOne({
        userId: user.user_id,
        type: "login",
        description: "Logged into CampusRide",
        metadata: {},
        createdAt: new Date(),
      });
    } catch (mongoError) {
      console.error("Login activity logging failed:", mongoError);
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("campusride_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
