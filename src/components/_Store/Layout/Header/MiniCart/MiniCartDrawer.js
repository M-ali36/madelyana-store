"use client";

import { useAppContext } from "@/components/context/AppContext";
import Image from "next/image";
import Link from "@/components/Ui/Link";
import useCurrency from "@/components/hooks/useCurrency";
import { useLocale, useTranslations } from "next-intl";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { HiX } from "react-icons/hi";

export default function MiniCartDrawer() {
  const { cart, setCart, navState, setNavState } = useAppContext();
  const { format } = useCurrency();
  const locale = useLocale();
  const t = useTranslations("MiniCart");
  const dir = locale === "ar" ? "rtl" : "ltr";

  const isOpen = navState === "cart";
  const close = () => setNavState("");

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

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      ></div>

      {/* DRAWER */}
      <div
        className={`
          fixed top-0 h-full bg-white z-50 shadow-xl pt-4 pb-4 transition-transform duration-300
          w-[420px] start-0
          ${isOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-base font-semibold">{t("yourCart")}</h2>

            <button
              onClick={close}
              className="text-xl text-white h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center"
            >
              <HiX className="h-3 w-3" />
            </button>
          </div>

          {/* ITEMS */}
          <div className="space-y-6 overflow-y-auto flex-1 p-6 border-y border-slate-300">
            {cart.length === 0 && (
              <p className="text-gray-500 text-center">{t("empty")}</p>
            )}

            {cart.map((item) => (
              <div
                key={item.variantId}
                className="flex items-center justify-between pb-5 border-b border-slate-300 last:border-0"
              >
                {/* Image */}
                <Image
                  src={item.image}
                  width={72}
                  height={72}
                  alt={item.title}
                  className="rounded-lg"
                />

                {/* Info */}
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
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl me-2 font-thin">{item.qty} ×</span>
                  <div>
                    <button
                      disabled={item.qty >= item.maxQty}
                      onClick={() => item.qty < item.maxQty && changeQty(item.variantId, 1)}
                      className="w-8 h-8 mb-2 flex items-center justify-center rounded border border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40"
                    >
                      <HiPlus />
                    </button>

                    <button
                      onClick={() => changeQty(item.variantId, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white"
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
                <span className="text-lg font-semibold">{format(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                locale={locale}
                onClick={close}
                className="block w-full text-center py-3 rounded-full border border-neutral-900 bg-neutral-900 text-white font-semibold hover:bg-neutral-700 transition mb-4"
              >
                {t("checkout")}
              </Link>

              <Link
                href="/cart"
                locale={locale}
                onClick={close}
                className="block w-full text-center py-3 rounded-full border border-neutral-900 bg-white text-neutral-900 font-semibold hover:text-neutral-700 transition"
              >
                {t("viewCart")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
