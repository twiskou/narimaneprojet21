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
    features: ["تحليل المشاعر الأساسي", "متابعة الإشارات (محدود)", "تصدير التقارير بصيغة PDF"],
    popular: false,
  },
  {
    id: "pro",
    name: "محترف / مهني",
    monthlyPrice: 2083,
    annualPrice: 25000,
    features: ["تحليل متقدم بالذكاء الاصطناعي", "تنبيهات فورية على مدار الساعة", "لوحة تحكم مخصصة بالكامل", "تصدير تقارير غير محدود"],
    popular: true,
  },
  {
    id: "expert",
    name: "خبير",
    monthlyPrice: 4167,
    annualPrice: 50000,
    features: ["وصول كامل لجميع قواعد البيانات", "تقارير استراتيجية مفصلة يومياً", "دعم فني مخصص على مدار الساعة", "تكامل عبر واجهة برمجة التطبيقات (API)"],
    popular: false,
  },
];

const INSTITUTION_PLANS = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    monthlyPrice: 8333,
    annualPrice: 100000,
    features: ["إدارة سمعة المؤسسة عبر منصات متعددة", "تحليل المنافسين الأساسي", "حسابات فريق العمل (حتى 3 مستخدمين)", "تقارير أداء شهرية"],
    popular: false,
  },
  {
    id: "advanced",
    name: "الباقة المتقدمة",
    monthlyPrice: 12500,
    annualPrice: 150000,
    features: ["تقارير أداء شاملة وفورية", "رصد التوجهات الإعلامية بدقة عالية", "حسابات فريق العمل (حتى 10 مستخدمين)", "تنبيهات الأزمات في الوقت الفعلي"],
    popular: true,
  },
  {
    id: "professional",
    name: "الباقة الاحترافية",
    monthlyPrice: 16667,
    annualPrice: 200000,
    features: ["منصة متكاملة لإدارة الأزمات", "ذكاء اصطناعي مخصص لبيانات المؤسسة", "وصول وحسابات غير محدودة للفرق", "مدير حساب مخصص للدعم الاستراتيجي"],
    popular: false,
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
    <div dir="rtl" className="w-full flex flex-col font-sans animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header & Role Badge */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-center md:text-right">
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">اختر باقة الاشتراك</h2>
          <p className="text-gray-500 text-base">ارتقِ بأعمالك مع الخطة التي تناسب تطلعاتك.</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#2d8bba]/10 to-[#22c778]/10 border border-[#22c778]/20 rounded-2xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm text-[#22c778]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">البروفايل المختار</span>
            <span className="text-[#2d8bba] font-bold text-sm">{selectedRoleLabel}</span>
          </div>
          <button
            onClick={onBack}
            className="text-gray-400 text-xs hover:text-gray-700 underline mr-2 transition-colors"
          >
            تغيير
          </button>
        </div>
      </div>

      {/* Modern Billing Toggle */}
      <div className="flex justify-center mb-12 relative">
        <div className="flex items-center p-1.5 bg-gray-100/80 backdrop-blur-md rounded-full shadow-inner border border-gray-200/50 relative">
          
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
              isAnnual ? "translate-x-0 left-1.5" : "translate-x-full left-[calc(50%-1.5px)]"
            }`}
          />
          
          <button
            onClick={() => setIsAnnual(false)}
            className={`relative z-10 px-8 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 w-[140px] ${
              !isAnnual ? "text-[#2d8bba]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            دفع شهري
          </button>
          
          <button
            onClick={() => setIsAnnual(true)}
            className={`relative z-10 flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 w-auto min-w-[140px] ${
              isAnnual ? "text-[#22c778]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            دفع سنوي
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black transition-colors ${
              isAnnual ? "bg-[#22c778]/15 text-[#22c778]" : "bg-gray-200 text-gray-500"
            }`}>
              وفر 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 items-stretch">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 ease-out ${
                plan.popular && !isSelected ? "md:-mt-4 md:mb-4 bg-white" : "bg-white"
              } ${
                isSelected
                  ? "border-2 border-[#22c778] ring-8 ring-[#22c778]/10 shadow-2xl scale-105 z-10"
                  : "border border-gray-200 hover:border-[#2d8bba]/40 hover:shadow-xl hover:-translate-y-2"
              }`}
            >
              {plan.popular && !isSelected && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2d8bba] to-[#4dbde8] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  الأكثر شيوعاً
                </div>
              )}

              {isSelected && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#22c778] to-[#1eb06a] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  الباقة المختارة
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${isSelected ? "text-[#22c778]" : "text-gray-900"}`}>{plan.name}</h3>
                <div className="flex items-end gap-1.5">
                  <span className={`text-4xl font-black tracking-tight ${isSelected ? "text-gray-900" : "text-gray-900"}`}>
                    {(isAnnual ? plan.annualPrice : plan.monthlyPrice).toLocaleString("en-US")}
                  </span>
                  <div className="flex flex-col pb-1">
                    <span className="text-gray-500 text-sm font-bold">دج</span>
                    <span className="text-gray-400 text-xs font-medium">/{isAnnual ? "سنوياً" : "شهرياً"}</span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gray-100 mb-6" />

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 rounded-full p-1 ${isSelected ? "bg-[#22c778]/10 text-[#22c778]" : "bg-[#2d8bba]/10 text-[#2d8bba]"}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 font-medium leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4">
                <button
                  className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#22c778] to-[#1eb06a] text-white shadow-lg shadow-[#22c778]/30"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {isSelected ? "الباقة الحالية" : "اختر هذه الباقة"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200/60 mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          الرجوع
        </button>
        <button
          disabled={!selectedPlanId}
          onClick={() => selectedPlanId && onContinue(selectedPlanId, isAnnual)}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
            selectedPlanId
              ? "bg-gradient-to-r from-[#2d8bba] to-[#22c778] text-white shadow-xl shadow-[#22c778]/30 hover:scale-[1.02]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          }`}
        >
          إنهاء التسجيل
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { transform: scale(0.97); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </div>
  );
}
