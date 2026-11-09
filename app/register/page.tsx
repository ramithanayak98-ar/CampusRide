
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful! You can now log in.");
        setFullName("");
        setEmail("");
        setPassword("");
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch {
      setMessage("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "30px 20px",
      background: "#eff6ff"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "450px",
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 5px 25px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{
          color: "#2563eb",
          textAlign: "center",
          marginBottom: "10px"
        }}>
          CampusRide
        </h1>

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          Create Your Account
        </h2>

        <p style={{
          textAlign: "center",
          color: "#64748b",
          marginBottom: "30px"
        }}>
          Join your campus ride-sharing community.
        </p>

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "15px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#2563eb"
          }}>
            {message}
          </p>
        )}

        <p style={{
          textAlign: "center",
          marginTop: "25px",
          color: "#64748b"
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#2563eb" }}>
            Login
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          <Link href="/" style={{ color: "#64748b" }}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "15px"
};
