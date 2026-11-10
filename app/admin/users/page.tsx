
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: "admin" | "student";
  created_at: string;
};

export default function ManageUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace("/dashboard");
          return;
        }

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load users.");
          return;
        }

        setUsers(data.users);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();

    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [users, search]);

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div>
          <h1>Manage Users</h1>
          <p>View all registered CampusRide accounts.</p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => router.push("/admin")}
        >
          Back to Dashboard
        </button>
      </header>

      <section style={styles.summary}>
        <div style={styles.summaryCard}>
          <span>Total Registered Users</span>
          <h2>{users.length}</h2>
        </div>

        <div style={styles.summaryCard}>
          <span>Students</span>
          <h2>{users.filter((u) => u.role === "student").length}</h2>
        </div>

        <div style={styles.summaryCard}>
          <span>Administrators</span>
          <h2>{users.filter((u) => u.role === "admin").length}</h2>
        </div>
      </section>

      <section style={styles.tableCard}>
        <h2>Registered Users</h2>

        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Full Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Registered On</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td style={styles.td}>{user.user_id}</td>
                    <td style={styles.td}>{user.full_name}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span
                        style={
                          user.role === "admin"
                            ? styles.adminBadge
                            : styles.studentBadge
                        }
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(user.created_at).toLocaleDateString("en-IN")}
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

const styles: Record<string, React.CSSProperties> = {
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
  summaryCard: {
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
  search: {
    width: "100%",
    maxWidth: "450px",
    padding: "13px",
    margin: "15px 0 25px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    boxSizing: "border-box",
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
  adminBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  studentBadge: {
    background: "#dbeafe",
    color: "#1e40af",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};
