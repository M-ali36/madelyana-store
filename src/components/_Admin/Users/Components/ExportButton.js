// /components/_Admin/Users/Components/ExportButton.js

"use client";

import React from "react";
import exportToCsv from "../Tools/exportToCsv";

/**
 * ExportButton component
 *
 * Props:
 * - users (array) => exports the entire dataset currently displayed
 */
export default function ExportButton({ users }) {
  return (
    <button
      onClick={() => exportToCsv(users, "users_export.csv")}
      className="px-4 py-2 mt-4 rounded-md text-sm border text-blue-600 border-blue-400 hover:bg-blue-50"
    >
      Export All
    </button>
  );
}
