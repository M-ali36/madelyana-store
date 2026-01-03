"use client";
import AnimatedImage from "@/components/Ui/AnimatedImage";
import Link from "@/components/Ui/Link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useLocale } from "next-intl";


export default function HomeCategories({ title, subTitle, items }) {
  const locale = useLocale();

  return (
    <section className="w-full py-16 container mx-auto px-4">
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
          lg:grid-cols-4
        "
      >
        {items?.map((item, index) => {
          const categoryTitle = documentToReactComponents(item?.content) || "";
          const categoryText = documentToReactComponents(item?.subContent) || "";
          const imageUrl = item?.image?.url;
          const href = item?.link?.url || "#";

          const Card = (
            <div className="relative w-full aspect-square overflow-hidden group cursor-pointer">
              {/* Image */}
              <AnimatedImage image={imageUrl} />

              {/* Overlay */}
              <div
                className="
                  absolute inset-0 bg-neutral-900/30 
                  group-hover:bg-neutral-900/40 
                  transition-colors duration-300
                "
              />

              {/* Text */}
              <div
                className="
                  absolute inset-0 flex flex-col justify-end 
                  p-6 text-white
                  bg-gradient-to-t from-[rgba(0,0,0,0.3)] to-transparent
                "
              >
                <h3 className="text-2xl font-semibold mb-1">
                  {categoryTitle}
                </h3>
                {categoryText}
              </div>
            </div>
          );

          return item.link?.url ? (
            <Link key={index} href={href} locale={locale} aria-label={categoryTitle}>
              {Card}
            </Link>
          ) : (
            <div key={index}>{Card}</div>
          );
        })}
      </div>

      {/* Bottom Link - See All Categories */}
      <div className="text-center mt-12">
        <Link
          href="/women"
          locale={locale}
          className="
            inline-block text-lg font-medium text-gray-800 
            hover:text-neutral-900 underline underline-offset-4
            transition-colors duration-200
          "
        >
          See all categories
        </Link>
      </div>
    </section>
  );
}
