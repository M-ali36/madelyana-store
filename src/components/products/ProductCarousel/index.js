"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { fetchContentfulProductsWithImages } from "@/lib/contentfulClient";

import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";
import ProductSkeletonGrid from "@/components/products/ProductCardWithVariants/ProductCard/ProductSkeletonGrid";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductCarousel({ skeletonCount = 4 }) {
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

      const staticContent = await fetchContentfulProductsWithImages();

      const merged = dynamicList
        .map((item) => {
          const staticInfo = staticContent.find(
            (c) => c.slug === item.contentfulSlug
          );
          if (!staticInfo) return null;

          return {
            id: item.id,
            slug: staticInfo.slug,
            title: staticInfo.title,
            images:
              staticInfo.images?.length > 0
                ? staticInfo.images
                : [{ url: "/placeholder.webp", tag: null }],
            price: Number(item.price) || 0,
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

  return (
    <div className="w-full px-6 py-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Latest Products</h2>
      </div>

      {/* Skeleton Loader */}
      {loading && <ProductSkeletonGrid count={skeletonCount} />}

      {/* Swiper Carousel */}
      {!loading && products.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 28 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="h-full">
                <ProductCardWithVariants product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {!loading && products.length === 0 && (
        <p className="text-gray-500">No products found.</p>
      )}
    </div>
  );
}
