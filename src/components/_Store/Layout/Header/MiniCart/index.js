"use client";

import React from "react";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import useCurrency from "@/components/hooks/useCurrency";
import { useLocale, useTranslations } from "next-intl";

export default function MiniCart() {
  const { cart, setCart, navState, setNavState } = useAppContext();
  const { format } = useCurrency();
  const locale = useLocale();
  const t = useTranslations("MiniCart");

  const toggleCart = () => {
    setNavState(navState === "cart" ? "" : "cart");
  };

  const removeItem = (variantId) => {
    setCart(cart.filter((item) => item.variantId !== variantId));
  };

  const changeQty = (variantId, value) => {
    setCart(
      cart.map((item) =>
        item.variantId === variantId
          ? { ...item, qty: Math.max(1, Math.min(item.qty + value, item.maxQty)) }
          : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="relative">
      {/* CART ICON */}
      <button className="relative control-btn" type="button" onClick={toggleCart}>
        <HiOutlineShoppingBag className="w-6 h-6" />

        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-neutral-900 text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {cart.length}
          </span>
        )}
      </button>

      {/* PANEL */}
      <div
        className={`control-menu ${
          navState === "cart" ? "opened" : ""
        } fixed top-0 w-80 bg-white shadow-xl h-full z-50 transition-all ${
          navState === "cart" ? "end-0" : "-end-80"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">{t("yourCart")}</h2>
          <button onClick={toggleCart} className="text-gray-500">
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
                {/* TITLE */}
                <h3 className="text-sm font-medium">{item.title}</h3>

                {/* VARIANT ATTRIBUTES */}
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  {Object.entries(item.selectedAttributes || {}).map(
                    ([key, value]) => {
                      if (!value) return null;

                      const isColor =
                        key.toLowerCase() === "color" ||
                        key.toLowerCase() === "colour";

                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="capitalize">{key}:</span>

                          {isColor ? (
                            <>
                              <span
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor: value.toLowerCase(),
                                }}
                              />
                              <span className="capitalize">{value}</span>
                            </>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 rounded border text-gray-800 capitalize">
                              {value}
                            </span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>

                {/* PRICE */}
                <p className="text-gray-600 text-xs mt-1">
                  {format(item.price)} {t("perOne")}
                </p>

                {/* QUANTITY */}
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
                    onClick={() =>
                      item.qty < item.maxQty &&
                      changeQty(item.variantId, 1)
                    }
                    disabled={item.qty >= item.maxQty}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* REMOVE */}
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
            {/* SUBTOTAL */}
            <div className="flex justify-between mb-3">
              <span className="font-semibold">{t("subtotal")}:</span>
              <span className="font-semibold">{format(subtotal.toFixed(2))}</span>
            </div>

            {/* VIEW CART BUTTON */}
            <Link
              href="/cart"
              locale={locale}
              onClick={() => setNavState("")}
              className="block w-full py-2 text-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition"
            >
              {t("viewCart")}
            </Link>

            {/* CHECKOUT */}
            <Link
              href="/checkout"
              locale={locale}
              onClick={() => setNavState("")}
              className="block w-full py-2 text-center bg-primary text-neutral-900 rounded-md font-medium hover:bg-primary-dark transition"
            >
              {t("checkout")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
