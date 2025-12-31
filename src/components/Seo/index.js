import { fetchWebsiteConfig } from "@/lib/contentfulClient";

export default async function Seo({ seo, type, slug, product, category }) {
  const config = await fetchWebsiteConfig();

  // -----------------------
  // FALLBACK LOGIC
  // -----------------------
  const finalTitle =
    seo?.metaTitle ||
    config.fallbackSeo.metaTitle ||
    config.siteName;

  const finalDescription =
    seo?.metaDescription ||
    config.fallbackSeo.metaDescription ||
    config.siteDescription;

  const finalImage =
    seo?.metaImage?.fields?.file?.url ||
    config.fallbackSeo.metaImage ||
    config.shareImage ||
    "/default-og.jpg";

  const keywords =
    seo?.keywords ||
    config.fallbackSeo.keywords ||
    [];

  const canonicalUrl = `${config.siteUrl}/${slug}`.replace(/\/+$/, "");

  // -----------------------
  // STRUCTURED DATA
  // -----------------------
  let structuredData = [];

  // 1. Store / Organization Schema (GLOBAL)
  if (config.storeSchema) {
    structuredData.push(config.storeSchema);
  }

  // 2. Breadcrumb Schema
  if (type === "product" || type === "category") {
    const breadcrumb = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": config.siteUrl
      }
    ];

    if (type === "product" && category) {
      breadcrumb.push({
        "@type": "ListItem",
        position: 2,
        name: category.title,
        item: `${config.siteUrl}/${category.slug}`
      });
      breadcrumb.push({
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: canonicalUrl
      });
    }

    if (type === "category") {
      breadcrumb.push({
        "@type": "ListItem",
        position: 2,
        name: category.title,
        item: canonicalUrl
      });
    }

    structuredData.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumb
    });
  }

  // 3. Product Schema
  if (type === "product" && product) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.shortDescription || finalDescription,
      image: product.images.map((i) => i.url),
      sku: product.id,
      brand: {
        "@type": "Brand",
        name: "Madelyana"
      },
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        price: product.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      }
    });
  }

  // 4. Category ItemList Schema
  if (type === "category" && category.products) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: category.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${config.siteUrl}/${p.slug}.html`
      }))
    });
  }

  return (
    <>
      <title>{finalTitle}</title>

      {/* META */}
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords.join(", ")} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OG */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type === "product" ? "product" : "website"} />

      {/* TWITTER */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* STRUCTURED DATA */}
      {structuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
        />
      ))}
    </>
  );
}
