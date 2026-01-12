"use client";

import { useTranslations } from "next-intl";
import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";
import data from "@/data/aiImageGen.json";

export default function StepOccasion() {
  const t = useTranslations("aiImageGen");
  const { state, updateState } = useWizard();

  if (!state.bagType) {
    return <p className="text-gray-500">Select a bag type first.</p>;
  }

  const bagType = data.bagTypes.find(b => b.id === state.bagType);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {t("steps.select_occasion")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.occasions.map((occasion) => {
          const isRecommended =
            bagType?.recommendedOccasions?.includes(occasion.id);

          const isAllowed =
            bagType?.allowedOccasions?.includes(occasion.id);

          const active = state.occasion === occasion.id;

          return (
            <button
              key={occasion.id}
              onClick={() => updateState("occasion", occasion.id)}
              disabled={!isAllowed}
              className={`relative p-5 rounded-xl border transition
                ${
                  active
                    ? "border-gray-900 ring-2 ring-gray-900 bg-gray-50"
                    : isAllowed
                    ? "border-gray-200 hover:border-gray-900"
                    : "border-gray-200 opacity-40 cursor-not-allowed"
                }
              `}
            >
              {isRecommended && (
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white">
                  {t("occasions.recommended")}
                </span>
              )}

              {t(`occasions.${occasion.id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
