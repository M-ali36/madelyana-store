import { notFound } from "next/navigation";
import {
  fetchCategories,
  fetchProductsByCategory,
  fetchRelatedCategories,
} from "@/lib/contentfulClient";

import CategoryProductsLayout from "@/components/_Store/_Category/CategoryProductsLayout";
import MainBanner from "@/components/_Store/_Category/MainBanner";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import RelatedCategories from "@/components/_Store/_Category/RelatedCategories";

export const revalidate = 60;

/**
 * 🔹 Generate all category routes statically:
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
  const resolvedParams = await params;
  const { locale, category_slug } = resolvedParams;

  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  // Fetch all categories
  const categories = await fetchCategories(normalizedLocale);

  // Find the current one
  const category = categories.find((c) => c.slug === category_slug);
  if (!category) return notFound();

  // Fetch products
  const products = await fetchProductsByCategory(category.id, normalizedLocale);

  // ⭐ NEW: fetch categories that share the same asset tag
  const relatedCategories = await fetchRelatedCategories(
    category.tag,
    normalizedLocale
  );

  console.log(JSON.stringify(relatedCategories));

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

      <section className="container mx-auto p-4">
        <RelatedCategories categories={relatedCategories} currentSlug={category.slug}  />
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-6 py-4">
        <CategoryProductsLayout products={products}/>
      </section>
    </>
  );
}
