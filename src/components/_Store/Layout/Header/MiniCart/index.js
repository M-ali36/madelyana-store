"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import useCurrency from "@/components/hooks/useCurrency";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import gsap from "gsap";

export default function MiniCart() {
  const { cart, setCart, navState, setNavState } = useAppContext();
  const { format } = useCurrency();
  const locale = useLocale();
  const t = useTranslations("MiniCart");
  const dir = locale === "ar" ? "rtl" : "ltr";

  // -----------------------------------------------------
  // HYDRATION
  // -----------------------------------------------------
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // -----------------------------------------------------
  // DESKTOP ONLY
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
  // CART LOGIC
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
  // DRAWER REFS
  // -----------------------------------------------------
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // -----------------------------------------------------
  // MEASURE DRAWER WIDTH ONCE (NO FORCED REFLOW DURING ANIM)
  // -----------------------------------------------------
  const [drawerWidth, setDrawerWidth] = useState(420);

  useEffect(() => {
    if (drawerRef.current) {
      setDrawerWidth(drawerRef.current.offsetWidth || 420);
    }
  }, [hydrated]);

  // -----------------------------------------------------
  // GSAP ANIMATION — SAFE + CLEAN + MATCHING ALL DRAWERS
  // -----------------------------------------------------
  useEffect(() => {
    if (!hydrated || !isDesktop) return;
    if (!drawerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      const drawer = drawerRef.current;
      const overlay = overlayRef.current;

      const offX = dir === "rtl" ? drawerWidth : -drawerWidth;

      if (isOpen) {
        gsap.to(overlay, {
          autoAlpha: 1,
          backdropFilter: "blur(6px)",
          duration: 0.3,
          ease: "power2.out",
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
  }, [isOpen, hydrated, isDesktop, drawerWidth, dir]);

  // -----------------------------------------------------
  // DO NOT RENDER UNTIL HYDRATED
  // -----------------------------------------------------
  if (!hydrated) return null;

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="relative hidden lg:block">
      {/* ICON */}
      <button className="relative control-btn" onClick={toggleCart} aria-label="My Cart">
        <HiOutlineShoppingBag className="w-6 h-6" />

        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-neutral-900 text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {cart.length}
          </span>
        )}
      </button>

      {/* DRAWER PORTAL */}
      {isDesktop &&
        createPortal(
          <>
            {/* OVERLAY */}
            <div
              ref={overlayRef}
              onClick={toggleCart}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm opacity-0 z-40"
              style={{ visibility: "hidden" }}
            />

            {/* DRAWER */}
            <div
              ref={drawerRef}
              className={`
                fixed top-0 h-full bg-white shadow-2xl z-50 p-4 overflow-y-auto
                ${dir === "rtl" ? "right-0" : "left-0"}
              `}
              style={{
                width: "420px",
                transform:
                  dir === "rtl"
                    ? `translateX(${drawerWidth}px)`
                    : `translateX(-${drawerWidth}px)`,
              }}
            >
              {/* HEADER */}
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-semibold">{t("yourCart")}</h2>
                <button onClick={toggleCart} className="text-gray-500 text-xl">
                  ✕
                </button>
              </div>

              {/* ITEMS */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
                {cart.length === 0 && (
                  <p className="text-gray-500 text-center">{t("empty")}</p>
                )}

                {cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-start gap-4 border-b pb-3"
                  >
                    <Image
                      src={item.image}
                      width={64}
                      height={64}
                      alt={item.title}
                      className="rounded-md"
                    />

                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.title}</h3>

                      {/* PRICE */}
                      <p className="text-gray-600 text-xs mt-1">
                        {format(item.price)} {t("perOne")}
                      </p>

                      {/* QTY */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="border px-2 rounded"
                          onClick={() => changeQty(item.variantId, -1)}
                        >
                          -
                        </button>

                        <span>{item.qty}</span>

                        <button
                          className={`border px-2 rounded ${
                            item.qty >= item.maxQty
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => {
                            if (item.qty < item.maxQty) {
                              changeQty(item.variantId, 1);
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="text-red-500 text-sm"
                      onClick={() => removeItem(item.variantId)}
                    >
                      {t("remove")}
                    </button>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              {cart.length > 0 && (
                <div className="p-4 border-t space-y-3">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold">{t("subtotal")}:</span>
                    <span className="font-semibold">{format(subtotal)}</span>
                  </div>

                  <Link
                    href="/cart"
                    locale={locale}
                    onClick={() => setNavState("")}
                    className="block w-full py-2 text-center bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    {t("viewCart")}
                  </Link>

                  <Link
                    href="/checkout"
                    locale={locale}
                    onClick={() => setNavState("")}
                    className="block w-full py-2 text-center bg-primary text-neutral-900 rounded-md hover:bg-primary-dark"
                  >
                    {t("checkout")}
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
