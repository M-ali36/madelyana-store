// /components/_Admin/Users/Components/BulkActions.js

"use client";

import React from "react";
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
  const selectedUsers = users.filter((u) => selected.includes(u.id));
  const disabled = selected.length === 0;

  return (
    <div className="flex items-center gap-3 mt-4">
      {/* Delete */}
      <button
        disabled={disabled}
        onClick={() => openBulkDelete(selectedUsers)}
        className={`px-4 py-2 rounded-md text-sm border ${
          disabled
            ? "cursor-not-allowed text-gray-400 border-gray-300"
            : "text-red-600 border-red-400 hover:bg-red-50"
        }`}
      >
        Bulk Delete
      </button>

      {/* Ban */}
      <button
        disabled={disabled}
        onClick={() => openBulkBan({ users: selectedUsers, ban: true })}
        className={`px-4 py-2 rounded-md text-sm border ${
          disabled
            ? "cursor-not-allowed text-gray-400 border-gray-300"
            : "text-orange-600 border-orange-400 hover:bg-orange-50"
        }`}
      >
        Bulk Ban
      </button>

      {/* Unban */}
      <button
        disabled={disabled}
        onClick={() => openBulkBan({ users: selectedUsers, ban: false })}
        className={`px-4 py-2 rounded-md text-sm border ${
          disabled
            ? "cursor-not-allowed text-gray-400 border-gray-300"
            : "text-green-600 border-green-400 hover:bg-green-50"
        }`}
      >
        Bulk Unban
      </button>

      {/* Password Reset */}
      <button
        disabled={disabled}
        onClick={() => openBulkPasswordReset(selectedUsers)}
        className={`px-4 py-2 rounded-md text-sm border ${
          disabled
            ? "cursor-not-allowed text-gray-400 border-gray-300"
            : "text-purple-600 border-purple-400 hover:bg-purple-50"
        }`}
      >
        Bulk Reset
      </button>

      {/* Export CSV */}
      <button
        disabled={disabled}
        onClick={() => exportToCsv(selectedUsers, "selected_users.csv")}
        className={`px-4 py-2 rounded-md text-sm border ${
          disabled
            ? "cursor-not-allowed text-gray-400 border-gray-300"
            : "text-blue-600 border-blue-400 hover:bg-blue-50"
        }`}
      >
        Export Selected
      </button>
    </div>
  );
}
