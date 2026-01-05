"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiOutlineHeart } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import gsap from "gsap";

export default function MiniWishlist() {
  const { wishlist, setWishlist, cart, setCart, navState, setNavState } =
    useAppContext();

  const locale = useLocale();
  const t = useTranslations("MiniWishlist");
  const dir = locale === "ar" ? "rtl" : "ltr";

  // ---------------------------
  // ALL HOOKS MUST BE AT THE TOP
  // ---------------------------

  const [hydrated, setHydrated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(420);

  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // Hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Desktop detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Measure drawer width ONCE
  useEffect(() => {
    if (drawerRef.current) {
      setDrawerWidth(drawerRef.current.offsetWidth || 420);
    }
  }, [hydrated]);

  // GSAP animation
  useEffect(() => {
    if (!hydrated || !isDesktop) return;
    if (!drawerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      const drawer = drawerRef.current;
      const overlay = overlayRef.current;

      const offX = dir === "rtl" ? drawerWidth : -drawerWidth;

      if (navState === "wishlist") {
        gsap.to(overlay, { autoAlpha: 1, duration: 0.3 });
        gsap.to(drawer, { x: 0, duration: 0.45 });
      } else {
        gsap.to(drawer, { x: offX, duration: 0.45 });
        gsap.to(overlay, { autoAlpha: 0, duration: 0.3 });
      }
    });

    return () => ctx.revert();
  }, [navState, hydrated, isDesktop, drawerWidth, dir]);

  // ---------------------------
  // NOW SAFE TO CONDITIONAL RENDER
  // ---------------------------
  if (!hydrated) return null;

  return (
    <div className="relative hidden lg:block">
      {/* HEART */}
      <button aria-label="My Wishlist" className="relative control-btn" onClick={() =>
        setNavState(navState === "wishlist" ? "" : "wishlist")
      }>
        <HiOutlineHeart className="w-6 h-6" />
        {wishlist.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-neutral-900 text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* DRAWER PORTAL */}
      {isDesktop &&
        createPortal(
          <>
            <div
              ref={overlayRef}
              onClick={() => setNavState("")}
              className="fixed inset-0 bg-black/30 opacity-0 pointer-events-auto z-40"
              style={{ visibility: "hidden" }}
            />

            <div
              ref={drawerRef}
              className={`
                fixed top-0 h-full bg-white shadow-2xl z-50 p-4
                ${dir === "rtl" ? "right-0" : "left-0"}
              `}
              style={{
                width: "420px",
                transform:
                  dir === "rtl"
                    ? `translateX(${drawerWidth}px)`
                    : `translateX(-${drawerWidth}px)`
              }}
            >
              {/* HEADER */}
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-semibold">{t("yourWishlist")}</h2>
                <button onClick={() => setNavState("")} className="text-gray-500 text-xl">
                  ✕
                </button>
              </div>

              {/* ITEMS */}
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {wishlist.length === 0 && (
                  <p className="text-gray-500 text-center">{t("empty")}</p>
                )}

                {wishlist.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-3">
                    <Image
                      src={item.image}
                      width={64}
                      height={64}
                      alt={item.title}
                      className="rounded-md"
                    />

                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-gray-600 text-xs mt-1">${item.price}</p>

                      <button
                        onClick={() => addToCart(item)}
                        className="mt-2 px-3 py-1 bg-primary text-neutral-900 rounded text-sm w-full"
                      >
                        {t("addToCart")}
                      </button>
                    </div>

                    <button
                      className="text-red-500 text-sm"
                      onClick={() => removeItem(item.id)}
                    >
                      {t("remove")}
                    </button>
                  </div>
                ))}
              </div>

              {wishlist.length > 0 && (
                <div className="p-4 border-t">
                  <Link
                    href="/customer/wishlist"
                    locale={locale}
                    onClick={() => setNavState("")}
                    className="block w-full py-2 text-center bg-gray-100 border border-gray-300 rounded-md"
                  >
                    {t("viewWishlist")}
                  </Link>
                </div>
              )}
            </div>
          </>,
          document.getElementById("ui-layer")
        )}
    </div>
  );
}
