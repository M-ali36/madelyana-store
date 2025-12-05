"use client";

import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductCarouselStatic({ products = [] }) {
  if (!products.length) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto">

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1.2 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.slug}>
            <ProductCardWithVariants product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
}
