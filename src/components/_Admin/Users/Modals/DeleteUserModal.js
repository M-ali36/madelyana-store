// /components/_Admin/Users/Modals/DeleteUserModal.js

"use client";

import React, { useState } from "react";
import deleteUser from "../Tools/deleteUser";

export default function DeleteUserModal({ isOpen, closeModal, user, refreshUsers }) {
  if (!isOpen || !user) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    const result = await deleteUser(user.id);

    if (!result.success) {
      setError(result.error);
    } else {
      refreshUsers();
      closeModal();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Delete User</h2>

        <p className="text-sm text-gray-700 mb-4">
          Are you sure you want to delete the user:{" "}
          <span className="font-semibold">{user.name || user.email}</span>?
        </p>

        <p className="text-sm text-red-600 mb-4">
          This action cannot be undone.
        </p>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
