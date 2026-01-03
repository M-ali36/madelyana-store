// /components/_Admin/Users/Modals/BulkDeleteModal.js

"use client";

import React, { useState } from "react";
import deleteUser from "../Tools/deleteUser";

export default function BulkDeleteModal({ isOpen, closeModal, users, refreshUsers }) {
  if (!isOpen || !users || users.length === 0) return null;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleBulkDelete = async () => {
    setLoading(true);
    setErrors([]);

    const errorList = [];

    for (const user of users) {
      const result = await deleteUser(user.id);

      if (!result.success) {
        errorList.push({
          id: user.id,
          email: user.email,
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
    <div className="fixed inset-0 bg-neutral-900/40 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Bulk Delete Users
        </h2>

        <p className="text-sm text-gray-700 mb-4">
          You are about to delete <strong>{users.length}</strong> users.  
          This action cannot be undone.
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
            <p className="font-semibold mb-1">Some deletions failed:</p>
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
            onClick={handleBulkDelete}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? "Deleting..." : "Delete All"}
          </button>
        </div>
      </div>
    </div>
  );
}
