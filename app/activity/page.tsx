
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Activity = {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  metadata?: {
    rideId?: number;
    bookingId?: number;
  };
};

const activityIcons: Record<string, string> = {
  login: "🔐",
  ride_offered: "🚗",
  ride_booked: "🎫",
  booking_cancelled: "❌",
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/activity");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (data.success) {
          setActivities(data.activities);
        } else {
          setError(data.message || "Unable to load activities.");
        }
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [router]);

  return (
    <main style={styles.main}>
      <aside style={styles.sidebar}>
        <h1 style={styles.brand}>CampusRide</h1>
        <p style={styles.tagline}>Your Campus Journey</p>

        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.navLink}>
            ▦ Dashboard
          </Link>
          <Link href="/find" style={styles.navLink}>
            🔍 Find a Ride
          </Link>
          <Link href="/offer" style={styles.navLink}>
            🚘 Offer a Ride
          </Link>
          <Link href="/bookings" style={styles.navLink}>
            🎫 My Bookings
          </Link>
          <Link href="/activity" style={styles.activeLink}>
            📋 Activity History
          </Link>
          <Link href="/" style={styles.navLink}>
            ⌂ Home
          </Link>
        </nav>
      </aside>

      <section style={styles.content}>
        <header>
          <h1 style={styles.heading}>Activity History</h1>
          <p style={styles.subtitle}>
            Keep track of your CampusRide activities.
          </p>
        </header>

        <section style={styles.card}>
          <h2 style={styles.cardHeading}>Your Recent Activities</h2>

          {loading ? (
            <p>Loading your activities...</p>
          ) : error ? (
            <p style={styles.error}>{error}</p>
          ) : activities.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: "45px" }}>📭</div>
              <h3>No activities yet</h3>
              <p>Your ride and booking activities will appear here.</p>
              <Link href="/find" style={styles.button}>
                Find a Ride
              </Link>
            </div>
          ) : (
            <div>
              {activities.map((activity) => (
                <div key={activity._id} style={styles.activity}>
                  <div style={styles.icon}>
                    {activityIcons[activity.type] || "📌"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={styles.activityTitle}>
                      {activity.description}
                    </h3>

                    <p style={styles.date}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>

                    {activity.metadata?.rideId && (
                      <p style={styles.date}>
                        Ride ID: {activity.metadata.rideId}
                      </p>
                    )}

                    {activity.metadata?.bookingId && (
                      <p style={styles.date}>
                        Booking ID: {activity.metadata.bookingId}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          © 2026 CampusRide. Making campus travel easier.
        </footer>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    background: "#eff6ff",
    fontFamily: "Arial, sans-serif",
    color: "#1e293b",
  },
  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "white",
    padding: "30px 20px",
    boxShadow: "2px 0 15px rgba(0,0,0,0.05)",
    flexShrink: 0,
  },
  brand: {
    color: "#2563eb",
    fontSize: "28px",
    margin: 0,
  },
  tagline: {
    color: "#64748b",
    fontSize: "13px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "45px",
  },
  navLink: {
    padding: "13px",
    textDecoration: "none",
    color: "#475569",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  activeLink: {
    padding: "13px",
    textDecoration: "none",
    color: "#2563eb",
    background: "#eff6ff",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    minWidth: 0,
    padding: "40px",
  },
  heading: {
    fontSize: "30px",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "30px",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
  },
  cardHeading: {
    marginBottom: "25px",
  },
  empty: {
    textAlign: "center",
    padding: "55px 15px",
    color: "#64748b",
  },
  button: {
    display: "inline-block",
    marginTop: "15px",
    padding: "12px 22px",
    background: "#2563eb",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  activity: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "20px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  icon: {
    width: "45px",
    height: "45px",
    background: "#eff6ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  activityTitle: {
    margin: "0 0 7px",
    fontSize: "16px",
  },
  date: {
    color: "#64748b",
    fontSize: "13px",
    margin: "4px 0",
  },
  error: {
    color: "#dc2626",
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
    marginTop: "40px",
  },
};
