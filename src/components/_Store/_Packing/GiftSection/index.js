import AnimatedImage from "@/components/Ui/AnimatedImage";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export default function GiftSection({ title, description, items }) {

    console.log(items)
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-3xl font-semibold text-center mb-8">{title}</h2>

        <div className="mx-auto content mb-12">
          {documentToReactComponents(description)}
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((item) => (
            <div
              key={item.title}
              className="overflow-hidden bg-white rounded-xl shadow hover:shadow-lg transition aspect-video"
            >
              {item.image && (
                <AnimatedImage
                    image={item.image}
                    className="aspect-video"
                    alt={item.title}
                />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
