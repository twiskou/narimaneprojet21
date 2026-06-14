"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LangContext";
import { translations, Lang } from "@/lib/translations";

const getNav = (role: string, t: any) => {
  const base = [
    { href: `/dashboard/${role.toLowerCase()}`, icon: "⊞", label: t.navDashboard },
    { href: "/dashboard/mentions", icon: "✦", label: t.navMentions },
  ];
  if (role === "ADMIN" || role === "ANALYST") {
    base.push({ href: "/dashboard/analytics", icon: "◈", label: t.navAnalytics });
    base.push({ href: "/dashboard/missions", icon: "🎯", label: t.navMissions });
  }
  base.push({ href: "/dashboard/alerts", icon: "◉", label: t.navAlerts });
  base.push({ href: "/dashboard/settings", icon: "◎", label: t.navSettings });
  if (role === "ADMIN") {
    base.push({ href: "/dashboard/settings/users", icon: "👥", label: t.navUsers });
  }
  return base;
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLang();
  const t = translations[lang];
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    fetch("/api/alerts?isRead=false").then(r => r.json()).then(d => {
      if (d.alerts) setUnreadAlerts(d.alerts.length);
    });
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isRtl = t.dir === "rtl";
  const sidebarStyle: React.CSSProperties = {
    width: 240,
    background: "var(--bg-secondary)",
    borderRight: isRtl ? "none" : "1px solid var(--border)",
    borderLeft: isRtl ? "1px solid var(--border)" : "none",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    position: "fixed",
    top: 0, bottom: 0,
    ...(isRtl ? { right: 0 } : { left: 0 }),
    zIndex: 100,
    transition: "transform 0.3s ease",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} dir={t.dir}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, padding: "0 6px" }}>
          <div style={{ width: 60, height: 60, position: "relative", flexShrink: 0 }}>
            <Image src="/logo.png" alt="NARP-SMART Logo" fill style={{ objectFit: "contain" }} priority />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#2d8bba,#22c778,#6b9e90)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NARP-SMART</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.05em" }}>PR Intelligence</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {getNav(user?.role || 'VIEWER', t).map(({ href, icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={`sidebar-link${active ? " active" : ""}`}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span>
                <span>{label}</span>
                {label === "Alerts" && unreadAlerts > 0 && (
                  <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: "100px", fontSize: 11, fontWeight: 700, padding: "1px 7px", minWidth: 20, textAlign: "center" }}>
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle + User card */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 }}>
          
          {/* Language Switcher */}
          <div style={{ display: "flex", gap: 8, padding: "0 4px", marginBottom: 12 }}>
            {(["AR", "FR", "EN"] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 600,
                  borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
                  background: lang === l ? "var(--accent-blue)" : "rgba(255,255,255,0.05)",
                  color: lang === l ? "#fff" : "var(--text-secondary)",
                  border: lang === l ? "none" : "1px solid var(--border)"
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "8px 14px", marginBottom: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              borderRadius: 10, cursor: "pointer", color: "var(--text-secondary)",
              fontSize: 13, fontWeight: 500, transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{theme === "dark" ? t.lightMode : t.darkMode}</span>
          </button>
          {user && (
            <div style={{ padding: "10px 8px", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
              <span className="badge" style={{ 
                marginTop: 6, fontSize: 10, padding: "2px 8px",
                background: user.role === 'ADMIN' ? 'rgba(239,68,68,0.15)' : user.role === 'ANALYST' ? 'rgba(245,158,11,0.15)' : 'rgba(34,199,120,0.15)',
                color: user.role === 'ADMIN' ? '#ef4444' : user.role === 'ANALYST' ? '#f59e0b' : '#22c778',
                border: `1px solid ${user.role === 'ADMIN' ? 'rgba(239,68,68,0.3)' : user.role === 'ANALYST' ? 'rgba(245,158,11,0.3)' : 'rgba(34,199,120,0.3)'}`
              }}>{user.role}</span>
            </div>
          )}
          <button onClick={logout} className="sidebar-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "#f87171" }}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{isRtl ? "←" : "→"}</span>
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, ...(isRtl ? { marginRight: 240 } : { marginLeft: 240 }), minHeight: "100vh", padding: "32px 32px 32px 32px" }}>
        {children}
      </main>
    </div>
  );
}
