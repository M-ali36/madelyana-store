import Seo from "@/components/Seo";
import { notFound } from "next/navigation";
import {
  fetchStandardContent,
  fetchStandardContents,
} from "@/lib/contentfulClient";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export const revalidate = 600;

/**
 * 🔹 Generate all policy routes statically:
 * Matches EXACT structure of your Category page
 */
export async function generateStaticParams() {
  const locales = ["en", "ar"];
  const pages = await fetchStandardContents("en-US"); // fetch all pages only once

  return locales.flatMap((locale) =>
    pages.map((p) => ({
      locale,
      slug: p.slug,
    }))
  );
}

/**
 * 🔹 Render Policy Page (Same pattern as CategoryPage)
 */
export default async function PolicyPage({ params }) {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;

  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  // Fetch the policy page content
  const data = await fetchStandardContent(slug, normalizedLocale);
  if (!data) return notFound();

  return (
    <>
      {/* ⭐ SEO */}
      <Seo seo={data.seo} type="website" slug={data.slug} locale={locale}/>

      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
          {/* Title */}
          <h1 className="text-4xl lg:text-4xl font-bold text-center mb-16">
            {documentToReactComponents(data.featuredTitle)}
          </h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert content">
            {documentToReactComponents(data.content)}
          </div>
        </div>
      </div>
    </>
  );
}
