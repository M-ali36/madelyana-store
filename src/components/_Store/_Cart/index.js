"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppContext } from "@/components/context/AppContext";
import useCurrency from "@/components/hooks/useCurrency";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";

import ProductCarouselBySlugs from "@/components/products/ProductCarouselBySlugs";

import { fetchUpsellProducts } from "@/lib/contentfulClient"; 
// Keep this — we still fetch slugs here.

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart } = useAppContext();
  const { format } = useCurrency();

  const [upsellSlugs, setUpsellSlugs] = useState([]);

  // ---------------------------------------------------------
  // SUBTOTAL
  // ---------------------------------------------------------
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cart]);

  // ---------------------------------------------------------
  // LOAD UPSELL PRODUCT SLUGS BASED ON CART ITEMS
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadUpsells() {
      if (!cart.length) {
        setUpsellSlugs([]);
        return;
      }

      const cartSlugs = cart.map((item) => item.slug);

      try {
        // fetchUpsellProducts returns actual product entries
        // but we only need the SLUGS for ProductCarouselBySlugs
        const upsellItems = await fetchUpsellProducts(cartSlugs);

        const slugs = upsellItems.map((p) => p.slug);

        setUpsellSlugs(slugs);
      } catch (err) {
        console.error("Upsell fetch error:", err);
      }
    }

    loadUpsells();
  }, [cart]);

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CART ITEMS */}
            {cart.map((item) => (
              <CartItem
                key={item.variantId}
                item={item}
                updateCartQty={updateCartQty}
                removeFromCart={removeFromCart}
                format={format}
              />
            ))}

            {/* UPSELL CAROUSEL */}
            {upsellSlugs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">You may also like</h2>
                <ProductCarouselBySlugs slugs={upsellSlugs} />
              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <CartSummary subtotal={subtotal} format={format} />
        </div>
      )}
    </div>
  );
}
