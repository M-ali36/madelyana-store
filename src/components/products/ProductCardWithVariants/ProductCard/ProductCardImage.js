"use client";

import Image from "next/image";

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
    <div className="relative w-full h-48 mb-3">
      <Image
        src={displayImage}
        alt="Product"
        fill
        className="object-cover rounded-lg"
      />
    </div>
  );
}
