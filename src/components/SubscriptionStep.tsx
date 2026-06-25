"use client";

import React, { useState } from "react";

interface SubscriptionStepProps {
  selectedRoleId: string;
  selectedRoleLabel: string;
  selectedRoleIcon: string;
  onBack: () => void;
  onContinue: (planId: string, isAnnual: boolean) => void;
}

// ─── الباقات حسب البروفيل ───────────────────────────────────────────────────
const PLANS_BY_ROLE: Record<string, {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  features: string[];
  highlighted: boolean;
}[]> = {
  student: [
    {
      id: "free",
      name: "مجاني",
      subtitle: "للبدء والاستكشاف",
      monthlyPrice: 0,
      annualPrice: 0,
      color: "#6b7280",
      features: ["تحليل المشاعر الأساسي", "متابعة 10 إشارات شهرياً", "تصدير تقرير واحد / شهر"],
      highlighted: false,
    },
    {
      id: "student_pro",
      name: "طالب Pro",
      subtitle: "الأنسب لبحثك الأكاديمي",
      monthlyPrice: 833,
      annualPrice: 10000,
      color: "#2d8bba",
      features: ["تحليل غير محدود للمشاعر", "متابعة 100 إشارة شهرياً", "تصدير تقارير PDF غير محدود", "دعم فني عبر البريد الإلكتروني"],
      highlighted: true,
    },
    {
      id: "student_expert",
      name: "طالب خبير",
      subtitle: "لأبحاث الدكتوراه والتحكيم",
      monthlyPrice: 2083,
      annualPrice: 25000,
      color: "#22c778",
      features: ["كل مزايا الباقة Pro", "وصول لقواعد بيانات الإعلام الجزائري", "تقارير مقارنة دورية", "دعم فني مخصص على مدار الساعة"],
      highlighted: false,
    },
  ],
  professor: [
    {
      id: "prof_basic",
      name: "أساسية",
      subtitle: "لمتابعة الأبحاث والنشر",
      monthlyPrice: 833,
      annualPrice: 10000,
      color: "#6b7280",
      features: ["تحليل المشاعر الأساسي", "متابعة 50 إشارة شهرياً", "تصدير 5 تقارير / شهر"],
      highlighted: false,
    },
    {
      id: "prof_pro",
      name: "محترف",
      subtitle: "للباحثين والأساتذة النشطين",
      monthlyPrice: 2083,
      annualPrice: 25000,
      color: "#2d8bba",
      features: ["تحليل متقدم بالذكاء الاصطناعي", "متابعة غير محدودة للإشارات", "لوحة تحكم بحثية مخصصة", "تصدير بصيغ متعددة (PDF, Excel)"],
      highlighted: true,
    },
    {
      id: "prof_expert",
      name: "خبير",
      subtitle: "للمختبرات والمجموعات البحثية",
      monthlyPrice: 4167,
      annualPrice: 50000,
      color: "#22c778",
      features: ["كل مزايا الباقة المحترف", "حسابات متعددة للفريق (حتى 5)", "تحليل مقارن للمؤسسات الأكاديمية", "API للتكامل مع أدوات البحث"],
      highlighted: false,
    },
  ],
  manager: [
    {
      id: "inst_basic",
      name: "الأساسية",
      subtitle: "للمؤسسات الصغيرة",
      monthlyPrice: 8333,
      annualPrice: 100000,
      color: "#6b7280",
      features: ["رصد السمعة عبر منصتين", "تقارير أداء شهرية", "حسابات الفريق (حتى 3)", "تنبيهات أساسية"],
      highlighted: false,
    },
    {
      id: "inst_advanced",
      name: "المتقدمة",
      subtitle: "للمؤسسات المتوسطة",
      monthlyPrice: 12500,
      annualPrice: 150000,
      color: "#2d8bba",
      features: ["رصد السمعة على جميع المنصات", "تقارير أداء أسبوعية وفورية", "حسابات الفريق (حتى 10)", "تنبيهات الأزمات في الوقت الفعلي", "لوحة تحكم المؤسسة"],
      highlighted: true,
    },
    {
      id: "inst_pro",
      name: "الاحترافية",
      subtitle: "للمؤسسات الكبرى والحكومية",
      monthlyPrice: 16667,
      annualPrice: 200000,
      color: "#22c778",
      features: ["إدارة الأزمات المتكاملة", "ذكاء اصطناعي مخصص للمؤسسة", "حسابات غير محدودة", "تقارير استراتيجية يومية", "مدير حساب مخصص"],
      highlighted: false,
    },
  ],
  pr: [
    {
      id: "pr_basic",
      name: "مسؤول مبتدئ",
      subtitle: "لإدارة حملة واحدة",
      monthlyPrice: 833,
      annualPrice: 10000,
      color: "#6b7280",
      features: ["متابعة حملة واحدة", "تحليل أساسي للمشاعر", "تصدير 5 تقارير / شهر"],
      highlighted: false,
    },
    {
      id: "pr_pro",
      name: "مسؤول محترف",
      subtitle: "للعلاقات العامة اليومية",
      monthlyPrice: 2083,
      annualPrice: 25000,
      color: "#2d8bba",
      features: ["متابعة حملات متعددة (حتى 5)", "تحليل متقدم وتنبيهات فورية", "تقارير يومية جاهزة للمشاركة", "لوحة تحكم مخصصة للعلاقات العامة"],
      highlighted: true,
    },
    {
      id: "pr_expert",
      name: "خبير اتصال",
      subtitle: "للإدارة الشاملة للسمعة",
      monthlyPrice: 4167,
      annualPrice: 50000,
      color: "#22c778",
      features: ["حملات غير محدودة", "رصد شامل للإعلام الجزائري", "تحليل المنافسين والجهات المنافسة", "دعم استراتيجي مخصص"],
      highlighted: false,
    },
  ],
};

