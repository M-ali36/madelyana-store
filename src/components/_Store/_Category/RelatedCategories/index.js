"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import Link from "@/components/Ui/Link";
import AnimatedImage from "@/components/Ui/AnimatedImage";

import { HiArrowRight } from "react-icons/hi";
import { useRef } from "react";
import { useLocale } from "next-intl";

export default function RelatedCategories({ categories, currentSlug }) {
  const locale = useLocale();
  const nextRef = useRef(null);
  const prevRef = useRef(null);

  console.log("Related Categories:", currentSlug);

  // ⭐ Remove the current category
  const filteredCategories = categories.filter(
    (cat) => cat.slug !== currentSlug
  );

  return (
    <div className="relative w-full grid grid-cols-1 lg:grid-cols-13 items-center gap-4">
      {/* Slider Header */}
      <div className="col-span-1 lg:col-span-2 flex items-center justify-end">
        <h2 className="text-4xl text-end">
          <strong>Related</strong>
          <br /> Categories
        </h2>
      </div>

      <div className="col-span-1 lg:col-span-11">
        <Swiper
          modules={[Navigation]}
          spaceBetween={18}
          slidesPerView={6.5}
          breakpoints={{
            440: { slidesPerView: 1.5 },
            640: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
            1280: { slidesPerView: 5.5 },
          }}
          onInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          className="pb-8 categories-swiper"
        >
          {filteredCategories.map((cat) => {
            const imageSrc = cat.mainBanner?.url ?? null;

            return (
              <SwiperSlide key={cat.id} className="flex flex-col items-center">
                <Link
                  href={`/${cat.slug}`}
                  locale={locale}
                  className="relative block rounded h-40 overflow-hidden group"
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10" />

                  {/* Image */}
                  {imageSrc && (
                    <AnimatedImage
                      image={imageSrc}
                      alt={cat.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Title */}
                  <div className="absolute bottom-0 w-full p-3 z-20">
                    <span className="text-white text-2xl font-medium drop-shadow">
                      {cat.featuredTitle || cat.title}
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Custom Arrows (currently hidden per your CSS) */}
      <div className="absolute right-0 -bottom-4 items-center gap-3 z-30 hidden">
        <button
          ref={prevRef}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white"
        >
          <HiArrowRight className="text-xl rotate-180" />
        </button>

        <button
          ref={nextRef}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white"
        >
          <HiArrowRight className="text-xl" />
        </button>
      </div>
    </div>
  );
}
