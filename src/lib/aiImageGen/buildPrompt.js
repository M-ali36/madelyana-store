import data from "@/data/aiImageGen.json";

/**
 * Perspective-specific composition rules
 * This is the KEY missing layer
 */
const PERSPECTIVE_RULES = {
  product_only: `
Composition rules:
- No human presence.
- The bag must occupy at least 75% of the frame.
- Centered composition.
- Clean e-commerce framing.
`,

  worn_side: `
Composition rules:
- The bag must occupy at least 60% of the frame width.
- The model is used ONLY for scale reference.
- Do NOT show the model’s face.
- Crop from shoulder to mid-torso only.
- The model must not dominate the image.
- The bag must be centered and fully visible.
`,

  worn_back: `
Composition rules:
- The bag must be clearly visible from the back view.
- The bag must occupy at least 60% of the frame.
- No face visible.
- Crop from shoulders to mid-back.
- Product remains the primary focus.
`,

  worn_front: `
Composition rules:
- The bag must be fully visible from the front.
- The bag must occupy at least 60% of the frame.
- No face visible.
- Crop from chest to waist.
- No editorial posing.
`,

  interior: `
Composition rules:
- No model presence.
- Focus on interior details.
- The interior must be well-lit and sharp.
- Background must be neutral.
`
};

export function buildPrompt(state) {
  const bag = data.bagTypes.find(b => b.id === state.bagType);
  const occasion = data.occasions.find(o => o.id === state.occasion);
  const model = data.models.find(m => m.id === state.model);

  const bagLabel = bag ? bag.id.replace(/_/g, " ") : "bag";
  const environment = occasion
    ? occasion.defaultEnvironment.replace(/_/g, " ")
    : "neutral environment";

  const outfitStyle = occasion
    ? occasion.defaultOutfitStyle.replace(/_/g, " ")
    : "neutral outfit";

  const lighting = occasion
    ? occasion.lighting.replace(/_/g, " ")
    : "soft natural lighting";

  const modelDescription = model?.vibe
    ? model.vibe.replace(/_/g, " ")
    : "woman";

  const perspectives = state.perspectives
    .map(id => data.perspectives.find(p => p.id === id))
    .filter(Boolean);

  return perspectives.map(p => {
    const compositionRules =
      PERSPECTIVE_RULES[p.id] || `
Composition rules:
- The bag must remain the primary focus.
- No distracting elements.
`;

    return `
Create a high-quality, photorealistic e-commerce product image of a ${bagLabel}.

The image must be suitable for an online store and product detail page.

${
  p.requiresModel
    ? `The bag is worn by a ${modelDescription} only for scale reference.`
    : `No human presence in the image.`
}

Perspective: ${p.id.replace(/_/g, " ")}.

${compositionRules}

Use the EXACT uploaded product image with NO alterations:
- Do not change color
- Do not change shape
- Do not change material
- Do not change texture
- Do not modify logo or stitching

Real-world dimensions (must be respected visually):
- Width: ${state.dimensions.width} cm
- Height: ${state.dimensions.height} cm
- Depth: ${state.dimensions.depth} cm

Outfit style: ${outfitStyle}.
Environment: ${environment}.
Lighting: ${lighting}.

The product must remain the CLEAR and DOMINANT subject of the image.
    `.trim();
  });
}
