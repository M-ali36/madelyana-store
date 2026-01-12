"use client";

import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";
import data from "@/data/aiImageGen.json";

export default function StepPerspectives() {
  const { state, togglePerspective } = useWizard();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {data.perspectives.map((p) => {
          const isRecommended =
            p.allowedBagTypes?.includes(state.bagType);

          const active = state.perspectives.includes(p.id);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePerspective(p.id)}
              className={`relative rounded-xl border p-4 text-left transition
                ${
                  active
                    ? "border-gray-900 ring-2 ring-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-900"
                }
              `}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <span className="absolute top-2 right-2 z-10 text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">
                  Recommended
                </span>
              )}

              {/* Perspective image */}
              <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-3 bg-gray-100">
                <img
                  src={p.image}
                  alt={p.label.en}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Perspective label */}
              <div className="text-sm font-medium text-gray-900">
                {p.label.en}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
