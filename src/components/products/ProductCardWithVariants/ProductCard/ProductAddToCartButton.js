"use client";

import { HiOutlineShoppingBag } from "react-icons/hi";

export default function ProductAddToCartButton({
  canAddToCart,
  hasVariants,
  allAttributesSelected,
  variantStock,
  addToCart,
}) {
  return (
    <button
      onClick={addToCart}
      disabled={!canAddToCart}
      className={`w-full py-2 rounded-md font-medium flex items-center gap-2 justify-center
        ${
          canAddToCart
            ? "bg-primary text-neutral-900 hover:bg-primary-dark"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }
      `}
    >
      <HiOutlineShoppingBag className="w-5 h-5" />

      {!hasVariants
        ? "Add to Cart"
        : !allAttributesSelected
        ? "Select Options"
        : variantStock > 0
        ? "Add to Cart"
        : "Out of Stock"}
    </button>
  );
}
