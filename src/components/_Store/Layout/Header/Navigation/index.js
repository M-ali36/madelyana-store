"use client";

import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";
import { HiMenu} from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";

export default function NavigationDesktop() {
  const locale = useLocale();
  const t = useTranslations();
  const { navState, setNavState } = useAppContext();

  const isOpen = navState === "navigation";
  const toggle = () => setNavState(isOpen ? "" : "navigation");
  
  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        className="inline-flex ms-auto items-center justify-center p-2 h-12 w-12 bg-white text-neutral-900 rounded-full lg:hidden"
        onClick={toggle}
      >
        <HiMenu className="w-6 h-6" />
      </button>
      <ul className="hidden lg:flex items-center lg:justify-center font-medium px-4 lg:gap-10">
        <li className="py-3">
          <Link locale={locale} href="/women" className="lg:underline">
            {t("women_bags")}
          </Link>
        </li>

        <li className="py-3">
          <Link locale={locale} href="/packing" className="lg:underline">
            {t("gifts")}
          </Link>
        </li>

        <li className="py-3">
          <Link locale={locale} href="/style-insights" className="lg:underline">
            {t("styleInsights")}
          </Link>
        </li>
      </ul>
    </>
  );
}
