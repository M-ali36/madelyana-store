import { notFound } from "next/navigation";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchProducts,
} from "@/lib/contentfulClient";

import Seo from "@/components/Seo";
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
      slug: p.slug,
    }))
  );
}

/**
 * -------------------------------------------------------------
 * PRODUCT PAGE
 * -------------------------------------------------------------
 */
export default async function ProductPage({ params }) {
  const resolved = await params;
  const { locale, slug } = resolved;

  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  // Fetch product
  const product = await fetchProductBySlug(slug, normalizedLocale);
  if (!product) return notFound();

  // Related products by category
  const related = await fetchRelatedProducts(product.categoryId, normalizedLocale);

  return (
    <>
      {/* ⭐⭐⭐ SEO for Product Page ⭐⭐⭐ */}
      <Seo
        type="product"
        slug={product.slug}
        seo={product.seo}
        product={product}
        category={
          product.categoryId
            ? { id: product.categoryId, title: product.categoryTitle, slug: product.categorySlug }
            : null
        }
      />

      <section className="container mx-auto">
        <ProductDetailsLayout product={product} related={related} />
      </section>
    </>
  );
}
