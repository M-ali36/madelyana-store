import { notFound } from "next/navigation";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

import {
  fetchArticles,
  fetchArticleBySlug,
  fetchRelatedArticles,
} from "@/lib/contentfulClient";

import Seo from "@/components/Seo";
import LatestArticles from "@/components/LatestArticles";
import MainBanner from "@/components/_Store/_Article/MainBanner";
import ArticleContent from "@/components/_Store/_Article/Content";
import ArticleMeta from "@/components/_Store/_Article/ArticleMeta";

export const revalidate = false; // best

/**
 * 🔹 Generate all article routes statically
 */
export async function generateStaticParams() {
  const locales = ["en", "ar"];
  const articles = await fetchArticles("en-US");

  return locales.flatMap((locale) =>
    articles.map((a) => ({
      locale,
      article_slug: a.slug,
    }))
  );
}

/**
 * 🔹 Article Page Component
 */
export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const { locale, article_slug } = resolvedParams;

  const normalizedLocale = locale === "ar" ? "ar" : "en-US";

  // Fetch Article
  const article = await fetchArticleBySlug(article_slug, normalizedLocale);
  if (!article) return notFound();

  // Fetch Related Articles using tag
  const relatedArticles = await fetchRelatedArticles(article.tag, normalizedLocale);

  return (
    <>
      {/* ⭐⭐⭐ SEO for Articles ⭐⭐⭐ */}
      <Seo
        type="article"
        slug={article.slug}
        seo={article.seo}
        locale={locale}
        article={{
          title: article.title,
          slug: article.slug,
          image: article.mainBanner,
        }}
      />

      {/* -------------------------- */}
      {/* 🔥 ARTICLE HERO SECTION   */}
      {/* -------------------------- */}
    <MainBanner featuredTitle={article.featuredTitle} image={article.mainBanner}/>
      <ArticleMeta date={article.date} // example "2026-12-31"
            description={article.description} />

      {/* -------------------------- */}
      {/* 🔥 ARTICLE BODY CONTENT    */}
      {/* -------------------------- */}
      <section className="container mx-auto px-4 py-10 prose prose-lg prose-neutral max-w-3xl">
        <ArticleContent content={article.content}/>
      </section>

      {/* -------------------------- */}
      {/* 🔥 RELATED ARTICLES        */}
      {/* -------------------------- */}
      {relatedArticles?.length > 0 && (
          <LatestArticles articles={relatedArticles} locale={locale} title={'Related Insights'} />
      )}
    </>
  );
}
