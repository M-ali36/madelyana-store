"use client";

import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";

import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { MdDoubleArrow } from "react-icons/md";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "swiper/css";
import "swiper/css/thumbs";

import Image from "@/components/Ui/Image";

// ⭐ Fancybox
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

gsap.registerPlugin(ScrollTrigger);

// -----------------------------------------------------------------------------------

export function getAspectClass(tag) {
  switch (tag) {
    case "aspectLandscape":
      return "aspect-[16/9]";
    case "aspectMonitor":
      return "aspect-[5/4]";
    case "aspectBoxed":
      return "aspect-square";
    case "aspectTablet":
      return "aspect-[4/5]";
    case "aspectProtrait":
      return "aspect-[9/16]";
    default:
      return "aspect-auto";
  }
}

// -----------------------------------------------------------------------------------

export default function ProductGallery({ product }) {
  const images = product.images || [];
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);

  const controlsRef = useRef(null);

  if (!images.length) return null;

  // ⭐ Setup Fancybox (optional: clean previous instances when unmounting)
  useEffect(() => {
    Fancybox.bind("[data-fancybox='gallery']", {});

    return () => {
      Fancybox.destroy();
    };
  }, []);

  // ⭐ ScrollTrigger pin logic stays untouched
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

  // -----------------------------------------------------------------------------------

  return (
    <>
      <div className="relative w-full overflow-hidden max-h-[80vh]">

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
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full border border-black bg-white text-neutral-900 transition-all duration-200 hover:shadow-[inset_0_0_0_4px_#161413]"
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
                      className="
                        heavy-shade
                        w-[30px] h-[30px]
                        rounded-full overflow-hidden
                        cursor-pointer border border-black bg-white
                        transition-all duration-200
                      "
                    >
                      {!isVideo ? (
                        <img
                          src={thumb}
                          height="30"
                          width="30"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* NEXT BUTTON */}
            <button
              onClick={() => mainSwiper?.slideNext()}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full border border-black bg-white text-neutral-900 transition-all duration-200 hover:shadow-[inset_0_0_0_4px_#161413]"
            >
              <HiChevronRight size={18} className="rtl:rotate-180" />
            </button>

          </div>
        </div>

        {/* The floating arrow */}
        <MdDoubleArrow className="text-white/80 absolute end-4 h-12 w-12 lg:h-24 lg:w-24 preview-svg z-10 top-[calc(50%-24px)] lg:top-[calc(50%-48px)] rtl:rotate-180" />

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
              <SwiperSlide key={i} className="!w-auto flex items-center justify-center">

                {/* ⭐ Fancybox wrapper */}
                <a
                  data-fancybox="gallery"
                  href={media.url}
                  data-type={isVideo ? "video" : "image"}
                  className="max-h-80 lg:max-h-screen flex items-center justify-center bg-neutral-900"
                >
                  {!isVideo ? (
                    <Image
                      image={media.url}
                      alt={product.title}
                      height={media.height}
                      width={media.width}
                      className="max-h-80 lg:max-h-screen w-auto object-contain"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className={`max-h-80 lg:max-h-screen w-auto object-contain ${getAspectClass(media.tag)}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                    ></video>
                  )}
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>

      </div>

      <div className="product-gallery-end"></div>
    </>
  );
}
