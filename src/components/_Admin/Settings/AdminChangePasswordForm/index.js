"use client";

import { useState } from "react";
import { changeAdminPassword } from "@/lib/firebase/adminAccount";
import { useTranslations } from "next-intl";

export default function AdminChangePasswordForm() {
  const t = useTranslations("AdminChangePassword");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      await changeAdminPassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setErrorMsg(error.message);
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md bg-white p-6 rounded-lg shadow border border-gray-300 space-y-4"
    >
      <h2 className="text-2xl font-semibold">{t("title")}</h2>

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          {t("success")}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">{t("currentPassword")}</label>
        <input
          type="password"
          required
          className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">{t("newPassword")}</label>
        <input
          type="password"
          required
          className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
      >
        {loading ? t("saving") : t("save")}
      </button>
    </form>
  );
}
