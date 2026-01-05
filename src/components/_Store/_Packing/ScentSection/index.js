import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export default function ScentSection({ title, description, image }) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-8">{title}</h2>

        <div className="prose dark:prose-invert mx-auto content mb-12">
          {documentToReactComponents(description)}
        </div>

        {image && (
          <img
            src={image.url}
            alt={title}
            className="mx-auto rounded-lg shadow-lg max-h-[400px]"
          />
        )}
      </div>
    </section>
  );
}
