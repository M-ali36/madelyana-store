"use client";
import React from "react";
import { HiOutlineHeart } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "next/link";

export default function MiniWishlist() {
  const { wishlist, setWishlist, cart, setCart, navState, setNavState } =
    useAppContext();

  // Toggle mini wishlist panel
  const toggleWishlist = () => {
    setNavState(navState === "wishlist" ? "" : "wishlist");
  };

  /** REMOVE WISHLIST ITEM (by variantless slug or id)
      wishlist items do NOT include variantId 
  */
  const removeItem = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  /** ADD TO CART (requires a default or selected variant)
      For wishlist, we add product WITHOUT variant selection.
      The productPage handles variant choice.
      So: redirect to product page OR add “base cart item”
  */
  const addToCart = (item) => {
    // If product has variants, redirect user to product page
    if (item.hasVariants) {
      window.location.href = `/product/${item.slug}`;
      return;
    }

    // If no variants → add simple product to cart
    const existing = cart.find((c) => c.id === item.id);

    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id
            ? {
                ...c,
                qty: Math.min(c.qty + 1, c.maxQty || 99),
              }
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
          variantId: item.id, // simple fallback
        },
      ]);
    }

    // Close menu
    setNavState("");
  };

  return (
    <div className="relative">
      {/* WISHLIST ICON */}
      <button
        className="relative control-btn"
        type="button"
        onClick={toggleWishlist}
      >
        <HiOutlineHeart className="w-6 h-6" />

        {wishlist.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-black text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* SLIDE PANEL */}
      <div
        className={`control-menu ${
          navState === "wishlist" ? "opened" : ""
        } fixed top-0 right-0 w-80 bg-white shadow-xl h-full z-50 transition-transform transform ${
          navState === "wishlist" ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">Your Wishlist</h2>
          <button onClick={toggleWishlist} className="text-gray-500">
            ✕
          </button>
        </div>

        {/* ITEMS */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {wishlist.length === 0 && (
            <p className="text-gray-500 text-center">
              Your wishlist is empty.
            </p>
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
                  className="mt-2 px-3 py-1 bg-primary text-black rounded text-sm w-full"
                >
                  Add to Cart
                </button>
              </div>

              {/* REMOVE */}
              <button
                className="text-red-500 text-sm"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <Link
              href="/customer/wishlist"
              onClick={() => setNavState("")}
              className="block w-full py-2 text-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition"
            >
              View Wishlist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
