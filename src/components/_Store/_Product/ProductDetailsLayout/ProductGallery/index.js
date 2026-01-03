"use client";

import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "swiper/css";
import "swiper/css/thumbs";

gsap.registerPlugin(ScrollTrigger);

export function getAspectClass(tag) {
  switch (tag) {
    case "aspectLandscape":
      return "aspect-[16/9]";        // Wide landscape
    case "aspectMonitor":
      return "aspect-[5/4]";        // Ultra-wide monitor
    case "aspectBoxed":
      return "aspect-square";        // 1:1 boxed
    case "aspectTablet":
      return "aspect-[4/5]";         // Tablet vertical
    case "aspectProtrait":
      return "aspect-[9/16]";         // Portrait
    default:
      return "aspect-auto";          // Safe fallback
  }
}


export default function ProductGallery({ product }) {
  const images = product.images || [];
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);

  const controlsRef = useRef(null);

  if (!images.length) return null;

  console.log(images)

  // ⭐ PIN CONTROLS LIKE EXTERNAL COMPONENT
  useEffect(() => {
    const filterContainer = document.querySelector(".controls");
    if (filterContainer) {
      ScrollTrigger.create({
        trigger: filterContainer,
        start: "top bottom",
        end: "bottom bottom",
        endTrigger: ".product-gallery-end",
        pin: true,
        scrub: true,
        pinSpacing: false,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <div className="relative w-full">
        <div className="controls relative z-10">
        <div
          className="
            absolute 
            bottom-4 end-6
            z-[50]
            p-3 bg-white border border-black rounded-full 
            flex items-center gap-3
          "
        >
          {/* PREVIOUS BUTTON */}
          <button
            onClick={() => mainSwiper?.slidePrev()}
            className="
              w-[30px] h-[30px]
              flex items-center justify-center
              rounded-full border border-black
              bg-white text-neutral-900
              transition-all duration-200
              transition-shadow duration-200 
              hover:shadow-[inset_0_0_0_4px_#161413]
              cursor-pointer
            "
          >
            <HiChevronLeft size={18} className="rtl:rotate-180" />
          </button>

          {/* THUMBNAILS */}
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[Thumbs]}
            slidesPerView={5}
            spaceBetween={8}
            watchSlidesProgress
            className="product-thumbs"
          >
            {images.map((media, i) => {
              const isVideo =
                media.url.endsWith(".mp4") ||
                media.mimeType?.includes("video");

              const thumb = media.url + "?w=50&fm=webp";

              return (
                <SwiperSlide key={i} className="!w-auto">
                  <div
                    className={`
                      heavy-shade
                      w-[30px] h-[30px]
                      rounded-full overflow-hidden
                      cursor-pointer border border-black bg-white
                      transition-all duration-200
                    `}
                  >
                    {!isVideo ? (
                      <img
                        src={thumb}
                        height="30px"
                        width="30px"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      ></video>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* NEXT BUTTON */}
          <button
            onClick={() => mainSwiper?.slideNext()}
            className="
              w-[30px] h-[30px]
              flex items-center justify-center
              rounded-full border border-black
              bg-white text-neutral-900
              transition-all duration-200
              transition-shadow duration-200 
              hover:shadow-[inset_0_0_0_4px_#161413]
              cursor-pointer
            "
          >
            <HiChevronRight size={18} className="rtl:rotate-180"/>
          </button>
        </div>
      </div>
        {/* MAIN SWIPER */}
        <Swiper
          onSwiper={setMainSwiper}
          modules={[Thumbs]}
          thumbs={{ swiper: thumbsSwiper }}
          slidesPerView="auto"
          spaceBetween={0}
          className="product-main-swiper"
        >
          {images.map((media, i) => {
            const isVideo =
              media.url.endsWith(".mp4") ||
              media.mimeType?.includes("video");

            return (
              <SwiperSlide
                key={i}
                className="!w-auto flex items-center justify-center"
              >
                <div className="max-h-screen flex items-center justify-center bg-neutral-900">
                  {!isVideo ? (
                    <img
                      src={media.url}
                      alt={product.title}
                      height={media.height}
                      width={media.width}
                      className="max-h-screen w-auto object-contain"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className={`max-h-screen w-auto object-contain ${getAspectClass(media.tag)}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                    ></video>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* ⭐ ABSOLUTE & PINNED CONTROLS BAR */}
      </div>

      {/* ⭐ END MARKER (required for pinning logic) */}
      <div className="product-gallery-end"></div>
    </>
  );
}