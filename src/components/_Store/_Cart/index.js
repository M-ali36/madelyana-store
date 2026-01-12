"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/components/context/AppContext";
import useCurrency from "@/components/hooks/useCurrency";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import ProductCarouselBySlugs from "@/components/products/ProductCarouselBySlugs";

import { fetchUpsellProducts } from "@/lib/contentfulClient";
import { useTranslations } from "next-intl";

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart } = useAppContext();
  const { format } = useCurrency();

  const t = useTranslations(); // <-- Add translations hook

  const [upsellSlugs, setUpsellSlugs] = useState([]);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );

  useEffect(() => {
    async function loadUpsells() {
      if (!cart.length) {
        setUpsellSlugs([]);
        return;
      }

      const cartSlugs = cart.map((item) => item.slug);

      try {
        const upsellItems = await fetchUpsellProducts(cartSlugs);
        const slugs = upsellItems.map((p) => p.slug);
        setUpsellSlugs(slugs);
      } catch (err) {
        console.error("Upsell fetch error:", err);
      }
    }

    loadUpsells();
  }, [cart]);

  return (
    <div className="px-4 py-6 lg:py-12 lg:px-8 max-w-7xl container mx-auto">
      <h1 className="text-3xl font-bold text-center mb-16">
        {t("cartPage.yourCart")}
      </h1>


      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-8">
                {t("cartPage.yourCart")}
              </h3>
              {cart.map((item) => (
                <CartItem
                  key={item.variantId}
                  item={item}
                  updateCartQty={updateCartQty}
                  removeFromCart={removeFromCart}
                  format={format}
                />
              ))}
            </div>

            {upsellSlugs.length > 0 && (
              <div className="mt-8">
                <ProductCarouselBySlugs slugs={upsellSlugs} max={3} title={t("cartPage.youMayAlsoLike")}/>
              </div>
            )}
          </div>

          <CartSummary subtotal={subtotal} format={format} />
        </div>
      )}
    </div>
  );
}
