import Seo from "@/components/Seo";
import { notFound } from "next/navigation";
import { fetchPackingExperience } from "@/lib/contentfulClient";
import Hero from "@/components/_Store/_Packing/Hero";
import FabricBagSection from "@/components/_Store/_Packing/FabricBagSection";
import GiftSection from "@/components/_Store/_Packing/GiftSection";
import ScentSection from "@/components/_Store/_Packing/ScentSection";
import ExtrasSection from "@/components/_Store/_Packing/ExtrasSection";
import MainBanner from "@/components/_Store/_Packing/MainBanner";

export const revalidate = 3600; // 1 hour


export default async function PackingPage(props) {
  const { locale } = await props.params;
  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  const data = await fetchPackingExperience(normalizedLocale);
  if (!data) return notFound();

  return (
    <>
      <Seo seo={data.seo} type="website" slug={data.slug} />

      <div className="w-full">
        <MainBanner 
            title={data.heroTitle}
            subtitle={data.heroSubtitle}
            image={data.heroImage}
        />

        <FabricBagSection
          title={data.bagTitle}
          description={data.bagDescription}
          images={data.bagImages}
        />

        <GiftSection
          title={data.giftTitle}
          description={data.giftDescription}
          items={data.giftItems}
        />

        {/*
        <ScentSection
          title={data.scentTitle}
          description={data.scentDescription}
          image={data.scentImage}
        />
         */}
         
        <ExtrasSection
          title={data.extrasTitle}
          description={data.extrasList}
        />
      </div>
    </>
  );
}
