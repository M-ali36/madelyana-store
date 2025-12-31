"use client";

export default function LoadMoreController({ canLoadMore, loadMore }) {
  if (!canLoadMore) return null;

  return (
    <div className="text-center mt-10">
      <button
        onClick={loadMore}
        className="px-6 py-3 border rounded-lg hover:bg-gray-100"
      >
        Load More
      </button>
    </div>
  );
}
