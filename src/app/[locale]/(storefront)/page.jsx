import { fetchHomePage } from "@/lib/contentfulClient";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import ProductCarouselStatic from "@/components/ContentTypes/ProductSlider";
import { getTranslations } from "next-intl/server";
import Seo from "@/components/Seo";
import Video from "@/components/Ui/Video";
import HomeCategories from "@/components/_Store/_Home/Categories";
import About from "@/components/_Store/_Home/About";
import RelatedProductsSlider from "@/components/products/RelatedProductsSlider";

export const revalidate = 60; 
// ISR enabled → page regenerates every 60 seconds

export default async function Home(props) {
  const { locale } = await props.params;
  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  // 🔥 Load translations (home namespace recommended)
  const t = await getTranslations({ locale, namespace: "home" });

  const homepage = await fetchHomePage(normalizedLocale);

  console.log(JSON.stringify(homepage.aboutUsText) );

  if (!homepage) return <p>{t("no_homepage_found")}</p>;

  return (
    <>
    <Seo
      seo={homepage.seo}
      type="website"
      slug="home"
    />
    <div className="w-full">

      {/* MAIN BANNER */}
      {homepage.videoUrl && (
        <Video vimeoId={homepage.videoUrl} image={homepage.mainBanner} title={homepage.mainTitle} subTitle={homepage.mainSubTitle}/>
      )}

      <HomeCategories title={homepage.servicesTitle} subTitle={homepage.servicesSubTitle} items={homepage.services}/>

      <RelatedProductsSlider title={homepage.latestProductsTitle} subTitle={homepage.latestProductsSubTitle} products={homepage.latestProducts} className="text-white bg-black"/>

      <RelatedProductsSlider title={homepage.onSaleTitle} subTitle={homepage.onSaleSubTitle} products={homepage.onSaleProducts}/>

      <About data={homepage.aboutUsText}/>
      
    </div>
    </>
  );
}
