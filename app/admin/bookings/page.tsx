
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

type Booking = {
  booking_id: number;
  ride_id: number;
  seats_requested: number;
  booking_status: string;
  booked_at: string;
  passenger_name: string;
  passenger_email: string;
  driver_name: string;
  driver_email: string;
  pickup_location: string;
  destination: string;
  departure_time: string;
  cost_per_seat: string | number;
  vehicle_type: string;
  vehicle_number: string;
};

export default function ManageBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/admin/bookings", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace("/dashboard");
          return;
        }

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load bookings.");
          return;
        }

        setBookings(data.bookings);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [router]);

  const filteredBookings = useMemo(() => {
    const query = search.toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        booking.passenger_name.toLowerCase().includes(query) ||
        booking.passenger_email.toLowerCase().includes(query) ||
        booking.driver_name.toLowerCase().includes(query) ||
        booking.pickup_location.toLowerCase().includes(query) ||
        booking.destination.toLowerCase().includes(query) ||
        String(booking.booking_id).includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        booking.booking_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const confirmed = bookings.filter(
    (b) => b.booking_status === "confirmed"
  ).length;

  const cancelled = bookings.filter(
    (b) => b.booking_status === "cancelled"
  ).length;

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div>
          <h1>Manage Bookings</h1>
          <p>Monitor all CampusRide bookings.</p>
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
          <span>Total Bookings</span>
          <h2>{bookings.length}</h2>
        </div>

        <div style={styles.card}>
          <span>Confirmed Bookings</span>
          <h2>{confirmed}</h2>
        </div>

        <div style={styles.card}>
          <span>Cancelled Bookings</span>
          <h2>{cancelled}</h2>
        </div>
      </section>

      <section style={styles.tableCard}>
        <h2>All Bookings</h2>

        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search passenger, driver or route..."
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
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredBookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Booking ID</th>
                  <th style={styles.th}>Passenger</th>
                  <th style={styles.th}>Driver</th>
                  <th style={styles.th}>Route</th>
                  <th style={styles.th}>Seats</th>
                  <th style={styles.th}>Cost/Seat</th>
                  <th style={styles.th}>Vehicle</th>
                  <th style={styles.th}>Booked On</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td style={styles.td}>#{booking.booking_id}</td>

                    <td style={styles.td}>
                      <strong>{booking.passenger_name}</strong>
                      <br />
                      <small>{booking.passenger_email}</small>
                    </td>

                    <td style={styles.td}>
                      <strong>{booking.driver_name}</strong>
                      <br />
                      <small>{booking.driver_email}</small>
                    </td>

                    <td style={styles.td}>
                      {booking.pickup_location}
                      <br />↓<br />
                      {booking.destination}
                    </td>

                    <td style={styles.td}>
                      {booking.seats_requested}
                    </td>

                    <td style={styles.td}>
                      ₹{Number(booking.cost_per_seat).toFixed(2)}
                    </td>

                    <td style={styles.td}>
                      {booking.vehicle_type}
                      <br />
                      {booking.vehicle_number}
                    </td>

                    <td style={styles.td}>
                      {new Date(booking.booked_at).toLocaleDateString("en-IN")}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          booking.booking_status === "confirmed"
                            ? styles.confirmedBadge
                            : styles.cancelledBadge
                        }
                      >
                        {booking.booking_status.toUpperCase()}
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
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
  confirmedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  cancelledBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};
