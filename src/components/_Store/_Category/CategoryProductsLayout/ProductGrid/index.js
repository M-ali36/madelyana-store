import ProductCardRelated from "@/components/products/ProductCardRelated";
import ProductCardWithVariants from "@/components/products/ProductCardWithVariants";

export default function ProductGrid({ products }) {

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-3 gap-6`}>
      {products.map((product, index) => (
        <ProductCardRelated product={product} key={index} />
      ))}
    </div>
  );
}
