"use client";
import AnimatedImage from "@/components/Ui/AnimatedImage";
import Link from "@/components/Ui/Link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useLocale, useTranslations } from "next-intl";

export default function HomeCategories({ title, subTitle, items }) {
  const locale = useLocale();
  const t = useTranslations("homeCategories");

  return (
    <section className="w-full py-16 container mx-auto px-4 max-w-7xl">
      {/* Section Heading */}
      <div className="text-center max-w-2xl mx-auto mb-12 px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {documentToReactComponents(title)}
        </h2>
        {subTitle && (
          <p className="text-lg text-gray-600">{subTitle}</p>
        )}
      </div>

      {/* Categories Grid */}
      <div
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {items?.map((item, index) => {
          const categoryTitle =
            documentToReactComponents(item?.content) || "";
          const categoryText =
            documentToReactComponents(item?.subContent) || "";
          const imageUrl = item?.image?.url;
          const href = item?.link?.url || "#";

          const Card = (
            <div className="relative w-full aspect-square overflow-hidden group cursor-pointer rounded-2xl">
              {/* Image */}
              <AnimatedImage image={imageUrl} />

              {/* Overlay */}
              <div className="absolute inset-0 bg-neutral-900/30 group-hover:bg-neutral-900/40 transition rounded-2xl" />

              {/* Text */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/30 to-transparent rounded-2xl">
                <h3 className="text-2xl font-semibold mb-1">{categoryTitle}</h3>
                {categoryText}
              </div>
            </div>
          );

          return item.link?.url ? (
            <Link
              key={index}
              href={href}
              locale={locale}
              aria-label={categoryTitle}
            >
              {Card}
            </Link>
          ) : (
            <div key={index}>{Card}</div>
          );
        })}

        {/* ⭐ SHOW MORE CATEGORY CARD */}
        <Link
          href="/women"
          locale={locale}
          className="
            relative w-full aspect-square border border-neutral-300
            rounded-2xl flex items-center justify-center
            text-neutral-700 hover:bg-neutral-100
            transition cursor-pointer
          "
        >
          <span className="text-2xl font-bold text-center px-4">
            {t("showMore")}...
          </span>
        </Link>
      </div>
    </section>
  );
}
