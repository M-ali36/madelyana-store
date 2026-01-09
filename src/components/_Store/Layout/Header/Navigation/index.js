"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiX,
  HiMenu,
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
} from "react-icons/hi";
import Link from "@/components/Ui/Link";
import { useAppContext } from "@/components/context/AppContext";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";

export default function Navigation() {
  const { navState, setNavState } = useAppContext();
  const locale = useLocale();
  const t = useTranslations();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const isOpen = navState === "navigation";
  const toggleMenu = () => setNavState(isOpen ? "" : "navigation");

  // ------------------------------------------
  // HYDRATION FLAG
  // ------------------------------------------
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // ------------------------------------------
  // MOBILE DETECTOR (SSR safe)
  // ------------------------------------------
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(mq.matches);
    update();

    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ------------------------------------------
  // DRAWER & OVERLAY REFS
  // ------------------------------------------
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // ------------------------------------------
  // MEASURE DRAWER WIDTH ONCE (no reflows later)
  // ------------------------------------------
  const [drawerWidth, setDrawerWidth] = useState(260);

  useEffect(() => {
    if (drawerRef.current && isMobile) {
      setDrawerWidth(drawerRef.current.offsetWidth || 260);
    }
  }, [hydrated, isMobile]);

  // ------------------------------------------
  // GSAP ANIMATION (optimized)
  // ------------------------------------------
  useEffect(() => {
    if (!hydrated || !drawerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      const drawer = drawerRef.current;
      const overlay = overlayRef.current;

      if (!isMobile) {
        // Desktop mode resets
        gsap.set(drawer, { x: 0 });
        gsap.set(overlay, { autoAlpha: 0, backdropFilter: "blur(0px)" });
        return;
      }

      const offX = dir === "rtl" ? drawerWidth : -drawerWidth;

      if (isOpen) {
        gsap.to(overlay, {
          autoAlpha: 1,
          backdropFilter: "blur(6px)",
          duration: 0.3,
        });

        gsap.to(drawer, {
          x: 0,
          duration: 0.45,
          ease: "power3.out",
        });
      } else {
        gsap.to(drawer, {
          x: offX,
          duration: 0.45,
          ease: "power3.inOut",
        });

        gsap.to(overlay, {
          autoAlpha: 0,
          backdropFilter: "blur(0px)",
          duration: 0.3,
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen, isMobile, drawerWidth, hydrated, dir]);

  // ------------------------------------------
  // RENDER — hydrates safely
  // ------------------------------------------
  return (
    <nav className="relative w-full flex justify-end lg:block">
      {/* MOBILE MENU BUTTON */}
      <button
        className="max-lg:inline-flex hidden p-2 rounded-md text-white hover:bg-gray-100"
        onClick={toggleMenu}
      >
        <HiMenu className="w-6 h-6" />
      </button>

      {/* OVERLAY */}
      <div
        ref={overlayRef}
        onClick={toggleMenu}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm opacity-0 max-lg:block hidden z-40"
        style={{ visibility: "hidden" }}
      />

      {/* DESKTOP SPACER */}
      <div className="hidden lg:flex justify-center w-full" />

      {/* DRAWER / NAV LIST */}
      <ul
        ref={drawerRef}
        className={`
          flex items-center lg:justify-center font-medium px-4

          /* Desktop */
          hidden lg:flex lg:gap-10 lg:static

          /* Mobile drawer */
          max-lg:flex-col max-lg:fixed max-lg:top-0 max-lg:h-full
          max-lg:bg-white max-lg:shadow-2xl max-lg:overflow-y-auto
          max-lg:z-50 max-lg:block
          max-lg:w-64 max-lg:text-neutral-900


          ${dir === "rtl" ? "max-lg:right-0" : "max-lg:left-0"}
        `}
        style={{
          transform:
            !hydrated || !isMobile
              ? dir === "rtl"
                ? `translateX(${drawerWidth}px)`
                : `translateX(-${drawerWidth}px)`
              : undefined,
        }}
      >
        {/* HEADER (mobile only) */}
        <div className="max-lg:flex hidden items-center justify-between w-full px-2 mb-4">
          <span className="text-lg font-semibold">{t("menu")}</span>

          <button
            className="p-2 text-gray-600 hover:text-gray-800"
            onClick={toggleMenu}
          >
            <HiX className="w-7 h-7" />
          </button>
        </div>

        {/* NAV LINKS */}
        <li className="py-3 max-lg:w-full border-b max-lg:border-gray-200 lg:border-none">
          <Link locale={locale} href="/women" className="">
            {t("women_bags")}
          </Link>
        </li>

        <li className="py-3 border-b max-lg:border-gray-200 lg:border-none">
          <Link locale={locale} href="/style-insights" className="">
            {t("styleInsights")}
          </Link>
        </li>

        <li className="py-3 border-b max-lg:border-gray-200 lg:border-none">
          <Link locale={locale} href="/packing" className="">
            {t("gifts")}
          </Link>
        </li>

        {/* MOBILE ICON MENU */}
        <div className="max-lg:flex max-lg:flex-col max-lg:gap-4 hidden mt-4">
          <Link
            locale={locale}
            href="/cart"
            className="flex items-center gap-3  py-3 border-b border-t"
          >
            <HiOutlineShoppingCart className="w-6 h-6" />
            <span>{t("cart")}</span>
          </Link>

          <Link
            locale={locale}
            href="/customer/wishlist"
            className="flex items-center gap-3  py-3 border-b"
          >
            <HiOutlineHeart className="w-6 h-6" />
            <span>{t("wishlist")}</span>
          </Link>

          <Link
            locale={locale}
            href="/customer"
            className="flex items-center gap-3  py-3 border-b"
          >
            <HiOutlineUser className="w-6 h-6" />
            <span>{t("my_account")}</span>
          </Link>
        </div>
      </ul>
    </nav>
  );
}
