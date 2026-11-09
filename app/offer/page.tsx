
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OfferRidePage() {
  const [message, setMessage] = useState("");
  const [today, setToday] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    pickup_location: "",
    destination: "",
    departure_date: "",
    departure_time: "",
    vehicle_type: "",
    vehicle_number: "",
    total_seats: "1",
    cost_per_seat: "0",
  });

  useEffect(() => {
    const date = new Date();

    const localDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    setToday(localDate);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not publish ride.");
        return;
      }

      setMessage(
        `Success! Your ride has been published. Ride ID: ${data.rideId}`
      );

      setForm({
        pickup_location: "",
        destination: "",
        departure_date: "",
        departure_time: "",
        vehicle_type: "",
        vehicle_number: "",
        total_seats: "1",
        cost_per_seat: "0",
      });
    } catch (error) {
      console.error("Publish ride error:", error);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <Link href="/" style={styles.back}>
          ← Back to Home
        </Link>

        <h1 style={styles.heading}>Offer a Ride 🚗</h1>

        <p style={styles.subtitle}>
          Share your journey with fellow students.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Pickup Location</label>
          <input
            name="pickup_location"
            placeholder="Enter pickup location"
            value={form.pickup_location}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Destination</label>
          <input
            name="destination"
            placeholder="Enter destination"
            value={form.destination}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <div style={styles.row}>
            <div style={styles.column}>
              <label style={styles.label}>Departure Date</label>
              <input
                type="date"
                name="departure_date"
                value={form.departure_date}
                onChange={handleChange}
                min={today || undefined}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.column}>
              <label style={styles.label}>Departure Time</label>
              <input
                type="time"
                name="departure_time"
                value={form.departure_time}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <label style={styles.label}>Vehicle Type</label>
          <select
            name="vehicle_type"
            value={form.vehicle_type}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select vehicle</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
            <option value="Car">Car</option>
          </select>

          <label style={styles.label}>Vehicle Number</label>
          <input
            name="vehicle_number"
            placeholder="Example: KA01AB1234"
            value={form.vehicle_number}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Available Seats</label>
          <input
            type="number"
            name="total_seats"
            min="1"
            max="8"
            value={form.total_seats}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Cost Per Seat (₹)</label>
          <input
            type="number"
            name="cost_per_seat"
            min="0"
            step="0.01"
            value={form.cost_per_seat}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: submitting ? 0.6 : 1,
            }}
            disabled={submitting}
          >
            {submitting ? "Publishing..." : "Publish Ride"}
          </button>
        </form>

        {message && (
          <p style={styles.message}>
            {message}
          </p>
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
    maxWidth: "650px",
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
    marginBottom: "30px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  row: {
    display: "flex",
    gap: "15px",
  },
  column: {
    flex: 1,
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    color: "#2563eb",
    marginTop: "20px",
  },
};
