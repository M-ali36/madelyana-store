"use client";

import React from "react";
import { useTranslations } from "next-intl";
import exportToCsv from "../Tools/exportToCsv";

/**
 * Bulk actions bar
 *
 * Props:
 * - selected (array of user IDs)
 * - users (full list to map selected IDs into user objects)
 * - openBulkDelete (fn)
 * - openBulkBan (fn)
 * - openBulkPasswordReset (fn)
 */
export default function BulkActions({
  selected,
  users,
  openBulkDelete,
  openBulkBan,
  openBulkPasswordReset,
}) {
  const t = useTranslations("admin.users.bulkActions");

  const selectedUsers = users.filter((u) => selected.includes(u.id));
  const disabled = selected.length === 0;

  return (
    <div className="mt-4 flex items-center gap-3">
      {/* Delete */}
      <button
        disabled={disabled}
        onClick={() => openBulkDelete(selectedUsers)}
        className={`rounded-md border px-4 py-2 text-sm ${
          disabled
            ? "cursor-not-allowed border-gray-300 text-gray-400"
            : "border-red-400 text-red-600 hover:bg-red-50"
        }`}
      >
        {t("delete")}
      </button>

      {/* Ban */}
      <button
        disabled={disabled}
        onClick={() => openBulkBan({ users: selectedUsers, ban: true })}
        className={`rounded-md border px-4 py-2 text-sm ${
          disabled
            ? "cursor-not-allowed border-gray-300 text-gray-400"
            : "border-orange-400 text-orange-600 hover:bg-orange-50"
        }`}
      >
        {t("ban")}
      </button>

      {/* Unban */}
      <button
        disabled={disabled}
        onClick={() => openBulkBan({ users: selectedUsers, ban: false })}
        className={`rounded-md border px-4 py-2 text-sm ${
          disabled
            ? "cursor-not-allowed border-gray-300 text-gray-400"
            : "border-green-400 text-green-600 hover:bg-green-50"
        }`}
      >
        {t("unban")}
      </button>

      {/* Password Reset */}
      <button
        disabled={disabled}
        onClick={() => openBulkPasswordReset(selectedUsers)}
        className={`rounded-md border px-4 py-2 text-sm ${
          disabled
            ? "cursor-not-allowed border-gray-300 text-gray-400"
            : "border-purple-400 text-purple-600 hover:bg-purple-50"
        }`}
      >
        {t("reset")}
      </button>

      {/* Export CSV */}
      <button
        disabled={disabled}
        onClick={() =>
          exportToCsv({
            users: selectedUsers,
            t,
            filename: "selected_users.csv",
          })
        }
        className={`rounded-md border px-4 py-2 text-sm ${
          disabled
            ? "cursor-not-allowed border-gray-300 text-gray-400"
            : "border-blue-400 text-blue-600 hover:bg-blue-50"
        }`}
      >
        {t("export")}
      </button>
    </div>
  );
}
