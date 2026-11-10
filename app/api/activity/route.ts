
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campusride_token")?.value;

  if (!token || !process.env.SESSION_SECRET) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET)
    );

    const userId = Number(payload.userId);

    return Number.isInteger(userId) && userId > 0
      ? userId
      : null;
  } catch {
    return null;
  }
}

// GET: Fetch activities of the logged-in user
export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campusride");

    const activities = await db
      .collection("activities")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const formattedActivities = activities.map((activity) => ({
      ...activity,
      _id: activity._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
    });

  } catch (error) {
    console.error("Fetch activities error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch activities." },
      { status: 500 }
    );
  }
}

// POST: Store a new user activity
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const allowedTypes = [
      "login",
      "ride_offered",
      "ride_booked",
      "booking_cancelled",
    ];

    if (!allowedTypes.includes(body.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid activity type." },
        { status: 400 }
      );
    }

    const descriptions: Record<string, string> = {
      login: "Logged into CampusRide",
      ride_offered: "Offered a new ride",
      ride_booked: "Booked a ride",
      booking_cancelled: "Cancelled a booking",
    };

    const metadata: Record<string, number> = {};

    if (Number.isInteger(body.rideId) && body.rideId > 0) {
      metadata.rideId = body.rideId;
    }

    if (Number.isInteger(body.bookingId) && body.bookingId > 0) {
      metadata.bookingId = body.bookingId;
    }

    const client = await clientPromise;
    const db = client.db("campusride");

    const result = await db.collection("activities").insertOne({
      userId,
      type: body.type,
      description: descriptions[body.type],
      metadata,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Activity recorded successfully!",
        activityId: result.insertedId.toString(),
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Record activity error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to record activity." },
      { status: 500 }
    );
  }
}
