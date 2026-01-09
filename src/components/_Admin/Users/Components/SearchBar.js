"use client";

import React from "react";
import { useTranslations } from "next-intl";

export default function SearchBar({
  searchValue,
  setSearchValue,
  clearSearch,
}) {
  const t = useTranslations("admin.users.searchForm");

  return (
    <div className="mt-4 mb-2 flex items-center gap-3">
      <input
        type="text"
        placeholder={t("placeholder")}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="flex-1 rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {searchValue && (
        <button
          onClick={clearSearch}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
        >
          {t("clear")}
        </button>
      )}
    </div>
  );
}
