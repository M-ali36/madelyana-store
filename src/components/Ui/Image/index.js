"use client";

import { useState } from "react";

export default function Image({
  image,            // contentful asset object: { url, blurDataURL, width, height }
  alt = "",
  sizes = "100vw",
  className = "",
  priority = false,
  quality = 75,
  rounded = false,
}) {
  if (!image) return null;

  const [loaded, setLoaded] = useState(false);

  const breakpoints = [320, 640, 768, 1024, 1280, 1536, 2048, 3000];

  const buildSrcSet = (format) =>
    breakpoints
      .map((w) => `${image}?w=${w}&q=${quality}&fm=${format} ${w}w`)
      .join(", ");

  const baseSrc = `${image}?w=${image.width}&q=${quality}&fm=jpg`;

  return (
    <picture>
      {/* AVIF */}
      <source
        type="image/avif"
        srcSet={buildSrcSet("avif")}
        sizes={sizes}
      />

      {/* WebP */}
      <source
        type="image/webp"
        srcSet={buildSrcSet("webp")}
        sizes={sizes}
      />

      {/* Fallback JPG */}
      <img
        src={baseSrc}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        sizes={sizes}
        className={`${className} transition-all duration-700 `}
        style={{
          backgroundImage: `url(${image.blurDataURL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: rounded ? "12px" : undefined,
        }}
        onLoad={() => setLoaded(true)}
      />

      {/* No-JS Fallback */}
      <noscript>
        <img
          src={baseSrc}
          alt={alt}
          width={image.width}
          height={image.height}
        />
      </noscript>
    </picture>
  );
}
