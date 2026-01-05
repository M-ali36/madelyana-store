export default function ProductCardMessage({ product }) {
  return (
    <div className="border rounded-lg p-3 flex gap-3">
      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
        {/* product image goes here */}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{product.name}</span>
        <span className="text-gray-600 text-sm">${product.price}</span>
      </div>
    </div>
  );
}
