"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useAppContext } from "@/components/context/AppContext";

export default function ProductCardWithVariants({ product }) {
  const { cart, setCart } = useAppContext();

  const { id, title, image, price, variants } = product;

  // LOCAL STATE
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // UNIQUE COLORS
  const colors = [...new Set(variants.map((v) => v.color))];

  // Filter available sizes based on selected color
  const filteredSizes = useMemo(() => {
    if (!selectedColor) return [...new Set(variants.map((v) => v.size))];

    return [
      ...new Set(
        variants
          .filter((v) => v.color === selectedColor && v.quantity > 0)
          .map((v) => v.size)
      ),
    ];
  }, [variants, selectedColor]);

  // Check stock for selected variant
  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [variants, selectedColor, selectedSize]);

  const inStock = selectedVariant ? selectedVariant.quantity > 0 : false;

  // ADD TO CART
  // ADD TO CART
    const addToCart = () => {
    if (!inStock) return;

    const variantId = `${id}-${selectedColor}-${selectedSize}`;
    const variant = variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
    );

    const maxQty = variant?.quantity ?? 0;

    const existing = cart.find((i) => i.variantId === variantId);

    if (existing) {
        // Prevent exceeding stock
        if (existing.qty < maxQty) {
        setCart(
            cart.map((i) =>
            i.variantId === variantId ? { ...i, qty: i.qty + 1 } : i
            )
        );
        }
    } else {
        setCart([
        ...cart,
        {
            ...product,
            qty: 1,
            maxQty,
            variantId,
            selectedColor,
            selectedSize,
        },
        ]);
    }
    };


  return (
    <div className="min-w-[240px] bg-white rounded-xl shadow hover:shadow-md transition p-4">

      {/* IMAGE */}
      <div className="relative w-full h-48 mb-3">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 240px"
          className="object-cover rounded-lg"
        />
      </div>

      {/* TITLE */}
      <h3 className="font-medium text-gray-800 text-sm mb-1">{title}</h3>

      {/* PRICE */}
      <p className="text-primary font-semibold mb-3">${price}</p>

      {/* COLOR SELECTOR */}
      {colors.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Color:</p>
          <div className="flex gap-2">
            {colors.map((colorValue) => {
              const isActive = colorValue === selectedColor;

              return (
                <button
                  key={colorValue}
                  onClick={() => {
                    setSelectedColor(colorValue);
                    setSelectedSize(null); // Reset size selection when color changes
                  }}
                  className={`w-6 h-6 rounded-full border ${
                    isActive ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: colorValue.toLowerCase() }}
                  title={colorValue}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* SIZE SELECTOR */}
      {filteredSizes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Size:</p>
          <div className="flex flex-wrap gap-2">
            {filteredSizes.map((sizeValue) => {
              const isActive = sizeValue === selectedSize;

              return (
                <button
                  key={sizeValue}
                  onClick={() => setSelectedSize(sizeValue)}
                  className={`px-3 py-1 text-xs rounded border ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {sizeValue}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD TO CART */}
      <button
        onClick={addToCart}
        disabled={
          !selectedColor || !selectedSize || !inStock
        }
        className={`
          flex items-center justify-center gap-2 w-full py-2 rounded-md font-medium transition
          ${
            selectedColor &&
            selectedSize &&
            inStock
              ? "bg-primary text-black hover:bg-primary-dark"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }
        `}
      >
        <HiOutlineShoppingBag className="w-5 h-5" />
        {inStock ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
}
