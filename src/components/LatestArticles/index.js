"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { HiArrowLeft } from "react-icons/hi";
import AnimatedImage from "@/components/Ui/AnimatedImage";
import Link from "@/components/Ui/Link";
import { useLocale } from "next-intl";

import { useRef } from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export default function LatestArticles({ articles, title, subTitle }) {
  const locale = useLocale();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Reading time estimator
  const getReadingTime = (content) => {
    if (!content) return 1;

    const plainText = JSON.stringify(content)
      .replace(/<[^>]*>/g, "")
      .replace(/["{}:,]/g, " ")
      .trim();

    const words = plainText.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Tag cleaner
  const cleanTags = (tag) => {
    if (!tag) return [];
    return tag
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.startsWith("article"))
      .map((t) => t.replace(/article[:\s]*/i, "").trim());
  };

  return (
    <section className="bg-neutral-900 text-white py-32">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* TITLE */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">
            {typeof title === "string"
              ? title
              : documentToReactComponents(title)}
          </h2>

          {subTitle && (
            <p className="text-gray-300 mt-2">{subTitle}</p>
          )}
        </div>

        {/* SLIDER */}
        <div className="relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
          >
            {articles.map((article) => {
              const readingTime = getReadingTime(article.featuredTitle);
              const tags = cleanTags(article.tag);

              return (
                <SwiperSlide key={article.id}>
                  <Link
                    href={`/style-insights/${article.slug}`}
                    locale={locale}
                    className="block group"
                  >
                    {/* --------------------------------------- */}
                    {/* ARTICLE CARD (New UI/UX Styling)       */}
                    {/* --------------------------------------- */}
                    <div className="rounded-2xl overflow-hidden bg-white text-neutral-900 shadow-lg hover:shadow-xl transition duration-300">

                      {/* IMAGE */}
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <AnimatedImage
                          image={article.mainImage}
                          width={article.mainImage?.width}
                          height={article.mainImage?.height}
                          alt={article.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {/* gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none"></div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-6">
                        {/* TITLE */}
                        <h3 className="text-lg font-semibold leading-tight mb-3 group-hover:opacity-70 transition">
                          {documentToReactComponents(article.featuredTitle)}
                        </h3>

                        {/* TAGS */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((t, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs tracking-wide capitalize"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* DATE + READING TIME */}
                        <div className="flex justify-between items-center text-sm text-neutral-500 mt-4">
                          <span>
                            {new Date(article.date).toLocaleDateString(locale, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>

                          <span>{readingTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* --------------------------------------- */}
          {/* SLIDER NAVIGATION                       */}
          {/* --------------------------------------- */}
          <div className="flex justify-center gap-6 mt-12">
            {/* Prev */}
            <button
              ref={prevRef}
              className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-neutral-900
              hover:bg-neutral-300 transition shadow cursor-pointer"
            >
              <HiArrowLeft className="text-2xl rtl:rotate-180" />
            </button>

            {/* Next */}
            <button
              ref={nextRef}
              className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-neutral-900
              hover:bg-neutral-300 transition shadow cursor-pointer rtl:rotate-180"
            >
              <HiArrowLeft className="text-2xl rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
