import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export default function Hero({ title, subtitle, image }) {
  return (
    <section className="text-center py-20">
      <h1 className="text-4xl lg:text-5xl font-bold mb-4">{title}</h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {subtitle}
      </p>

      {image && (
        <img
          src={image.url}
          alt={title}
          className="mx-auto mt-12 rounded-xl shadow-lg max-h-[420px] object-cover"
        />
      )}
    </section>
  );
}
