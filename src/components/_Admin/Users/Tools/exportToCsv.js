// /components/_Admin/Users/Tools/exportToCsv.js

/**
 * Converts an array of user objects to CSV
 * and triggers a download in the browser.
 *
 * @param {Array} users - Users list
 * @param {string} filename - Name of the CSV file
 */
export default function exportToCsv(users = [], filename = "users_export.csv") {
  if (!users.length) return;

  // Define the CSV columns
  const headers = [
    "ID",
    "Name",
    "Email",
    "Role",
    "Is Banned",
    "Total Orders",
    "Completed Orders",
    "Total Spent",
    "Created At",
    "Last Login",
    "Last Order Date",
  ];

  // Convert users to CSV rows
  const rows = users.map((u) => [
    u.id || "",
    u.name || "",
    u.email || "",
    u.role || "",
    u.isBanned ? "Yes" : "No",
    u.totalOrders ?? 0,
    u.completedOrders ?? 0,
    u.totalSpent ?? 0,
    u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : "",
    u.lastLogin?.toDate ? u.lastLogin.toDate().toISOString() : "",
    u.lastOrderDate?.toDate ? u.lastOrderDate.toDate().toISOString() : "",
  ]);

  // Escape CSV values
  const escapeCsv = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  // Build CSV content
  const csvContent = [
    headers.map(escapeCsv).join(","), // header row
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  // Convert to Blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a temporary link to download the CSV
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
