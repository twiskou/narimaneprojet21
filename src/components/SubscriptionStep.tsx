"use client";

import React, { useState } from "react";

interface SubscriptionStepProps {
  selectedRoleLabel: string;
  isInstitution: boolean;
  onBack: () => void;
  onContinue: (planId: string, isAnnual: boolean) => void;
}

const INDIVIDUAL_PLANS = [
  {
    id: "student",
    name: "طالب",
    monthlyPrice: 833,
    annualPrice: 10000,
    features: ["تحليل المشاعر الأساسي", "متابعة الإشارات (محدود)", "تصدير التقارير"],
  },
  {
    id: "pro",
    name: "محترف / مهني",
    monthlyPrice: 2083,
    annualPrice: 25000,
    features: ["تحليل متقدم بالذكاء الاصطناعي", "تنبيهات فورية", "لوحة تحكم مخصصة"],
  },
  {
    id: "expert",
    name: "خبير",
    monthlyPrice: 4167,
    annualPrice: 50000,
    features: ["وصول كامل للبيانات", "تقارير استراتيجية مفصلة", "دعم فني على مدار الساعة"],
  },
];

const INSTITUTION_PLANS = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    monthlyPrice: 8333,
    annualPrice: 100000,
    features: ["إدارة سمعة المؤسسة", "تحليل المنافسين الأساسي", "حسابات متعددة (حتى 3)"],
  },
  {
    id: "advanced",
    name: "الباقة المتقدمة",
    monthlyPrice: 12500,
    annualPrice: 150000,
    features: ["تقارير أداء شاملة", "رصد التوجهات الإعلامية", "حسابات متعددة (حتى 10)"],
  },
  {
    id: "professional",
    name: "الباقة الاحترافية",
    monthlyPrice: 16667,
    annualPrice: 200000,
    features: ["منصة متكاملة لإدارة الأزمات", "ذكاء اصطناعي مخصص للمؤسسة", "وصول غير محدود"],
  },
];

export default function SubscriptionStep({
  selectedRoleLabel,
  isInstitution,
  onBack,
  onContinue,
}: SubscriptionStepProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans = isInstitution ? INSTITUTION_PLANS : INDIVIDUAL_PLANS;

  return (
    <div dir="rtl" className="w-full max-w-4xl mx-auto font-sans">
      {/* Selected Profile Badge */}
      <div className="flex items-center gap-3 mb-8 p-3 bg-[#4dbde8]/10 border border-[#4dbde8]/20 rounded-xl w-fit">
        <span className="text-[#4dbde8] font-bold text-sm">✓ {selectedRoleLabel}</span>
        <button
          onClick={onBack}
          className="text-gray-500 text-xs hover:text-gray-700 underline mr-4"
        >
          تغيير
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 mb-2">اختر باقة الاشتراك</h2>
        <p className="text-gray-500 text-sm">اختر الخطة التي تناسب احتياجاتك</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-10">
        <div className="relative flex items-center p-1 bg-gray-100 rounded-full">
          <button
            onClick={() => setIsAnnual(false)}
            className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
              !isAnnual ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 flex items-center gap-2 ${
              isAnnual ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            سنوي
            <span className="bg-[#00BFA5]/10 text-[#00BFA5] text-[10px] px-2 py-0.5 rounded-full font-bold">
              وفر 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative flex flex-col p-6 rounded-2xl cursor-pointer transition-all duration-300 bg-white shadow-lg ${
                isSelected
                  ? "border-2 border-[#00BFA5] ring-4 ring-[#00BFA5]/10 transform -translate-y-1"
                  : "border border-gray-100 hover:border-[#00BFA5]/50 hover:shadow-xl"
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 left-4 text-[#00BFA5]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-black text-[#00BFA5]">
                  {(isAnnual ? plan.annualPrice : plan.monthlyPrice).toLocaleString("en-US")}
                </span>
                <span className="text-gray-500 text-sm font-medium mb-1">
                  دج / {isAnnual ? "سنوياً" : "شهرياً"}
                </span>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-[#4dbde8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                  isSelected
                    ? "bg-[#00BFA5] text-white shadow-md shadow-[#00BFA5]/30"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isSelected ? "تم الاختيار" : "اختيار الباقة"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-500 font-semibold hover:text-gray-800 transition-colors"
        >
          ← تراجع
        </button>
        <button
          disabled={!selectedPlanId}
          onClick={() => selectedPlanId && onContinue(selectedPlanId, isAnnual)}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            selectedPlanId
              ? "bg-gradient-to-r from-[#2d8bba] to-[#22c778] text-white shadow-lg shadow-[#22c778]/30 hover:scale-105"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          متابعة ←
        </button>
      </div>
    </div>
  );
}
