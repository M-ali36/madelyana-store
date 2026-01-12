"use client";

import Image from "next/image";
import { HiPlus, HiMinus } from "react-icons/hi2";
import { useTranslations } from "next-intl";
import ColorSwatch from "../ColorSwatch";

export default function CartItem({
  item,
  updateCartQty,
  removeFromCart,
  format,
}) {
  const t = useTranslations("cartItem");

  return (
    <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-300 last:border-0">

      {/* IMAGE */}
      <Image
        src={item.image}
        alt={item.title}
        width={72}
        height={72}
        className="rounded-lg"
      />

      {/* MIDDLE INFO */}
      <div className="flex-1 mx-4">
        <h3 className="text-sm font-semibold">{item.title}</h3>

        {/* Variants (color, size, etc) */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {Object.entries(item.selectedAttributes).map(([key, value]) => (
            key.toLowerCase() === "color" ? (
              <ColorSwatch key={key} label={value} />
            ) : (
              <span
                key={key}
                className="px-2 py-1 text-xs bg-gray-100 rounded-full border border-gray-300"
              >
                {key}: {value}
              </span>
            )
          ))}
        </div>

        <p className="text-base text-gray-500 mt-2">
          {format(item.price)}
        </p>

        <button
          onClick={() => removeFromCart(item.variantId)}
          className="text-xs text-red-500 underline cursor-pointer mt-1"
        >
          {t("remove")}
        </button>
      </div>

      {/* QTY CONTROLS */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-thin font-sans">{item.qty} ×</span>

        <div className="block">
          {/* PLUS */}
          <button
            disabled={item.qty >= item.maxQty}
            onClick={() =>
              item.qty < item.maxQty &&
              updateCartQty(item.variantId, item.qty + 1)
            }
            className={`
              w-8 h-8 mb-2 flex items-center justify-center rounded
              border border-neutral-900 bg-white text-neutral-900
              hover:bg-neutral-900 hover:text-white
              ${item.qty >= item.maxQty ? "opacity-40 cursor-not-allowed" : ""}
            `}
          >
            <HiPlus className="h-4 w-4" />
          </button>

          {/* MINUS */}
          <button
            onClick={() => item.qty > 1 && updateCartQty(item.variantId, item.qty - 1)}
            className="
              w-8 h-8 flex items-center justify-center rounded
              border border-neutral-900 bg-white text-neutral-900
              hover:bg-neutral-900 hover:text-white
            "
          >
            <HiMinus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
