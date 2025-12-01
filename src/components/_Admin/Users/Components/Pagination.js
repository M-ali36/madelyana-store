// /components/_Admin/Users/Components/Pagination.js

"use client";

import React from "react";

export default function Pagination({ page, hasMore, nextPage, prevPage }) {
  return (
    <div className="flex items-center justify-between mt-6">
      {/* Previous */}
      <button
        onClick={prevPage}
        disabled={page === 1}
        className={`px-4 py-2 rounded-md border ${
          page === 1
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        Previous
      </button>

      {/* Page Number */}
      <span className="font-medium text-gray-700 text-sm">
        Page {page}
      </span>

      {/* Next */}
      <button
        onClick={nextPage}
        disabled={!hasMore}
        className={`px-4 py-2 rounded-md border ${
          !hasMore
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        Next
      </button>
    </div>
  );
}
