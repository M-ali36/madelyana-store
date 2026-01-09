"use client";

import { useTranslations } from "next-intl";
import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";
import data from "@/data/aiImageGen.json";

export default function StepBagType() {
  const t = useTranslations("aiImageGen");
  const { state, updateState } = useWizard();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("steps.select_bag_type")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.bagTypes.map((bag) => {
          const active = state.bagType === bag.id;

          return (
            <button
              key={bag.id}
              onClick={() => updateState("bagType", bag.id)}
              className={`p-5 rounded-xl border transition
                ${active
                  ? "border-gray-900 ring-2 ring-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-900"}
              `}
            >
              {t(`bagTypes.${bag.id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
