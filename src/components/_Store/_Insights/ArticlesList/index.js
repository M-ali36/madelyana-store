"use client";

import { useEffect, useState, useMemo } from "react";
import AnimatedImage from "@/components/Ui/AnimatedImage";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

// Remove "Article: " prefix
const cleanTag = (str = "") =>
  str.replace(/^article/i, "").replace(/^[:\s]+/, "");

export default function ArticlesList({ articles }) {
  const locale = useLocale();
  const t = useTranslations("articlesList");

  // If articles not loaded
  if (!articles || articles.length === 0) {
    return (
      <p className="text-center text-gray-500 py-20">
        {t("noArticles")}
      </p>
    );
  }

  // Extract tag list (cleaned)
  const tags = useMemo(() => {
    const uniqueTags = articles
      .map((a) => cleanTag(a.tag || ""))
      .filter((v) => v.length > 0);

    return Array.from(new Set(uniqueTags));
  }, [articles]);

  // Tag filter state
  const [selectedTag, setSelectedTag] = useState("all");

  // Load more logic
  const INITIAL_COUNT = 6;
  const LOAD_MORE_COUNT = 6;

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [autoLoaded, setAutoLoaded] = useState(false);

  // Auto-load one time after mount
  useEffect(() => {
    if (!autoLoaded) {
      setTimeout(() => {
        setVisibleCount(INITIAL_COUNT + LOAD_MORE_COUNT);
        setAutoLoaded(true);
      }, 600);
    }
  }, [autoLoaded]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    if (selectedTag === "all") return articles;

    const result = articles.filter(
      (a) => cleanTag(a.tag) === selectedTag
    );

    return result;
  }, [selectedTag, articles]);

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  return (
    <section className="w-full py-16">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-10 text-center px-4">
        <h2 className="text-3xl font-semibold tracking-tight">
          {t("sectionTitle")}
        </h2>
        <p className="mt-2 text-gray-600">
          {t("sectionSubTitle")}
        </p>
      </div>

      {/* TAG FILTERS */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12 px-4">
        <button
          onClick={() => setSelectedTag("all")}
          className={`
            px-4 py-2 text-sm rounded-full border transition
            ${selectedTag === "all"
              ? "bg-neutral-900 text-white border-neutral-900"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }
          `}
        >
          {t("all")}
        </button>

        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`
              px-4 py-2 text-sm rounded-full border transition capitalize
              ${selectedTag === tag
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ARTICLES GRID */}
      {filteredArticles.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto px-4">
          {visibleArticles.map((article) => (
            <Link
              locale={locale}
              href={`/style-insights/${article.slug}`}
              key={article.id}
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 shadow-sm ring-1 ring-gray-200 transition group-hover:shadow-lg">
                <AnimatedImage
                  image={article.mainImage}
                  width={article.mainImage?.width || 800}
                  height={article.mainImage?.height || 1000}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
              </div>

              <h3 className="mt-4 text-lg font-medium text-neutral-900 group-hover:opacity-70 transition">
                {article.title}
              </h3>

              {article.date && (
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(article.date).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* LOAD MORE */}
      {visibleCount < filteredArticles.length && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisibleCount(visibleCount + LOAD_MORE_COUNT)}
            className="
              px-8 py-3 rounded-full border border-neutral-300 
              bg-white text-neutral-900 hover:bg-neutral-100 
              transition text-sm tracking-wide shadow-sm
            "
          >
            {t("loadMore")}
          </button>
        </div>
      )}
    </section>
  );
}
