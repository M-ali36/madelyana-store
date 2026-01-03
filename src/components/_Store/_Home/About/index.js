"use client";

import AnimatedImage from "@/components/Ui/AnimatedImage";
import Link from "@/components/Ui/Link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useLocale } from "next-intl";

export default function About({ data }) {

    const {title, content, link, image} = data;
  const locale = useLocale();

  return (
    <section className="w-full py-20 container mx-auto px-4 max-w-7xl">
      <div 
        className="
          grid grid-cols-1
          lg:grid-cols-2
          gap-12 lg:gap-20
          items-center
        "
      >
        {/* RIGHT — IMAGE */}
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg">
          <AnimatedImage
            image={image}
            alt={title}
            width={image.width}
            height={image.height}
          />
        </div>
        
        {/* LEFT — TEXT CONTENT */}
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
            {title}
          </h2>

          <div className="text-lg text-gray-700 leading-relaxed space-y-4 mb-8">
            {documentToReactComponents(content)}
          </div>

          {link?.url && (
            <Link
              href={link.url}
              locale={locale}
              className="
                w-fit px-6 py-3 
                border border-black
                rounded-full
                text-sm font-medium
                transition-all duration-300
                hover:bg-neutral-900 hover:text-white
              "
            >
              {link.title}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
