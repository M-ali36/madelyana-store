"use client";

import { useState, useMemo } from "react";
import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";
import { buildPrompt } from "@/lib/aiImageGen/buildPrompt";

export default function StepReview() {
  const { state } = useWizard();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  /**
   * Prompt is UI-only and independent of API details
   */
  const prompt = useMemo(() => {
    if (
      !state.bagType ||
      !state.occasion ||
      !Array.isArray(state.perspectives) ||
      state.perspectives.length === 0
    ) {
      return "";
    }

    return buildPrompt(state);
  }, [state.bagType, state.occasion, state.perspectives]);

  const handleGenerate = async () => {
    setError(null);

    if (!prompt) {
      setError("Prompt is not ready.");
      return;
    }

    if (!state.productImage?.base64) {
      setError("Product image is missing.");
      return;
    }

    if (!state.model) {
      setError("No model selected.");
      return;
    }

    setLoading(true);
    setImages([]);

    try {
      // ✅ USE BASE64 EXACTLY AS STORED BY StepUpload
      const productImageBase64 = state.productImage.base64;

      const res = await fetch("/api/ai-image-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          productImageBase64,
          model: state.model,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to start generation.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const chunk = JSON.parse(line);
          const parts =
            chunk?.candidates?.[0]?.content?.parts ?? [];

          for (const part of parts) {
            if (part.inlineData?.data) {
              setImages((prev) => [
                ...prev,
                `data:image/png;base64,${part.inlineData.data}`,
              ]);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-medium text-gray-700">
          Prompt Preview
        </h3>

        <textarea
          readOnly
          value={
            prompt ||
            "Complete all previous steps to generate the prompt."
          }
          className="mt-2 h-64 w-full rounded border p-3 text-sm"
        />
      </section>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate Images"}
      </button>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Generated ${i + 1}`}
              className="rounded border"
            />
          ))}
        </div>
      )}
    </div>
  );
}
