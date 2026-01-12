import Seo from "@/components/Seo";
import { notFound } from "next/navigation";
import { fetchYourRightsPage } from "@/lib/contentfulClient";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export const revalidate = 60;

export default async function YourRightsPage(props) {
  const { locale } = await props.params;
  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  const data = await fetchYourRightsPage(normalizedLocale);
  if (!data) return notFound();

  return (
    <>
      <Seo seo={data.seo} type="website" slug={data.slug} locale={locale}/>
      <div className="w-full">

        <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
          <h1 className="text-4xl lg:text-4xl font-bold text-center mb-16">
            {documentToReactComponents(data.featuredTitle)}
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert content">
            {documentToReactComponents(data.content)}
          </div>
        </div>
      </div>
    </>
  );
}
