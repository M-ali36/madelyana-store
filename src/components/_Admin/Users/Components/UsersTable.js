// /components/_Admin/Users/Components/UsersTable.js

"use client";

import React from "react";

/**
 * Users Table UI
 *
 * Props:
 * - users (array)
 * - loading (boolean)
 * - isSelected (fn)
 * - toggleUser (fn)
 * - allSelected (fn)
 * - selectAll (fn)
 * - openEditUser (fn)
 * - openDeleteUser (fn)
 * - openUserDetails (fn)
 * - openBulkPasswordReset (fn)
 * - banUser (fn)
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
  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm mt-6">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3">
              <input
                type="checkbox"
                checked={allSelected(users)}
                onChange={() => selectAll(users)}
                className="w-4 h-4"
              />
            </th>

            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="7" className="text-center p-6 text-gray-500">
                Loading users...
              </td>
            </tr>
          )}

          {!loading && users.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center p-6 text-gray-500">
                No users found.
              </td>
            </tr>
          )}

          {!loading &&
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* Checkbox */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={isSelected(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4"
                  />
                </td>

                {/* Name */}
                <td className="p-3 font-medium">{user.name || "-"}</td>

                {/* Email */}
                <td className="p-3">{user.email}</td>

                {/* Role */}
                <td className="p-3 capitalize">{user.role || "customer"}</td>

                {/* Status */}
                <td className="p-3">
                  {user.isBanned ? (
                    <span className="text-red-600 font-semibold">Banned</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Active</span>
                  )}
                </td>

                {/* Created At */}
                <td className="p-3">
                  {user.createdAt?.toDate
                    ? user.createdAt.toDate().toLocaleDateString()
                    : "-"}
                </td>

                {/* Actions */}
                <td className="p-3 text-right space-x-2">

                  {/* View Details */}
                  <button
                    onClick={() => openUserDetails(user)}
                    className="px-3 py-1 text-blue-600 hover:underline"
                  >
                    Details
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditUser(user)}
                    className="px-3 py-1 text-amber-600 hover:underline"
                  >
                    Edit
                  </button>

                  {/* Ban/Unban */}
                  <button
                    onClick={() => banUser(user.id, !user.isBanned)}
                    className={`px-3 py-1 ${
                      user.isBanned
                        ? "text-green-600 hover:underline"
                        : "text-red-600 hover:underline"
                    }`}
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </button>

                  {/* Reset Password */}
                  <button
                    onClick={() => openBulkPasswordReset([user])}
                    className="px-3 py-1 text-purple-600 hover:underline"
                  >
                    Reset
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => openDeleteUser(user)}
                    className="px-3 py-1 text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
