"use client";

import { useEffect, useState, useRef } from "react";
import { fetchProductsBySlugs } from "@/lib/contentfulClient";
import ProductCardRelated from "@/components/products/ProductCardRelated";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";

import { HiArrowLeft } from "react-icons/hi";

export default function ProductCarouselBySlugs({ slugs = [], title, subTitle, max = 4 }) {
  const [products, setProducts] = useState([]);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    if (!slugs.length) return;

    async function load() {
      const data = await fetchProductsBySlugs(slugs);
      setProducts(data);
    }

    load();
  }, [slugs]);

  if (!products?.length) return null;

  return (
    <div className="w-full py-16 container mx-auto max-w-7xl">

      {/* Section Heading */}
      {(title || subTitle) && (
        <div className="text-center max-w-2xl mx-auto mb-12 px-4">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
          )}

          {subTitle && (
            <p className="text-lg text-gray-400">{subTitle}</p>
          )}
        </div>
      )}

      {/* Slider */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={2}
        onSwiper={(swiper) => {
          // Bind navigation only after refs exist
          setTimeout(() => {
            if (swiper?.params?.navigation && prevRef.current && nextRef.current) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          });
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: max },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.slug}>
            <ProductCardRelated product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          ref={prevRef}
          aria-label="Previous"
          className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-gray-800 transition"
        >
          <HiArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        <button
          ref={nextRef}
          aria-label="Next"
          className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-gray-800 transition"
        >
          <HiArrowLeft className="w-5 h-5 rotate-180 rtl:rotate-0" />
        </button>
      </div>
    </div>
  );
}
