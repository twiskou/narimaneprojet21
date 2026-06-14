"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { UploadCloud, File, CheckCircle, XCircle, X, ArrowLeft, ArrowRight, Sparkles, AlertTriangle, Target, Clock, TrendingUp, Users, BarChart3, Lightbulb } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

interface TargetProfile {
  fullName: string;
  role: string;
  organization: string;
  fileUrl: string;
  fileType: string;
  notes: string;
}

interface Activity {
  type: string;
  label: string;
  description: string;
}

interface MissionActivity {
  id: string;
  type: string;
  label: string;
  description: string | null;
}

interface MissionTargetProfile {
  id: string;
  fullName: string;
  role: string | null;
  organization: string | null;
  fileUrl: string | null;
  fileType: string | null;
  notes: string | null;
}

interface Mission {
  id: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "DRAFT" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  authorId: string;
  user: { name: string; role: string };
  targetProfile: MissionTargetProfile | null;
  activities: MissionActivity[];
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; icon: string }> = {
  ACTIVE:    { bg: "rgba(34,197,94,0.12)", color: "#22c55e", border: "rgba(34,197,94,0.3)", icon: "⚡" },
  DRAFT:     { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", border: "rgba(156,163,175,0.3)", icon: "📝" },
  COMPLETED: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "rgba(59,130,246,0.3)", icon: "✅" },
  CANCELLED: { bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.25)", icon: "✕" },
};

const ACTIVITY_TYPES = [
  { type: 'PRESS_RELEASE',         emoji: '🗞', label: 'بيان صحفي' },
  { type: 'SOCIAL_CAMPAIGN',       emoji: '📱', label: 'حملة على وسائل التواصل' },
  { type: 'EVENT_ORGANIZATION',    emoji: '🎪', label: 'تنظيم فعالية' },
  { type: 'MEDIA_INTERVIEW',       emoji: '🎙', label: 'مقابلة إعلامية' },
  { type: 'CRISIS_RESPONSE',       emoji: '🚨', label: 'إدارة الأزمات' },
  { type: 'MONITORING_REPORT',     emoji: '📊', label: 'تقرير مراقبة' },
  { type: 'TRAINING_SESSION',      emoji: '🎓', label: 'جلسة تدريبية' },
  { type: 'PARTNERSHIP_OUTREACH',  emoji: '🤝', label: 'شراكة وتواصل' },
  { type: 'INTERNAL_COMMUNICATION',emoji: '📢', label: 'تواصل داخلي' },
  { type: 'OTHER',                 emoji: '➕', label: 'أخرى' },
];

