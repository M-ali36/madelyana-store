"use client";

import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>

      <Link
        href="/products"
        className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-900 transition"
      >
        Start Shopping
      </Link>
    </div>
  );
}
