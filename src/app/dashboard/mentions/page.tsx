"use client";
import React, { useState, useEffect, useCallback, Fragment } from "react";
import { Sparkles, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

interface AIResult {
  id: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  score: number;
  crisisRisk: number;
  summary: string;
  keywords?: string[];
  scorePercent?: number;
  crisisRiskPercent?: number;
}

interface Mention {
  id: string;
  content: string;
  source: string;
  language: string;
  authorName: string | null;
  url: string | null;
  publishedAt: string;
  sentiment: { label: string; score: number } | null;
  aiAnalysis: { id: string; sentiment: string; score: number; crisisRisk: number; summary: string } | null;
}

const SOURCES = ["", "TWITTER", "NEWS", "MANUAL"];
const LANGUAGES = ["", "EN", "FR", "AR"];

const SENTIMENT_COLORS = {
  POSITIVE: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", border: "rgba(34,197,94,0.3)", icon: "▲" },
  NEGATIVE: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", border: "rgba(239,68,68,0.3)", icon: "▼" },
  NEUTRAL:  { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.3)", icon: "●" },
};

function getRiskColor(pct: number) {
  if (pct <= 30) return "#22c55e";
  if (pct <= 60) return "#f59e0b";
  return "#ef4444";
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 99, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function AIResultCard({ result }: { result: AIResult }) {
  const sc = SENTIMENT_COLORS[result.sentiment] ?? SENTIMENT_COLORS.NEUTRAL;
  const scorePercent = result.scorePercent ?? Math.round(result.score * 100);
  const riskPercent = result.crisisRiskPercent ?? Math.round(result.crisisRisk * 100);
  const riskColor = getRiskColor(riskPercent);
  const keywords: string[] = result.keywords ?? [];

  return (
    <div style={{
      marginTop: 12,
      border: `1px solid ${sc.border}`,
      borderRadius: 12,
      overflow: "hidden",
      background: "var(--bg-secondary)",
    }}>
      <div style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid var(--border)` }}>
        <div style={{ padding: "12px 18px", background: sc.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 110, borderRight: `1px solid var(--border)` }}>
          <span style={{ fontSize: 22 }}>{sc.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: sc.color, letterSpacing: "0.06em" }}>{result.sentiment}</span>
        </div>
        <div style={{ flex: 1, padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", width: 70, flexShrink: 0 }}>التقييم</span>
            <ProgressBar value={scorePercent} color={sc.color} />
            <span style={{ fontSize: 12, fontWeight: 700, color: sc.color, width: 36, textAlign: "right" }}>{scorePercent}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", width: 70, flexShrink: 0 }}>خطر الأزمة</span>
            <ProgressBar value={riskPercent} color={riskColor} />
            <span style={{ fontSize: 12, fontWeight: 700, color: riskColor, width: 36, textAlign: "right" }}>{riskPercent}%</span>
          </div>
        </div>
      </div>

      {keywords.length > 0 && (
        <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 6, borderBottom: `1px solid var(--border)` }}>
          {keywords.map((kw, i) => (
            <span key={i} style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {kw}
            </span>
          ))}
        </div>
      )}

      <div style={{ padding: "10px 16px" }}>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
          {result.summary}
        </p>
      </div>
    </div>
  );
}

export default function MentionsPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [aiResults, setAiResults] = useState<Record<string, AIResult>>({});
  const [filters, setFilters] = useState({ source: "", language: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content: "", source: "MANUAL", language: "EN", authorName: "", url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { lang } = useLang();
  const t = translations[lang];

  const pendingCount = mentions.filter(m => !m.sentiment).length;

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setUserRole(d.user.role);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filters.source) params.set("source", filters.source);
    if (filters.language) params.set("language", filters.language);
    const res = await fetch(`/api/mentions?${params}`);
    const data = await res.json();
    setMentions(data.mentions || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  async function addMention(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/mentions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ content: "", source: "MANUAL", language: "EN", authorName: "", url: "" });
    setShowForm(false);
    await load();
    setSubmitting(false);
  }

  async function analyzeWithAI(id: string) {
    setAnalyzing(id);
    setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التحليل");
      setAiResults(prev => ({ ...prev, [id]: data.analysis }));
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      setErrors(prev => ({ ...prev, [id]: msg }));
    } finally {
      setAnalyzing(null);
    }
  }

  async function analyzeAll() {
    setAnalyzingAll(true);
    const pending = mentions.filter(m => !m.sentiment && !m.aiAnalysis);
    for (const m of pending) {
      await analyzeWithAI(m.id);
    }
    setAnalyzingAll(false);
  }

  async function deleteMention(id: string) {
    if (!confirm("هل تريد حذف هذه الإشارة نهائياً؟")) return;
    await fetch(`/api/mentions/${id}`, { method: "DELETE" });
    await load();
  }

  const isAnalyst = userRole === "ANALYST" || userRole === "ADMIN";
  const sentimentStyle = (label: string) => SENTIMENT_COLORS[label as keyof typeof SENTIMENT_COLORS] ?? SENTIMENT_COLORS.NEUTRAL;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{t.mentionsTitle}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{total} {t.mentionsSub} • {pendingCount} {t.mentionsPending}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isAnalyst && pendingCount > 0 && (
            <button onClick={analyzeAll} className="btn-secondary" disabled={analyzingAll} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              {analyzingAll ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {analyzingAll ? t.analyzing : `${t.btnAnalyzePending} (${pendingCount})`}
            </button>
          )}
          <button id="add-mention-btn" onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? `✕ ${t.btnCancel}` : `+ ${t.btnAddMention}`}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{t.formNewMention}</h2>
          <form onSubmit={addMention} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>{t.formContent} *</label>
              <textarea className="input-field" rows={3} required placeholder="..."
                value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
              {([
                { label: t.formSource, key: "source", opts: ["MANUAL", "TWITTER", "NEWS"] },
                { label: t.formLanguage, key: "language", opts: ["EN", "FR", "AR"] },
              ] as const).map(({ label, key, opts }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>
                  <select className="input-field" value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>{t.formAuthor}</label>
                <input className="input-field" placeholder="@pseudo" value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>{t.formUrl}</label>
                <input className="input-field" placeholder="https://…" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: "flex-start" }}>
              {submitting ? "..." : `✓ ${t.btnAdd}`}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {([
          { label: t.filterAllSources, key: "source", opts: SOURCES },
          { label: t.filterAllLangs, key: "language", opts: LANGUAGES },
        ] as const).map(({ label, key, opts }) => (
          <select key={key} className="input-field" style={{ width: "auto", minWidth: 140 }}
            value={filters[key as keyof typeof filters]}
            onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1); }}>
            <option value="">{label}</option>
            {opts.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />)}
          </div>
        ) : mentions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 15, marginBottom: 6 }}>{t.noMentionsFound}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.tblContent}</th>
                <th>{t.formSource}</th>
                <th>{t.formLanguage}</th>
                <th>{t.formAuthor}</th>
                <th>{t.tblDate}</th>
                <th>{t.tblSentiment}</th>
                <th style={{ minWidth: 140 }}>{t.tblActions}</th>
              </tr>
            </thead>
            <tbody>
              {mentions.map((m) => {
                const aiResult = aiResults[m.id];
                const hasAnalysis = !!m.aiAnalysis || !!aiResult;
                const sentSt = m.sentiment ? sentimentStyle(m.sentiment.label) : null;
                return (
                  <Fragment key={m.id}>
                    <tr>
                      <td style={{ maxWidth: 320 }}>
                        <p style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{m.content}</p>
                      </td>
                      <td><span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", fontSize: 11 }}>{m.source}</span></td>
                      <td><span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", fontSize: 11, fontWeight: 600 }}>{m.language}</span></td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.authorName || "—"}</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(m.publishedAt).toLocaleDateString()}</td>
                      <td>
                        {sentSt ? (
                          <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: sentSt.bg, color: sentSt.color, border: `1px solid ${sentSt.border}` }}>
                            {sentSt.icon} {m.sentiment!.label}
                          </span>
                        ) : (
                          <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.08)" }}>{t.kpiPending}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {isAnalyst && (
                            hasAnalysis ? (
                              <button disabled style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)", cursor: "default" }}>
                                <CheckCircle size={13} /> تم التحليل
                              </button>
                            ) : (
                              <button onClick={() => analyzeWithAI(m.id)} disabled={analyzing === m.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: analyzing === m.id ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", cursor: analyzing === m.id ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                                {analyzing === m.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                {analyzing === m.id ? t.analyzing : t.btnAiAnalyze}
                              </button>
                            )
                          )}
                          <button onClick={() => deleteMention(m.id)} style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", borderRadius: 8, fontSize: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", transition: "background 0.2s" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {errors[m.id] && <p style={{ marginTop: 4, fontSize: 11, color: "#ef4444" }}>⚠ {errors[m.id]}</p>}
                      </td>
                    </tr>
                    {(aiResult || m.aiAnalysis) && (
                      <tr key={`ai-${m.id}`}>
                        <td colSpan={7} style={{ padding: "0 16px 16px" }}>
                          <AIResultCard result={aiResult ?? { ...m.aiAnalysis!, keywords: [], scorePercent: Math.round(m.aiAnalysis!.score * 100), crisisRiskPercent: Math.round(m.aiAnalysis!.crisisRisk * 100) }} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}

        {total > 15 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, borderTop: "1px solid var(--border)" }}>
            <button className="btn-secondary" style={{ padding: "6px 14px" }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
            <span style={{ padding: "6px 14px", fontSize: 13, color: "var(--text-muted)" }}>{page} / {Math.ceil(total / 20)}</span>
            <button className="btn-secondary" style={{ padding: "6px 14px" }} disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}
