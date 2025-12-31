import { notFound } from "next/navigation";
import {
  fetchCategories,
  fetchProductsByCategory,
} from "@/lib/contentfulClient";

import CategoryProductsLayout from "@/components/_Store/_Category/CategoryProductsLayout";
import MainBanner from "@/components/_Store/_Category/MainBanner";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export const revalidate = 60;

/**
 * 🔹 Generate all category routes statically:
 * /en/women
 * /en/men
 * /ar/women
 * /ar/men
 */
export async function generateStaticParams() {
  const locales = ["en", "ar"];
  const categories = await fetchCategories("en-US");

  return locales.flatMap((locale) =>
    categories.map((cat) => ({
      locale,
      category_slug: cat.slug,
    }))
  );
}

/**
 * 🔹 Render Category Page
 */
export default async function CategoryPage({ params }) {
  // ⛳ IMPORTANT: await params fixes the Promise issue in Windows/WAMP setups
  const resolvedParams = await params;
  const { locale, category_slug } = resolvedParams;

  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  // Fetch categories from Contentful
  const categories = await fetchCategories(normalizedLocale);

  // Match the category using slug
  const category = categories.find((c) => c.slug === category_slug);

  if (!category) return notFound();

  // Fetch products only for this category
  const products = await fetchProductsByCategory(category.id, normalizedLocale);

  return (
    <>
      {/* Category Hero Banner */}
      <MainBanner
        image={category.mainBanner}
        title={category.title}
        featuredTitle={category.featuredTitle}
        descriptions={
          category.description
            ? documentToReactComponents(category.description)
            : null
        }
      />

      {/* Products Grid */}
      <section className="container mx-auto px-6 py-16">
        <CategoryProductsLayout products={products} />
      </section>
    </>
  );
}
