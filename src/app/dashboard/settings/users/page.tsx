"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  orgName: string | null;
  createdAt: string;
}

const ROLE_STYLES = {
  ADMIN:   { bg: "rgba(239,68,68,0.12)",  color: "#f87171", border: "rgba(239,68,68,0.3)" },
  ANALYST: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  VIEWER:  { bg: "rgba(34,199,120,0.12)", color: "#22c778", border: "rgba(34,199,120,0.3)" },
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [currentId, setCurrentId]   = useState<string>("");
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
      setCurrentId(d.user.id);
    });
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (!res.ok) { router.replace("/dashboard"); return; }
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function changeRole(id: string, role: string) {
    setUpdatingId(id);
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    await load();
    setUpdatingId(null);
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await load();
    setDeletingId(null);
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    ADMIN:   users.filter(u => u.role === "ADMIN").length,
    ANALYST: users.filter(u => u.role === "ANALYST").length,
    VIEWER:  users.filter(u => u.role === "VIEWER").length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{t.usersTitle}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {users.length} {t.usersSub}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {(["ADMIN", "ANALYST", "VIEWER"] as const).map(role => {
          const st = ROLE_STYLES[role];
          return (
            <div key={role} className="stat-card" style={{ cursor: "pointer", border: roleFilter === role ? `1px solid ${st.border}` : undefined }}
              onClick={() => setRoleFilter(roleFilter === role ? "" : role)}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{role}</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: st.color }}>{counts[role]}</p>
            </div>
          );
        })}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="input-field"
          placeholder={`🔍 ${t.searchUsers}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select
          className="input-field"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ width: "auto", minWidth: 140 }}
        >
          <option value="">{t.allRoles}</option>
          <option value="ADMIN">ADMIN</option>
          <option value="ANALYST">ANALYST</option>
          <option value="VIEWER">VIEWER</option>
        </select>
        {(search || roleFilter) && (
          <button
            onClick={() => { setSearch(""); setRoleFilter(""); }}
            className="btn-secondary"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            ✕ {t.btnCancel || "Clear"}
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>
          {filtered.length} {t.usersFound}
        </span>
      </div>

      {/* Users table */}
      <div className="glass" style={{ overflow: "hidden", padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <p style={{ fontSize: 15 }}>{t.noUsersFound}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.tblUser}</th>
                <th>{t.tblEmail}</th>
                <th>{t.tblRole}</th>
                <th>{t.tblOrg}</th>
                <th>{t.tblDate}</th>
                <th>{t.tblActions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const st = ROLE_STYLES[u.role];
                const isSelf = u.id === currentId;
                const isUpdating = updatingId === u.id;
                const isDeleting = deletingId === u.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: "linear-gradient(135deg,#2d8bba,#22c778)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, color: "#fff", fontSize: 13, flexShrink: 0,
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            {u.name} {isSelf && <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>({t.yourAccount})</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{u.email}</td>
                    <td>
                      <span style={{
                        padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                        background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.orgName || "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {isSelf ? (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>{t.yourAccount}</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {/* Role select */}
                          <select
                            className="input-field"
                            value={u.role}
                            disabled={isUpdating}
                            onChange={e => changeRole(u.id, e.target.value)}
                            style={{ width: "auto", minWidth: 110, padding: "5px 10px", fontSize: 12 }}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                          {isUpdating && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>...</span>}
                          {/* Delete */}
                          <button
                            onClick={() => deleteUser(u.id, u.name)}
                            disabled={isDeleting}
                            className="btn-danger"
                            style={{ padding: "5px 10px", fontSize: 12 }}
                            title="Delete user"
                          >
                            {isDeleting ? "…" : "✕"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
