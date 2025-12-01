// /components/_Admin/Users/Modals/AddUserModal.js

"use client";

import React, { useState } from "react";
import createUser from "../Tools/createUser";

export default function AddUserModal({ isOpen, closeModal, refreshUsers }) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await createUser(form);

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(true);
      refreshUsers(); // reload user list
      setTimeout(() => {
        closeModal();
      }, 700);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

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

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          />

          {/* Role */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="customer">Customer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Alerts */}
        {error && <p className="text-red-600 mt-3">{error}</p>}
        {success && <p className="text-green-600 mt-3">User created!</p>}

        {/* Buttons */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
