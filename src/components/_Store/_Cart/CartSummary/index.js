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
        className="block w-full text-center py-3 rounded-full border border-neutral-900 bg-neutral-900 text-white font-semibold hover:bg-neutral-700 transition mb-4"
      >
        {t("proceedToCheckout")}
      </Link>

      <Link
        href="/products"
        locale={locale}
        className="block w-full text-center py-3 rounded-full border border-neutral-900 bg-white text-neutral-900 font-semibold hover:text-neutral-700 transition"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
