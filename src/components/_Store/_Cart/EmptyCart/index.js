"use client";

import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

export default function EmptyCart() {
  const locale = useLocale();
  const t = useTranslations("emptyCart");

  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">
        {t("title")}
      </h2>

      <Link
        href="/products"
        locale={locale}
        className="inline-block bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition"
      >
        {t("startShopping")}
      </Link>
    </div>
  );
}
