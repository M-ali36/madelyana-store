"use client";

import AnimatedImage from "@/components/Ui/AnimatedImage";
import Link from "@/components/Ui/Link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import {
  BLOCKS,
  INLINES,
  MARKS,
} from "@contentful/rich-text-types";
import { useLocale } from "next-intl";

export default function ArticleContent({ content }) {
  if (!content) return null;
  const locale = useLocale();

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text) => (
        <strong className="font-semibold text-neutral-900">{text}</strong>
      ),
      [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
    },

    renderNode: {
      // --------------------------------------------
      // 🔹 HEADINGS
      // --------------------------------------------
      [BLOCKS.HEADING_1]: (node, children) => (
        <h1 className="text-4xl font-bold mt-10 mb-6">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node, children) => (
        <h2 className="text-3xl font-semibold mt-10 mb-4">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node, children) => (
        <h3 className="text-2xl font-semibold mt-8 mb-4">{children}</h3>
      ),

      // --------------------------------------------
      // 🔹 PARAGRAPHS
      // --------------------------------------------
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="leading-relaxed mb-6 text-neutral-800">{children}</p>
      ),

      // --------------------------------------------
      // 🔹 QUOTES
      // --------------------------------------------
      [BLOCKS.QUOTE]: (node, children) => (
        <blockquote className="border-s-4 border-neutral-300 ps-4 italic text-neutral-600 my-6">
          {children}
        </blockquote>
      ),

      // --------------------------------------------
      // 🔹 LISTS
      // --------------------------------------------
      [BLOCKS.UL_LIST]: (node, children) => (
        <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node, children) => <li>{children}</li>,

      // --------------------------------------------
      // 🔹 EMBEDDED ASSETS (Images)
      // --------------------------------------------
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const { file, title } = node.data.target.fields || {};
        if (!file?.url) return null;

        return (
          <div className="my-10 flex justify-center">
            <AnimatedImage
              image={`https:${file.url}`}
              width={file.details?.image?.width}
              height={file.details?.image?.height}
              alt={title || "Article Image"}
              className="rounded-xl"
            />
          </div>
        );
      },

      // --------------------------------------------
      // 🔹 HYPERLINKS
      // --------------------------------------------
      [INLINES.HYPERLINK]: (node, children) => {
        const url = node.data.uri;

        // Internal link → use your custom <Link />
        const isInternal = url.startsWith("/");

        return isInternal ? (
          <Link
            href={url}
            locale={locale}
            className="text-neutral-900 underline underline-offset-4 hover:text-neutral-700 transition"
          >
            {children}
          </Link>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-900 underline underline-offset-4 hover:text-neutral-700 transition"
          >
            {children}
          </a>
        );
      },
    },
  };

  return (
    <div className="prose prose-neutral max-w-none">
      {documentToReactComponents(content, options)}
    </div>
  );
}
