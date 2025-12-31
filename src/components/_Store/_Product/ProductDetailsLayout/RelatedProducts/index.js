export default function RelatedProducts({ products }) {
  if (!products?.length) return null;

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Related Products</h3>

      <div className="grid md:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.id} className="border rounded-xl p-4">
            <img
              src={p.images?.[0]?.url}
              className="rounded-lg mb-3 w-full h-48 object-cover"
            />
            <p className="font-medium">{p.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