// ─── المكوّن الرئيسي ─────────────────────────────────────────────────────────
export default function SubscriptionStep({
  selectedRoleId,
  selectedRoleLabel,
  selectedRoleIcon,
  onBack,
  onContinue,
}: SubscriptionStepProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans = PLANS_BY_ROLE[selectedRoleId] ?? PLANS_BY_ROLE["student"];

  return (
    <>
      <style>{`
        .sub-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 36px 32px;
          border: 2px solid #f0f0f0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
          position: relative;
        }
        .sub-card:hover {
          border-color: #2d8bba44;
          box-shadow: 0 20px 60px rgba(45,139,186,0.12);
          transform: translateY(-4px);
        }
        .sub-card.selected {
          border-color: #22c778;
          box-shadow: 0 0 0 4px rgba(34,199,120,0.12), 0 20px 60px rgba(34,199,120,0.2);
          transform: translateY(-6px);
        }
        .sub-card.highlighted {
          border-color: #2d8bba33;
          box-shadow: 0 12px 40px rgba(45,139,186,0.1);
          transform: translateY(-2px);
        }
        .sub-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 800;
          padding: 5px 16px;
          border-radius: 100px;
          white-space: nowrap;
        }
        .toggle-pill {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          border-radius: 100px;
          padding: 5px;
          gap: 4px;
          border: 1px solid #e5e7eb;
        }
        .toggle-btn {
          padding: 10px 28px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #9ca3af;
          transition: all 0.25s ease;
          line-height: 1;
        }
        .toggle-btn.active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
        }
        .feature-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .select-btn {
          width: 100%;
          padding: 14px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .select-btn.default {
          background: #f9fafb;
          color: #374151;
          border: 1.5px solid #e5e7eb;
        }
        .select-btn.default:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        .select-btn.selected {
          background: linear-gradient(135deg, #22c778, #1eb06a);
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(34,199,120,0.35);
        }
        .continue-btn {
          padding: 16px 40px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .continue-btn.active {
          background: linear-gradient(135deg, #2d8bba, #22c778);
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(34,199,120,0.35);
        }
        .continue-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(34,199,120,0.45);
        }
        .continue-btn.disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
        .back-btn {
          padding: 14px 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          border: 1.5px solid #e5e7eb;
          cursor: pointer;
          background: transparent;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .back-btn:hover {
          background: #f9fafb;
          color: #374151;
          border-color: #d1d5db;
        }
        .savings-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 100px;
          background: rgba(34,199,120,0.12);
          color: #16a34a;
          margin-right: 8px;
        }
      `}</style>

      <div dir="rtl" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          
          {/* Role chip */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 100, padding: "8px 20px", marginBottom: 24 }}>
            <span style={{ fontSize: 20 }}>{selectedRoleIcon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>{selectedRoleLabel}</span>
            <span style={{ width: 1, height: 16, background: "#86efac", margin: "0 4px" }} />
            <button onClick={onBack} style={{ fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              تغيير
            </button>
          </div>

          <h2 style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
            اختر الباقة المناسبة لك
          </h2>
          <p style={{ fontSize: 16, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
            عروض مخصصة لك كـ <strong>{selectedRoleLabel}</strong> — يمكنك الترقية في أي وقت
          </p>
        </div>

        {/* ── Billing Toggle ── */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 52, alignItems: "center", gap: 14 }}>
          <div className="toggle-pill">
            <button className={`toggle-btn ${!isAnnual ? "active" : ""}`} onClick={() => setIsAnnual(false)}>
              شهري
            </button>
            <button className={`toggle-btn ${isAnnual ? "active" : ""}`} onClick={() => setIsAnnual(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              سنوي
              <span className="savings-badge">وفر 17%</span>
            </button>
          </div>
          {isAnnual && (
            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 14px", borderRadius: 100 }}>
              💰 دفع سنوي واحد أرخص
            </span>
          )}
        </div>

        {/* ── Plans Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 52, alignItems: "start", paddingTop: 20 }}>
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isFree = plan.monthlyPrice === 0 && plan.annualPrice === 0;

            return (
              <div
                key={plan.id}
                className={`sub-card ${isSelected ? "selected" : plan.highlighted ? "highlighted" : ""}`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                {/* Badge */}
                {plan.highlighted && !isSelected && (
                  <div className="sub-badge" style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: "#fff" }}>
                    الأكثر شيوعاً
                  </div>
                )}
                {isSelected && (
                  <div className="sub-badge" style={{ background: "linear-gradient(135deg, #22c778, #16a34a)", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    مختارة
                  </div>
                )}

                {/* Plan name + subtitle */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: plan.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{plan.name}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 0 18px", fontWeight: 500 }}>{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 28, padding: "20px", background: "#f8fafc", borderRadius: 16, textAlign: "center" }}>
                  {isFree ? (
                    <div style={{ fontSize: 40, fontWeight: 900, color: "#0f172a" }}>مجاني</div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }}>
                        <span style={{ fontSize: 44, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>
                          {(isAnnual ? plan.annualPrice : plan.monthlyPrice).toLocaleString("en-US")}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#475569" }}>دج</span>
                          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>/{isAnnual ? "سنوياً" : "شهرياً"}</span>
                        </div>
                      </div>
                      {isAnnual && (
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 0", fontWeight: 500 }}>
                          أي {Math.round(plan.annualPrice / 12).toLocaleString("en-US")} دج / شهرياً
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <div style={{ flex: 1, marginBottom: 28, borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <div className="feature-icon" style={{ background: isSelected ? "#dcfce7" : "#eff6ff" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#16a34a" : plan.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.5 }}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button className={`select-btn ${isSelected ? "selected" : "default"}`}>
                  {isSelected ? "✓ الباقة المختارة" : "اختر هذه الباقة"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1.5px solid #f1f5f9" }}>
          <button className="back-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            رجوع
          </button>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            {selectedPlanId && (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 600 }}>
                الباقة المختارة: <span style={{ color: "#16a34a" }}>{plans.find(p => p.id === selectedPlanId)?.name}</span>
              </p>
            )}
            <button
              className={`continue-btn ${selectedPlanId ? "active" : "disabled"}`}
              disabled={!selectedPlanId}
              onClick={() => selectedPlanId && onContinue(selectedPlanId, isAnnual)}
            >
              إنهاء التسجيل وإنشاء الحساب
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
