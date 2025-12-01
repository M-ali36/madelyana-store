// /components/_Admin/Users/Modals/EditUserModal.js

"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import sendPasswordReset from "../Tools/sendPasswordReset";
import banUser from "../Tools/banUser";

export default function EditUserModal({ isOpen, closeModal, user, refreshUsers }) {
  if (!isOpen || !user) return null;

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
  });

  const [loading, setLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /** Save Updates */
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, "users", user.id), {
        name: form.name,
        email: form.email,
        updatedAt: serverTimestamp(),
      });

      refreshUsers();
      closeModal();
    } catch (e) {
      console.error(e);
      setError("Error updating user");
    }
    setLoading(false);
  };

  /** Send Password Reset Email */
  const handleResetPassword = async () => {
    setResetStatus("loading");
    const result = await sendPasswordReset(user.email);

    if (result.success) setResetStatus("success");
    else setResetStatus("error");
  };

  /** Ban or Unban User */
  const toggleBan = async () => {
    await banUser(user.id, !user.isBanned);
    refreshUsers();
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>

        {/* Form */}
        <div className="space-y-3">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="User Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="User Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />

          {/* Ban/Unban */}
          <button
            onClick={toggleBan}
            className={`w-full py-2 rounded-md text-sm mt-3 ${
              user.isBanned
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {user.isBanned ? "Unban User" : "Ban User"}
          </button>

          {/* Password Reset */}
          <button
            onClick={handleResetPassword}
            disabled={resetStatus === "loading"}
            className="w-full py-2 rounded-md text-sm bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300 mt-3"
          >
            {resetStatus === "loading"
              ? "Sending..."
              : "Send Password Reset Email"}
          </button>

          {resetStatus === "success" && (
            <p className="text-green-600 text-sm">Password reset sent!</p>
          )}

          {resetStatus === "error" && (
            <p className="text-red-600 text-sm">
              Failed to send reset email.
            </p>
          )}
        </div>

        {error && <p className="text-red-600 mt-3">{error}</p>}

        {/* Buttons */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
