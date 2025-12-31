import ProductCardRelated from "@/components/products/ProductCardRelated";
import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";

export default function ProductGrid({ products, view, onlyInStock }) {
  const gridCols =
    view === 1
      ? "grid-cols-1"
      : view === 2
      ? "grid-cols-2"
      : view === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {products.map((product, index) => (
        <ProductCardRelated product={product} key={index} />
      ))}
    </div>
  );
}
