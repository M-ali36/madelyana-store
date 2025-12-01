"use client";

import { useAppContext } from "@/components/context/AppContext";
import ProductCardImage from "./ProductCard/ProductCardImage";
import ProductAttributeSelector from "./ProductCard/ProductAttributeSelector";
import ProductWishlistButton from "./ProductCard/ProductWishlistButton";
import ProductAddToCartButton from "./ProductCard/ProductAddToCartButton";
import { useProductVariantEngine } from "./ProductCard/useProductVariantEngine";
import useCurrency from "@/components/hooks/useCurrency";

export default function ProductCardWithVariants({ product }) {
  const { wishlist, setWishlist, cart, setCart } = useAppContext();

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
  } = useProductVariantEngine(product);

  const { format } = useCurrency();

  const isInWishlist = wishlist.some((w) => w.id === product.id);

  const toggleWishlist = () => {
    if (isInWishlist) {
      setWishlist(wishlist.filter((w) => w.id !== product.id));
    } else {
      setWishlist([
        ...wishlist,
        {
          id: product.id,
          title: product.title,
          image: product.images[0]?.url,
          price: product.price,
          slug: product.slug,
        },
      ]);
    }
  };

  // -------------------------------------
  // ADD TO CART HANDLER
  // -------------------------------------
  const addToCart = () => {
    if (!canAddToCart) return;

    // No variants → simple product
    if (!hasVariants) {
      const variantId = `${product.id}-default`;

      const existing = cart.find((i) => i.variantId === variantId);

      if (existing) {
        setCart(
          cart.map((i) =>
            i.variantId === variantId
              ? { ...i, qty: i.qty + 1 }
              : i
          )
        );
      } else {
        setCart([
          ...cart,
          {
            ...product,
            qty: 1,
            maxQty: 99,
            variantId,
            selectedAttributes: {},
          },
        ]);
      }
      return;
    }

    // Variant product
    const variantId =
      product.id +
      "-" +
      attributeKeys.map((k) => selected[k]).join("-");

    const existing = cart.find((i) => i.variantId === variantId);

    if (existing) {
      if (existing.qty < variantStock) {
        setCart(
          cart.map((i) =>
            i.variantId === variantId
              ? { ...i, qty: i.qty + 1 }
              : i
          )
        );
      }
    } else {
      setCart([
        ...cart,
        {
          ...product,
          qty: 1,
          maxQty: variantStock,
          selectedAttributes: { ...selected },
          variantId,
        },
      ]);
    }
  };

  return (
    <div className="min-w-[240px] bg-white rounded-xl shadow hover:shadow-md transition p-4">
      
      {/* Image */}
      <ProductCardImage images={product.images} selected={selected} />

      {/* Title */}
      <h3 className="font-medium text-gray-800 text-sm mb-1">
        {product.title}
      </h3>

      {/* Price */}
      <p className="text-primary font-semibold mb-3">
        {format(product.price)}
      </p>

      {/* Wishlist */}
      <ProductWishlistButton
        isInWishlist={isInWishlist}
        toggleWishlist={toggleWishlist}
      />

      {/* Dynamic Attribute Selectors */}
      {hasVariants && (
        <ProductAttributeSelector
          attributeKeys={attributeKeys}
          attributeOptions={attributeOptions}
          selected={selected}
          setSelected={setSelected}
        />
      )}

      {/* Add To Cart */}
      <ProductAddToCartButton
        canAddToCart={canAddToCart}
        hasVariants={hasVariants}
        allAttributesSelected={attributeKeys.every(
          (key) => selected[key]
        )}
        variantStock={variantStock}
        addToCart={addToCart}
      />
    </div>
  );
}
