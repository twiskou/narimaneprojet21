"use client";
import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Stats { sentimentBreakdown: { positive: number; negative: number; neutral: number }; totalMentions: number; analyzed: number; }
interface Mention { id: string; content: string; source: string; language: string; sentiment: { label: string; score: number } | null; publishedAt: string; authorName: string | null; }

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then(r => r.json()),
      fetch("/api/mentions?page=1").then(r => r.json()),
    ]).then(([s, m]) => {
      setStats(s);
      setMentions(m.mentions || []);
      setLoading(false);
    });
  }, []);

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#131f28", borderColor: "#1d2f3a", borderWidth: 1, titleColor: "#ddeee8", bodyColor: "#8faaa0" } },
    scales: { x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#5c7a70", font: { size: 11 } } }, y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#5c7a70", font: { size: 11 } } } },
  };

  // Breakdown by language
  const byLang = { EN: { pos: 0, neg: 0, neu: 0 }, FR: { pos: 0, neg: 0, neu: 0 }, AR: { pos: 0, neg: 0, neu: 0 } };
  const bySource = { TWITTER: { pos: 0, neg: 0, neu: 0 }, NEWS: { pos: 0, neg: 0, neu: 0 }, MANUAL: { pos: 0, neg: 0, neu: 0 } };

  mentions.forEach(m => {
    if (!m.sentiment) return;
    const lang = m.language as keyof typeof byLang;
    const src = m.source as keyof typeof bySource;
    const field = m.sentiment.label === "POSITIVE" ? "pos" : m.sentiment.label === "NEGATIVE" ? "neg" : "neu";
    if (byLang[lang]) byLang[lang][field]++;
    if (bySource[src]) bySource[src][field]++;
  });

  const negMentions = mentions.filter(m => m.sentiment?.label === "NEGATIVE").sort((a, b) => (b.sentiment?.score || 0) - (a.sentiment?.score || 0));

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{t.analyticsTitle}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t.analyticsSub}</p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />) :
          [
            { label: t.kpiTotalAnalyzed, value: stats?.analyzed ?? 0, color: "#2d8bba" },
            { label: t.kpiPosRate, value: stats && stats.analyzed > 0 ? `${Math.round((stats.sentimentBreakdown.positive / stats.analyzed) * 100)}%` : "0%", color: "#22c778" },
            { label: t.kpiNegRate, value: stats && stats.analyzed > 0 ? `${Math.round((stats.sentimentBreakdown.negative / stats.analyzed) * 100)}%` : "0%", color: "#ef4444" },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{label}</p>
              <p style={{ fontSize: 36, fontWeight: 800, color }}>{value}</p>
            </div>
          ))
        }
      </div>

      {/* Language & Source Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="glass" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{t.chartSentLang}</h2>
          <div style={{ height: 200 }}>
            {!loading && (
              <Bar
                data={{
                  labels: [t.langEN, t.langFR, t.langAR],
                  datasets: [
                    { label: "Positive", data: [byLang.EN.pos, byLang.FR.pos, byLang.AR.pos], backgroundColor: "rgba(34,199,120,0.7)", borderRadius: 4 },
                    { label: "Negative", data: [byLang.EN.neg, byLang.FR.neg, byLang.AR.neg], backgroundColor: "rgba(239,68,68,0.7)", borderRadius: 4 },
                    { label: "Neutral", data: [byLang.EN.neu, byLang.FR.neu, byLang.AR.neu], backgroundColor: "rgba(245,158,11,0.7)", borderRadius: 4 },
                  ],
                }}
                options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: true, position: "top" as const, labels: { color: "#5c7a70", boxWidth: 12, font: { size: 11 } } } } }}
              />
            )}
          </div>
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{t.chartSentSource}</h2>
          <div style={{ height: 200 }}>
            {!loading && (
              <Bar
                data={{
                  labels: ["Twitter", "News", "Manual"],
                  datasets: [
                    { label: "Positive", data: [bySource.TWITTER.pos, bySource.NEWS.pos, bySource.MANUAL.pos], backgroundColor: "rgba(34,199,120,0.7)", borderRadius: 4 },
                    { label: "Negative", data: [bySource.TWITTER.neg, bySource.NEWS.neg, bySource.MANUAL.neg], backgroundColor: "rgba(239,68,68,0.7)", borderRadius: 4 },
                    { label: "Neutral", data: [bySource.TWITTER.neu, bySource.NEWS.neu, bySource.MANUAL.neu], backgroundColor: "rgba(245,158,11,0.7)", borderRadius: 4 },
                  ],
                }}
                options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: true, position: "top" as const, labels: { color: "#5c7a70", boxWidth: 12, font: { size: 11 } } } } }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Overall Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
        <div className="glass" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, alignSelf: "flex-start" }}>{t.chartOverallDist}</h2>
          <div style={{ height: 180, width: "100%" }}>
            {stats && stats.analyzed > 0 && (
              <Doughnut
                data={{
                  labels: ["Positive", "Negative", "Neutral"],
                  datasets: [{ data: [stats.sentimentBreakdown.positive, stats.sentimentBreakdown.negative, stats.sentimentBreakdown.neutral], backgroundColor: ["rgba(16,185,129,0.8)", "rgba(239,68,68,0.8)", "rgba(245,158,11,0.8)"], borderColor: ["#10b981", "#ef4444", "#f59e0b"], borderWidth: 1, hoverOffset: 6 }],
                }}
                options={{ responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { position: "bottom", labels: { color: "#8faaa0", boxWidth: 12, padding: 12, font: { size: 11 } } }, tooltip: { backgroundColor: "#131f28" } } }}
              />
            )}
          </div>
        </div>

        {/* Top Negative Mentions */}
        <div className="glass" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{t.topNegMentions}</h2>
          {negMentions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", paddingTop: 40 }}>{t.noNegMentions}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {negMentions.slice(0, 5).map(m => (
                <div key={m.id} style={{ padding: "10px 14px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.content}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.authorName || "Unknown"}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>·</span>
                    <span style={{ fontSize: 11, color: "#f87171", fontWeight: 600 }}>Score: {m.sentiment ? (m.sentiment.score * 100).toFixed(0) : 0}%</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, padding: "1px 7px", background: "rgba(255,255,255,0.06)", borderRadius: 5, color: "var(--text-muted)" }}>{m.language}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
