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

  // Map into clean objects
  return data.items.map((item) => (item.fields));
}

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

  // Build an asset map for resolving URLs
  const assetMap = {};
  data.includes?.Asset?.forEach((asset) => {
    const id = asset.sys.id;
    const url = asset.fields.file.url.startsWith("//")
      ? "https:" + asset.fields.file.url
      : asset.fields.file.url;

    assetMap[id] = url;
  });

  // Transform entries into clean product objects
  return data.items.map((item) => {
    const f = item.fields;

    // Resolve productImages asset links
    const images =
      f.productImages?.map((img) => assetMap[img.sys.id]) || [];

    return {
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

      // REAL images resolved here
      images: images.filter(Boolean),
    };
  });
}
