import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import AnimatedImage from "@/components/Ui/AnimatedImage";

export default function FabricBagSection({ title, description, images }) {
  if (!images || images.length < 5) {
    console.warn("FabricBagSection expects exactly 5 images.");
  }

  const col1 = images.slice(0, 2);       // first two images
  const col2 = images.slice(2, 3);       // third image
  const col3 = images.slice(3, 5);       // last two images

  return (
    <section className="py-20 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-8">{title}</h2>

        <div className="prose dark:prose-invert mx-auto content mb-12 text-gray-200">
          {documentToReactComponents(description)}
        </div>

        {/* GRID WITH 3 COLUMNS */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

          {/* ⭐ COLUMN 1 — First two images, video aspect ratio */}
          <div className="space-y-6">
            {col1.map((img) => (
              <div key={img.url} className="aspect-video overflow-hidden rounded-lg">
                <AnimatedImage 
                    image={img}
                    alt="Fabric Bag"
                />
              </div>
            ))}
          </div>

          {/* ⭐ COLUMN 2 — Portrait ratio */}
          <div className="space-y-6 flex flex-col justify-center">
            {col2.map((img) => (
              <div key={img.url} className="aspect-[42/50] overflow-hidden rounded-lg">
                <AnimatedImage 
                    image={img}
                    alt="Fabric Bag"
                />
              </div>
            ))}
          </div>

          {/* ⭐ COLUMN 3 — Last two images, video aspect ratio */}
          <div className="space-y-6">
            {col3.map((img) => (
              <div key={img.url} className="aspect-video overflow-hidden rounded-lg">
                <AnimatedImage 
                    image={img}
                    alt="Fabric Bag"
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
