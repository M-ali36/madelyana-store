"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { fetchContentfulProductsWithImages } from "@/lib/contentfulClient";

import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";
import ProductSkeletonGrid from "@/components/products/ProductCardWithVariants/ProductCard/ProductSkeletonGrid";

export default function ProductCarousel({ skeletonCount = 4 }) {
  const sliderRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // Load products
  // -------------------------------------------------------
  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products_dynamic"));
      const dynamicList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const contentful = await fetchContentfulProductsWithImages();

      const merged = dynamicList
        .map((item) => {
          const staticInfo = contentful.find(
            (c) => c.slug === item.contentfulSlug
          );

          if (!staticInfo) return null;

          return {
            id: item.id,
            title: staticInfo.title,
            slug: staticInfo.slug,
            price: Number(item.price) || 0,
            images:
              staticInfo.images?.length > 0
                ? staticInfo.images
                : [{ url: "/placeholder.png", tag: null }],
            variants: item.variants || [],
          };
        })
        .filter(Boolean);

      setProducts(merged);
    } catch (err) {
      console.error("Error loading products:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // -------------------------------------------------------
  // Carousel scroll
  // -------------------------------------------------------
  const slideLeft = () => {
    sliderRef.current?.scrollBy({ left: -250, behavior: "smooth" });
  };

  const slideRight = () => {
    sliderRef.current?.scrollBy({ left: 250, behavior: "smooth" });
  };

  return (
    <div className="w-full px-6 py-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Latest Products</h2>

        <div className="flex gap-2">
          <button
            onClick={slideLeft}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            ◀
          </button>
          <button
            onClick={slideRight}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Skeleton Loader */}
      {loading && <ProductSkeletonGrid count={skeletonCount} />}

      {/* Product List */}
      {!loading && (
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-4"
        >
          {products.map((product) => (
            <ProductCardWithVariants key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
