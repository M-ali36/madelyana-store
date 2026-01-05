import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export default function ExtrasSection({ title, description }) {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">

        <h2 className="text-3xl font-semibold text-center mb-8">{title}</h2>

        <div className="prose dark:prose-invert mx-auto content">
          {documentToReactComponents(description)}
        </div>

      </div>
    </section>
  );
}
