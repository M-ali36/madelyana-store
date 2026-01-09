"use client";

import React from "react";
import { useTranslations } from "next-intl";
import exportToCsv from "../Tools/exportToCsv";

/**
 * ExportButton component
 *
 * Props:
 * - users (array) => exports the entire dataset currently displayed
 */
export default function ExportButton({ users }) {
  const t = useTranslations("admin.users.export");

  return (
    <button
      onClick={() =>
        exportToCsv({
          users,
          t,
          filename: "users_export.csv",
        })
      }
      className="mt-4 rounded-md border border-blue-400 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
    >
      {t("all")}
    </button>
  );
}
