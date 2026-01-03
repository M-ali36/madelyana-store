// /components/_Admin/Users/Modals/BulkPasswordResetModal.js

"use client";

import React, { useState } from "react";
import sendPasswordReset from "../Tools/sendPasswordReset";

export default function BulkPasswordResetModal({ isOpen, closeModal, users }) {
  if (!isOpen || !users || users.length === 0) return null;

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleBulkReset = async () => {
    setLoading(true);
    const resultList = [];

    for (const u of users) {
      const result = await sendPasswordReset(u.email);
      resultList.push({
        email: u.email,
        success: result.success,
        error: result.error,
      });
    }

    setResults(resultList);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold text-purple-600 mb-4">
          Bulk Password Reset
        </h2>

        <p className="text-sm text-gray-700 mb-4">
          A password reset email will be sent to{" "}
          <strong>{users.length}</strong> users:
        </p>

        <div className="max-h-40 overflow-y-auto border p-3 rounded-md bg-gray-50 text-sm mb-4">
          {users.map((u) => (
            <p key={u.id} className="text-gray-600">
              • {u.email}
            </p>
          ))}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold mb-2">Results</h3>
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {results.map((r, i) => (
                <p
                  key={i}
                  className={r.success ? "text-green-600" : "text-red-600"}
                >
                  {r.success
                    ? `✓ Reset sent to ${r.email}`
                    : `✗ Failed for ${r.email}: ${r.error}`}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Close
          </button>

          <button
            onClick={handleBulkReset}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300"
          >
            {loading ? "Sending..." : "Send Reset Emails"}
          </button>
        </div>
      </div>
    </div>
  );
}
