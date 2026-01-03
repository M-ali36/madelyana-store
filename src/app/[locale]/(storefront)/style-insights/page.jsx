import { fetchStyleInsights } from "@/lib/contentfulClient";
import Seo from "@/components/Seo";
import Image from "next/image";
import { notFound } from "next/navigation";
import MainBanner from "@/components/_Store/_Insights/MainBanner";
import TikTokSlider from "@/components/_Store/_Insights/TikTokSlider";
import ArticlesList from "@/components/_Store/_Insights/ArticlesList";

export const revalidate = 60;

export default async function StyleInsightsPage(props) {
  const { locale } = await props.params;
  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  const data = await fetchStyleInsights(normalizedLocale);
  if (!data) return notFound();

  return (
    <>
      <Seo seo={data.seo} type="website" slug="style-insights" />

      <div className="w-full">
        <MainBanner image={data.mainBanner} title={data.featuredTitle}/>
        <TikTokSlider title={data.tikTokTitle} subTitle={data.tiktokSubTitle} videos={data.tiktokVideos}/>
        <ArticlesList articles={data.allArticles}/>
      </div>
    </>
  );
}
