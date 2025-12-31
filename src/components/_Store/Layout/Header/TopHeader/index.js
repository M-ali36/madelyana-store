"use client";

import React from "react";
import { useTranslations } from "next-intl";
import CurrencySwitcher from "../CurrencySwitcher";
import LanguageSwitcher from "../LanguageSwitcher";
import { useAppContext } from "@/components/context/AppContext";

export default function TopHeader({ locale }) {
  const { scrollDirection } = useAppContext();
  const t = useTranslations("");

  const hidden = scrollDirection === "down";

  return (
    <div
      className="
        w-full bg-black text-white 
        transition-all duration-500 overflow-hidden
      "
      style={{
        height: hidden ? "0px" : "46px",
      }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between py-2">

        {/* Left message */}
        <div className="text-sm">
          {t("top_message")}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          <CurrencySwitcher />
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </div>
  );
}