export default function MissionsPage() {
  const [missions, setMissions]   = useState<Mission[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilter] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [currentUser, setCurrentUser] = useState<{ userId: string; role: string; name: string } | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const { lang } = useLang();
  const t = translations[lang];
  
  const [step, setStep] = useState(1);
  const [targetProfile, setTargetProfile] = useState<TargetProfile>({ fullName: "", role: "", organization: "", fileUrl: "", fileType: "", notes: "" });
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [missionData, setMissionData] = useState({ title: "", description: "", authorNote: "", status: "DRAFT" as const });
  
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  // AI Strategy states
  const [aiStrategy, setAiStrategy] = useState<any>(null);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [showAiStrategy, setShowAiStrategy] = useState(false);
  const [strategyMissionTitle, setStrategyMissionTitle] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setCurrentUser({ userId: d.user.id, role: d.user.role, name: d.user.name });
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/missions?${params}`);
    const data = await res.json();
    setMissions(data.missions || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus("IDLE");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setTargetProfile(prev => ({ ...prev, fileUrl: data.url, fileType: data.fileType }));
        setUploadStatus("SUCCESS");
      } else {
        console.error("Upload error:", data.error);
        setUploadStatus("ERROR");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("ERROR");
    } finally {
      setUploading(false);
    }
  };

  const toggleActivity = (type: string, defaultLabel: string) => {
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.type === type);
      if (exists) return prev.filter(a => a.type !== type);
      return [...prev, { type, label: defaultLabel, description: "" }];
    });
  };

  const updateActivityField = (type: string, field: "label" | "description", value: string) => {
    setSelectedActivities(prev => prev.map(a => a.type === type ? { ...a, [field]: value } : a));
  };

  const updateMissionStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/missions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast("تم تحديث الحالة بنجاح ✅");
        setSelectedMission(prev => prev ? { ...prev, status: newStatus as any } : null);
        load();
      } else {
        showToast("حدث خطأ أثناء التحديث ❌");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateAiStrategy = async (mission: Mission) => {
    setGeneratingStrategy(true);
    setAiStrategy(null);
    setStrategyMissionTitle(mission.title);
    setSelectedMission(null);
    setShowAiStrategy(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}/ai-strategy`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.strategy) {
        setAiStrategy(data.strategy);
      } else {
        showToast("حدث خطأ أثناء إنشاء الاستراتيجية ❌");
        setShowAiStrategy(false);
      }
    } catch (e) {
      console.error(e);
      showToast("خطأ في الشبكة ❌");
      setShowAiStrategy(false);
    } finally {
      setGeneratingStrategy(false);
    }
  };

  async function createMission() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: missionData.title,
          description: missionData.description,
          status: missionData.status,
          authorNote: missionData.authorNote,
          targetProfile: {
            fullName: targetProfile.fullName,
            role: targetProfile.role,
            organization: targetProfile.organization,
            fileUrl: targetProfile.fileUrl,
            fileType: targetProfile.fileType,
            notes: targetProfile.notes,
          },
          activities: selectedActivities.map(a => ({
            type: a.type,
            label: a.label || a.type,
            description: a.description || '',
          }))
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create mission');
      }
      
      showToast("تم إنشاء المهمة بنجاح ✅");
      resetForm();
      setShowForm(false);
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  const resetForm = () => {
    setStep(1);
    setTargetProfile({ fullName: "", role: "", organization: "", fileUrl: "", fileType: "", notes: "" });
    setSelectedActivities([]);
    setMissionData({ title: "", description: "", authorNote: "", status: "DRAFT" });
    setUploadStatus("IDLE");
  };

  const counts = {
    ACTIVE: missions.filter(m => m.status === "ACTIVE").length,
    COMPLETED: missions.filter(m => m.status === "COMPLETED").length,
    CANCELLED: missions.filter(m => m.status === "CANCELLED").length,
  };

  const canEdit = currentUser?.role !== "VIEWER";

  return (
    <div style={{ paddingBottom: 60 }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 30, right: 30,
          background: "var(--bg-card)", border: "1px solid rgba(34,197,94,0.3)",
          color: "#22c55e", padding: "12px 24px", borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 1000,
          display: "flex", alignItems: "center", gap: 8,
          animation: "slideIn 0.3s ease-out forwards"
        }}>
          {toast.message}
        </div>
      )}

      {selectedMission && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, backdropFilter: "blur(4px)"
        }}>
          <div className="glass animate-in zoom-in-95 duration-200" style={{
            background: "var(--bg-card)",
            width: "100%", maxWidth: 650, maxHeight: "90vh", overflowY: "auto",
            borderRadius: 16, padding: 32, position: "relative",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <button 
              onClick={() => setSelectedMission(null)}
              className="btn-secondary" 
              style={{ position: "absolute", top: 24, right: 24, padding: 8, borderRadius: "50%" }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, paddingRight: 40, color: "var(--text-primary)" }}>
              {selectedMission.title}
            </h2>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                padding: "4px 14px", borderRadius: 100,
                background: STATUS_STYLES[selectedMission.status]?.bg || STATUS_STYLES.DRAFT.bg, 
                color: STATUS_STYLES[selectedMission.status]?.color || STATUS_STYLES.DRAFT.color,
                border: `1px solid ${STATUS_STYLES[selectedMission.status]?.border || STATUS_STYLES.DRAFT.border}`,
                fontSize: 12, fontWeight: 700
              }}>
                {t[`missionStatus${selectedMission.status.charAt(0).toUpperCase() + selectedMission.status.slice(1).toLowerCase()}` as keyof typeof t] || selectedMission.status}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                {t.missionCreatedBy} <strong style={{color:"var(--text-secondary)", marginLeft: 4}}>{selectedMission.user.name}</strong>
              </span>
              
              {canEdit && selectedMission.status === "ACTIVE" && (
                <button
                  onClick={() => updateMissionStatus(selectedMission.id, "COMPLETED")}
                  className="btn-primary"
                  style={{ marginLeft: "auto", padding: "6px 14px", fontSize: 12, background: "#3b82f6", color: "white", border: "none" }}
                >
                  ✓ تعيين كمكتملة
                </button>
              )}
            </div>

            {selectedMission.description && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 15, color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.6, background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12 }}>
                  {selectedMission.description}
                </p>
              </div>
            )}

            {selectedMission.targetProfile && (
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.missionTarget}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(99,102,241,0.05)", padding: 20, borderRadius: 12, border: "1px solid rgba(99,102,241,0.15)" }}>
                  <div>
                    <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>{selectedMission.targetProfile.fullName}</strong>
                  </div>
                  {selectedMission.targetProfile.organization && (
                    <div>
                      <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>{selectedMission.targetProfile.organization}</strong>
                    </div>
                  )}
                  {selectedMission.targetProfile.role && (
                    <div>
                      <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>{selectedMission.targetProfile.role}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedMission.activities && selectedMission.activities.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{selectedMission.activities.length} {t.missionActivities}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedMission.activities.map(act => (
                    <div key={act.id} style={{ padding: 16, background: "var(--bg-body)", borderRadius: 10, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{act.label}</div>
                      {act.description && <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>{act.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Strategy Button */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => generateAiStrategy(selectedMission)}
                style={{
                  width: "100%", padding: "14px 24px", borderRadius: 12, cursor: "pointer",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                  border: "none", color: "white", fontSize: 15, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <Sparkles size={20} />
                ✨ توليد استراتيجية العلاقات العامة بالذكاء الاصطناعي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Strategy Full-Screen Modal */}
      {showAiStrategy && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 2000,
          display: "flex", flexDirection: "column",
          backdropFilter: "blur(8px)",
          overflowY: "auto",
        }}>
          <div style={{ maxWidth: 900, width: "100%", margin: "0 auto", padding: "32px 24px 80px" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
                  ✨ NARP-SMART • الاستخبارات الاستراتيجية بالذكاء الاصطناعي
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                  استراتيجية العلاقات العامة بالذكاء الاصطناعي
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{strategyMissionTitle}</p>
              </div>
              <button
                onClick={() => setShowAiStrategy(false)}
                style={{ padding: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, cursor: "pointer", color: "white" }}
              >
                <X size={20} />
              </button>
            </div>

            {generatingStrategy ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "80px 0" }}>
                <div style={{
                  width: 70, height: 70, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 40px rgba(99,102,241,0.6)",
                  animation: "pulse 2s infinite",
                }}>
                  <Sparkles size={30} color="white" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>جارٍ تحليل المهمة بالذكاء الاصطناعي...</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>يقوم المستشار الذكي بتحليل مهمتك وإنشاء توصيات استراتيجية متخصصة</p>
                </div>
              </div>
            ) : aiStrategy && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* 1. Executive Summary */}
                <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ padding: 8, background: "rgba(99,102,241,0.2)", borderRadius: 10 }}><Lightbulb size={18} color="#818cf8" /></div>
                    <h2 style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>01 · الملخص التنفيذي</h2>
                  </div>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, margin: 0 }}>{aiStrategy.executiveSummary}</p>
                </div>

                {/* 2. Risk Assessment — prominently placed */}
                {aiStrategy.riskAssessment && (
                  <div style={{
                    background: aiStrategy.riskAssessment.level === "CRITICAL" ? "rgba(239,68,68,0.12)" :
                                aiStrategy.riskAssessment.level === "HIGH" ? "rgba(245,158,11,0.12)" :
                                aiStrategy.riskAssessment.level === "MEDIUM" ? "rgba(59,130,246,0.12)" : "rgba(34,197,94,0.1)",
                    border: `1px solid ${aiStrategy.riskAssessment.level === "CRITICAL" ? "rgba(239,68,68,0.4)" : aiStrategy.riskAssessment.level === "HIGH" ? "rgba(245,158,11,0.4)" : aiStrategy.riskAssessment.level === "MEDIUM" ? "rgba(59,130,246,0.4)" : "rgba(34,197,94,0.3)"}`,
                    borderRadius: 16, padding: 28,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ padding: 8, background: "rgba(255,255,255,0.1)", borderRadius: 10 }}><AlertTriangle size={18} color={aiStrategy.riskAssessment.level === "CRITICAL" ? "#f87171" : aiStrategy.riskAssessment.level === "HIGH" ? "#fbbf24" : "#60a5fa"} /></div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>05 · تقييم المخاطر</h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color: aiStrategy.riskAssessment.level === "CRITICAL" ? "#f87171" : aiStrategy.riskAssessment.level === "HIGH" ? "#fbbf24" : aiStrategy.riskAssessment.level === "MEDIUM" ? "#60a5fa" : "#4ade80" }}>
                          {aiStrategy.riskAssessment.score}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>/100</div>
                      </div>
                      <div>
                        <span style={{
                          padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 800,
                          background: aiStrategy.riskAssessment.level === "CRITICAL" ? "rgba(239,68,68,0.2)" : aiStrategy.riskAssessment.level === "HIGH" ? "rgba(245,158,11,0.2)" : aiStrategy.riskAssessment.level === "MEDIUM" ? "rgba(59,130,246,0.2)" : "rgba(34,197,94,0.2)",
                          color: aiStrategy.riskAssessment.level === "CRITICAL" ? "#f87171" : aiStrategy.riskAssessment.level === "HIGH" ? "#fbbf24" : aiStrategy.riskAssessment.level === "MEDIUM" ? "#60a5fa" : "#4ade80",
                          border: "1px solid currentColor", display: "inline-block", marginBottom: 8
                        }}>
                          {aiStrategy.riskAssessment.level}
                        </span>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>{aiStrategy.riskAssessment.explanation}</p>
                      </div>
                    </div>
                    {aiStrategy.riskAssessment.mainRisks?.length > 0 && (
                      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {aiStrategy.riskAssessment.mainRisks.map((r: string, i: number) => (
                          <span key={i} style={{ fontSize: 12, padding: "4px 12px", background: "rgba(255,255,255,0.07)", borderRadius: 100, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>⚠ {r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Grid: Stakeholders + Objectives */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* 2. Stakeholders */}
                  {aiStrategy.stakeholders && (
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ padding: 8, background: "rgba(34,197,94,0.15)", borderRadius: 10 }}><Users size={16} color="#4ade80" /></div>
                        <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>02 · أصحاب المصلحة</h2>
                      </div>
                      {[
                        { label: "🏢 داخليون", items: aiStrategy.stakeholders.internal },
                        { label: "🌍 خارجيون", items: aiStrategy.stakeholders.external },
                        { label: "📣 مؤثرون", items: aiStrategy.stakeholders.influencers },
                        { label: "📺 إعلام", items: aiStrategy.stakeholders.media },
                        { label: "🏛 سلطات", items: aiStrategy.stakeholders.authorities },
                      ].map(({ label, items }) => items?.length > 0 && (
                        <div key={label} style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                          {items.map((item: string, i: number) => (
                            <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>• {item}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Communication Objectives */}
                  {aiStrategy.communicationObjectives && (
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ padding: 8, background: "rgba(59,130,246,0.15)", borderRadius: 10 }}><Target size={16} color="#60a5fa" /></div>
                        <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>03 · الأهداف</h2>
                      </div>
                      {[
                        { label: "⚡ قصير المدى", items: aiStrategy.communicationObjectives.shortTerm, color: "#4ade80" },
                        { label: "📈 متوسط المدى", items: aiStrategy.communicationObjectives.mediumTerm, color: "#60a5fa" },
                        { label: "🎯 طويل المدى", items: aiStrategy.communicationObjectives.longTerm, color: "#c084fc" },
                      ].map(({ label, items, color }) => items?.length > 0 && (
                        <div key={label} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                          {items.map((obj: string, i: number) => (
                            <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>→ {obj}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Recommended Actions */}
                {aiStrategy.recommendedActions?.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ padding: 8, background: "rgba(245,158,11,0.15)", borderRadius: 10 }}><TrendingUp size={18} color="#fbbf24" /></div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>04 · الإجراءات الموصى بها</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {aiStrategy.recommendedActions.map((a: any, i: number) => (
                        <div key={i} style={{ padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <span style={{
                            padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 800, flexShrink: 0,
                            background: a.priority === "HIGH" ? "rgba(239,68,68,0.2)" : a.priority === "MEDIUM" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.15)",
                            color: a.priority === "HIGH" ? "#f87171" : a.priority === "MEDIUM" ? "#fbbf24" : "#4ade80",
                            border: "1px solid currentColor"
                          }}>{a.priority}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>{a.category}</div>
                            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 4 }}>{a.action}</div>
                            {a.rationale && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>💡 {a.rationale}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Timeline */}
                {aiStrategy.timeline && (
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ padding: 8, background: "rgba(168,85,247,0.15)", borderRadius: 10 }}><Clock size={18} color="#c084fc" /></div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>06 · خارطة الطريق</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                      {[
                        { phase: "0 – 24 ساعة", items: aiStrategy.timeline.h24, color: "#f87171", bg: "rgba(239,68,68,0.08)" },
                        { phase: "24 – 48 ساعة", items: aiStrategy.timeline.h48, color: "#fbbf24", bg: "rgba(245,158,11,0.08)" },
                        { phase: "3 – 7 أيام", items: aiStrategy.timeline.week1, color: "#60a5fa", bg: "rgba(59,130,246,0.08)" },
                        { phase: "1 – 4 أسابيع", items: aiStrategy.timeline.month1, color: "#4ade80", bg: "rgba(34,197,94,0.08)" },
                      ].map(({ phase, items, color, bg }) => items?.length > 0 && (
                        <div key={phase} style={{ background: bg, borderRadius: 12, padding: 16, border: `1px solid ${color}30` }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>📅 {phase}</div>
                          {items.map((item: string, i: number) => (
                            <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", lineHeight: 1.5 }}>• {item}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. KPIs */}
                {aiStrategy.kpis?.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ padding: 8, background: "rgba(34,197,94,0.15)", borderRadius: 10 }}><BarChart3 size={18} color="#4ade80" /></div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>07 · مؤشرات قياس النجاح</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
                      {aiStrategy.kpis.map((kpi: any, i: number) => (
                        <div key={i} style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>{kpi.indicator}</div>
                          <div style={{ fontSize: 14, color: "#4ade80", fontWeight: 600, marginBottom: 4 }}>🎯 {kpi.target}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>📏 {kpi.measurement}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. AI Recommendations */}
                {aiStrategy.aiRecommendations?.length > 0 && (
                  <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 16, padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ padding: 8, background: "rgba(99,102,241,0.2)", borderRadius: 10 }}><Sparkles size={18} color="#818cf8" /></div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: 1.5, margin: 0 }}>08 · التوصيات الاستراتيجية للذكاء الاصطناعي</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {aiStrategy.aiRecommendations.map((rec: string, i: number) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.15)" }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>✦</span>
                          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  تم إنشاء هذا التقرير بواسطة NARP-SMART Intelligence IA • مدعوم بـ Llama 3.3 70B عبر Groq
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {!showForm ? (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{t.missionsTitle}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                {total} {t.missionsSub}
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="btn-primary"
                style={{ padding: "10px 20px", fontSize: 15 }}
              >
                ＋ {t.btnNewMission}
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {(["ACTIVE", "COMPLETED", "CANCELLED"] as const).map(s => {
              const st = STATUS_STYLES[s];
              return (
                <button
                  key={s}
                  onClick={() => { setFilter(filterStatus === s ? "" : s); setPage(1); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 100, cursor: "pointer",
                    background: filterStatus === s ? st.bg : "var(--bg-card)",
                    border: `1px solid ${filterStatus === s ? st.border : "var(--border)"}`,
                    color: filterStatus === s ? st.color : "var(--text-secondary)",
                    fontWeight: filterStatus === s ? 700 : 400,
                    fontSize: 13, transition: "all 0.2s",
                  }}
                >
                  <span>{st.icon}</span>
                  <span>{t[`missionStatus${s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}` as keyof typeof t] || s}</span>
                  <span style={{
                    background: filterStatus === s ? st.border : "rgba(255,255,255,0.06)",
                    borderRadius: 100, padding: "0 7px", fontSize: 11, fontWeight: 700,
                    color: filterStatus === s ? st.color : "var(--text-muted)",
                  }}>
                    {counts[s]}
                  </span>
                </button>
              );
            })}
            {filterStatus && (
              <button
                onClick={() => { setFilter(""); setPage(1); }}
                style={{
                  padding: "8px 14px", borderRadius: 100, cursor: "pointer",
                  background: "transparent", border: "1px solid var(--border)",
                  color: "var(--text-muted)", fontSize: 12, transition: "all 0.2s",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />
              ))}
            </div>
          ) : missions.length === 0 ? (
            <div className="glass" style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t.noMissionsYet}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {missions.map((m) => {
                const st = STATUS_STYLES[m.status] || STATUS_STYLES.DRAFT;
                return (
                  <div
                    key={m.id}
                    className="glass"
                    style={{
                      display: "flex", flexDirection: "column", gap: 12,
                      padding: "20px 24px",
                      borderRadius: 16,
                      border: `1px solid var(--border)`,
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                          {m.title}
                        </h3>
                        {m.targetProfile && (
                          <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ opacity: 0.7 }}>{t.missionTarget}:</span> 
                            <strong style={{ color: "var(--text-primary)" }}>{m.targetProfile.fullName}</strong>
                            {m.targetProfile.organization && <span>({m.targetProfile.organization})</span>}
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{m.activities.length} {t.missionActivities}</span>
                          <span>·</span>
                          <span>{t.missionCreatedBy} {m.user.name} ({new Date(m.createdAt).toLocaleDateString()})</span>
                        </div>
                      </div>
                      <span style={{
                        padding: "5px 14px", borderRadius: 100,
                        background: st.bg, color: st.color,
                        border: `1px solid ${st.border}`,
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {t[`missionStatus${m.status.charAt(0).toUpperCase() + m.status.slice(1).toLowerCase()}` as keyof typeof t] || m.status}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                       <button onClick={() => setSelectedMission(m)} className="btn-secondary" style={{ padding: "6px 16px", fontSize: 13 }}>
                         ...
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{t.btnNewMission}</h2>
            <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: 8, borderRadius: "50%" }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
            {[
              { num: 1, label: t.missionTarget },
              { num: 2, label: t.missionActivities },
              { num: 3, label: t.missionFormInfo },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  opacity: step >= s.num ? 1 : 0.5,
                  fontWeight: step >= s.num ? 700 : 500,
                  transition: "all 0.3s"
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: step >= s.num ? "var(--primary)" : "var(--bg-card)",
                    color: step >= s.num ? "white" : "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: step >= s.num ? "none" : "1px solid var(--border)",
                    boxShadow: step === s.num ? "0 0 15px rgba(59,130,246,0.4)" : "none",
                    fontSize: 14, fontWeight: "bold"
                  }}>
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span style={{ color: step >= s.num ? "var(--text-primary)" : "var(--text-muted)", fontSize: 15 }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div style={{ 
                  width: 50, height: 3, borderRadius: 2,
                  background: step > s.num ? "var(--primary)" : "var(--border)", 
                  opacity: step > s.num ? 1 : 0.5,
                  transition: "all 0.3s"
                }} />}
              </React.Fragment>
            ))}
          </div>

          <div className="glass" style={{ padding: 32, maxWidth: 800, margin: "0 auto", position: "relative" }}>
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>{t.missionFormName} *</label>
                    <input className="input-field" value={targetProfile.fullName} onChange={e => setTargetProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="..." />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>{t.missionFormRole}</label>
                      <input className="input-field" value={targetProfile.role} onChange={e => setTargetProfile(p => ({ ...p, role: e.target.value }))} placeholder="..." />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>{t.missionFormOrg}</label>
                      <input className="input-field" value={targetProfile.organization} onChange={e => setTargetProfile(p => ({ ...p, organization: e.target.value }))} placeholder="..." />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>{t.missionFormNotes}</label>
                    <textarea className="input-field" rows={3} value={targetProfile.notes} onChange={e => setTargetProfile(p => ({ ...p, notes: e.target.value }))} placeholder="..." />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>إرفاق ملف (PDF, صور)</label>
                    <div 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      style={{ 
                        border: `2px dashed ${targetProfile.fileUrl ? "var(--primary)" : "var(--border)"}`, 
                        borderRadius: 16, padding: "32px", 
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                        background: targetProfile.fileUrl ? "rgba(59,130,246,0.05)" : "rgba(0,0,0,0.02)",
                        cursor: uploading ? "wait" : "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = targetProfile.fileUrl ? "var(--primary)" : "var(--border)"}
                    >
                      <input 
                        type="file" ref={fileInputRef} onChange={handleFileUpload} 
                        style={{ display: "none" }} accept=".pdf,image/*" 
                      />
                      {uploading ? (
                        <div style={{ color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <UploadCloud size={32} className="animate-pulse" />
                          <span style={{ fontSize: 14, fontWeight: 500 }}>جاري الرفع...</span>
                        </div>
                      ) : targetProfile.fileUrl ? (
                        <div style={{ color: "var(--primary)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <File size={32} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>تم إرفاق الملف بنجاح ✓</span>
                          <span style={{ fontSize: 12, opacity: 0.8 }}>اضغط هنا لتغيير الملف</span>
                        </div>
                      ) : (
                        <div style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <UploadCloud size={32} />
                          <span style={{ fontSize: 14, fontWeight: 500 }}>اضغط هنا لاختيار ملف</span>
                          <span style={{ fontSize: 12 }}>يدعم PDF و الصور</span>
                        </div>
                      )}
                      {uploadStatus === "ERROR" && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>فشل الرفع ❌ حاول مرة أخرى</div>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                  <button onClick={() => setStep(2)} disabled={!targetProfile.fullName.trim()} className="btn-primary" style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, fontSize: 15, borderRadius: 100 }}>
                    التالي
                    <ArrowLeft size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {ACTIVITY_TYPES.map(act => {
                    const selected = selectedActivities.find(a => a.type === act.type);
                    return (
                      <div key={act.type} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div
                          onClick={() => toggleActivity(act.type, act.label)}
                          style={{
                            padding: "16px", borderRadius: 12, cursor: "pointer",
                            background: selected ? "rgba(99,102,241,0.08)" : "var(--bg-card)",
                            border: `1px solid ${selected ? "#6366f1" : "var(--border)"}`,
                            display: "flex", alignItems: "center", gap: 12,
                            transition: "all 0.2s"
                          }}
                        >
                          <span style={{ fontSize: 24 }}>{act.emoji}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: selected ? "var(--text-primary)" : "var(--text-secondary)" }}>{act.label}</span>
                        </div>
                        {selected && (
                          <div className="animate-in slide-in-from-top-2 duration-200" style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 8 }}>
                            <input
                              className="input-field" style={{ fontSize: 13, padding: "8px 12px" }}
                              value={selected.label} onChange={e => updateActivityField(act.type, "label", e.target.value)}
                              placeholder="..."
                            />
                            <textarea
                              className="input-field" style={{ fontSize: 13, padding: "8px 12px", minHeight: 60 }}
                              value={selected.description} onChange={e => updateActivityField(act.type, "description", e.target.value)}
                              placeholder="..."
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                  <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, fontSize: 15, borderRadius: 100 }}>
                    <ArrowRight size={18} />
                    السابق
                  </button>
                  <button onClick={() => setStep(3)} disabled={selectedActivities.length === 0} className="btn-primary" style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, fontSize: 15, borderRadius: 100 }}>
                    التالي
                    <ArrowLeft size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>{t.missionFormTitle} *</label>
                    <input className="input-field" value={missionData.title} onChange={e => setMissionData(p => ({ ...p, title: e.target.value }))} placeholder="..." />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>{t.missionFormDesc}</label>
                    <textarea className="input-field" rows={4} value={missionData.description} onChange={e => setMissionData(p => ({ ...p, description: e.target.value }))} placeholder="..." />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>{t.missionFormStatus}</label>
                      <select className="input-field" value={missionData.status} onChange={e => setMissionData(p => ({ ...p, status: e.target.value as any }))}>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ACTIVE">ACTIVE</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                  <button onClick={() => setStep(2)} className="btn-secondary" style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, fontSize: 15, borderRadius: 100 }}>
                    <ArrowRight size={18} />
                    السابق
                  </button>
                  <button onClick={createMission} disabled={!missionData.title.trim() || submitting} className="btn-primary" style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, fontSize: 15, borderRadius: 100, background: "#22c55e", color: "white", border: "none" }}>
                    {submitting ? "جاري الحفظ..." : "حفظ المهمة ✓"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
