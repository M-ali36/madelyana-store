import data from "@/data/aiImageGen.json";

/**
 * Perspective-specific composition rules
 * Single source of truth
 */
const PERSPECTIVE_RULES = {
  crossbody_front_center: `
- Positioning: The long strap rests on her right shoulder and runs diagonally across her chest, allowing the bag to sit at the front of her hip.
- Strap Style: The bag features a wide, decorative webbing strap with a geometric pattern.
- Hands-Free Carriage: Her hands rest naturally at her sides for completely hands-free movement.
- Height: The bag sits at waist or upper-hip level.
`,
  crossbody_front_center_low: `
- Positioning: The strap crosses from the right shoulder to the left hip, placing the bag lower on the torso.
- Strap Style: Wide patterned webbing strap providing ergonomic support.
- Hands-Free Carriage: Fully hands-free and secure.
- Height: Low waist or upper-hip level.
`,
  crossbody_front_right: `
- Positioning: The bag sits at the front of the right hip with the strap over the right shoulder.
- Strap Style: Thick patterned webbing strap.
- Hands-Free Carriage: Secure shoulder placement allows free movement.
- Height: Natural waistline.
`,
  crossbody_front_right_to_left: `
- Positioning: Strap runs diagonally from right shoulder to left side.
- Strap Style: Integrated fabric strap for a streamlined look.
- Hands-Free Carriage: Close-to-body and stable.
- Height: Upper waist or ribcage level.
`,
  crossbody_back: `
- Positioning: The bag rests against the lower back with the strap crossing diagonally.
- Strap Style: Clearly visible crossbody strap across the back.
- Hands-Free Carriage: Fully hands-free and secure.
- Height: Upper-hip or lower-back level.
`,
  shoulder_front_left: `
- Positioning: The bag hangs at the left side from the shoulder.
- Strap Style: Thin adjustable shoulder strap.
- Hands-Free Carriage: May require occasional stabilization.
- Height: Hip level.
`,
  shoulder_back_left: `
- Positioning: The bag rests against the back when worn on the shoulder.
- Strap Style: Short decorative strap designed to stay in place.
- Hands-Free Carriage: Hands-free, but out of direct sight.
- Height: Upper-to-mid ribcage.
`,
  shoulder_side: `
- Positioning: Side-angle view emphasizing depth and profile.
- Strap Style: Natural vertical strap line.
- Hands-Free Carriage: Fully hands-free.
- Height: Hip level.
`,
  hand_held_low_center: `
- Positioning: Bag held in front of the body with one hand.
- Strap Style: Short structured top handles.
- Hands-Free Carriage: Manual carry.
- Height: Upper-thigh or hip level.
`,
  hand_held_low_right: `
- Positioning: Bag held down at the right side.
- Strap Style: Medium-length hand straps.
- Hands-Free Carriage: Manual carry.
- Height: Knee level.
`,
  hand_held_extended_right: `
- Positioning: Bag extended slightly away from the body.
- Strap Style: Short braided or textured handle.
- Hands-Free Carriage: Manual carry only.
- Height: Mid-thigh level.
`,
  hand_held_waist_center: `
- Positioning: Bag held centrally at waist height with both hands.
- Strap Style: Short reinforced top handles.
- Hands-Free Carriage: Requires both hands.
- Height: Waist level.
`,
  hand_held_top_handle: `
- Positioning: Bag carried by the top handle beside or in front of the body.
- Strap Style: Structured top handle.
- Hands-Free Carriage: Manual carry.
- Height: Upper-thigh to hip level.
`
};

export function buildPrompt(state) {
  const bag = data.bagTypes.find(b => b.id === state.bagType);
  const occasion = data.occasions.find(o => o.id === state.occasion);
  const model = data.models.find(m => m.id === state.model);

  const bagLabel = bag ? bag.id.replace(/_/g, " ") : "bag";
  const outfitStyle = occasion
    ? occasion.defaultOutfitStyle.replace(/_/g, " ")
    : "neutral outfit";
  const environment = occasion
    ? occasion.defaultEnvironment.replace(/_/g, " ")
    : "neutral environment";
  const lighting = occasion
    ? occasion.lighting.replace(/_/g, " ")
    : "soft natural lighting";

  const perspectives = state.perspectives
    .map(id => data.perspectives.find(p => p.id === id))
    .filter(Boolean);

  const perspectivesBlock = perspectives
    .map((p, index) => {
      const rules =
        PERSPECTIVE_RULES[p.id] ||
        `- No distracting elements.`;

      return `
### Perspective ${index + 1}: ${p.id.replace(/_/g, " ")}

${rules}
      `.trim();
    })
    .join("\n\n");

  return `
Create high-quality, photorealistic e-commerce product images of a ${bagLabel}.

The images must be suitable for an online store and product detail page.
The bag is worn by the uploaded woman only for scale reference unless stated otherwise.

The following perspectives MUST ALL be generated:

${perspectivesBlock}

Use the EXACT uploaded product image with NO alterations:
- Do not change color
- Do not change shape
- Do not change material
- Do not change texture
- Do not modify logo or stitching
- Do not touch or modify the product in any way

Real-world dimensions (must be respected visually):
- Width: ${state.dimensions.width} cm
- Height: ${state.dimensions.height} cm
- Depth: ${state.dimensions.depth} cm

Outfit style: ${outfitStyle}.
Environment: ${environment}.
Lighting: ${lighting}.

The product must remain the CLEAR and DOMINANT subject in every image.
  `.trim();
}
