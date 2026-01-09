"use client";

import React from "react";
import { useTranslations } from "next-intl";

export default function Pagination({ page, hasMore, nextPage, prevPage }) {
  const t = useTranslations("admin.users.pagination");

  return (
    <div className="mt-6 flex items-center justify-between">
      {/* Previous */}
      <button
        onClick={prevPage}
        disabled={page === 1}
        className={`rounded-md border px-4 py-2 ${
          page === 1
            ? "cursor-not-allowed border-gray-300 text-gray-400"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {t("previous")}
      </button>

      {/* Page Number */}
      <span className="text-sm font-medium text-gray-700">
        {t("page", { page })}
      </span>

      {/* Next */}
      <button
        onClick={nextPage}
        disabled={!hasMore}
        className={`rounded-md border px-4 py-2 ${
          !hasMore
            ? "cursor-not-allowed border-gray-300 text-gray-400"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {t("next")}
      </button>
    </div>
  );
}
