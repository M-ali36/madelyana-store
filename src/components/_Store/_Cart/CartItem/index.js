"use client";

import Image from "next/image";
import ColorSwatch from "../ColorSwatch";

export default function CartItem({
  item,
  updateCartQty,
  removeFromCart,
  format,
}) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Image */}
      <div className="relative w-28 h-28 rounded-md overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <h2 className="font-semibold text-lg">{item.title}</h2>

          {/* Dynamic attributes */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {Object.entries(item.selectedAttributes).map(([key, value]) => (
              <div key={key}>
                {key.toLowerCase() === "color" ? (
                  <ColorSwatch label={value} />
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full border">
                    {key}: {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price + Qty + Remove */}
        <div className="flex items-center justify-between mt-4">

          <span className="font-bold">{format(item.price * item.qty)}</span>

          <div className="flex items-center gap-3">
            {/* Quantity */}
            <select
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              value={item.qty}
              onChange={(e) =>
                updateCartQty(item.variantId, Number(e.target.value))
              }
            >
              {Array.from({ length: item.maxQty }, (_, i) => i + 1).map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>

            {/* Remove */}
            <button
              onClick={() => removeFromCart(item.variantId)}
              className="text-gray-500 hover:text-red-600 transition"
            >
              ✕
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
