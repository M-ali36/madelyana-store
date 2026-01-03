"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/components/context/AppContext";
import useCurrency from "@/components/hooks/useCurrency";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";

import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";
import { useProductVariantEngine } from "@/components/products/ProductCardWithVariants/ProductCard/useProductVariantEngine";
import ProductTrust from "./ProductTrust";
import { HiOutlineHeart } from "react-icons/hi";
import ProductDetails from "./ProductDetails";
import ProductCarouselStatic from "@/components/ContentTypes/ProductSlider";
import { useTranslations } from "next-intl";
import RelatedProductsSlider from "@/components/products/RelatedProductsSlider";

export default function ProductDetailsLayout({ product, related }) {
    const t = useTranslations("relatedProducts");
  const [merged, setMerged] = useState(product);
  const [loading, setLoading] = useState(true);

  const { cart, setCart, wishlist, setWishlist } = useAppContext();
  const { format } = useCurrency();

  // --------------------------------------
  // Load Firebase dynamic product data
  // --------------------------------------
  useEffect(() => {
    async function loadFb() {
      const q = query(
        collection(db, "products_dynamic"),
        where("contentfulSlug", "==", product.slug)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const doc = snap.docs[0];
        const data = doc.data();

        setMerged((prev) => ({
          ...prev,
          firebaseId: doc.id,
          price: Number(data.price) || prev.price,
          variants: data.variants || prev.variants || [],
        }));
      } else {
        setMerged((prev) => ({
          ...prev,
          firebaseId: prev.id,
          price: prev.price || 0,
          variants: prev.variants || [],
        }));
      }

      setLoading(false);
    }

    loadFb();
  }, [product]);

  // Variant Engine
  const {
    hasVariants,
    attributeKeys,
    attributeOptions,
    selected,
    setSelected,
    variantStock,
    canAddToCart,
  } = useProductVariantEngine(merged);

  const toggleWishlist = () => {
    const exists = wishlist.some((w) => w.id === merged.firebaseId);

    if (exists) {
      setWishlist(wishlist.filter((w) => w.id !== merged.firebaseId));
    } else {
      setWishlist([
        ...wishlist,
        {
          id: merged.firebaseId,
          title: merged.title,
          image: merged.images?.[0]?.url,
          price: merged.price,
          slug: merged.slug,
        },
      ]);
    }
  };

  // Add to Cart
  const addToCart = () => {
    if (!canAddToCart) return;

    const vid = hasVariants
      ? `${merged.firebaseId}-${Object.values(selected).join("-")}`
      : `${merged.firebaseId}-default`;

    const existing = cart.find((i) => i.variantId === vid);

    if (existing) {
      setCart(
        cart.map((i) =>
          i.variantId === vid
            ? { ...i, qty: Math.min(i.qty + 1, i.maxQty) }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: merged.firebaseId,
          slug: merged.slug,
          title: merged.title,
          price: merged.price,
          qty: 1,
          maxQty: hasVariants ? Number(variantStock) : 99,
          image: merged.images?.[0]?.url,
          selectedAttributes: selected,
          variantId: vid,
        },
      ]);
    }
  };

  const variantImageMap = {};

  (merged.images || []).forEach((img) => {
    if (!img.tag) return;

    // imageBlack → Black
    const match = img.tag.match(/^image(.+)$/);
    if (!match) return;

    const value = match[1];
    variantImageMap[value.toLowerCase()] = img.url;
  });


  return (
    <>
      <ProductGallery product={merged} selected={selected} />
      <div className="container mx-auto max-w-7xl px-4 py-12">

        <div className="grid lg:grid-cols-12 gap-16">       
          <div className="lg:col-span-6">
            <h1 className="text-3xl font-semibold mb-2">{merged.title}</h1>
            <p className="text-xl font-bold text-primary mb-4">
              {format(merged.price)}
            </p>

            {/* Variant selectors */}
            {hasVariants && (
              <VariantSelector
                attributeKeys={attributeKeys}
                attributeOptions={attributeOptions}
                selected={selected}
                setSelected={setSelected}
                variantImageMap={variantImageMap}
              />
            )}

            {/* Add to cart */}
            <div className="flex gap-4">
              <AddToCartButton
                loading={loading}
                canAddToCart={canAddToCart}
                addToCart={addToCart}
              />

              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                className={`px-4 py-3 cursor-pointer border rounded-lg overflow-hidden transition ${wishlist.some((w) => w.id === merged.firebaseId) ? 'bg-rose-500 border-rose-500 text-white' : 'text-neutral-900 border-black  hover:border-rose-500 hover:text-rose-500'}`}
              >
                <HiOutlineHeart className='w-5 h-5' />
              </button>
            </div>
            <ProductDetails product={merged} />
          </div>
          <div className="lg:col-span-6">
            <ProductTrust />
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {product?.relatedProducts?.length > 0 && (
        <div className="mt-20">
          <RelatedProductsSlider products={product.relatedProducts} subTitle={t("subTitle")} title={t("title")}/>
        </div>
      )}
    </>
  );
}
