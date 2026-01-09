"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import sendPasswordReset from "../Tools/sendPasswordReset";

export default function BulkPasswordResetModal({
  isOpen,
  closeModal,
  users,
}) {
  const t = useTranslations("admin.users.bulkReset");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // ✅ EARLY RETURN AFTER HOOKS
  if (!isOpen || !users || users.length === 0) return null;

  const handleBulkReset = async () => {
    setLoading(true);
    const resultList = [];

    for (const u of users) {
      const result = await sendPasswordReset(u.email);
      resultList.push({
        email: u.email,
        success: result.success,
        messageKey: result.messageKey,
      });
    }

    setResults(resultList);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-purple-600">
          {t("title")}
        </h2>

        <p className="mb-4 text-sm text-gray-700">
          {t("description", { count: users.length })}
        </p>

        <div className="mb-4 max-h-40 overflow-y-auto rounded-md border bg-gray-50 p-3 text-sm">
          {users.map((u) => (
            <p key={u.id} className="text-gray-600">
              • {u.email}
            </p>
          ))}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mb-3">
            <h3 className="mb-2 text-sm font-semibold">
              {t("results.title")}
            </h3>

            <div className="max-h-40 space-y-2 overflow-y-auto text-sm">
              {results.map((r, i) => (
                <p
                  key={i}
                  className={r.success ? "text-green-600" : "text-red-600"}
                >
                  {r.success
                    ? t("results.success", { email: r.email })
                    : t("results.failed", {
                        email: r.email,
                        error: t(r.messageKey),
                      })}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={closeModal}
            disabled={loading}
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            {t("actions.close")}
          </button>

          <button
            onClick={handleBulkReset}
            disabled={loading}
            className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:bg-purple-300"
          >
            {loading ? t("actions.sending") : t("actions.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
