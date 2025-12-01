// /components/_Admin/Users/Modals/UserDetailsModal.js

"use client";

import React, { useEffect, useState } from "react";
import getUserStats from "../Tools/getUserStats";

export default function UserDetailsModal({ isOpen, closeModal, user }) {
  if (!isOpen || !user) return null;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /** Load user stats on modal open */
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const result = await getUserStats(user.id);
      if (result.success) {
        setStats(result.stats);
      }
      setLoading(false);
    };

    loadStats();
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">User Details</h2>

        {/* Basic Info */}
        <div className="space-y-2 text-sm mb-4">
          <p><span className="font-semibold">Name:</span> {user.name || "-"}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Role:</span> {user.role}</p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {user.isBanned ? (
              <span className="text-red-600 font-semibold">Banned</span>
            ) : (
              <span className="text-green-600 font-semibold">Active</span>
            )}
          </p>
          <p>
            <span className="font-semibold">Created:</span>{" "}
            {user.createdAt?.toDate
              ? user.createdAt.toDate().toLocaleString()
              : "-"}
          </p>
        </div>

        {/* Stats Section */}
        <h3 className="text-lg font-medium mb-2">Statistics</h3>

        {loading ? (
          <p className="text-gray-500">Loading stats...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Total Orders</p>
              <p className="text-xl font-semibold">{stats.totalOrders}</p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Completed Orders</p>
              <p className="text-xl font-semibold">{stats.completedOrders}</p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Total Spent</p>
              <p className="text-xl font-semibold">
                ${stats.totalSpent.toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Avg Order Value</p>
              <p className="text-xl font-semibold">
                ${stats.averageOrderValue.toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Last Login</p>
              <p className="font-medium">
                {stats.lastLogin?.toDate
                  ? stats.lastLogin.toDate().toLocaleString()
                  : "-"}
              </p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Last Order</p>
              <p className="font-medium">
                {stats.lastOrderDate?.toDate
                  ? stats.lastOrderDate.toDate().toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-red-600">Failed to load stats.</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end mt-6">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
