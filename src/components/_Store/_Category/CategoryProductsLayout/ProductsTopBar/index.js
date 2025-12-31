"use client";

import { HiChevronUp, HiChevronDown } from "react-icons/hi";

export default function ProductsTopBar({ sort, setSort, sortDir, setSortDir }) {
  const toggleDirection = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex items-center justify-end mb-6 gap-3">
      {/* Sorting */}
      <div className="flex items-center gap-2">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="default">Default</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="newest">Newest</option>
        </select>

        {/* Sorting Direction Toggle */}
        <button
          onClick={toggleDirection}
          className="
            border rounded px-3 py-2 
            flex items-center justify-center
            hover:bg-gray-100 transition
          "
        >
          {sortDir === "asc" ? (
            <HiChevronUp className="text-xl" />
          ) : (
            <HiChevronDown className="text-xl" />
          )}
        </button>
      </div>
    </div>
  );
}
