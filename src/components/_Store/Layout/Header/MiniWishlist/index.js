"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiHeart, HiOutlineHeart, HiX } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import gsap from "gsap";

export default function MiniWishlist() {
  const { wishlist, setWishlist, pushNotification, navState, setNavState } =
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

  const removeItem = (itemId) => {
    setWishlist((prevWishlist) =>
      prevWishlist.filter((item) => item.id !== itemId)
    );

  };


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
      <button aria-label="My Wishlist" className="header-control icons-hover primary-anime" onClick={() =>
        setNavState(navState === "wishlist" ? "" : "wishlist")
      }>
        
        {wishlist.length > 0 ?
          <HiHeart className="w-5 h-5 fill-rose-500"/>
          :
          <HiOutlineHeart className="w-5 h-5" />
        }
      </button>

      {/* DRAWER PORTAL */}
      {isDesktop &&
        createPortal(
          <>
            <div
              ref={overlayRef}
              onClick={() => setNavState("")}
              className="fixed inset-0 backdrop-blur-sm bg-black/30 opacity-0 pointer-events-auto z-40"
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
              <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4 px-4">
                  <h2 className="text-base font-semibold">{t("yourWishlist")}</h2>
                  <button onClick={() => setNavState("")} className="text-xl text-white h-6 w-6 rounded-full bg-neutral-900 cursor-pointer flex items-center justify-center">
                    <HiX className="h-3 w-3"/>
                  </button>
                </div>

                {/* ITEMS */}
                <div className="space-y-4 overflow-y-auto flex-1 p-6 border-y border-slate-300">
                  {wishlist.length === 0 && (
                    <p className="text-gray-500 text-center">{t("empty")}</p>
                  )}

                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between pb-5 border-b border-slate-300 last:border-0">
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
                  <div className="p-4">
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
            </div>
          </>,
          document.getElementById("ui-layer")
        )}
    </div>
  );
}
