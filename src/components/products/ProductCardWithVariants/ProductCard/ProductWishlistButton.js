"use client";

import { HiHeart, HiOutlineHeart } from "react-icons/hi";

export default function ProductWishlistButton({
  isInWishlist,
  toggleWishlist,
}) {
  return (
    <button
      onClick={toggleWishlist}
      className={`flex items-center gap-1 text-sm mb-3 ${
        isInWishlist
          ? "text-red-500"
          : "text-gray-600 hover:text-red-500"
      }`}
    >
      {isInWishlist ? (
        <HiHeart className="w-5 h-5" />
      ) : (
        <HiOutlineHeart className="w-5 h-5" />
      )}
      {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
    </button>
  );
}
