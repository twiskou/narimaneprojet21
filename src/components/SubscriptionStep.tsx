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
    features: ["تحليل متقدم بالذكاء الاصطناعي", "تنبيهات فورية على مدار الساعة", "لوحة تحكم مخصصة", "تصدير تقارير غير محدود"],
    popular: true,
  },
  {
    id: "expert",
    name: "خبير",
    monthlyPrice: 4167,
    annualPrice: 50000,
    features: ["وصول كامل لجميع قواعد البيانات", "تقارير استراتيجية يومياً", "دعم فني مخصص 24/7", "تكامل عبر واجهة التطبيقات (API)"],
    popular: false,
  },
];

const INSTITUTION_PLANS = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    monthlyPrice: 8333,
    annualPrice: 100000,
    features: ["إدارة سمعة المؤسسة عبر منصات متعددة", "تحليل المنافسين الأساسي", "حسابات الفريق (حتى 3 مستخدمين)", "تقارير أداء شهرية"],
    popular: false,
  },
  {
    id: "advanced",
    name: "الباقة المتقدمة",
    monthlyPrice: 12500,
    annualPrice: 150000,
    features: ["تقارير أداء شاملة وفورية", "رصد التوجهات الإعلامية بدقة", "حسابات الفريق (حتى 10 مستخدمين)", "تنبيهات الأزمات في الوقت الفعلي"],
    popular: true,
  },
  {
    id: "professional",
    name: "الباقة الاحترافية",
    monthlyPrice: 16667,
    annualPrice: 200000,
    features: ["منصة متكاملة لإدارة الأزمات", "ذكاء اصطناعي مخصص للمؤسسة", "وصول غير محدود", "مدير حساب مخصص للدعم"],
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
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-12 space-y-6">
        
        {/* Role Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-[#2d8bba]/10 to-[#22c778]/10 border border-[#22c778]/20 rounded-full shadow-sm">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm text-[#22c778]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-600">البروفايل المختار:</span>
          <span className="text-[#2d8bba] font-black text-sm">{selectedRoleLabel}</span>
          <button
            onClick={onBack}
            className="text-gray-400 text-xs hover:text-[#2d8bba] underline mr-2 transition-colors"
          >
            تغيير
          </button>
        </div>

        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">اختر باقة الاشتراك</h2>
          <p className="text-gray-500 text-lg">ارتقِ بأعمالك مع الخطة التي تناسب تطلعاتك.</p>
        </div>

      </div>

      {/* Modern Billing Toggle */}
      <div className="flex justify-center mb-16 relative">
        <div className="flex items-center p-2 bg-gray-100 rounded-full shadow-inner border border-gray-200 relative">
          
          <div 
            className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
              isAnnual ? "translate-x-0 right-2" : "translate-x-full right-[calc(50%+4px)]"
            }`}
          />
          
          <button
            onClick={() => setIsAnnual(false)}
            className={`relative z-10 px-8 py-3 text-base font-bold rounded-full transition-colors duration-300 w-40 ${
              !isAnnual ? "text-[#2d8bba]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            دفع شهري
          </button>
          
          <button
            onClick={() => setIsAnnual(true)}
            className={`relative z-10 flex items-center justify-center gap-2 px-8 py-3 text-base font-bold rounded-full transition-colors duration-300 w-auto min-w-[160px] ${
              isAnnual ? "text-[#22c778]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            دفع سنوي
            <span className={`text-xs px-2.5 py-1 rounded-full font-black transition-colors ${
              isAnnual ? "bg-[#22c778]/20 text-[#22c778]" : "bg-gray-200 text-gray-500"
            }`}>
              وفر 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-16 px-4">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 ease-out bg-white ${
                isSelected
                  ? "border-2 border-[#22c778] ring-8 ring-[#22c778]/10 shadow-2xl scale-105 z-10"
                  : "border border-gray-200 hover:border-[#2d8bba]/40 hover:shadow-xl hover:-translate-y-2"
              } ${plan.popular && !isSelected ? "md:-translate-y-2 shadow-lg border-[#2d8bba]/30" : ""}`}
            >
              {plan.popular && (
                <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-white text-sm font-bold px-6 py-2 rounded-full shadow-md ${
                  isSelected ? "bg-gradient-to-r from-[#22c778] to-[#1eb06a]" : "bg-gradient-to-r from-[#2d8bba] to-[#4dbde8]"
                }`}>
                  {isSelected ? "الباقة المختارة" : "الأكثر شيوعاً"}
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8 pt-4">
                <h3 className={`text-2xl font-black mb-4 ${isSelected ? "text-[#22c778]" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-5xl font-black tracking-tight ${isSelected ? "text-gray-900" : "text-gray-800"}`}>
                    {(isAnnual ? plan.annualPrice : plan.monthlyPrice).toLocaleString("en-US")}
                  </span>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-600 text-base font-bold">دج</span>
                    <span className="text-gray-400 text-sm font-medium">/{isAnnual ? "سنوياً" : "شهرياً"}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-200 mb-8" />

              {/* Features List */}
              <ul className="flex-1 space-y-5 mb-10 px-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className={`mt-1 shrink-0 rounded-full p-1.5 ${isSelected ? "bg-[#22c778]/10 text-[#22c778]" : "bg-gray-100 text-[#2d8bba]"}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-base text-gray-700 font-medium leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <div className="mt-auto">
                <button
                  className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#22c778] to-[#1eb06a] text-white shadow-xl shadow-[#22c778]/30"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {isSelected ? "تم الاختيار" : "اختر هذه الباقة"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-8 mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-3 px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors rounded-2xl hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          الرجوع
        </button>
        <button
          disabled={!selectedPlanId}
          onClick={() => selectedPlanId && onContinue(selectedPlanId, isAnnual)}
          className={`flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
            selectedPlanId
              ? "bg-gradient-to-r from-[#2d8bba] to-[#22c778] text-white shadow-xl shadow-[#22c778]/40 hover:-translate-y-1"
              : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200"
          }`}
        >
          إنهاء التسجيل
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
