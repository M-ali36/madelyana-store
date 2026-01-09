"use client";

import React from "react";
import { useTranslations } from "next-intl";

/**
 * Users Table UI
 */
export default function UsersTable({
  users,
  loading,
  isSelected,
  toggleUser,
  allSelected,
  selectAll,
  openEditUser,
  openDeleteUser,
  openUserDetails,
  openBulkPasswordReset,
  banUser,
}) {
  const t = useTranslations("admin.users.table");

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border shadow-sm">
      <table className="w-full text-start text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-700">
          <tr>
            <th className="p-3">
              <input
                type="checkbox"
                checked={allSelected(users)}
                onChange={() => selectAll(users)}
                className="h-4 w-4"
              />
            </th>
            <th className="p-3">{t("name")}</th>
            <th className="p-3">{t("email")}</th>
            <th className="p-3">{t("role")}</th>
            <th className="p-3">{t("status")}</th>
            <th className="p-3">{t("created")}</th>
            <th className="p-3 text-right">{t("actions")}</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} className="p-6 text-start text-gray-500">
                {t("loading")}
              </td>
            </tr>
          )}

          {!loading && users.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-start text-gray-500">
                {t("empty")}
              </td>
            </tr>
          )}

          {!loading &&
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b transition hover:bg-gray-50"
              >
                {/* Checkbox */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={isSelected(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="h-4 w-4"
                  />
                </td>

                {/* Name */}
                <td className="p-3 font-medium">
                  {user.fullName || "-"}
                </td>

                {/* Email */}
                <td className="p-3">{user.email}</td>

                {/* Role */}
                <td className="p-3 capitalize">
                  {user.role || t("defaultRole")}
                </td>

                {/* Status */}
                <td className="p-3">
                  {user.isBanned ? (
                    <span className="font-semibold text-red-600">
                      {t("banned")}
                    </span>
                  ) : (
                    <span className="font-semibold text-green-600">
                      {t("active")}
                    </span>
                  )}
                </td>

                {/* Created */}
                <td className="p-3">
                  {user.createdAt?.toDate
                    ? user.createdAt.toDate().toLocaleDateString()
                    : "-"}
                </td>

                {/* Actions */}
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => openUserDetails(user)}
                    className="px-3 py-1 text-blue-600 hover:underline"
                  >
                    {t("details")}
                  </button>

                  <button
                    onClick={() => openEditUser(user)}
                    className="px-3 py-1 text-amber-600 hover:underline"
                  >
                    {t("edit")}
                  </button>

                  <button
                    onClick={() => banUser(user.id, !user.isBanned)}
                    className={`px-3 py-1 ${
                      user.isBanned
                        ? "text-green-600 hover:underline"
                        : "text-red-600 hover:underline"
                    }`}
                  >
                    {user.isBanned ? t("unban") : t("ban")}
                  </button>

                  <button
                    onClick={() => openBulkPasswordReset([user])}
                    className="px-3 py-1 text-purple-600 hover:underline"
                  >
                    {t("reset")}
                  </button>

                  <button
                    onClick={() => openDeleteUser(user)}
                    className="px-3 py-1 text-red-600 hover:underline"
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
