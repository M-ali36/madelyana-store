import { fetchHomePage } from "@/lib/contentfulClient";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import ProductCarouselStatic from "@/components/ContentTypes/ProductSlider";

export const revalidate = 60; 
// ISR enabled → page regenerates every 60 seconds

export default async function Home() {
  const homepage = await fetchHomePage();


  if (!homepage) return <p>No homepage found.</p>;

  return (
    <div className="w-full">

      {/* MAIN BANNER */}
      {homepage.mainBanner && (
        <div className="relative w-full h-[420px] mb-10">
          <Image
            src={homepage.mainBanner}
            alt={homepage.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="px-6 max-w-5xl mx-auto">

        {/* FEATURED TITLE (Rich Text) */}
        <section className="my-8">
          <div className="prose max-w-none">
            {documentToReactComponents(homepage.featuredTitle)}
          </div>
        </section>

        {/* LATEST PRODUCTS (SSG + dynamic component) */}
        {homepage.latestProducts.length > 0 && (
          <section className="my-12">
            <h2 className="text-2xl font-bold mb-4">Latest Products</h2>

            <ProductCarouselStatic products={homepage.latestProducts} />
          </section>
        )}

      </div>
    </div>
  );
}
