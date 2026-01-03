export default function AddToCartButton({ loading, canAddToCart, addToCart }) {
  return (
    <button
      onClick={addToCart}
      disabled={loading || !canAddToCart}
      className="w-full bg-neutral-900 text-white cursor-pointer border border-black py-3 rounded-lg disabled:bg-gray-400 hover:bg-white hover:text-neutral-900 transition-all duration-200"
    >
      {loading ? "Loading…" : "Add to Cart"}
    </button>
  );
}
