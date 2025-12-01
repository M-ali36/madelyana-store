"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { fetchContentfulProductsWithImages } from "@/lib/contentfulClient";
import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";

export default function ProductCarousel() {
  const sliderRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // Load real products (Firebase + Contentful merged)
  // -------------------------------------------------------
  const loadProducts = async () => {
    try {
      // 1. Get Firebase dynamic products
      const snap = await getDocs(collection(db, "products_dynamic"));
      const dynamicList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 2. Get Contentful static products (with images)
      const contentful = await fetchContentfulProductsWithImages();

      // 3. Merge them using slug
      const merged = dynamicList
        .map((item) => {
          const staticInfo = contentful.find(
            (c) => c.slug === item.contentfulSlug
          );

          if (!staticInfo) return null;

          return {
            id: item.id,
            title: staticInfo.title,
            image: staticInfo.images?.[0] || "/placeholder.png",
            price: Number(item.price) || 0,
            slug: staticInfo.slug,
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
  // Carousel scroll controls
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
          <button onClick={slideLeft} className="p-2 rounded bg-gray-200 hover:bg-gray-300">
            ◀
          </button>
          <button onClick={slideRight} className="p-2 rounded bg-gray-200 hover:bg-gray-300">
            ▶
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading products…</p>}

      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-4"
      >
        {products.map((product) => (
          <ProductCardWithVariants key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
