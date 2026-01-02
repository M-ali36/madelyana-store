// ---------------------------------------------------------------------------
// ENV + BASE URL
// ---------------------------------------------------------------------------
const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN;

const BASE_URL = `https://cdn.contentful.com/spaces/${space}/environments/master`;

function authHeaders() {
  return {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 60 },
  };
}

// ---------------------------------------------------------------------------
// ASSET MAPPING
// ---------------------------------------------------------------------------
function buildAssetMap(includes) {
  const map = {};

  includes?.Asset?.forEach((asset) => {
    const id = asset.sys.id;
    const file = asset.fields?.file;

    const rawUrl = file?.url || "";
    const url = rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl;

    map[id] = {
      url,
      width: file?.details?.image?.width || null,
      height: file?.details?.image?.height || null,
      blurDataURL: url ? `${url}?w=30&fm=webp` : null,
      tag: asset.metadata?.tags?.[0]?.sys?.id || null,
    };
  });

  return map;
}

// ---------------------------------------------------------------------------
// CATEGORY FETCHERS
// ---------------------------------------------------------------------------
export async function fetchCategories(locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=category&include=10&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items?.length) return [];

  const assetMap = buildAssetMap(data.includes);

  return data.items.map((item) => {
    const f = item.fields;

    let mainBanner = null;
    const bannerId = f.mainBanner?.sys?.id;
    if (bannerId && assetMap[bannerId]) {
      mainBanner = assetMap[bannerId];
    }

    // 🔥 GET TAG FROM CONTENTFUL METADATA
    const tag = item.metadata?.tags?.[0]?.sys?.id || null;

    return {
      id: item.sys.id,
      title: f.title,
      slug: f.slug,
      mainBanner,
      featuredTitle: f.featuredTitle || "",
      description: f.description || null,
      tag, // ⭐ category tag from metadata
    };
  });
}

export async function fetchRelatedCategories(currentTag, locale = "en-US") {
  if (!currentTag) return [];

  const allCategories = await fetchCategories(locale);

  // Filter by matching tag and exclude the current category itself
  return allCategories.filter(
    (cat) => cat.tag === currentTag
  );
}

export async function fetchCategoryBySlug(slug, locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=category&fields.slug=${slug}&include=10&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items?.length) return null;

  const item = data.items[0];
  const f = item.fields;

  const assetMap = buildAssetMap(data.includes);

  let mainBanner = null;
  const bannerId = f.mainBanner?.sys?.id;
  if (bannerId && assetMap[bannerId]) {
    mainBanner = assetMap[bannerId];
  }

  return {
    id: item.sys.id,
    title: f.title,
    slug: f.slug,
    mainBanner,
    featuredTitle: f.featuredTitle || "",
    description: f.description || null,
  };
}

// ---------------------------------------------------------------------------
// PRODUCT PARSING
// ---------------------------------------------------------------------------
function parseProduct(entry, assetMap) {
  const f = entry.fields;

  const images =
    f.productImages
      ?.map((ref) => {
        const asset = assetMap[ref.sys.id];
        return asset ? { url: asset.url, tag: asset.tag } : null;
      })
      .filter(Boolean) || [];

  return {
    id: entry.sys.id,
    slug: f.slug,
    title: f.title,
    price: f.price || 0,
    description: f.description || "",
    shortDescription: f.shortDescription || "",
    colors: f.colors || [],
    sizes: f.sizes || [],
    materials: f.materials || [],
    features: f.features || [],
    categoryId: f.category?.sys?.id || null,
    seo: f.seo || null,
    images,
    relatedProducts:
      f.relatedProducts?.map((r) => ({ id: r.sys.id, slug: null })) || [],
    upsellProducts:
      f.upsellProducts?.map((r) => ({ id: r.sys.id, slug: null })) || [],
  };
}

