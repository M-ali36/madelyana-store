"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  HiShieldCheck,
  HiLockClosed,
  HiRefresh,
  HiHeart,
  HiChatAlt2,
} from "react-icons/hi";

export default function ProductTrust() {
  const t = useTranslations("productTrust");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const items = [
    {
      icon: HiShieldCheck,
      title: t("qualityTitle"),
      description: t("qualityDesc"),
    },
    {
      icon: HiLockClosed,
      title: t("secureTitle"),
      description: t("secureDesc"),
    },
    {
      icon: HiRefresh,
      title: t("returnsTitle"),
      description: t("returnsDesc"),
    },
    {
      icon: HiChatAlt2,
      title: t("supportTitle"),
      description: t("supportDesc"),
    },
    {
      icon: HiHeart,
      title: t("careTitle"),
      description: t("careDesc"),
    },
  ];

  return (
    <section
      className={`w-full max-w-5xl mx-auto px-4 ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mb-12">
        <h2 className="text-1xl font-semibold text-gray-900 mb-4 text-teal-700">
          {t("heading")}
        </h2>
        <p className="text-gray-600 max-w-3xl leading-relaxed text-teal-600">
          {t("intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex gap-4 items-start border border-gray-200 rounded-lg p-6 odd:bg-gray-50 even:bg-gray-100"
            >
              <div className="flex-shrink-0">
                <Icon className="w-6 h-6 text-gray-900" />
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
