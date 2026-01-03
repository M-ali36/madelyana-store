"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { HiArrowRight } from "react-icons/hi";
import { useLocale } from "next-intl";
import AnimatedImage from "@/components/Ui/AnimatedImage";
import TikTokModal from "./TikTokModal";

import "swiper/css";
import "swiper/css/navigation";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useState } from "react";

export default function TikTokSlider({ title, subTitle, videos }) {
  const locale = useLocale();

  const [openModal, setOpenModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const openVideo = (url) => {
    setActiveVideo(url);
    setOpenModal(true);
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setOpenModal(false);
  };

  return (
    <section className="w-full py-16 max-w-7xl mx-auto container px-4">
      {/* Title */}
      <div className="max-w-3xl mx-auto text-center mb-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {documentToReactComponents(title)}
        </h2>

        {subTitle && (
          <p className="text-gray-600 mt-3">{subTitle}</p>
        )}
      </div>

      <div className="relative">
        {/* Custom Navigation */}
        <div className="absolute inset-y-0 -start-6 flex items-center z-20">
          <div
            className="tiktok-prev h-12 w-12 rounded-full bg-white flex items-center justify-center hover:bg-neutral-300 transition cursor-pointer text-neutral-900 shadow"
          >
            <HiArrowRight className="w-6 h-6 rotate-180" />
          </div>
        </div>

        <div className="absolute inset-y-0 -end-6 flex items-center z-20">
          <div
            className="tiktok-next h-12 w-12 rounded-full bg-white flex items-center justify-center hover:bg-neutral-300 transition cursor-pointer text-neutral-900 shadow"
          >
            <HiArrowRight className="w-6 h-6" />
          </div>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: ".tiktok-prev",
            nextEl: ".tiktok-next",
          }}
          slidesPerView={1.2}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 4.2 },
          }}
          className="px-6"
        >
          {videos.map((item, index) => (
            <SwiperSlide key={index}>
              <button
                onClick={() => openVideo(item.videoUrl)}
                className="block group relative rounded-lg overflow-hidden w-full text-start cursor-pointer"
              >
                {/* Aspect Ratio Wrapper 4/5 */}
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
                  <AnimatedImage
                    image={item.image}
                    width={item.image.width}
                    height={item.image.height}
                    className="object-cover w-full h-full"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300" />

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-900 group-hover:scale-110 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="w-6 h-6"
                      >
                        <path d="M6 4l10 6-10 6V4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-3 text-neutral-900 font-medium">
                  {item.title}
                </h3>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modal */}
      {openModal && (
        <TikTokModal
          videoUrl={activeVideo}
          open={openModal}
          onClose={closeVideo}
        />
      )}
    </section>
  );
}
