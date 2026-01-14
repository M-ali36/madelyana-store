"use client";

import { useState } from "react";
import data from "@/data/aiImageVideo.json";
import VideoSceneCard from "../VideoSceneCard";
import StepHeader from "../StepHeader";

export default function VideoPromptSteps() {
  const scenes = data.videoSceneImageRecords || [];

  // Wizard step
  const [currentStep, setCurrentStep] = useState(6);

  // User selections
  const [aspectRatio, setAspectRatio] = useState("portrait");
  const [selectedScenes, setSelectedScenes] = useState([]);

  function toggleScene(sceneId) {
    setSelectedScenes((prev) =>
      prev.includes(sceneId)
        ? prev.filter((id) => id !== sceneId)
        : [...prev, sceneId]
    );
  }

  function goNext() {
    if (currentStep === 6 && selectedScenes.length === 0) return;
    setCurrentStep(7);
  }

  function goBack() {
    setCurrentStep(6);
  }

  // Resolve selected scene objects
  const selectedSceneObjects = scenes.filter((scene) =>
    selectedScenes.includes(scene.sceneId)
  );

  return (
    <div className="space-y-6">
      <StepHeader
        title="AI Product Video Generator"
        stepLabel="Step"
        stepValue={`${currentStep} / 7`}
      />

      {/* STEP 6 — SELECTION */}
      {currentStep === 6 && (
        <>
          {/* Aspect Ratio */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-sm font-medium text-gray-700">
              Video Aspect Ratio
            </h2>

            <div className="flex gap-3">
              {["portrait", "landscape", "boxed"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`rounded-md border px-4 py-2 text-sm transition
                    ${
                      aspectRatio === ratio
                        ? "border-black bg-black text-white"
                        : "hover:border-black"
                    }
                  `}
                >
                  {ratio.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Scene Selection */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-sm font-medium text-gray-700">
              Select Video Scenes
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {scenes.map((scene) => (
                <VideoSceneCard
                  key={scene.sceneId}
                  scene={scene}
                  selected={selectedScenes.includes(scene.sceneId)}
                  onToggle={() => toggleScene(scene.sceneId)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* STEP 7 — PROMPT RESULTS (SPLIT PER SCENE) */}
      {currentStep === 7 && (
        <div className="space-y-8">
          {selectedSceneObjects.map((scene, index) => {
            const imagePrompt = `
Create a high-end, photorealistic product image to be used as a reference frame for AI video generation.

PRODUCT LOCK (CRITICAL):
You are provided with the exact product image of the handbag.
You MUST preserve the product exactly as-is.

STRICTLY DO NOT:
- Change color, material, texture, or shape
- Modify stitching, seams, or edges
- Alter logo, branding, or hardware
- Redesign, stylize, or enhance the product

SCENE:
${scene.sceneId}

COMPOSITION RULES:
${Object.entries(scene.compositionRules || {})
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

GENERATION NOTES:
${scene.generationNotes.map((note) => `- ${note}`).join("\n")}

QUALITY REQUIREMENTS:
- Ultra-sharp focus
- Clean studio lighting
- No motion blur
- Stable geometry
- Suitable for image-to-video conversion
`.trim();

            const videoPrompt = `
Create a high-end cinematic product video using the provided reference image.

VIDEO FORMAT:
- Aspect ratio: ${aspectRatio.toUpperCase()}
- Product-only video
- No humans or hands

PRODUCT LOCK (ABSOLUTE):
The handbag must remain IDENTICAL to the provided image.
Do not change color, shape, material, stitching, or branding.

SCENE TYPE:
${scene.sceneId}

CAMERA & MOTION:
- Smooth, controlled cinematic motion
- No camera shake
- No warping or geometry deformation

LIGHTING & STYLE:
- Luxury studio lighting
- Preserve leather grain and material realism

QUALITY:
- Photorealistic
- Stable proportions
- No AI artifacts

The final result should feel like a luxury brand product video shot.
`.trim();

            return (
              <div
                key={scene.sceneId}
                className="rounded-xl border bg-white p-6 space-y-6"
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-800">
                    Scene {index + 1}: {scene.sceneId}
                  </h2>
                </div>

                {/* IMAGE PROMPT */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-medium text-gray-600">
                      Image Prompt
                    </h3>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(imagePrompt)
                      }
                      className="text-xs underline"
                    >
                      Copy
                    </button>
                  </div>

                  <textarea
                    readOnly
                    value={imagePrompt}
                    className="h-64 w-full resize-none rounded-md border bg-gray-50 p-4 text-sm font-mono"
                  />
                </div>

                {/* VIDEO PROMPT */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-medium text-gray-600">
                      Video Prompt
                    </h3>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(videoPrompt)
                      }
                      className="text-xs underline"
                    >
                      Copy
                    </button>
                  </div>

                  <textarea
                    readOnly
                    value={videoPrompt}
                    className="h-64 w-full resize-none rounded-md border bg-gray-50 p-4 text-sm font-mono"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between">
        <button
          onClick={goBack}
          disabled={currentStep === 6}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
        >
          Back
        </button>

        <button
          onClick={goNext}
          disabled={currentStep === 6 && selectedScenes.length === 0}
          className="rounded-md bg-black px-6 py-2 text-sm text-white disabled:opacity-40"
        >
          {currentStep === 6 ? "Next" : "Done"}
        </button>
      </div>
    </div>
  );
}
