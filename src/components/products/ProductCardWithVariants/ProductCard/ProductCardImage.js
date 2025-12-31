"use client";

import AnimatedImage from "@/components/Ui/AnimatedImage";
import Image from "@/components/Ui/Image";

export default function ProductCardImage({ images, selected }) {
  const mainImage =
    images.find((i) => i.tag === "imageMain")?.url ||
    images[0]?.url ||
    "/placeholder.png";

  const colorKey = Object.keys(selected).find(
    (key) => key.toLowerCase() === "color"
  );

  const selectedColor = colorKey ? selected[colorKey] : null;

  const colorImage =
    selectedColor &&
    images.find(
      (i) =>
        i.tag?.toLowerCase() ===
        `image${selectedColor.toLowerCase()}`
    )?.url;

  const displayImage = colorImage || mainImage;

  return (
    <div className="relative w-full aspect-video mb-3">
      <AnimatedImage 
        image={displayImage}
      />
    </div>
  );
}
