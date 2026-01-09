/**
 * Converts an array of user objects to CSV
 * and triggers a download in the browser.
 *
 * @param {Object} params
 * @param {Array} params.users
 * @param {Function} params.t - next-intl translation function
 * @param {string} params.filename
 */
export default function exportToCsv({
  users = [],
  t,
  filename = "users_export.csv",
}) {
  if (!users.length) {
    return {
      success: false,
      messageKey: "admin.users.errors.noUsersToExport",
    };
  }

  if (typeof t !== "function") {
    console.warn("exportToCsv: translation function (t) missing");
  }

  const headers = [
    t?.("admin.users.csv.id") ?? "ID",
    t?.("admin.users.csv.name") ?? "Name",
    t?.("admin.users.csv.email") ?? "Email",
    t?.("admin.users.csv.role") ?? "Role",
    t?.("admin.users.csv.isBanned") ?? "Is Banned",
    t?.("admin.users.csv.totalOrders") ?? "Total Orders",
    t?.("admin.users.csv.completedOrders") ?? "Completed Orders",
    t?.("admin.users.csv.totalSpent") ?? "Total Spent",
    t?.("admin.users.csv.createdAt") ?? "Created At",
    t?.("admin.users.csv.lastLogin") ?? "Last Login",
    t?.("admin.users.csv.lastOrderDate") ?? "Last Order Date",
  ];

  const rows = users.map((u) => [
    u.id || "",
    u.name || "",
    u.email || "",
    u.role || "",
    u.isBanned
      ? t?.("admin.users.csv.yes") ?? "Yes"
      : t?.("admin.users.csv.no") ?? "No",
    u.totalOrders ?? 0,
    u.completedOrders ?? 0,
    u.totalSpent ?? 0,
    u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : "",
    u.lastLogin?.toDate ? u.lastLogin.toDate().toISOString() : "",
    u.lastOrderDate?.toDate ? u.lastOrderDate.toDate().toISOString() : "",
  ]);

  const escapeCsv = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    messageKey: "admin.users.success.exported",
  };
}
