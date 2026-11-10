
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/me");

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        router.refresh();
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch {
      alert("Unable to connect. Please try again.");
    }
  }

  return (
    <main>
      <nav className="navbar">
        <h2>CampusRide</h2>

        <div className="nav-links">
          <a href="/find">Find a Ride</a>
          <a href="/#offer">Offer a Ride</a>
          <a href="/#bookings">My Bookings</a>

          {!loading && (
            user ? (
              <>
                <a href="/dashboard">My Dashboard</a>
                <a href="/activity">Activity History</a>
                <span>Hi, {user.full_name}!</span>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <a href="/login">Login</a>
                <a href="/register">Register</a>
              </>
            )
          )}
        </div>
      </nav>

      <section className="hero">
        <p className="tagline">YOUR CAMPUS, CONNECTED</p>

        <h1>
          {user
            ? `Welcome, ${user.full_name}!`
            : "Every journey is better together."}
        </h1>

        <p className="subtitle">
          Share rides with fellow students. Save money, reduce traffic,
          and make your campus commute easier.
        </p>

        <div className="hero-buttons">
          <a className="button primary" href="/find">
            Find a Ride
          </a>

          <a className="button secondary" href="/offer">
            Offer a Ride
          </a>
        </div>
      </section>

      <section className="features">
        <article className="feature-card" id="find">
          <span className="feature-icon">🔎</span>
          <h2>Find a Ride</h2>
          <p>
            Discover available rides and find a convenient journey
            with fellow students.
          </p>
          <a href="/find">Explore rides →</a>
        </article>

        <article className="feature-card" id="offer">
          <span className="feature-icon">🚗</span>
          <h2>Offer a Ride</h2>
          <p>
            Share your journey and help another student reach
            their destination.
          </p>
          <a href="/offer">Share your ride →</a>
        </article>

        <article className="feature-card" id="bookings">
          <span className="feature-icon">🎫</span>
          <h2>My Bookings</h2>
          <p>
            Keep track of your ride bookings and upcoming
            campus journeys.
          </p>
          <a href="/bookings">View bookings →</a>
        </article>

        {user && (
          <>
            <article className="feature-card">
              <span className="feature-icon">📊</span>
              <h2>My Ride Dashboard</h2>
              <p>
                View your ride statistics, booking trends,
                popular routes and activity analytics.
              </p>
              <a href="/dashboard">View Dashboard →</a>
            </article>

            <article className="feature-card">
              <span className="feature-icon">📋</span>
              <h2>Activity History</h2>
              <p>
                Track your logins, rides offered, bookings
                and booking cancellations.
              </p>
              <a href="/activity">View Activity History →</a>
            </article>
          </>
        )}
      </section>

      <footer>
        <p>CampusRide · Making campus travel simpler.</p>
      </footer>
    </main>
  );
}
