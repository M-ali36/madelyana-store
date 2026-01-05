"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/Ui/Link";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { HiMenu, HiX } from "react-icons/hi";
import { createPortal } from "react-dom";
import Head from "next/head"; // ⭐ ADD THIS

export default function CustomerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("customerLayout");

  const dir = locale === "ar" ? "rtl" : "ltr";

  // -------------------------
  // AUTH / USER LOADING
  // -------------------------
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.replace("/login");

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserData(snap.data());

      setLoading(false);
    });
    return () => unsub();
  }, []);

  // -------------------------
  // HYDRATION READY
  // -------------------------
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // -------------------------
  // MOBILE DETECTOR (SSR safe)
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

  // -------------------------
  // DRAWER STATE + REFS
  // -------------------------
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  const toggleDrawer = () => setIsOpen((v) => !v);

  // -------------------------
  // INITIAL POSITION
  // -------------------------
  useEffect(() => {
    if (!hydrated || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const width = drawer.offsetWidth || 420;
    const fromX = dir === "rtl" ? width : -width;

    gsap.set(drawer, { x: fromX });
  }, [hydrated, dir]);

  // -------------------------
  // OPEN / CLOSE ANIMATION
  // -------------------------
  useEffect(() => {
    if (!hydrated) return;
    if (!drawerRef.current || !overlayRef.current) return;

    const drawer = drawerRef.current;
    const overlay = overlayRef.current;
    const width = drawer.offsetWidth || 420;
    const fromX = dir === "rtl" ? width : -width;

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
        x: fromX,
        duration: 0.45,
        ease: "power3.inOut",
      });

      gsap.to(overlay, {
        autoAlpha: 0,
        backdropFilter: "blur(0px)",
        duration: 0.3,
      });
    }
  }, [isOpen, hydrated, dir]);

  // -------------------------
  // LOADING SCREEN
  // -------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        {t("loading")}
      </div>
    );
  }

  // -------------------------
  // NAV ITEMS
  // -------------------------
  const navItems = [
    { label: t("dashboard"), href: "/customer" },
    { label: t("orders"), href: "/customer/orders" },
    { label: t("wishlist"), href: "/customer/wishlist" },
    { label: t("settings"), href: "/customer/settings" },
    { label: t("address"), href: "/customer/address" },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    document.cookie = "firebase_id_token=; path=/; max-age=0;";
    document.cookie = "auth_role=; path=/; max-age=0;";
    localStorage.clear();
    sessionStorage.clear();
    router.replace(`${locale === "ar" ? '/ar' : ''}/login`);
  };

  const uiLayer =
    typeof document !== "undefined"
      ? document.getElementById("ui-layer")
      : null;

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <>
      <Head>
          <title>{t("dashboard")}</title>
      </Head>
      <div className="lg:flex min-h-screen bg-gray-100 pt-12 lg:pt-0">
        {/* ⭐ MOBILE MENU BUTTON */}
        <div className="lg:hidden w-full p-4">
          <button
            onClick={toggleDrawer}
            className="w-full flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          >
            <HiMenu className="w-5 h-5" />
            <span className="font-medium">{t("accountMenu")}</span>
          </button>
        </div>

        {/* ⭐ DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-gray-200 p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold">
              {t("hello")}, {userData?.fullName}
            </h2>
            <p className="text-sm text-gray-500">{userData?.email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition
                    ${
                      active
                        ? "bg-neutral-900 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            {t("logout")}
          </button>
        </aside>

        {/* ⭐ MOBILE DRAWER */}
        {hydrated &&
          isMobile &&
          uiLayer &&
          createPortal(
            <>
              {/* Overlay */}
              <div
                ref={overlayRef}
                onClick={toggleDrawer}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm opacity-0 z-[999]"
                style={{ visibility: "hidden" }}
              />

              {/* Drawer */}
              <div
                ref={drawerRef}
                className={`fixed top-0 h-full bg-white shadow-2xl z-[9999] p-6 overflow-y-auto
                  ${dir === "rtl" ? "right-0" : "left-0"}`}
                style={{
                  width: "420px",
                  minWidth: "420px",
                  maxWidth: "420px",
                  transform:
                    isOpen || !hydrated
                      ? undefined
                      : dir === "rtl"
                      ? "translateX(420px)"
                      : "translateX(-420px)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">{t("accountMenu")}</h2>
                  <button onClick={toggleDrawer} className="text-gray-600 text-xl">
                    <HiX />
                  </button>
                </div>

                {/* User Info */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">{userData?.fullName}</h2>
                  <p className="text-sm text-gray-500">{userData?.email}</p>
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        locale={locale}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition
                          ${
                            active
                              ? "bg-neutral-900 text-white"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  {t("logout")}
                </button>
              </div>
            </>,
            uiLayer
          )}

        {/* MAIN CONTENT */}
        <main className="flex-1 py-8 px-4">{children}</main>
      </div>
    </>
  );
}
