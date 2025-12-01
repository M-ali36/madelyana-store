// /components/_Admin/Users/Modals/BulkBanModal.js

"use client";

import React, { useState } from "react";
import banUser from "../Tools/banUser";

export default function BulkBanModal({ isOpen, closeModal, users, ban, refreshUsers }) {
  if (!isOpen || !users || users.length === 0) return null;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const actionLabel = ban ? "Ban Users" : "Unban Users";
  const actionColor = ban ? "text-red-600" : "text-green-600";
  const buttonColor = ban
    ? "bg-red-600 hover:bg-red-700"
    : "bg-green-600 hover:bg-green-700";

  const handleBulkBan = async () => {
    setLoading(true);
    setErrors([]);

    const errorList = [];

    for (const u of users) {
      const result = await banUser(u.id, ban);
      if (!result.success) {
        errorList.push({
          id: u.id,
          email: u.email,
          error: result.error,
        });
      }
    }

    setErrors(errorList);

    if (errorList.length === 0) {
      refreshUsers();
      closeModal();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className={`text-xl font-semibold mb-4 ${actionColor}`}>
          {actionLabel}
        </h2>

        <p className="text-sm text-gray-700 mb-4">
          You are about to <strong>{ban ? "ban" : "unban"}</strong> 
          {" "}
          <strong>{users.length}</strong> users.
        </p>

        <div className="max-h-40 overflow-y-auto border p-3 rounded-md bg-gray-50 text-sm mb-4">
          {users.map((u) => (
            <p key={u.id} className="text-gray-600">
              • {u.email}
            </p>
          ))}
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 p-3 rounded-md text-sm text-red-700 mb-3">
            <p className="font-semibold mb-1">Some operations failed:</p>
            {errors.map((e) => (
              <p key={e.id}>
                {e.email}: {e.error}
              </p>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleBulkBan}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${buttonColor} disabled:bg-opacity-50`}
          >
            {loading ? `${ban ? "Banning..." : "Unbanning..."}` : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
