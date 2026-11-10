
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/admin", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          router.replace("/dashboard");
          return;
        }

        if (!response.ok || !data.success) {
          setMessage(data.message || "Unable to verify Admin access.");
          return;
        }

        setAuthorized(true);
      } catch {
        setMessage("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Verifying Admin Access...</h2>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={styles.center}>
        <h2>Access Error</h2>
        <p>{message}</p>
        <button
          onClick={() => router.push("/login")}
          style={styles.button}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>CampusRide Admin Dashboard</h1>
          <p>Welcome, Administrator!</p>
        </div>

        <button
          style={styles.logout}
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            router.replace("/login");
          }}
        >
          Logout
        </button>
      </header>

      <section style={styles.welcome}>
        <h2>Admin Control Panel</h2>
        <p>
          Manage CampusRide users, monitor rides, and oversee
          booking activities from one place.
        </p>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2>Manage Users</h2>
          <p>View and manage registered CampusRide users.</p>
          <button style={styles.button}
            onClick={() => router.push("/admin/users")}>
            Manage Users
          </button>
        </div>

        <div style={styles.card}>
          <h2>Manage Rides</h2>
          <p>Monitor rides offered by students.</p>
          <button style={styles.button}
            onClick={() => router.push("/admin/rides")}>
            Manage Rides
          </button>
        </div>

        <div style={styles.card}>
          <h2>Manage Bookings</h2>
          <p>Monitor ride bookings and their status.</p>
          <button style={styles.button}
            onClick={() => router.push("/admin/bookings")}>
            Manage Bookings
          </button>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f4f6fb",
    color: "#172033",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  welcome: {
    background: "#172554",
    color: "white",
    padding: "30px",
    borderRadius: "14px",
    marginTop: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "25px",
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  button: {
    padding: "12px 20px",
    marginTop: "12px",
    background: "#172554",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  logout: {
    padding: "11px 20px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },
};
