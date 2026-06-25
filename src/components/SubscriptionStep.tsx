"use client";

import React, { useState } from "react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

interface SubscriptionStepProps {
  selectedRoleId: string;
  selectedRoleLabel: string;
  selectedRoleIcon: string;
  onBack: () => void;
  onContinue: (planId: string, isAnnual: boolean) => void;
}

export default function SubscriptionStep({
  selectedRoleId,
  selectedRoleLabel,
  selectedRoleIcon,
  onBack,
  onContinue,
}: SubscriptionStepProps) {
  const { lang } = useLang();
  const t = translations[lang] as typeof translations["AR"];
  const isRtl = t.dir === "rtl";

  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const roleKey = (selectedRoleId as keyof typeof t.subPlans) in t.subPlans
    ? selectedRoleId as keyof typeof t.subPlans
    : "student";

  const plans = t.subPlans[roleKey];

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
        .sub-card.is-selected {
          border-color: #22c778;
          box-shadow: 0 0 0 4px rgba(34,199,120,0.12), 0 20px 60px rgba(34,199,120,0.2);
          transform: translateY(-6px);
        }
        .sub-card.is-highlighted {
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
        .sub-toggle {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          border-radius: 100px;
          padding: 5px;
          border: 1px solid #e5e7eb;
        }
        .sub-toggle-btn {
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
          white-space: nowrap;
        }
        .sub-toggle-btn.active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .sub-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
        }
        .sub-feature-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .sub-select-btn {
          width: 100%;
          padding: 14px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .sub-select-btn.default {
          background: #f9fafb;
          color: #374151;
          border: 1.5px solid #e5e7eb;
        }
        .sub-select-btn.default:hover {
          background: #f3f4f6;
        }
        .sub-select-btn.chosen {
          background: linear-gradient(135deg, #22c778, #1eb06a);
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(34,199,120,0.35);
        }
        .sub-finish-btn {
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
        .sub-finish-btn.active {
          background: linear-gradient(135deg, #2d8bba, #22c778);
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(34,199,120,0.35);
        }
        .sub-finish-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(34,199,120,0.45);
        }
        .sub-finish-btn.disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
        .sub-back-btn {
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
        .sub-back-btn:hover {
          background: #f9fafb;
          color: #374151;
          border-color: #d1d5db;
        }
      `}</style>

      <div dir={t.dir} style={{ width: "100%", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>

          {/* Role chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#f0fdf4", border: "1.5px solid #bbf7d0",
            borderRadius: 100, padding: "8px 20px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 20 }}>{selectedRoleIcon}</span>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{t.subSelectedProfile}:</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>{selectedRoleLabel}</span>
            <span style={{ width: 1, height: 16, background: "#86efac", margin: "0 4px" }} />
            <button onClick={onBack} style={{ fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              {t.subChange}
            </button>
          </div>

          <h2 style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
            {t.subTitle}
          </h2>
          <p style={{ fontSize: 16, color: "#64748b", margin: 0 }}>
            {t.subSubtitle} <strong>{selectedRoleLabel}</strong> {t.subSubtitleEnd}
          </p>
        </div>

        {/* ── Billing Toggle ── */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 52, alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div className="sub-toggle">
            <button className={`sub-toggle-btn ${!isAnnual ? "active" : ""}`} onClick={() => setIsAnnual(false)}>
              {t.subMonthly}
            </button>
            <button className={`sub-toggle-btn ${isAnnual ? "active" : ""}`} onClick={() => setIsAnnual(true)}
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {t.subAnnual}
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 100,
                background: isAnnual ? "rgba(34,199,120,0.15)" : "#e5e7eb",
                color: isAnnual ? "#16a34a" : "#6b7280",
              }}>
                {t.subSave}
              </span>
            </button>
          </div>
          {isAnnual && (
            <span style={{
              fontSize: 13, color: "#16a34a", fontWeight: 700,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              padding: "6px 14px", borderRadius: 100,
            }}>
              {t.subAnnualNote}
            </span>
          )}
        </div>

        {/* ── Plans Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          marginBottom: 52,
          paddingTop: 20,
        }}>
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isFree = plan.monthlyPrice === 0 && plan.annualPrice === 0;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`sub-card ${isSelected ? "is-selected" : plan.highlighted ? "is-highlighted" : ""}`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                {/* Badge */}
                {plan.highlighted && !isSelected && (
                  <div className="sub-badge" style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: "#fff" }}>
                    {t.subPopular}
                  </div>
                )}
                {isSelected && (
                  <div className="sub-badge" style={{ background: "linear-gradient(135deg, #22c778, #16a34a)", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {t.subSelected}
                  </div>
                )}

                {/* Name & subtitle */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: plan.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{plan.name}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 0 18px", fontWeight: 500 }}>{plan.subtitle}</p>
                </div>

                {/* Price box */}
                <div style={{ marginBottom: 24, padding: "20px", background: "#f8fafc", borderRadius: 16, textAlign: "center" }}>
                  {isFree ? (
                    <div style={{ fontSize: 40, fontWeight: 900, color: "#0f172a" }}>{t.subFree}</div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }}>
                        <span style={{ fontSize: 44, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>
                          {price.toLocaleString("en-US")}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isRtl ? "flex-end" : "flex-start", paddingBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#475569" }}>{t.subCurrency}</span>
                          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                            {isAnnual ? t.subPerYear : t.subPerMonth}
                          </span>
                        </div>
                      </div>
                      {isAnnual && (
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "8px 0 0", fontWeight: 500 }}>
                          {t.subEquiv} {Math.round(plan.annualPrice / 12).toLocaleString("en-US")} {t.subEquivEnd}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#f1f5f9", marginBottom: 20 }} />

                {/* Features */}
                <div style={{ flex: 1, marginBottom: 24 }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="sub-feature">
                      <div className="sub-feature-icon" style={{ background: isSelected ? "#dcfce7" : "#eff6ff" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#16a34a" : plan.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.5 }}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button className={`sub-select-btn ${isSelected ? "chosen" : "default"}`}>
                  {isSelected ? `✓ ${t.subSelectedBtn}` : t.subSelectBtn}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
          borderTop: "1.5px solid #f1f5f9",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <button className="sub-back-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isRtl
                ? <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>
                : <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>
              }
            </svg>
            {t.subBack}
          </button>

          <div style={{ display: "flex", flexDirection: "column", alignItems: isRtl ? "flex-start" : "flex-end", gap: 6 }}>
            {selectedPlanId && (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 600 }}>
                {t.subChosenPlan} <span style={{ color: "#16a34a" }}>{plans.find(p => p.id === selectedPlanId)?.name}</span>
              </p>
            )}
            <button
              className={`sub-finish-btn ${selectedPlanId ? "active" : "disabled"}`}
              disabled={!selectedPlanId}
              onClick={() => selectedPlanId && onContinue(selectedPlanId, isAnnual)}
            >
              {t.subFinish}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isRtl
                  ? <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>
                  : <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Responsive */}
        <style>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: repeat(3, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
