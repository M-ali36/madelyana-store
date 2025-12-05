"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/components/context/AppContext";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";

import ProductCardImage from "./ProductCard/ProductCardImage";
import ProductAttributeSelector from "./ProductCard/ProductAttributeSelector";
import ProductWishlistButton from "./ProductCard/ProductWishlistButton";
import ProductAddToCartButton from "./ProductCard/ProductAddToCartButton";
import { useProductVariantEngine } from "./ProductCard/useProductVariantEngine";
import useCurrency from "@/components/hooks/useCurrency";

export default function ProductCardWithVariants({ product }) {
  // -----------------------------------------
  // 1️⃣ Local merged product state
  // -----------------------------------------
  const [mergedProduct, setMergedProduct] = useState(product);
  const [loading, setLoading] = useState(true);

  const { wishlist, setWishlist, cart, setCart } = useAppContext();
  const { format } = useCurrency();

  // -----------------------------------------
  // 2️⃣ Fetch Firebase dynamic data
  // -----------------------------------------
  useEffect(() => {
    async function loadFirebaseDynamic() {
      try {
        const q = query(
          collection(db, "products_dynamic"),
          where("contentfulSlug", "==", product.slug)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const dynamicData = snap.docs[0].data();

          setMergedProduct((prev) => ({
            ...prev,
            price: Number(dynamicData.price) || prev.price || 0,
            variants: dynamicData.variants || [],
          }));
        } else {
          // fallback if no dynamic entry
          setMergedProduct((prev) => ({
            ...prev,
            price: prev.price || 0,
            variants: prev.variants || [],
          }));
        }
      } catch (e) {
        console.error("Firebase product load error:", e);
        setMergedProduct(product);
      }

      setLoading(false);
    }

    loadFirebaseDynamic();
  }, [product]);

  // -----------------------------------------
  // 3️⃣ Handle wishlist state
  // -----------------------------------------
  const isInWishlist = wishlist.some((w) => w.id === mergedProduct.id);

  const toggleWishlist = () => {
    if (isInWishlist) {
      setWishlist(wishlist.filter((w) => w.id !== mergedProduct.id));
    } else {
      setWishlist([
        ...wishlist,
        {
          id: mergedProduct.id,
          title: mergedProduct.title,
          image: mergedProduct.images[0]?.url,
          price: mergedProduct.price,
          slug: mergedProduct.slug,
        },
      ]);
    }
  };

  // -----------------------------------------
  // 4️⃣ Variant Engine (now using merged product)
  // -----------------------------------------
  const {
    hasVariants,
    variants,
    attributeKeys,
    attributeOptions,
    selected,
    setSelected,
    selectedVariant,
    variantStock,
    canAddToCart,
  } = useProductVariantEngine(mergedProduct);

  // -----------------------------------------
  // 5️⃣ Get Selected Image (same logic as before)
  // -----------------------------------------
  const getSelectedImageFromCard = () => {
    const imgs = mergedProduct.images || [];

    const mainImage =
      imgs.find((i) => i.tag === "imageMain")?.url ||
      imgs[0]?.url ||
      "/placeholder.webp";

    const colorKey = Object.keys(selected).find(
      (key) => key.toLowerCase() === "color"
    );

    const selectedColor = colorKey ? selected[colorKey] : null;

    const colorImage =
      selectedColor &&
      imgs.find(
        (i) =>
          i.tag?.toLowerCase() ===
          `image${selectedColor.toLowerCase()}`
      )?.url;

    return colorImage || mainImage;
  };

  // -----------------------------------------
  // 6️⃣ ADD TO CART (unchanged except using mergedProduct)
  // -----------------------------------------
  const addToCart = () => {
    if (!canAddToCart) return;

    const selectedImage = getSelectedImageFromCard();

    // SIMPLE PRODUCTS
    if (!hasVariants) {
      const variantId = `${mergedProduct.id}-default`;

      const existing = cart.find((i) => i.variantId === variantId);

      if (existing) {
        setCart(
          cart.map((i) =>
            i.variantId === variantId ? { ...i, qty: i.qty + 1 } : i
          )
        );
        return;
      }

      setCart([
        ...cart,
        {
          ...mergedProduct,
          image: selectedImage,
          qty: 1,
          maxQty: 99,
          variantId,
          selectedAttributes: {},
        },
      ]);

      return;
    }

    // VARIANT PRODUCTS
    const variantId =
      mergedProduct.id +
      "-" +
      attributeKeys.map((k) => selected[k]).join("-");

    const existing = cart.find((i) => i.variantId === variantId);

    if (existing) {
      if (existing.qty < variantStock) {
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
          ...mergedProduct,
          image: selectedImage,
          qty: 1,
          maxQty: variantStock,
          selectedAttributes: { ...selected },
          variantId,
        },
      ]);
    }
  };

  // -----------------------------------------
  // 7️⃣ UI Rendering
  // -----------------------------------------
  if (loading) return null; // or show skeleton by prop

  return (
    <div className="min-w-[240px] bg-white rounded-xl shadow hover:shadow-md transition p-4">

      {/* Image */}
      <ProductCardImage images={mergedProduct.images} selected={selected} />

      {/* Title */}
      <h3 className="font-medium text-gray-800 text-sm mb-1">
        {mergedProduct.title}
      </h3>

      {/* Price */}
      <p className="text-primary font-semibold mb-3">
        {format(mergedProduct.price)}
      </p>

      {/* Wishlist */}
      <ProductWishlistButton
        isInWishlist={isInWishlist}
        toggleWishlist={toggleWishlist}
      />

      {/* Variants */}
      {hasVariants && (
        <ProductAttributeSelector
          attributeKeys={attributeKeys}
          attributeOptions={attributeOptions}
          selected={selected}
          setSelected={setSelected}
        />
      )}

      {/* Add to Cart */}
      <ProductAddToCartButton
        canAddToCart={canAddToCart}
        hasVariants={hasVariants}
        allAttributesSelected={attributeKeys.every((k) => selected[k])}
        variantStock={variantStock}
        addToCart={addToCart}
      />
    </div>
  );
}
