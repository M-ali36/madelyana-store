"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import banUser from "../Tools/banUser";

export default function BulkBanModal({
  isOpen,
  closeModal,
  users,
  ban,
  refreshUsers,
}) {
  const t = useTranslations("admin.users.bulkBan");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // ✅ EARLY RETURN MUST BE AFTER HOOKS
  if (!isOpen || !users || users.length === 0) return null;

  const actionLabel = ban ? t("actions.ban") : t("actions.unban");
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
          messageKey: result.messageKey,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className={`mb-4 text-xl font-semibold ${actionColor}`}>
          {actionLabel}
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

        {errors.length > 0 && (
          <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <p className="mb-1 font-semibold">
              {t("errors.title")}
            </p>
            {errors.map((e) => (
              <p key={e.id}>
                {e.email}: {t(e.messageKey)}
              </p>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={closeModal}
            disabled={loading}
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            {t("actions.cancel")}
          </button>

          <button
            onClick={handleBulkBan}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-white ${buttonColor} disabled:opacity-50`}
          >
            {loading ? t("actions.processing") : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
