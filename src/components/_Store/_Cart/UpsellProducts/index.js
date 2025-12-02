"use client";

import Link from "next/link";
import Image from "next/image";
import useCurrency from "@/components/hooks/useCurrency";

export default function UpsellProducts({ products }) {
  const { format } = useCurrency();

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">You May Also Like</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/products/${p.slug}`}
            className="border rounded-lg p-3 hover:shadow-md transition"
          >
            {/* Image */}
            <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden">
              <Image
                src={p.mainImage}
                alt={p.title}
                fill
                className="object-cover"
              />
            </div>

            <p className="font-medium text-sm">{p.title}</p>
            <p className="font-bold text-sm mt-1">{format(p.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
