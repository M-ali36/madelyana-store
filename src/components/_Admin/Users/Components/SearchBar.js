// /components/_Admin/Users/Components/SearchBar.js

"use client";

import React from "react";

export default function SearchBar({ searchValue, setSearchValue, clearSearch }) {
  return (
    <div className="flex items-center gap-3 mt-4 mb-2">
      <input
        type="text"
        placeholder="Search users by name, email, UID, role..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {searchValue && (
        <button
          onClick={clearSearch}
          className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Clear
        </button>
      )}
    </div>
  );
}
