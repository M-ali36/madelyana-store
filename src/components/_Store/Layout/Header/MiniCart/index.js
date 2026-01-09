"use client";

import { useEffect, useRef, useState } from "react";
import { IoBagHandleOutline, IoBagHandle } from "react-icons/io5";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import useCurrency from "@/components/hooks/useCurrency";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { HiX } from "react-icons/hi";

export default function MiniCart() {
  const { cart, setCart, navState, setNavState } = useAppContext();
  const { format } = useCurrency();
  const locale = useLocale();
  const t = useTranslations("MiniCart");
  const dir = locale === "ar" ? "rtl" : "ltr";

  // -----------------------------------------------------
  // Hydration
  // -----------------------------------------------------
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // -----------------------------------------------------
  // Desktop only
  // -----------------------------------------------------
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isOpen = navState === "cart";
  const toggleCart = () => setNavState(isOpen ? "" : "cart");

  // -----------------------------------------------------
  // Cart Logic
  // -----------------------------------------------------
  const removeItem = (variantId) => {
    setCart(cart.filter((item) => item.variantId !== variantId));
  };

  const changeQty = (variantId, value) => {
    setCart(
      cart.map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              qty: Math.max(1, Math.min(item.qty + value, item.maxQty)),
            }
          : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // -----------------------------------------------------
  // Drawer Refs
  // -----------------------------------------------------
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  const [drawerWidth, setDrawerWidth] = useState(420);

  useEffect(() => {
    if (drawerRef.current) {
      setDrawerWidth(drawerRef.current.offsetWidth || 420);
    }
  }, [hydrated]);

  // -----------------------------------------------------
  // GSAP drawer animation
  // -----------------------------------------------------
  useEffect(() => {
    if (!hydrated || !isDesktop) return;

    const ctx = gsap.context(() => {
      const drawer = drawerRef.current;
      const overlay = overlayRef.current;

      const offX = dir === "rtl" ? drawerWidth : -drawerWidth;

      if (isOpen) {
        gsap.to(overlay, {
          autoAlpha: 1,
          backdropFilter: "blur(8px)",
          duration: 0.35,
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
          ease: "power2.inOut",
        });

        gsap.to(overlay, {
          autoAlpha: 0,
          backdropFilter: "blur(0px)",
          duration: 0.3,
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen, hydrated, isDesktop, drawerWidth, dir]);

  if (!hydrated) return null;

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="relative hidden lg:block">
      {/* ICON */}
      <button
        className="header-control icons-hover primary-anime relative"
        onClick={toggleCart}
      >
        {cart.length > 0 ? (
          <>
          <IoBagHandle className="w-5 h-5 fill-emerald-500" />
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          </>
        ) : (
          <IoBagHandleOutline className="w-5 h-5" />
        )}
      </button>

      {/* PORTAL */}
      {isDesktop &&
        createPortal(
          <>
            <div
              ref={overlayRef}
              onClick={toggleCart}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm opacity-0 z-40"
              style={{ visibility: "hidden" }}
            />

            {/* DRAWER — minimal, flat style */}
            <div
              ref={drawerRef}
              className={`
                fixed top-0 h-full bg-white z-50
                ${dir === "rtl" ? "right-0" : "left-0"}
                 pt-4 pb-4 shadow-xl
              `}
              style={{
                width: "420px",
                transform:
                  dir === "rtl"
                    ? `translateX(${drawerWidth}px)`
                    : `translateX(-${drawerWidth}px)`,
              }}
            >
              <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4 px-4">
                  <h2 className="text-base font-semibold">{t("yourCart")}</h2>
                  <button onClick={toggleCart} className="text-xl text-white h-6 w-6 rounded-full bg-neutral-900 cursor-pointer flex items-center justify-center">
                    <HiX className="h-3 w-3"/>
                  </button>
                </div>

                {/* ITEM LIST */}
                <div className="space-y-6 overflow-y-auto flex-1 p-6 border-y border-slate-300">
                  {cart.length === 0 && (
                    <p className="text-gray-500 text-center">{t("empty")}</p>
                  )}

                  {cart.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex items-center justify-between pb-5 border-b border-slate-300 last:border-0"
                    >
                      {/* LEFT: Image */}
                      <Image
                        src={item.image}
                        width={72}
                        height={72}
                        alt={item.title}
                        className="rounded-lg"
                      />

                      {/* MIDDLE */}
                      <div className="flex-1 mx-4">
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <p className="text-base text-gray-500 mt-1">
                          {format(item.price)}
                        </p>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs text-red-500 underline cursor-pointer"
                        >
                          {t("remove")}
                        </button>

                        {/* QTY */}
                      </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-3xl me-2 font-sans font-thin">{item.qty} ×</span>
                          <div className="block">
                            <button
                              disabled={item.qty >= item.maxQty}
                              onClick={() =>
                                item.qty < item.maxQty &&
                                changeQty(item.variantId, 1)
                              }
                              className={`w-8 h-8 mb-2 flex items-center justify-center rounded cursor-pointer border border-neutral-900 bg-white text-neutral-900 hover:text-white hover:bg-neutral-900 
                                ${
                                  item.qty >= item.maxQty
                                    ? "cursor-not-allowed"
                                    : ""
                                }
                              `}
                            >
                              <HiPlus />
                            </button>
                            <button
                              onClick={() => changeQty(item.variantId, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded cursor-pointer border border-neutral-900 bg-white text-neutral-900 hover:text-white hover:bg-neutral-900"
                            >
                              <HiMinus />
                            </button>

                          </div>
                        </div>
                      
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                {cart.length > 0 && (
                  <div className="px-4 mt-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-500">{t("subtotal")}</span>
                      <span className="text-lg font-semibold">
                        {format(subtotal)}
                      </span>
                    </div>

                    <Link
                      href="/checkout"
                      locale={locale}
                      onClick={() => setNavState("")}
                      className="
                        block w-full text-center py-3 rounded-full border border-neutral-900
                        bg-neutral-900 text-white font-semibold hover:bg-neutral-700
                        transition mb-4
                      "
                    >
                      {t("checkout")}
                    </Link>
                    <Link
                      href="/cart"
                      locale={locale}
                      onClick={() => setNavState("")}
                      className="
                        block w-full text-center py-3 rounded-full  border border-neutral-900
                        bg-white text-neutral-900 font-semibold hover:text-neutral-700
                        transition
                      "
                    >
                      {t("viewCart")}
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
