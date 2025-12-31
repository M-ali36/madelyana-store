"use client";

import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductCarouselStatic({ title, subTitle, products = [], ...props }) {
  if (!products.length) return null;

  return (
    <section {...props}>
      <div className="w-full py-16 container mx-auto px-4">
        {/* Section Heading (same styling as categories section) */}
        <div className="text-center max-w-2xl mx-auto mb-12 px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {typeof title === 'string'
              ? title
              : documentToReactComponents(title)}
            </h2>
          )}

          {subTitle && (
            <p className="text-lg text-gray-400">
              {subTitle}
            </p>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
            className="swiper-products"
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
      </div>

    </section>
  );
}
