
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ride = {
  ride_id: number;
  pickup_location: string;
  destination: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  cost_per_seat: number;
  driver_name: string;
  vehicle_type: string;
  vehicle_number: string;
};

export default function FindRidePage() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [today, setToday] = useState("");
  const [message, setMessage] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);

  const [seatSelections, setSeatSelections] = useState<
    Record<number, number>
  >({});
  const [bookingLoadingId, setBookingLoadingId] = useState<number | null>(
    null
  );
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const date = new Date();
    const localDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    setToday(localDate);
  }, []);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setBookingMessage("");
    setRides([]);

    try {
      const params = new URLSearchParams({
        pickup,
        destination,
        date: travelDate,
      });

      const response = await fetch(`/api/rides/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to search rides.");
        return;
      }

      setRides(data.rides || []);

      if (data.rides.length === 0) {
        setMessage("No matching rides found. Try another date or location.");
      } else {
        setMessage(`Found ${data.rides.length} matching ride(s)!`);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking(ride: Ride) {
    const seats = seatSelections[ride.ride_id] || 1;

    setBookingLoadingId(ride.ride_id);
    setBookingMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId: ride.ride_id,
          seats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingMessage(data.message || "Unable to book this ride.");
        return;
      }

      setBookingMessage(
        `Booking successful! Your Booking ID is ${data.bookingId}.`
      );

      setRides((previousRides) =>
        previousRides
          .map((item) =>
            item.ride_id === ride.ride_id
              ? {
                  ...item,
                  available_seats: data.remainingSeats,
                }
              : item
          )
          .filter((item) => item.available_seats > 0)
      );
    } catch {
      setBookingMessage("Something went wrong. Please try again.");
    } finally {
      setBookingLoadingId(null);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <Link href="/" style={styles.back}>
          ← Back to Home
        </Link>

        <h1 style={styles.heading}>Find a Ride 🔎</h1>

        <p style={styles.subtitle}>
          Find a convenient ride with fellow students.
        </p>

        <form onSubmit={handleSearch}>
          <label style={styles.label}>Pickup Location</label>
          <input
            type="text"
            placeholder="Enter your pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Destination</label>
          <input
            type="text"
            placeholder="Enter your destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Travel Date</label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            min={today || undefined}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Searching..." : "Search Rides"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        {bookingMessage && (
          <p style={styles.bookingMessage}>{bookingMessage}</p>
        )}

        {rides.map((ride) => (
          <div key={ride.ride_id} style={styles.rideCard}>
            <h3>Ride #{ride.ride_id}</h3>

            <p><strong>Driver:</strong> {ride.driver_name}</p>
            <p><strong>From:</strong> {ride.pickup_location}</p>
            <p><strong>To:</strong> {ride.destination}</p>

            <p>
              <strong>Departure:</strong>{" "}
              {new Date(ride.departure_time).toLocaleString()}
            </p>

            <p><strong>Vehicle:</strong> {ride.vehicle_type}</p>
            <p><strong>Vehicle Number:</strong> {ride.vehicle_number}</p>
            <p><strong>Available Seats:</strong> {ride.available_seats}</p>
            <p><strong>Cost per Seat:</strong> ₹{ride.cost_per_seat}</p>

            <label style={styles.label}>Number of Seats</label>

            <select
              value={seatSelections[ride.ride_id] || 1}
              onChange={(e) =>
                setSeatSelections((previous) => ({
                  ...previous,
                  [ride.ride_id]: Number(e.target.value),
                }))
              }
              style={styles.input}
            >
              {Array.from(
                { length: ride.available_seats },
                (_, index) => index + 1
              ).map((number) => (
                <option key={number} value={number}>
                  {number} {number === 1 ? "Seat" : "Seats"}
                </option>
              ))}
            </select>

            <p>
              <strong>Total Cost:</strong>{" "}
              ₹
              {(
                ride.cost_per_seat *
                (seatSelections[ride.ride_id] || 1)
              ).toFixed(2)}
            </p>

            <button
              type="button"
              style={styles.bookButton}
              onClick={() => handleBooking(ride)}
              disabled={bookingLoadingId !== null}
            >
              {bookingLoadingId === ride.ride_id
                ? "Booking..."
                : "Book Ride"}
            </button>
          </div>
        ))}

        <p style={styles.bookingLink}>
          <Link href="/bookings">View My Bookings →</Link>
        </p>
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
    maxWidth: "600px",
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
  bookButton: {
    width: "100%",
    padding: "13px",
    background: "#16a34a",
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
  bookingMessage: {
    textAlign: "center",
    color: "#15803d",
    marginTop: "20px",
    fontWeight: "bold",
  },
  bookingLink: {
    textAlign: "center",
    marginTop: "25px",
  },
  rideCard: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#334155",
  },
};
