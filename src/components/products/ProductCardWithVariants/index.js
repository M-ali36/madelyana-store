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
import Link from "@/components/Ui/Link";
import { useLocale } from "next-intl";

/* -----------------------------------------
   Skeleton helpers (Tailwind only)
------------------------------------------ */
const SkeletonLine = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const SkeletonButton = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export default function ProductCardWithVariants({ product }) {
    // -----------------------------------------
    // 1️⃣ Local merged product state
    // -----------------------------------------
    const [mergedProduct, setMergedProduct] = useState(product);
    const [loading, setLoading] = useState(true);

    const { wishlist, setWishlist, cart, setCart } = useAppContext();
    const { format } = useCurrency();

    const locale = useLocale();

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
                    const docSnap = snap.docs[0];
                    const dynamicData = docSnap.data();

                    setMergedProduct((prev) => ({
                        ...prev,
                        firebaseId: docSnap.id,
                        price: Number(dynamicData.price) || prev.price || 0,
                        variants: dynamicData.variants || [],
                    }));
                } else {
                    setMergedProduct((prev) => ({
                        ...prev,
                        firebaseId: prev.firebaseId || prev.id,
                        price: prev.price || 0,
                        variants: prev.variants || [],
                    }));
                }
            } catch (e) {
                console.error("Firebase product load error:", e);
                setMergedProduct((prev) => ({
                    ...prev,
                    firebaseId: prev.firebaseId || prev.id,
                }));
            }

            setLoading(false);
        }

        loadFirebaseDynamic();
    }, [product]);

    // -----------------------------------------
    // 3️⃣ Wishlist Toggle
    // -----------------------------------------
    const isInWishlist = wishlist.some(
        (w) => w.id === mergedProduct.firebaseId
    );

    const toggleWishlist = () => {
        if (loading) return;

        if (isInWishlist) {
            setWishlist(
                wishlist.filter((w) => w.id !== mergedProduct.firebaseId)
            );
        } else {
            setWishlist([
                ...wishlist,
                {
                    id: mergedProduct.firebaseId,
                    title: mergedProduct.title,
                    image: mergedProduct.images?.[0]?.url,
                    price: mergedProduct.price,
                    slug: mergedProduct.slug,
                    hasVariants: mergedProduct.variants?.length > 0,
                },
            ]);
        }
    };

    // -----------------------------------------
    // 4️⃣ Variant Engine
    // -----------------------------------------
    const {
        hasVariants,
        attributeKeys,
        attributeOptions,
        selected,
        setSelected,
        variantStock,
        canAddToCart,
    } = useProductVariantEngine(mergedProduct);

    // -----------------------------------------
    // 5️⃣ Selected Image Logic
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
    // 6️⃣ Add to Cart
    // -----------------------------------------
    const addToCart = () => {
        if (loading || !canAddToCart) return;

        const selectedImage = getSelectedImageFromCard();

        const variantId = hasVariants
            ? `${mergedProduct.firebaseId}-${Object.values(selected).join("-")}`
            : `${mergedProduct.firebaseId}-default`;

        const existing = cart.find((i) => i.variantId === variantId);

        if (existing) {
            setCart(
                cart.map((i) =>
                    i.variantId === variantId
                        ? { ...i, qty: Math.min(i.qty + 1, i.maxQty) }
                        : i
                )
            );
            return;
        }

        setCart([
            ...cart,
            {
                id: mergedProduct.firebaseId,
                slug: mergedProduct.slug,
                title: mergedProduct.title,
                image: selectedImage,
                price: mergedProduct.price,
                qty: 1,
                maxQty: hasVariants ? Number(variantStock) || 1 : 99,
                selectedAttributes: hasVariants ? { ...selected } : {},
                variantId,
            },
        ]);
    };

    return (
        <div className="shadow-lg p-4 rounded-lg bg-white">
            {/* Image (SEO safe) */}
            <Link href={`/${mergedProduct.slug}.html`} locale={locale}>
            <ProductCardImage
                images={mergedProduct.images}
                selected={selected}
            />
            </Link>

            {/* Title (SEO safe) */}
            <h3 className="font-medium text-gray-800 text-sm mb-1">
                {mergedProduct.title}
            </h3>

            {/* Price */}
            <div className="mb-3">
                {loading ? (
                    <SkeletonLine className="h-4 w-20" />
                ) : (
                    <p className="text-primary font-semibold">
                        {format(mergedProduct.price)}
                    </p>
                )}
            </div>

            {/* Wishlist */}
            <div className="mb-3">
                {loading ? (
                    <SkeletonButton className="h-8 w-8 rounded-full" />
                ) : (
                    <ProductWishlistButton
                        isInWishlist={isInWishlist}
                        toggleWishlist={toggleWishlist}
                    />
                )}
            </div>

            {/* Variants */}
            {hasVariants && (
                <div className="mb-4">
                    {loading ? (
                        <div className="flex gap-2">
                            <SkeletonLine className="h-7 w-12" />
                            <SkeletonLine className="h-7 w-12" />
                            <SkeletonLine className="h-7 w-12" />
                        </div>
                    ) : (
                        <ProductAttributeSelector
                            attributeKeys={attributeKeys}
                            attributeOptions={attributeOptions}
                            selected={selected}
                            setSelected={setSelected}
                        />
                    )}
                </div>
            )}

            {/* Add to Cart */}
            <div>
                {loading ? (
                    <SkeletonButton className="h-10 w-full" />
                ) : (
                    <ProductAddToCartButton
                        canAddToCart={canAddToCart}
                        hasVariants={hasVariants}
                        allAttributesSelected={attributeKeys.every(
                            (k) => selected[k]
                        )}
                        variantStock={variantStock}
                        addToCart={addToCart}
                    />
                )}
            </div>
        </div>
    );
}
