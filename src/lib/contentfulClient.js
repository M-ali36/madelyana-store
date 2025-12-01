/**
 * BASIC product fetch (no images resolved)
 */
export async function fetchContentfulProducts() {
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN;

  const res = await fetch(
    `https://cdn.contentful.com/spaces/${space}/environments/master/entries?content_type=product`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return data.items.map((item) => item.fields);
}



/**
 * FULL product fetch with image tag resolution
 */
export async function fetchContentfulProductsWithImages() {
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN;

  const res = await fetch(
    `https://cdn.contentful.com/spaces/${space}/environments/master/entries?content_type=product&include=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  // ------------------------------
  // BUILD ASSET MAP (url + tags)
  // ------------------------------
  const assetMap = {};
  data.includes?.Asset?.forEach((asset) => {
    const id = asset.sys.id;

    const url = asset.fields.file.url.startsWith("//")
      ? "https:" + asset.fields.file.url
      : asset.fields.file.url;

    // Read tag name: imageMain, imageRed, imageBlack, etc.
    const tag =
      asset.metadata?.tags?.[0]?.sys?.id || null;

    assetMap[id] = {
      url,
      tag,
    };
  });

  // ------------------------------
  // TRANSFORM PRODUCTS
  // ------------------------------
  return data.items.map((item) => {
    const f = item.fields;

    // Map images: [{url, tag}]
    const images =
      f.productImages?.map((imgRef) => {
        const asset = assetMap[imgRef.sys.id];
        if (!asset) return null;
        return {
          url: asset.url,
          tag: asset.tag, // "imageMain", "imageRed", etc.
        };
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

      // NEW IMAGE FORMAT
      images,
    };
  });
}
