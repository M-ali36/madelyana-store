"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { db } from "@/lib/firebaseClient";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import sendPasswordReset from "../Tools/sendPasswordReset";
import banUser from "../Tools/banUser";

export default function EditUserModal({
  isOpen,
  closeModal,
  user,
  refreshUsers,
}) {
  const t = useTranslations("admin.users.edit");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);
  const [errorKey, setErrorKey] = useState(null);

  // ✅ EARLY RETURN AFTER HOOKS
  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /** Save Updates */
  const handleSave = async () => {
    try {
      setLoading(true);
      setErrorKey(null);

      await updateDoc(doc(db, "users", user.id), {
        name: form.name,
        email: form.email,
        updatedAt: serverTimestamp(),
      });

      refreshUsers();
      closeModal();
    } catch (e) {
      console.error(e);
      setErrorKey("errors.updateFailed");
    }

    setLoading(false);
  };

  /** Send Password Reset Email */
  const handleResetPassword = async () => {
    setResetStatus("loading");

    const result = await sendPasswordReset(user.email);
    setResetStatus(result.success ? "success" : "error");
  };

  /** Ban or Unban User */
  const toggleBan = async () => {
    await banUser(user.id, !user.isBanned);
    refreshUsers();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">
          {t("title")}
        </h2>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder={t("fields.name")}
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border px-4 py-2"
          />

          <input
            type="email"
            name="email"
            placeholder={t("fields.email")}
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border px-4 py-2"
          />

          {/* Ban / Unban */}
          <button
            onClick={toggleBan}
            className={`mt-3 w-full rounded-md py-2 text-sm text-white ${
              user.isBanned
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {user.isBanned ? t("actions.unban") : t("actions.ban")}
          </button>

          {/* Password Reset */}
          <button
            onClick={handleResetPassword}
            disabled={resetStatus === "loading"}
            className="mt-3 w-full rounded-md bg-purple-600 py-2 text-sm text-white hover:bg-purple-700 disabled:bg-purple-300"
          >
            {resetStatus === "loading"
              ? t("actions.sending")
              : t("actions.resetPassword")}
          </button>

          {resetStatus === "success" && (
            <p className="text-sm text-green-600">
              {t("messages.resetSuccess")}
            </p>
          )}

          {resetStatus === "error" && (
            <p className="text-sm text-red-600">
              {t("messages.resetFailed")}
            </p>
          )}
        </div>

        {errorKey && (
          <p className="mt-3 text-sm text-red-600">
            {t(errorKey)}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={closeModal}
            disabled={loading}
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            {t("actions.cancel")}
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? t("actions.saving") : t("actions.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
