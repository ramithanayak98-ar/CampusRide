
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Booking = {
  booking_id: number;
  seats_requested: number;
  booking_status: string;
  booked_at: string;
  pickup_location: string;
  destination: string;
  departure_time: string;
  cost_per_seat: number;
  driver_name: string;
  vehicle_type: string;
  vehicle_number: string;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Unable to load bookings.");
          return;
        }

        setBookings(data.bookings || []);

        if (data.bookings.length === 0) {
          setMessage("You haven't booked any rides yet.");
        }
      } catch {
        setMessage("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  async function handleCancel(bookingId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(bookingId);
    setMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to cancel booking.");
        return;
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, booking_status: "cancelled" }
            : booking
        )
      );

      setMessage(
        `Booking #${bookingId} cancelled successfully! Seats have been returned.`
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <Link href="/" style={styles.back}>
          ← Back to Home
        </Link>

        <h1 style={styles.heading}>My Bookings 📋</h1>

        <p style={styles.subtitle}>
          View and manage your ride bookings.
        </p>

        {loading && <p style={styles.message}>Loading bookings...</p>}

        {!loading && bookings.length === 0 && (
          <div style={styles.emptyBox}>
            <div style={styles.icon}>🚗</div>
            <h2 style={styles.emptyHeading}>No Bookings Yet</h2>
            <p style={styles.emptyText}>{message}</p>

            <Link href="/find" style={styles.button}>
              Find a Ride
            </Link>
          </div>
        )}

        {!loading && bookings.map((booking) => (
          <div key={booking.booking_id} style={styles.bookingCard}>
            <h2>Booking #{booking.booking_id}</h2>

            <p><strong>Driver:</strong> {booking.driver_name}</p>
            <p><strong>From:</strong> {booking.pickup_location}</p>
            <p><strong>To:</strong> {booking.destination}</p>

            <p>
              <strong>Departure:</strong>{" "}
              {new Date(booking.departure_time).toLocaleString()}
            </p>

            <p><strong>Vehicle:</strong> {booking.vehicle_type}</p>
            <p><strong>Vehicle Number:</strong> {booking.vehicle_number}</p>
            <p><strong>Seats Booked:</strong> {booking.seats_requested}</p>

            <p>
              <strong>Total Cost:</strong>{" "}
              ₹{Number(booking.cost_per_seat) * booking.seats_requested}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {booking.booking_status.toUpperCase()}
            </p>

            {booking.booking_status === "confirmed" && (
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => handleCancel(booking.booking_id)}
                disabled={cancellingId !== null}
              >
                {cancellingId === booking.booking_id
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            )}
          </div>
        ))}

        {message && !loading && bookings.length > 0 && (
          <p style={styles.message}>{message}</p>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#eff6ff",
    padding: "40px 20px",
  },
  card: {
    maxWidth: "750px",
    margin: "auto",
    background: "white",
    padding: "35px",
    borderRadius: "16px",
    boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
  },
  back: {
    color: "#2563eb",
    textDecoration: "none",
  },
  heading: {
    textAlign: "center",
    marginTop: "25px",
    color: "#1e3a8a",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "35px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "40px 20px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px dashed #cbd5e1",
  },
  icon: {
    fontSize: "55px",
    marginBottom: "10px",
  },
  emptyHeading: {
    color: "#1e3a8a",
  },
  emptyText: {
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "25px",
  },
  button: {
    display: "inline-block",
    padding: "13px 25px",
    background: "#2563eb",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  bookingCard: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#334155",
  },
  cancelButton: {
    width: "100%",
    padding: "13px",
    marginTop: "12px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    color: "#2563eb",
    marginTop: "20px",
  },
};
