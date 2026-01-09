"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import deleteUser from "../Tools/deleteUser";

export default function BulkDeleteModal({
  isOpen,
  closeModal,
  users,
  refreshUsers,
}) {
  const t = useTranslations("admin.users.bulkDelete");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // ✅ EARLY RETURN AFTER HOOKS
  if (!isOpen || !users || users.length === 0) return null;

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
        <h2 className="mb-4 text-xl font-semibold text-red-600">
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
            onClick={handleBulkDelete}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? t("actions.deleting") : t("actions.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
