
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
};

type Stats = {
  totalRides: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
};

type MonthlyBooking = {
  monthKey: string;
  month: string;
  total: number;
};

type PopularRoute = {
  pickup_location: string;
  destination: string;
  totalBookings: number;
};

type ActivityCount = {
  _id: string;
  count: number;
};

type MonthlyActivity = {
  month: string;
  total: number;
};

type ActivityAnalytics = {
  totalActivities: number;
  activityCounts: ActivityCount[];
  monthlyActivity: MonthlyActivity[];
  mostFrequentActivity: ActivityCount | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyBookings, setMonthlyBookings] = useState<MonthlyBooking[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [activityAnalytics, setActivityAnalytics] =
    useState<ActivityAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          userResponse,
          statsResponse,
          activityResponse,
        ] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/dashboard"),
          fetch("/api/activity/analytics"),
        ]);

        if (
          userResponse.status === 401 ||
          statsResponse.status === 401 ||
          activityResponse.status === 401
        ) {
          router.push("/login");
          return;
        }

        const userData = await userResponse.json();
        const statsData = await statsResponse.json();
        const activityData = await activityResponse.json();

        if (userData.success) {
          setUser(userData.user);
        }

        if (statsData.success) {
          setStats(statsData.stats);
          setMonthlyBookings(statsData.monthlyBookings || []);
          setPopularRoutes(statsData.popularRoutes || []);
        }

        if (activityData.success) {
          setActivityAnalytics(activityData.analytics);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (loading) {
    return <main style={styles.loading}>Loading your dashboard...</main>;
  }

  if (!user || !stats) {
    return (
      <main style={styles.loading}>
        Unable to load dashboard. Please log in again.
      </main>
    );
  }

  const cards = [
    {
      title: "Rides Offered",
      value: stats.totalRides,
      icon: "🚗",
      description: "Rides created by you",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: "🎫",
      description: "Bookings made by you",
    },
    {
      title: "Confirmed Bookings",
      value: stats.confirmedBookings,
      icon: "✓",
      description: "Successfully confirmed",
    },
    {
      title: "Cancelled Bookings",
      value: stats.cancelledBookings,
      icon: "✕",
      description: "Bookings cancelled",
    },
  ];

  const maxBookings = Math.max(
    ...monthlyBookings.map((item) => Number(item.total)),
    1
  );

  const maxActivities = Math.max(
    ...(activityAnalytics?.monthlyActivity || []).map(
      (item) => Number(item.total)
    ),
    1
  );

  const activityLabels: Record<string, string> = {
    login: "Login",
    ride_offered: "Ride Offered",
    ride_booked: "Ride Booked",
    booking_cancelled: "Booking Cancelled",
  };

  const activityIcons: Record<string, string> = {
    login: "🔐",
    ride_offered: "🚘",
    ride_booked: "🎫",
    booking_cancelled: "❌",
  };

  return (
    <main style={styles.main}>
      <aside style={styles.sidebar}>
        <h1 style={styles.brand}>CampusRide</h1>
        <p style={styles.sidebarSubtitle}>Your Campus Journey</p>

        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.activeLink}>
            <span>▦</span> Dashboard
          </Link>

          <Link href="/find" style={styles.navLink}>
            <span>🔍</span> Find a Ride
          </Link>

          <Link href="/offer" style={styles.navLink}>
            <span>🚘</span> Offer a Ride
          </Link>

          <Link href="/bookings" style={styles.navLink}>
            <span>🎫</span> My Bookings
          </Link>

          <Link href="/activity" style={styles.navLink}>
            <span>📋</span> Activity History
          </Link>

          <Link href="/" style={styles.navLink}>
            <span>⌂</span> Home
          </Link>
        </nav>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </aside>

      <section style={styles.content}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.heading}>Dashboard</h2>
            <p style={styles.subtitle}>
              Welcome back, {user.full_name}! Here's your ride overview.
            </p>
          </div>

          <div style={styles.profile}>
            <div style={styles.avatar}>
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.full_name}</strong>
              <p style={styles.role}>{user.role}</p>
            </div>
          </div>
        </header>

        <section style={styles.welcomeCard}>
          <div>
            <h2>Welcome to CampusRide! 💙</h2>
            <p>
              Manage your rides, track your bookings and make your
              campus journeys easier.
            </p>
          </div>
          <div style={styles.welcomeIcon}>🚗</div>
        </section>

        {/* MYSQL RIDE STATISTICS */}
        <section>
          <h2 style={styles.sectionTitle}>Your Ride Statistics</h2>

          <div style={styles.grid}>
            {cards.map((card) => (
              <div key={card.title} style={styles.statCard}>
                <div style={styles.cardTop}>
                  <span style={styles.cardIcon}>{card.icon}</span>
                  <span style={styles.cardNumber}>
                    {Number(card.value)}
                  </span>
                </div>

                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDescription}>{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MYSQL RIDE ANALYTICS */}
        <section style={styles.analyticsSection}>
          <h2 style={styles.sectionTitle}>Ride Analytics</h2>

          <div style={styles.analyticsGrid}>
            <div style={styles.infoCard}>
              <h3 style={styles.analyticsTitle}>
                Monthly Booking Trends
              </h3>
              <p style={styles.cardDescription}>
                Your bookings over the last six months
              </p>

              {monthlyBookings.length === 0 ? (
                <p style={styles.emptyMessage}>
                  No booking trends available yet.
                </p>
              ) : (
                <div style={styles.chart}>
                  {monthlyBookings.map((item) => {
                    const total = Number(item.total);
                    const barHeight = Math.max(
                      (total / maxBookings) * 150,
                      8
                    );

                    return (
                      <div key={item.monthKey} style={styles.barColumn}>
                        <strong style={styles.barValue}>{total}</strong>
                        <div
                          style={{
                            ...styles.bar,
                            height: `${barHeight}px`,
                          }}
                          title={`${item.month}: ${total} bookings`}
                        />
                        <span style={styles.barLabel}>{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.analyticsTitle}>Popular Routes</h3>
              <p style={styles.cardDescription}>
                Routes you have booked most often
              </p>

              {popularRoutes.length === 0 ? (
                <p style={styles.emptyMessage}>
                  No popular routes available yet.
                </p>
              ) : (
                <div style={styles.routeList}>
                  {popularRoutes.map((route, index) => (
                    <div
                      key={`${route.pickup_location}-${route.destination}`}
                      style={styles.routeItem}
                    >
                      <div style={styles.routeNumber}>{index + 1}</div>
                      <div style={styles.routeDetails}>
                        <strong>
                          {route.pickup_location} → {route.destination}
                        </strong>
                        <p style={styles.cardDescription}>
                          {Number(route.totalBookings)} booking(s)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MONGODB ACTIVITY ANALYTICS */}
        <section style={styles.analyticsSection}>
          <h2 style={styles.sectionTitle}>
            Activity Analytics
          </h2>

          {!activityAnalytics ? (
            <div style={styles.infoCard}>
              <p style={styles.emptyMessage}>
                Activity analytics are currently unavailable.
              </p>
            </div>
          ) : (
            <>
              <div style={styles.activitySummaryGrid}>
                <div style={styles.activitySummaryCard}>
                  <span style={styles.cardIcon}>📊</span>
                  <h3 style={styles.activityNumber}>
                    {activityAnalytics.totalActivities}
                  </h3>
                  <p style={styles.cardDescription}>Total Activities</p>
                </div>

                <div style={styles.activitySummaryCard}>
                  <span style={styles.cardIcon}>⭐</span>
                  <h3 style={styles.activityNumber}>
                    {activityAnalytics.mostFrequentActivity
                      ? activityLabels[
                          activityAnalytics.mostFrequentActivity._id
                        ] || activityAnalytics.mostFrequentActivity._id
                      : "None"}
                  </h3>
                  <p style={styles.cardDescription}>
                    Most Frequent Activity
                  </p>
                </div>
              </div>

              <div style={styles.analyticsGrid}>
                {/* ACTIVITY BREAKDOWN */}
                <div style={styles.infoCard}>
                  <h3 style={styles.analyticsTitle}>
                    Activity Breakdown
                  </h3>
                  <p style={styles.cardDescription}>
                    Activities grouped by type using MongoDB
                  </p>

                  {activityAnalytics.activityCounts.length === 0 ? (
                    <p style={styles.emptyMessage}>
                      No activities recorded yet.
                    </p>
                  ) : (
                    <div style={styles.activityList}>
                      {activityAnalytics.activityCounts.map((item) => (
                        <div
                          key={item._id}
                          style={styles.activityItem}
                        >
                          <div style={styles.activityIcon}>
                            {activityIcons[item._id] || "📌"}
                          </div>

                          <div style={styles.activityDetails}>
                            <strong>
                              {activityLabels[item._id] || item._id}
                            </strong>
                            <div style={styles.progressBackground}>
                              <div
                                style={{
                                  ...styles.progressFill,
                                  width: `${
                                    activityAnalytics.totalActivities > 0
                                      ? (item.count /
                                          activityAnalytics.totalActivities) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          <strong style={styles.activityCount}>
                            {item.count}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MONTHLY ACTIVITY TRENDS */}
                <div style={styles.infoCard}>
                  <h3 style={styles.analyticsTitle}>
                    Monthly Activity Trends
                  </h3>
                  <p style={styles.cardDescription}>
                    Your activities grouped by month
                  </p>

                  {activityAnalytics.monthlyActivity.length === 0 ? (
                    <p style={styles.emptyMessage}>
                      No monthly activity available yet.
                    </p>
                  ) : (
                    <div style={styles.chart}>
                      {activityAnalytics.monthlyActivity.map((item) => {
                        const total = Number(item.total);
                        const barHeight = Math.max(
                          (total / maxActivities) * 150,
                          8
                        );

                        return (
                          <div key={item.month} style={styles.barColumn}>
                            <strong style={styles.barValue}>
                              {total}
                            </strong>

                            <div
                              style={{
                                ...styles.activityBar,
                                height: `${barHeight}px`,
                              }}
                              title={`${item.month}: ${total} activities`}
                            />

                            <span style={styles.barLabel}>
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.mongoNote}>
                <strong>MongoDB Aggregation</strong>
                <p>
                  Activity statistics are generated using MongoDB
                  aggregation pipelines with $match, $facet, $group,
                  $sum, $sort and $project.
                </p>
              </div>
            </>
          )}
        </section>

        {/* PROFILE AND QUICK ACTIONS */}
        <section style={styles.lowerSection}>
          <div style={styles.infoCard}>
            <h3 style={styles.sectionTitle}>Profile Information</h3>
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
            <Link href="/find" style={styles.actionButton}>
              Find a Ride →
            </Link>
            <Link href="/offer" style={styles.actionButton}>
              Offer a Ride →
            </Link>
            <Link href="/bookings" style={styles.actionButton}>
              View My Bookings →
            </Link>
            <Link href="/activity" style={styles.actionButton}>
              View Activity History →
            </Link>
          </div>
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

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eff6ff",
    fontSize: "18px",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "white",
    padding: "30px 20px",
    boxShadow: "2px 0 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },

  brand: {
    color: "#2563eb",
    fontSize: "28px",
    margin: 0,
  },

  sidebarSubtitle: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "8px",
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

  logout: {
    marginTop: "auto",
    padding: "13px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  content: {
    flex: 1,
    minWidth: 0,
    padding: "35px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  heading: {
    fontSize: "30px",
    margin: 0,
  },

  subtitle: {
    color: "#64748b",
    marginTop: "8px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "white",
    padding: "12px 18px",
    borderRadius: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "20px",
  },

  role: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  welcomeCard: {
    background: "#2563eb",
    color: "white",
    padding: "30px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "35px",
    boxShadow: "0 5px 20px rgba(37,99,235,0.15)",
  },

  welcomeIcon: {
    fontSize: "55px",
  },

  sectionTitle: {
    fontSize: "20px",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "20px",
  },

  statCard: {
    background: "white",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardIcon: {
    fontSize: "27px",
  },

  cardNumber: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  cardTitle: {
    fontSize: "16px",
    marginTop: "18px",
  },

  cardDescription: {
    color: "#64748b",
    fontSize: "13px",
  },

  analyticsSection: {
    marginTop: "35px",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  infoCard: {
    background: "white",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
    minWidth: 0,
  },

  analyticsTitle: {
    fontSize: "18px",
    margin: "0 0 8px",
  },

  chart: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: "12px",
    minHeight: "210px",
    paddingTop: "20px",
    overflowX: "auto",
  },

  barColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "7px",
    minWidth: "45px",
    flex: 1,
  },

  barValue: {
    fontSize: "13px",
    color: "#2563eb",
  },

  bar: {
    width: "28px",
    maxWidth: "100%",
    background: "#3b82f6",
    borderRadius: "6px 6px 0 0",
    minHeight: "8px",
  },

  activityBar: {
    width: "28px",
    maxWidth: "100%",
    background: "#0d9488",
    borderRadius: "6px 6px 0 0",
    minHeight: "8px",
  },

  barLabel: {
    color: "#64748b",
    fontSize: "11px",
    textAlign: "center",
  },

  emptyMessage: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "25px",
  },

  routeList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "25px",
  },

  routeItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "14px",
    borderBottom: "1px solid #e2e8f0",
  },

  routeNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    flexShrink: 0,
  },

  routeDetails: {
    minWidth: 0,
  },

  activitySummaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  activitySummaryCard: {
    background: "white",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
  },

  activityNumber: {
    fontSize: "25px",
    color: "#2563eb",
    margin: "12px 0 8px",
    overflowWrap: "anywhere",
  },

  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "25px",
  },

  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  activityIcon: {
    fontSize: "22px",
    width: "32px",
    flexShrink: 0,
  },

  activityDetails: {
    flex: 1,
    minWidth: 0,
    fontSize: "14px",
  },

  progressBackground: {
    height: "7px",
    background: "#e2e8f0",
    borderRadius: "10px",
    marginTop: "8px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "10px",
  },

  activityCount: {
    color: "#2563eb",
    fontSize: "15px",
  },

  mongoNote: {
    background: "#eff6ff",
    padding: "18px",
    borderRadius: "12px",
    marginTop: "20px",
    color: "#1e40af",
    fontSize: "13px",
  },

  lowerSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "35px",
  },

  actionButton: {
    display: "block",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "bold",
    marginBottom: "15px",
  },

  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
    marginTop: "40px",
  },
};
