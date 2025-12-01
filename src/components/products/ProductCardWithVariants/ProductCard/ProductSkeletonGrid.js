"use client";

import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductSkeletonGrid({ count = 4 }) {
  const items = Array.from({ length: count });

  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
      {items.map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
