"use client";

import { useEffect, useState } from "react";
import { HiX, HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

export default function NavigationMobile() {
  const { navState, setNavState } = useAppContext();
  const locale = useLocale();
  const t = useTranslations();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const isOpen = navState === "navigation";

  const toggle = () => setNavState(isOpen ? "" : "navigation");

  // Detect mobile only
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isMobile) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={toggle}
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      ></div>

      {/* DRAWER */}
      <ul
        className={`
          fixed top-0 h-full bg-white shadow-2xl p-4 overflow-y-auto z-50 w-64
          flex flex-col font-medium lg:hidden transition-transform duration-300
          start-0
          ${
            isOpen
              ? "translate-x-0"
              : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
          }
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between w-full py-4">
          <span className="text-lg font-semibold">{t("menu")}</span>

          <button
            className="p-2 bg-neutral-800 text-white h-8 w-8 rounded-full"
            onClick={toggle}
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>

        {/* NAV LINKS */}
        <li className="py-4 border-b border-gray-200">
          <Link locale={locale} href="/women">
            {t("women_bags")}
          </Link>
        </li>

        <li className="py-4 border-b border-gray-200">
          <Link locale={locale} href="/packing">
            {t("gifts")}
          </Link>
        </li>

        <li className="py-4 border-b border-gray-200">
          <Link locale={locale} href="/style-insights">
            {t("styleInsights")}
          </Link>
        </li>

        {/* MOBILE ICON MENU */}
        <li className="py-4 border-b border-gray-200">
          <Link locale={locale} href="/cart" className="flex items-center gap-3">
            <HiOutlineShoppingCart className="w-6 h-6" />
            <span>{t("cart")}</span>
          </Link>
        </li>

        <li className="py-4 border-b border-gray-200">
          <Link locale={locale} href="/customer/wishlist" className="flex items-center gap-3">
            <HiOutlineHeart className="w-6 h-6" />
            <span>{t("wishlist")}</span>
          </Link>
        </li>

        <li className="py-4">
          <Link locale={locale} href="/customer" className="flex items-center gap-3">
            <HiOutlineUser className="w-6 h-6" />
            <span>{t("my_account")}</span>
          </Link>
        </li>
      </ul>
    </>
  );
}
