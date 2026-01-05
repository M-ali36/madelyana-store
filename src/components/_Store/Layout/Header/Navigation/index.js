'use client';

import { useEffect, useRef, useState } from "react";
import {
    HiX,
    HiMenu,
    HiOutlineShoppingCart,
    HiOutlineHeart,
    HiOutlineUser
} from "react-icons/hi";
import Link from '@/components/Ui/Link';
import { useAppContext } from '@/components/context/AppContext';
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";

const Navigation = () => {
    const { navState, setNavState } = useAppContext();
    const locale = useLocale();
    const t = useTranslations();
    const dir = locale === "ar" ? "rtl" : "ltr";

    const drawerRef = useRef(null);
    const overlayRef = useRef(null);

    const isOpen = navState === "navigation";

    // -------------------------
    // HYDRATION SAFE FLAG
    // -------------------------
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    // -------------------------
    // SSR-SAFE MOBILE DETECTOR
    // -------------------------
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof matchMedia === "undefined") return;
        const mq = matchMedia("(max-width: 1024px)");
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    const toggleMenu = () => setNavState(isOpen ? "" : "navigation");

    // -------------------------
    // GSAP ANIMATION
    // -------------------------
    useEffect(() => {
        if (!hydrated) return; // ❗ prevent flash during SSR → client switch
        if (!drawerRef.current || !overlayRef.current) return;

        const drawer = drawerRef.current;
        const overlay = overlayRef.current;

        if (!isMobile) {
            gsap.set(drawer, { x: 0 });
            gsap.set(overlay, { autoAlpha: 0, backdropFilter: "blur(0px)" });
            return;
        }

        const fromX = dir === "rtl" ? 260 : -260;

        if (isOpen) {
            gsap.to(overlay, {
                autoAlpha: 1,
                backdropFilter: "blur(6px)",
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(drawer, {
                x: 0,
                duration: 0.45,
                ease: "power3.out"
            });
        } else {
            gsap.to(drawer, {
                x: fromX,
                duration: 0.45,
                ease: "power3.inOut"
            });

            gsap.to(overlay, {
                autoAlpha: 0,
                backdropFilter: "blur(0px)",
                duration: 0.3
            });
        }
    }, [isOpen, isMobile, dir, hydrated]);

    return (
        <nav className="relative w-full flex justify-end lg:block">

            {/* ⭐ MOBILE MENU TOGGLE BUTTON */}
            <button
                className="max-lg:inline-flex hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={toggleMenu}
            >
                <HiMenu className="w-6 h-6" />
            </button>

            {/* ⭐ OVERLAY */}
            <div
                ref={overlayRef}
                onClick={toggleMenu}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm opacity-0 pointer-events-auto max-lg:block hidden z-40"
                style={{ visibility: "hidden" }}
            />

            {/* Desktop Centering Wrapper */}
            <div className="hidden lg:flex justify-center w-full"></div>

            {/* ⭐ DRAWER / NAV LIST */}
            <ul
                ref={drawerRef}
                className={`
                    flex items-center font-medium px-4

                    /* Desktop navigation */
                    hidden lg:flex lg:gap-10 lg:justify-center lg:static

                    /* Mobile drawer */
                    max-lg:flex-col max-lg:fixed max-lg:top-0 max-lg:h-full
                    max-lg:w-64 max-lg:bg-white max-lg:shadow-2xl
                    max-lg:overflow-y-auto max-lg:z-50 max-lg:block

                    ${dir === "rtl" ? "max-lg:right-0" : "max-lg:left-0"}
                `}
                style={{
                    transform:
                        !hydrated
                            ? (dir === "rtl" ? "translateX(260px)" : "translateX(-260px)") // ❗ ALWAYS closed on first paint
                            : isMobile
                            ? (dir === "rtl" ? "translateX(260px)" : "translateX(-260px)")
                            : "none"
                }}
            >

                {/* ⭐ Drawer Header */}
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
                    <Link locale={locale} href="/women" className="text-gray-900">
                        {t("women_bags")}
                    </Link>
                </li>

                <li className="py-3 border-b max-lg:border-gray-200 lg:border-none">
                    <Link locale={locale} href="/style-insights" className="text-gray-900">
                        {t("styleInsights")}
                    </Link>
                </li>

                <li className="py-3 border-b max-lg:border-gray-200 lg:border-none">
                    <Link locale={locale} href="/packing" className="text-gray-900">
                        {t("gifts")}
                    </Link>
                </li>

                {/* MOBILE ICON LINKS */}
                <div className="max-lg:mt-4 max-lg:flex max-lg:flex-col max-lg:gap-4 hidden">

                    <Link
                        locale={locale}
                        href="/cart"
                        className="flex items-center gap-3 text-gray-900 hover:text-gray-700 py-3 border-b border-t max-lg:border-gray-200"
                    >
                        <HiOutlineShoppingCart className="w-6 h-6" />
                        <span>{t("cart")}</span>
                    </Link>

                    <Link
                        locale={locale}
                        href="/customer/wishlist"
                        className="flex items-center gap-3 text-gray-900 hover:text-gray-700 py-3 border-b max-lg:border-gray-200"
                    >
                        <HiOutlineHeart className="w-6 h-6" />
                        <span>{t("wishlist")}</span>
                    </Link>

                    <Link
                        locale={locale}
                        href="/customer"
                        className="flex items-center gap-3 text-gray-900 hover:text-gray-700 py-3 border-b max-lg:border-gray-200"
                    >
                        <HiOutlineUser className="w-6 h-6" />
                        <span>{t("my_account")}</span>
                    </Link>

                </div>
            </ul>
        </nav>
    );
};

export default Navigation;
