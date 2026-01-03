"use client";

import React from "react";
import Image from "@/components/Ui/Image";
import Link from "@/components/Ui/Link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useLocale, useTranslations } from "next-intl";

export default function Video({ vimeoId, image, title, subTitle }) {
    const locale = useLocale();
    const t = useTranslations("videoSection");

    const thumbnailUrl = image;
    const altText =
        image?.description || "Background video thumbnail for About Us section";

    return (
        <div className="relative flex items-center justify-center aspect-[16/7] mb-10 overflow-hidden">

            {/* Background */}
            <div className="absolute min-w-full">

                {/* Static Thumbnail */}
                {thumbnailUrl && (
                    <div className="absolute z-0 min-h-full w-full">
                        <Image
                            image={thumbnailUrl}
                            alt={altText}
                            fill
                            className="w-full"
                            priority={true}
                        />
                    </div>
                )}

                {/* Vimeo Background Video */}
                <iframe
                    src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1&playsinline=1`}
                    title="Website background video"
                    loading="lazy"
                    decoding="async"
                    allow="autoplay; fullscreen; picture-in-picture"
                    className="aspect-video object-cover relative z-10 w-full"
                ></iframe>

                {/* Overlay */}
                <div className="absolute inset-0 bg-neutral-900/40 z-20"></div>
            </div>

            {/* CONTENT */}
            <div className="relative z-30 text-center px-6 max-w-3xl mx-auto">
                {title && (
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {documentToReactComponents(title)}
                    </h2>
                )}

                {subTitle && (
                    <p className="text-lg md:text-xl text-gray-200 mb-8">
                        {subTitle}
                    </p>
                )}

                {/* CTA (Translated) */}
                <Link
                    href="/women"
                    locale={locale}
                    className="inline-block px-8 py-3 text-white border border-white rounded-full text-lg font-medium transition-all duration-300 hover:bg-white hover:text-neutral-900"
                    aria-label={t("cta")}
                >
                    {t("cta")}
                </Link>
            </div>
        </div>
    );
}
