"use client";

import { useState, useMemo } from "react";
import { useWizard } from "@/components/_Admin/ProductImageGen/WizardContext";
import { buildPrompt } from "@/lib/aiImageGen/buildPrompt";

export default function StepReview() {
  const { state } = useWizard();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  // Build prompts (one per perspective)
  const prompts = useMemo(() => {
    if (
      !state.bagType ||
      !state.occasion ||
      !state.perspectives.length ||
      !state.productImage?.base64
    ) {
      return [];
    }
    return buildPrompt(state);
  }, [state]);

  // 🔹 Build FULL request payload preview
  const requestPreview = useMemo(() => {
    return prompts.map((prompt, index) => ({
      index: index + 1,
      prompt,
      negativePrompt: `
        Do not change product color, shape, logo, texture, stitching, or proportions.
        Do not invent branding or text.
        Do not add accessories.
        Do not crop or hide the bag.
        Do not distort scale.
        Do not apply dramatic or cinematic lighting.
        Do not show the model’s face.
        Do not allow the model to dominate the frame.
        Do not show uncovered hair.
        Do not show the neck or chest.
        Do not show short sleeves or tight clothing.
        Do not show revealing or transparent outfits.
        Do not dress the model in western fashion styles.
      `.trim(),
      modelImagePath: `/models/${state.model}.webp`,
      productImage: {
        name: state.productImage?.name,
        type: state.productImage?.type,
        base64Length: state.productImage?.base64?.length
      },
      dimensions: state.dimensions,
      bagType: state.bagType,
      occasion: state.occasion,
      perspective: state.perspectives[index]
    }));
  }, [prompts, state]);

  const handleGenerate = async () => {
    if (!requestPreview.length) {
      setError("Please complete all required steps before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setImages([]);

    try {
      const responses = await Promise.all(
        requestPreview.map((req) =>
          fetch("/api/ai-image-gen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: req.prompt,
              negativePrompt: req.negativePrompt,
              productImageBase64: state.productImage.base64,
              productImageType: state.productImage.type
            })
          }).then((res) => res.json())
        )
      );

      const generatedImages = [];

      responses.forEach((response) => {
        const parts =
          response?.result?.candidates?.[0]?.content?.parts || [];

        parts.forEach((part) => {
          if (part.inlineData?.data) {
            generatedImages.push(
              `data:image/png;base64,${part.inlineData.data}`
            );
          }
        });
      });

      setImages(generatedImages);
    } catch (err) {
      console.error(err);
      setError("Failed to generate images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Review Request Data & Generate
        </h2>
        <p className="text-sm text-gray-500">
          Review the exact data that will be sent to the AI API.
        </p>
      </div>

      {/* Prompt Preview */}
      {prompts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Prompt Preview
          </h3>

          {prompts.map((prompt, index) => (
            <textarea
              key={index}
              readOnly
              value={prompt}
              className="h-56 w-full rounded-lg border bg-white p-3 text-sm"
            />
          ))}
        </section>
      )}

      {/* FULL REQUEST DATA PREVIEW */}
      {requestPreview.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Full API Request Payload (Preview)
          </h3>

          <pre className="max-h-[500px] overflow-auto rounded-xl border bg-gray-50 p-4 text-xs">
            {JSON.stringify(requestPreview, null, 2)}
          </pre>
        </section>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !requestPreview.length}
        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Generating images..." : "Generate Images"}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Generated Images
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Generated ${index + 1}`}
                className="rounded-xl border object-cover"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
