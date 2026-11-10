
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

type Ride = {
  ride_id: number;
  driver_id: number;
  driver_name: string;
  driver_email: string;
  pickup_location: string;
  destination: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  cost_per_seat: string | number;
  status: string;
  vehicle_type: string;
  vehicle_number: string;
};

export default function ManageRidesPage() {
  const router = useRouter();

  const [rides, setRides] = useState<Ride[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRides() {
      try {
        const response = await fetch("/api/admin/rides", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace("/dashboard");
          return;
        }

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load rides.");
          return;
        }

        setRides(data.rides);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchRides();
  }, [router]);

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const query = search.toLowerCase();

      const matchesSearch =
        ride.driver_name.toLowerCase().includes(query) ||
        ride.driver_email.toLowerCase().includes(query) ||
        ride.pickup_location.toLowerCase().includes(query) ||
        ride.destination.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || ride.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rides, search, statusFilter]);

  const availableCount = rides.filter(
    (ride) => ride.status === "available"
  ).length;

  const fullCount = rides.filter(
    (ride) => ride.status === "full"
  ).length;

  const otherCount = rides.length - availableCount - fullCount;

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div>
          <h1>Manage Rides</h1>
          <p>Monitor all rides offered on CampusRide.</p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => router.push("/admin")}
        >
          Back to Dashboard
        </button>
      </header>

      <section style={styles.summary}>
        <div style={styles.card}>
          <span>Total Rides</span>
          <h2>{rides.length}</h2>
        </div>

        <div style={styles.card}>
          <span>Available Rides</span>
          <h2>{availableCount}</h2>
        </div>

        <div style={styles.card}>
          <span>Full Rides</span>
          <h2>{fullCount}</h2>
        </div>

        <div style={styles.card}>
          <span>Other Status</span>
          <h2>{otherCount}</h2>
        </div>
      </section>

      <section style={styles.tableCard}>
        <h2>All Registered Rides</h2>

        <div style={styles.filters}>
          <input
            placeholder="Search driver or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p>Loading rides...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredRides.length === 0 ? (
          <p>No rides found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "ID",
                    "Driver",
                    "Route",
                    "Departure",
                    "Seats",
                    "Cost",
                    "Vehicle",
                    "Status",
                  ].map((heading) => (
                    <th key={heading} style={styles.th}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRides.map((ride) => (
                  <tr key={ride.ride_id}>
                    <td style={styles.td}>{ride.ride_id}</td>
                    <td style={styles.td}>
                      <strong>{ride.driver_name}</strong>
                      <br />
                      <small>{ride.driver_email}</small>
                    </td>
                    <td style={styles.td}>
                      {ride.pickup_location}
                      <br />↓<br />
                      {ride.destination}
                    </td>
                    <td style={styles.td}>
                      {new Date(ride.departure_time).toLocaleString("en-IN")}
                    </td>
                    <td style={styles.td}>
                      {ride.available_seats}/{ride.total_seats}
                    </td>
                    <td style={styles.td}>
                      ₹{Number(ride.cost_per_seat).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      {ride.vehicle_type}
                      <br />
                      {ride.vehicle_number}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.status}>
                        {ride.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#f4f6fb",
    padding: "40px",
    color: "#172033",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  backButton: {
    background: "#172554",
    color: "white",
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "18px",
    marginTop: "30px",
  },
  card: {
    background: "white",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  tableCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginTop: "30px",
    overflow: "hidden",
  },
  filters: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    margin: "20px 0",
  },
  search: {
    flex: "1",
    minWidth: "220px",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
  },
  select: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    background: "#172554",
    color: "white",
    padding: "14px",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
  },
  status: {
    background: "#dbeafe",
    color: "#1e40af",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};
