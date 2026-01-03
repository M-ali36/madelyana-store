"use client";

import Link from "@/components/Ui/Link";
import { useLocale } from "next-intl";

export default function EmptyCart() {
  const locale = useLocale();
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>

      <Link
        href="/products"
        locale={locale}
        className="inline-block bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition"
      >
        Start Shopping
      </Link>
    </div>
  );
}
