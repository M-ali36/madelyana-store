"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppContext } from "@/components/context/AppContext";
import useCurrency from "@/components/hooks/useCurrency";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import UpsellProducts from "./UpsellProducts";

import {
  fetchContentfulProductBySlug,
  fetchUpsellProducts
} from "@/lib/contentfulClient"; 
// ^ Adjust this to your actual file path if needed.

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart } = useAppContext();
  const { format } = useCurrency();

  const [upsell, setUpsell] = useState([]);

  // ---------------------------------------------------------
  // SUBTOTAL
  // ---------------------------------------------------------
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cart]);

  // ---------------------------------------------------------
  // LOAD UPSELL PRODUCTS BASED ON CART ITEMS
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadUpsells() {
      if (!cart.length) {
        setUpsell([]);
        return;
      }

      const slugs = cart.map((item) => item.slug);

      try {
        const upsells = await fetchUpsellProducts(slugs);
        setUpsell(upsells);
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
    <div className="px-4 py-6 md:px-8 max-w-5xl mx-auto">
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

            {/* UPSELL PRODUCTS */}
            {upsell.length > 0 && (
              <UpsellProducts products={upsell} />
            )}

          </div>

          {/* RIGHT COLUMN */}
          <CartSummary subtotal={subtotal} format={format} />
        </div>
      )}
    </div>
  );
}
