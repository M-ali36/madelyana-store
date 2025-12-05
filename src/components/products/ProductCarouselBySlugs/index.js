"use client";

import { useEffect, useState } from "react";
import { fetchProductsBySlugs } from "@/lib/contentfulClient";
import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductCarouselBySlugs({ slugs = [] }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!slugs.length) return;

    async function load() {
      const data = await fetchProductsBySlugs(slugs);
      setProducts(data);
    }

    load();
  }, [slugs]);

  if (!products.length) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto">

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="w-full"
        breakpoints={{
          640: { slidesPerView: 1.2 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.slug}>
            <div className="h-full">
              <ProductCardWithVariants product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
