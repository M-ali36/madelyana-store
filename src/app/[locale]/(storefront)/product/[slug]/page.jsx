import { notFound } from "next/navigation";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchProducts,
} from "@/lib/contentfulClient";

import ProductDetailsLayout from "@/components/_Store/_Product/ProductDetailsLayout";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export const revalidate = 60;

/**
 * -------------------------------------------------------------
 * GENERATE STATIC PARAMS
 * -------------------------------------------------------------
 */
export async function generateStaticParams() {
  const locales = ["en", "ar"];
  const products = await fetchProducts("en-US");

  return locales.flatMap((locale) =>
    products.map((p) => ({
      locale,
      slug: p.slug, // because folder = [slug]
    }))
  );
}

/**
 * -------------------------------------------------------------
 * PRODUCT PAGE
 * -------------------------------------------------------------
 */
export default async function ProductPage({ params }) {
  // Ensure stability on Windows/WAMP
  const resolved = await params;
  const { locale, slug } = resolved;

  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  // Fetch main product
  const product = await fetchProductBySlug(slug, normalizedLocale);
  if (!product) return notFound();

  // Related products by category
  const related = await fetchRelatedProducts(product.categoryId, normalizedLocale);

  return (
    <>
      <section className="container mx-auto">
        <ProductDetailsLayout product={product} related={related} />
      </section>
    </>
  );
}
