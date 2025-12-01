"use client";

export default function ProductCardSkeleton() {
  return (
    <div className="min-w-[240px] bg-white rounded-xl shadow p-4 animate-pulse">
      {/* Image */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-3" />

      {/* Title */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />

      {/* Price */}
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />

      {/* Wishlist Button */}
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />

      {/* Variant Selectors (simulated) */}
      <div className="flex gap-2 mb-4">
        <div className="w-10 h-6 bg-gray-200 rounded" />
        <div className="w-10 h-6 bg-gray-200 rounded" />
        <div className="w-10 h-6 bg-gray-200 rounded" />
      </div>

      {/* Add to Cart button */}
      <div className="w-full h-10 bg-gray-200 rounded" />
    </div>
  );
}
