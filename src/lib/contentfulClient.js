// -------------------------------------------------------------
// ENV + BASE URL
// -------------------------------------------------------------
const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN;

const BASE_URL = `https://cdn.contentful.com/spaces/${space}/environments/master`;

function authHeaders() {
  return {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
}

// -------------------------------------------------------------
// OLD FUNCTION #1 (Kept for backward compatibility)
// -------------------------------------------------------------
export async function fetchContentfulProducts() {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product`,
    authHeaders()
  );

  const data = await res.json();
  return data.items.map((item) => item.fields);
}

// -------------------------------------------------------------
// HELPER: Build Asset Map (id → { url, tag })
// -------------------------------------------------------------
function buildAssetMap(includes) {
  const assetMap = {};

  includes?.Asset?.forEach((asset) => {
    const id = asset.sys.id;
    const rawUrl = asset.fields?.file?.url || "";
    const url = rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl;

    const tag = asset.metadata?.tags?.[0]?.sys?.id || null;

    assetMap[id] = { url, tag };
  });

  return assetMap;
}

// -------------------------------------------------------------
// HELPER: Parse a Single Product Entry
// -------------------------------------------------------------
function parseProduct(entry, assetMap) {
  const f = entry.fields;

  const images =
    f.productImages?.map((ref) => {
      const asset = assetMap[ref.sys.id];
      if (!asset) return null;
      return { url: asset.url, tag: asset.tag };
    }).filter(Boolean) || [];

  return {
    id: entry.sys.id,
    title: f.title,
    slug: f.slug,
    description: f.description || "",
    shortDescription: f.shortDescription || "",
    colors: f.colors || [],
    sizes: f.sizes || [],
    materials: f.materials || [],
    features: f.features || [],
    category: f.category || null,
    seo: f.seo || null,
    images,

    relatedProducts:
      f.relatedProducts?.map((ref) => ({
        id: ref.sys.id,
        slug: null,
      })) || [],

    upsellProducts:
      f.upsellProducts?.map((ref) => ({
        id: ref.sys.id,
        slug: null,
      })) || [],
  };
}

// -------------------------------------------------------------
// HELPER: Fill slugs for referenced entries
// -------------------------------------------------------------
function fillReferenceSlugs(products, includesEntries) {
  const entryMap = {};

  includesEntries?.forEach((entry) => {
    entryMap[entry.sys.id] = entry.fields.slug;
  });

  return products.map((p) => ({
    ...p,
    relatedProducts: p.relatedProducts.map((r) => ({
      ...r,
      slug: entryMap[r.id] || null,
    })),
    upsellProducts: p.upsellProducts.map((r) => ({
      ...r,
      slug: entryMap[r.id] || null,
    })),
  }));
}

// -------------------------------------------------------------
// OLD FUNCTION #2 (still works fine)
// -------------------------------------------------------------
export async function fetchContentfulProductsWithImages() {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10`,
    authHeaders()
  );

  const data = await res.json();
  const assetMap = buildAssetMap(data.includes);

  return data.items.map((item) => {
    const f = item.fields;

    const images =
      f.productImages?.map((imgRef) => {
        const asset = assetMap[imgRef.sys.id];
        if (!asset) return null;
        return { url: asset.url, tag: asset.tag };
      }).filter(Boolean) || [];

    return {
      id: item.sys.id,
      title: f.title,
      slug: f.slug,
      description: f.description || "",
      shortDescription: f.shortDescription || "",
      colors: f.colors || [],
      sizes: f.sizes || [],
      materials: f.materials || [],
      features: f.features || [],
      category: f.category || null,
      seo: f.seo || null,
      images,
    };
  });
}

// -------------------------------------------------------------
// NEW FUNCTION #1 — Full Product Fetch + References
// -------------------------------------------------------------
export async function fetchContentfulProductsFull() {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10`,
    authHeaders()
  );

  const data = await res.json();
  const assetMap = buildAssetMap(data.includes);

  let products = data.items.map((entry) =>
    parseProduct(entry, assetMap)
  );

  products = fillReferenceSlugs(products, data.includes?.Entry || []);
  return products;
}

// -------------------------------------------------------------
// NEW FUNCTION #2 — Fetch Single Product by Slug
// -------------------------------------------------------------
export async function fetchContentfulProductBySlug(slug) {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10&fields.slug=${slug}`,
    authHeaders()
  );

  const data = await res.json();
  if (!data.items.length) return null;

  const assetMap = buildAssetMap(data.includes);
  let product = parseProduct(data.items[0], assetMap);

  product = fillReferenceSlugs([product], data.includes?.Entry || [])[0];

  return product;
}

// -------------------------------------------------------------
// NEW FUNCTION #3 — Fetch Upsell Products by Slugs
// -------------------------------------------------------------
export async function fetchUpsellProducts(slugs = []) {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];

  const upsellSlugs = new Set();

  for (const slug of slugs) {
    const product = await fetchContentfulProductBySlug(slug);
    if (!product) continue;

    product.upsellProducts.forEach((ref) => {
      if (ref.slug) upsellSlugs.add(ref.slug);
    });
  }

  const finalSlugs = Array.from(upsellSlugs);

  const results = [];
  for (const slug of finalSlugs) {
    const p = await fetchContentfulProductBySlug(slug);
    if (p) results.push(p);
  }

  return results;
}

// -------------------------------------------------------------
// NEW FUNCTION #4 — Correct version of fetchProductsBySlugs
// (Uses REST API, consistent with everything above)
// -------------------------------------------------------------
export async function fetchProductsBySlugs(slugs = []) {
  if (!slugs.length) return [];

  const slugQuery = slugs.join(",");

  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10&fields.slug[in]=${slugQuery}`,
    authHeaders()
  );

  const data = await res.json();
  const assetMap = buildAssetMap(data.includes);

  let products = data.items.map((entry) =>
    parseProduct(entry, assetMap)
  );

  products = fillReferenceSlugs(products, data.includes?.Entry || []);

  return products;
}

export async function fetchHomePage() {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=homePage&include=10`,
    authHeaders()
  );

  const data = await res.json();

  if (!data.items.length) return null;

  const entry = data.items[0];
  const f = entry.fields;

  // ✔ Use your global & correct buildAssetMap
  const assetMap = buildAssetMap(data.includes);

  // ------- Build entry (product) map ---------
  const entryMap = {};
  data.includes?.Entry?.forEach((e) => {
    entryMap[e.sys.id] = e;
  });

  // ------- Resolve main banner asset ---------
  const bannerId = f.mainBanner?.sys?.id;
  const banner = bannerId ? assetMap[bannerId] : null;

  // ------- Resolve latest products WITH TAGGED IMAGES ---------
  const latestProducts = (f.latestProducts || [])
    .map((ref) => {
      const entryObj = entryMap[ref.sys.id];
      if (!entryObj) return null;

      const pf = entryObj.fields;

      const images =
        pf.productImages?.map((imgRef) => {
          const asset = assetMap[imgRef.sys.id];
          return asset ? { url: asset.url, tag: asset.tag } : null;
        }).filter(Boolean) || [];

      return {
        id: entryObj.sys.id,
        slug: pf.slug,
        title: pf.title,
        price: pf.price,
        images,
        description: pf.description || "",
        shortDescription: pf.shortDescription || "",
      };
    })
    .filter(Boolean);


  return {
    entry: entry,
    title: f.title,
    slug: f.slug,
    seo: entryMap[f.seo?.sys?.id]?.fields || null,
    mainBanner: banner?.url || null,
    featuredTitle: f.featuredTitle,
    latestProducts,
  };
}