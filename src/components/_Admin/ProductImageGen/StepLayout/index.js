// File: components/_Admin/ProductImageGen/StepLayout.js
// Controls wizard flow, navigation, and progress UI

"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function StepLayout({ steps }) {
  const t = useTranslations("aiImageGen");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = steps.length;

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600">
            {t("app.review")} {currentStep + 1} / {totalSteps}
          </div>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-all ${
                  index <= currentStep
                    ? "bg-gray-900"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl bg-white p-8 shadow-sm">
        {steps[currentStep]}
      </div>

      {/* Navigation */}
      <div
        className={`flex items-center justify-between ${
          isRTL ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 0}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
        >
          {t("app.back")}
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={currentStep === totalSteps - 1}
          className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {currentStep === totalSteps - 1
            ? t("app.generate")
            : t("app.next")}
        </button>
      </div>
    </div>
  );
}