function fillReferenceSlugs(products, entries) {
  const map = {};
  entries?.forEach((e) => {
    map[e.sys.id] = e.fields.slug;
  });

  return products.map((p) => ({
    ...p,
    relatedProducts: p.relatedProducts.map((r) => ({
      ...r,
      slug: map[r.id] || null,
    })),
    upsellProducts: p.upsellProducts.map((r) => ({
      ...r,
      slug: map[r.id] || null,
    })),
  }));
}

/**
 * Map full product cards from Contentful refs using includes.Entry + assetMap
 * (Used by fetchProductBySlug to return full relatedProducts/upsellProducts)
 */
function mapProductsFromRefs(refs = [], entryMap, assetMap) {
  return (
    refs
      ?.map((ref) => entryMap?.[ref?.sys?.id])
      ?.map((prod) => {
        if (!prod) return null;

        const pf = prod.fields;

        const images =
          pf.productImages
            ?.map((imgRef) => {
              const asset = assetMap[imgRef.sys.id];
              return asset ? { url: asset.url, tag: asset.tag } : null;
            })
            ?.filter(Boolean) || [];

        return {
          id: prod.sys.id,
          slug: pf.slug,
          title: pf.title,
          price: pf.price || 0,
          images,
          shortDescription: pf.shortDescription || "",
          description: pf.description || "",
        };
      })
      ?.filter(Boolean) || []
  );
}

// ---------------------------------------------------------------------------
// FETCH PRODUCTS BY CATEGORY
// ---------------------------------------------------------------------------
export async function fetchProductsByCategory(categoryId, locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10&fields.category.sys.id=${categoryId}&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items?.length) return [];

  const assetMap = buildAssetMap(data.includes);

  let products = data.items.map((e) => parseProduct(e, assetMap));

  products = fillReferenceSlugs(products, data.includes?.Entry);

  return products;
}

// ---------------------------------------------------------------------------
// FETCH ALL PRODUCTS (FOR generateStaticParams)
// ---------------------------------------------------------------------------
export async function fetchProducts(locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=0&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  return data.items.map((item) => ({
    id: item.sys.id,
    slug: item.fields.slug,
  }));
}

// ---------------------------------------------------------------------------
// FETCH RELATED PRODUCTS
// ---------------------------------------------------------------------------
export async function fetchRelatedProducts(categoryId, locale = "en-US") {
  const list = await fetchProductsByCategory(categoryId, locale);
  return list.slice(0, 12);
}

// ---------------------------------------------------------------------------
// FETCH PRODUCT BY SLUG
// ---------------------------------------------------------------------------
export async function fetchProductBySlug(slug, locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&fields.slug=${slug}&include=10&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items?.length) return null;

  const assetMap = buildAssetMap(data.includes);

  // Build entryMap for included entries (id -> entry)
  const entryMap = {};
  data.includes?.Entry?.forEach((e) => {
    entryMap[e.sys.id] = e;
  });

  const productEntry = data.items[0];

  // Base product (keeps your current normalized shape)
  const product = parseProduct(productEntry, assetMap);

  // ✅ Full mapping for relatedProducts / upsellProducts (instead of only {id, slug})
  const relatedProducts = mapProductsFromRefs(
    productEntry.fields?.relatedProducts || [],
    entryMap,
    assetMap
  );

  const upsellProducts = mapProductsFromRefs(
    productEntry.fields?.upsellProducts || [],
    entryMap,
    assetMap
  );

  return {
    ...product,
    relatedProducts,
    upsellProducts,
  };
}

// ---------------------------------------------------------------------------
// FETCH ALL SLUGS (for SSG indexing if needed)
// ---------------------------------------------------------------------------
export async function fetchAllSlugs(locale = "en-US") {
  const [categories, products] = await Promise.all([
    fetchCategories(locale),
    fetchProducts(locale),
  ]);

  return {
    categorySlugs: categories.map((c) => c.slug),
    productSlugs: products.map((p) => p.slug),
  };
}

