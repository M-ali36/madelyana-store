// -------------------------------------------------------------
// ENV + BASE URL
// -------------------------------------------------------------
const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN;

const BASE_URL = `https://cdn.contentful.com/spaces/${space}/environments/master`;

// -------------------------------------------------------------
// OLD FUNCTION #1 (KEPT AS-IS)
// Basic product fetch without images or references
// -------------------------------------------------------------
export async function fetchContentfulProducts() {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await res.json();
  return data.items.map((item) => item.fields);
}

// -------------------------------------------------------------
// HELPER: Build Asset Map (url + tag)
// -------------------------------------------------------------
function buildAssetMap(includes) {
  const assetMap = {};

  includes?.Asset?.forEach((asset) => {
    const id = asset.sys.id;

    const url = asset.fields.file.url.startsWith("//")
      ? "https:" + asset.fields.file.url
      : asset.fields.file.url;

    const tag = asset.metadata?.tags?.[0]?.sys?.id || null;

    assetMap[id] = { url, tag };
  });

  return assetMap;
}

// -------------------------------------------------------------
// HELPER: Parse a Single Product Entry
// Converts Contentful entry → your standardized static structure
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
    description: f.description || null,
    shortDescription: f.shortDescription || null,
    colors: f.colors || [],
    sizes: f.sizes || [],
    materials: f.materials || [],
    features: f.features || [],
    category: f.category || null,
    seo: f.seo || null,
    images,

    // Product references
    relatedProducts: f.relatedProducts?.map((ref) => ({
      id: ref.sys.id,
      slug: null,
    })) || [],

    upsellProducts: f.upsellProducts?.map((ref) => ({
      id: ref.sys.id,
      slug: null,
    })) || [],
  };
}

// -------------------------------------------------------------
// HELPER: Fill Slugs for Upsell / Related Product References
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
// OLD FUNCTION #2 (KEPT AS-IS)
// Full product fetch with images (NO references yet)
// -------------------------------------------------------------
export async function fetchContentfulProductsWithImages() {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
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
      description: f.description || null,
      shortDescription: f.shortDescription || null,
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
// NEW FUNCTION #1
// Full product fetch WITH references + image tags
// (This is what your upsell system needs!)
// -------------------------------------------------------------
export async function fetchContentfulProductsFull() {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
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
// NEW FUNCTION #2
// Fetch a single product by slug
// (with images + upsellProducts + relatedProducts)
// -------------------------------------------------------------
export async function fetchContentfulProductBySlug(slug) {
  const res = await fetch(
    `${BASE_URL}/entries?content_type=product&include=10&fields.slug=${slug}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await res.json();
  if (!data.items.length) return null;

  const assetMap = buildAssetMap(data.includes);
  let product = parseProduct(data.items[0], assetMap);

  // Attach slugs for referenced products
  product = fillReferenceSlugs([product], data.includes?.Entry || [])[0];

  return product;
}


// -------------------------------------------------------------
// NEW FUNCTION #3
// fetchUpsellProducts(slugs: string[])
// -------------------------------------------------------------
export async function fetchUpsellProducts(slugs = []) {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];

  const upsellSlugs = new Set();

  // Fetch each product to read its upsellProducts references
  for (const slug of slugs) {
    const product = await fetchContentfulProductBySlug(slug);
    if (!product) continue;

    product.upsellProducts.forEach((ref) => {
      if (ref.slug) upsellSlugs.add(ref.slug);
    });
  }

  // Convert Set to array
  const uniqueSlugs = Array.from(upsellSlugs);

  // Fetch the full product for each upsell slug
  const results = [];
  for (const slug of uniqueSlugs) {
    const p = await fetchContentfulProductBySlug(slug);
    if (p) results.push(p);
  }

  return results;
}
