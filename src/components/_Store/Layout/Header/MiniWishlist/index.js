"use client";

import React from "react";
import { HiOutlineHeart } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

export default function MiniWishlist() {
  const { wishlist, setWishlist, cart, setCart, navState, setNavState } =
    useAppContext();

  const locale = useLocale();
  const t = useTranslations("MiniWishlist");

  // Toggle mini wishlist panel
  const toggleWishlist = () => {
    setNavState(navState === "wishlist" ? "" : "wishlist");
  };

  // Remove wishlist item
  const removeItem = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  // Add item to cart
  const addToCart = (item) => {
    if (item.hasVariants) {
      window.location.href = `/product/${item.slug}`;
      return;
    }

    const existing = cart.find((c) => c.id === item.id);

    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id
            ? { ...c, qty: Math.min(c.qty + 1, c.maxQty || 99) }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          title: item.title,
          price: item.price,
          qty: 1,
          maxQty: item.maxQty || 99,
          image: item.image,
          selectedColor: null,
          selectedSize: null,
          variantId: item.id
        }
      ]);
    }

    setNavState("");
  };

  return (
    <div className="relative">
      {/* ICON */}
      <button
        className="relative control-btn"
        type="button"
        onClick={toggleWishlist}
      >
        <HiOutlineHeart className="w-6 h-6" />

        {wishlist.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-neutral-900 text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* PANEL */}
      <div
        className={`control-menu ${
          navState === "wishlist" ? "opened" : ""
        } fixed top-0 w-80 bg-white shadow-xl h-full z-50 transition-all ${
          navState === "wishlist" ? "end-0" : "-end-80"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">{t("yourWishlist")}</h2>
          <button onClick={toggleWishlist} className="text-gray-500">
            ✕
          </button>
        </div>

        {/* ITEMS */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {wishlist.length === 0 && (
            <p className="text-gray-500 text-center">{t("empty")}</p>
          )}

          {wishlist.map((item) => (
            <div key={item.id} className="flex items-start gap-4 border-b pb-3">
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

                {/* PRICE */}
                <p className="text-gray-600 text-xs mt-1">${item.price}</p>

                {/* ADD TO CART */}
                <button
                  onClick={() => addToCart(item)}
                  className="mt-2 px-3 py-1 bg-primary text-neutral-900 rounded text-sm w-full"
                >
                  {t("addToCart")}
                </button>
              </div>

              {/* REMOVE */}
              <button
                className="text-red-500 text-sm"
                onClick={() => removeItem(item.id)}
              >
                {t("remove")}
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <Link
              href="/customer/wishlist"
              locale={locale}
              onClick={() => setNavState("")}
              className="block w-full py-2 text-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition"
            >
              {t("viewWishlist")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
