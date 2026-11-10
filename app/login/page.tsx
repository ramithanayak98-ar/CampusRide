
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const role = data.user?.role;

        setMessage("Login successful! Redirecting...");

        if (role === "admin") {
          router.replace("/admin");
        } else if (role === "student") {
          router.replace("/dashboard");
        } else {
          setMessage("Your account role is invalid. Please contact support.");
        }

        router.refresh();
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch {
      setMessage("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.brand}>CampusRide</h1>

        <h2 style={styles.heading}>Welcome Back!</h2>

        <p style={styles.subtitle}>
          Login to continue your campus journey.
        </p>

        <div style={styles.info}>
          <strong>Student and Admin Login</strong>
          <p>
            Your account role will be detected automatically
            after successful login.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email Address</label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p style={styles.message}>{message}</p>
        )}

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link href="/register" style={styles.link}>
            Register as Student
          </Link>
        </p>

        <p style={styles.home}>
          <Link href="/" style={styles.homeLink}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 20px",
    background: "#eff6ff",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    background: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
  },
  brand: {
    color: "#2563eb",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "30px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "10px",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "25px",
  },
  info: {
    background: "#eff6ff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "25px",
    color: "#1e40af",
    fontSize: "14px",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
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
    marginTop: "5px",
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
    marginTop: "20px",
    color: "#2563eb",
  },
  footer: {
    textAlign: "center",
    marginTop: "25px",
    color: "#64748b",
  },
  link: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  home: {
    textAlign: "center",
    marginTop: "18px",
  },
  homeLink: {
    color: "#64748b",
    textDecoration: "none",
  },
};
