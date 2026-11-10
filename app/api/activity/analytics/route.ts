
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/mongodb";

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

// GET: Generate personal activity analytics using MongoDB aggregation
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

    const result = await db.collection("activities").aggregate([
      {
        $match: { userId }
      },
      {
        $facet: {
          activityCounts: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 }
              }
            },
            {
              $sort: { count: -1 }
            }
          ],

          monthlyActivity: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m",
                    date: "$createdAt",
                    timezone: "Asia/Kolkata"
                  }
                },
                total: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 }
            },
            {
              $project: {
                _id: 0,
                month: "$_id",
                total: 1
              }
            }
          ],

          totalActivities: [
            {
              $count: "count"
            }
          ]
        }
      }
    ]).toArray();

    const analytics = result[0];

    const activityCounts = analytics?.activityCounts || [];
    const monthlyActivity = analytics?.monthlyActivity || [];
    const totalActivities =
      analytics?.totalActivities?.[0]?.count || 0;

    const mostFrequentActivity =
      activityCounts.length > 0 ? activityCounts[0] : null;

    return NextResponse.json({
      success: true,
      analytics: {
        totalActivities,
        activityCounts,
        monthlyActivity,
        mostFrequentActivity
      }
    });

  } catch (error) {
    console.error("Activity analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate activity analytics."
      },
      { status: 500 }
    );
  }
}