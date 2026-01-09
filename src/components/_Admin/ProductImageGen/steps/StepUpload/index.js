"use client";

import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";
import { useRef } from "react";

export default function StepUpload() {
  const { updateState, state } = useWizard();
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // remove data:image/*
      updateState("productImage", {
        name: file.name,
        type: file.type,
        base64
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Upload Product Image</h2>

      <div
        className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer"
        onClick={() => inputRef.current.click()}
      >
        {state.productImage?.name || "Click to upload"}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