// ---------------------------------------------------------------------------
// FETCH PRODUCTS BY MULTIPLE SLUGS
// ---------------------------------------------------------------------------
export async function fetchProductsBySlugs(slugs = [], locale = "en-US") {
  if (!slugs.length) return [];

  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10&fields.slug[in]=${slugs.join(
      ","
    )}&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  const assetMap = buildAssetMap(data.includes);

  let products = data.items.map((e) => parseProduct(e, assetMap));

  return fillReferenceSlugs(products, data.includes?.Entry);
}

// ---------------------------------------------------------------------------
// FETCH UPSELL PRODUCTS
// ---------------------------------------------------------------------------
export async function fetchUpsellProducts(slugs = []) {
  if (!slugs.length) return [];

  const result = [];

  for (const slug of slugs) {
    const p = await fetchProductBySlug(slug);
    if (!p) continue;

    for (const ref of p.upsellProducts) {
      if (ref.slug) {
        const full = await fetchProductBySlug(ref.slug);
        if (full) result.push(full);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// HOMEPAGE FETCHER
// ---------------------------------------------------------------------------
export async function fetchHomePage(locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=homePage&include=10&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items?.length) return null;

  const entry = data.items[0];
  const f = entry.fields;

  const assetMap = buildAssetMap(data.includes);

  const entryMap = {};
  data.includes?.Entry?.forEach((e) => {
    entryMap[e.sys.id] = e;
  });

  // -------------------------
  // MAIN BANNER
  // -------------------------
  let mainBanner = null;
  const bannerId = f.mainBanner?.sys?.id;
  if (bannerId && assetMap[bannerId]) {
    mainBanner = assetMap[bannerId].url;
  }

  // -------------------------
  // PRODUCTS HELPERS
  // -------------------------
  function mapProducts(list) {
    return (
      list
        ?.map((ref) => entryMap[ref.sys.id])
        ?.map((prod) => {
          if (!prod) return null;

          const pf = prod.fields;

          const images =
            pf.productImages
              ?.map((imgRef) => {
                const asset = assetMap[imgRef.sys.id];
                return asset ? { url: asset.url, tag: asset.tag } : null;
              })
              ?.filter(Boolean) || [];

          return {
            id: prod.sys.id,
            slug: pf.slug,
            title: pf.title,
            price: pf.price,
            images,
            description: pf.description || "",
            shortDescription: pf.shortDescription || "",
          };
        })
        ?.filter(Boolean) || []
    );
  }

  const latestProducts = mapProducts(f.latestProducts);
  const onSaleProducts = mapProducts(f.onSaleProducts);

  // -------------------------
  // SERVICES MAPPER (UPDATED)
  // -------------------------
  function mapService(serviceRef) {
    if (!serviceRef?.sys?.id) return null;
    const entry = entryMap[serviceRef.sys.id];
    if (!entry) return null;

    const sf = entry.fields;

    // Map link entry
    let link = null;
    if (sf.link?.sys?.id) {
      const linkEntry = entryMap[sf.link.sys.id];
      if (linkEntry) {
        link = {
          title: linkEntry.fields?.title || "",
          url: linkEntry.fields?.url || "",
        };
      }
    }

    // Map image asset
    let image = null;
    if (sf.image?.sys?.id && assetMap[sf.image.sys.id]) {
      image = {
        url: assetMap[sf.image.sys.id].url,
      };
    }

    return {
      title: sf.title || "",
      content: sf.content || null, // RichText
      subContent: sf.subContent || null, // RichText
      link,
      image,
    };
  }

  const services = (f.services || []).map(mapService).filter(Boolean);

  // -------------------------
  // ABOUT US (UPDATED)
  // -------------------------
  let aboutUsText = null;

  if (f.aboutUsText?.sys?.id) {
    const aboutEntry = entryMap[f.aboutUsText.sys.id];
    if (aboutEntry) {
      const af = aboutEntry.fields;

      // Map link
      let link = null;
      if (af.link?.sys?.id) {
        const linkEntry = entryMap[af.link.sys.id];
        if (linkEntry) {
          link = {
            title: linkEntry.fields?.title || "",
            url: linkEntry.fields?.url || "",
          };
        }
      }

      // Map image
      let image = null;
      if (af.image?.sys?.id && assetMap[af.image.sys.id]) {
        image = {
          url: assetMap[af.image.sys.id].url,
        };
      }

      aboutUsText = {
        title: af.title || "",
        content: af.content || null,
        link,
        image,
      };
    }
  }

  // -------------------------
  // FINAL RETURN
  // -------------------------
  return {
    id: entry.sys.id,
    title: f.title,
    slug: f.slug,
    seo: entryMap[f.seo?.sys?.id]?.fields || null,

    mainBanner,
    videoUrl: f.videoUrl || null,
    mainSubTitle: f.mainSubTitle || "",
    mainTitle: f.mainTitle || "",

    servicesTitle: f.servicesTitle || "",
    servicesSubTitle: f.servicesSubTitle || "",
    services,

    latestProductsTitle: f.latestProductsTitle || "",
    latestProductsSubTitle: f.latestProductsSubTitle || "",
    latestProducts,

    onSaleTitle: f.onSaleTitle || "",
    onSaleSubTitle: f.onSaleSubTitle || "",
    onSaleProducts,

    aboutUsText,

    latestArticlesTitle: f.latestArticlesTitle || "",
    latestArticlesSubTitle: f.latestArticlesSubTitle || "",

    featuredTitle: f.featuredTitle || "",
  };
}

export async function fetchWebsiteConfig(locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=websiteConfiguration&include=5&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items.length) return null;

  const entry = data.items[0];
  const f = entry.fields;

  const siteSeo = f.defaultSeo?.fields || null;

  return {
    siteName: f.siteName,
    siteUrl: f.siteUrl,
    siteDescription: f.siteDescription,
    fallbackSeo: {
      metaTitle: siteSeo?.metaTitle || f.siteName,
      metaDescription: siteSeo?.metaDescription || f.siteDescription,
      keywords: siteSeo?.keywords || [],
      metaImage: siteSeo?.metaImage?.fields?.file?.url || null,
    },
    logo: f.logo?.fields?.file?.url || null,
    shareImage: f.shareImage?.fields?.file?.url || null,
    socialLinks: f.socialLinks || {},
    contactEmail: f.contactEmail || "",
    contactPhone: f.contactPhone || "",
    address: f.address || "",
    storeSchema: f.storeSchema || null,
  };
}

export async function fetchFooter(locale = "en-US") {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=footer&include=10&locale=${locale}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items?.length) return null;

  const entry = data.items[0];
  const f = entry.fields;

  // Build entry map
  const entryMap = {};
  data.includes?.Entry?.forEach((e) => {
    entryMap[e.sys.id] = e.fields;
  });

  // Helper to map link references
  const mapLinks = (list = []) =>
    list
      .map((ref) => entryMap[ref.sys.id])
      .map((l) => ({
        title: l?.title || "",
        url: l?.url || "",
      }))
      .filter(Boolean);

  // Helper to map social links
  const mapSocialLinks = (list = []) =>
    list
      .map((ref) => entryMap[ref.sys.id])
      .map((l) => ({
        url: l?.url || "",
        icon: l?.icon || "",
      }))
      .filter(Boolean);

  return {
    footerDescription: f.footerDescriptions || "",
    socialLinks: mapSocialLinks(f.socialLinks),

    aboutLinksTitle: f.aboutLinksTitle || "",
    aboutLinks: mapLinks(f.aboutLinks),

    informationTitle: f.informationTitle || "",
    informationLinks: mapLinks(f.informationLinks),

    policyTitle: f.policyTitle || "",
    policyLinks: mapLinks(f.policyLinks),

    copyrights: f.copyrights || "",
  };
}

