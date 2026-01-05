"use client";

import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

export default function CustomerDashboard() {
  const locale = useLocale();
  const t = useTranslations("customerDashboard");

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {t("yourAccount")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard
          title={t("orders.title")}
          desc={t("orders.desc")}
          href="/customer/orders"
          locale={locale}
        />

        <DashboardCard
          title={t("wishlist.title")}
          desc={t("wishlist.desc")}
          href="/customer/wishlist"
          locale={locale}
        />

        <DashboardCard
          title={t("settings.title")}
          desc={t("settings.desc")}
          href="/customer/settings"
          locale={locale}
        />

        <DashboardCard
          title={t("address.title")}
          desc={t("address.desc")}
          href="/customer/address"
          locale={locale}
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, desc, href, ...props }) {
  return (
    <Link
      href={href}
      {...props}
      className="block bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-600">{desc}</p>
    </Link>
  );
}
