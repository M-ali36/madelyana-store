"use client";

import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";

export default function StepProductDetails() {
  const { state, updateDimensions } = useWizard();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {["width", "height", "depth"].map((key) => (
        <input
          key={key}
          type="number"
          placeholder={key}
          value={state.dimensions[key] ?? ""}
          onChange={(e) => updateDimensions(key, Number(e.target.value))}
          className="border rounded-lg px-3 py-2"
        />
      ))}
    </div>
  );
}
