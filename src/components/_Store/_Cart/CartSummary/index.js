"use client";

import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

export default function CartSummary({ subtotal, format }) {
  const locale = useLocale();
  const t = useTranslations("cartSummary");

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">
        {t("orderSummary")}
      </h3>

      <div className="flex justify-between mb-3 text-sm">
        <span>{t("subtotal")}</span>
        <span className="font-medium">{format(subtotal)}</span>
      </div>

      <div className="h-px bg-gray-300 my-4" />

      {/* Checkout */}
      <Link
        href="/checkout"
        locale={locale}
        className="block w-full bg-neutral-900 text-white text-center py-2 rounded-md hover:bg-gray-800 transition"
      >
        {t("proceedToCheckout")}
      </Link>

      <Link
        href="/products"
        locale={locale}
        className="block text-center text-sm mt-3 text-gray-700 hover:underline"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
