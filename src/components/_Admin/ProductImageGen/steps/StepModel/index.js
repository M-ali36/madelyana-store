"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";
import data from "@/data/aiImageGen.json";

export default function StepModel() {
  const t = useTranslations("aiImageGen");
  const { state, updateState } = useWizard();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("steps.select_model")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.models.map((model) => {
          const isRecommended =
            model.allowedBagTypes?.includes(state.bagType);
          const active = state.model === model.id;

          return (
            <button
              key={model.id}
              onClick={() => updateState("model", model.id)}
              className={`relative rounded-xl border p-4 transition
                ${
                  active
                    ? "border-gray-900 ring-2 ring-gray-900"
                    : isRecommended
                    ? "border-green-500 ring-1 ring-green-900"
                    : "border-gray-200 hover:border-gray-900"
                }
              `}
            >
              {isRecommended && (
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-green-500 text-white z-10">
                  Recommended
                </span>
              )}

              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image src={model.image} alt="" fill className="object-cover" />
              </div>

              <div className="mt-2 font-medium">
                {t(`models.${model.id}`)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
