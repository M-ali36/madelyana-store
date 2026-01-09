"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import createUser from "../Tools/createUser";

export default function AddUserModal({ isOpen, closeModal, refreshUsers }) {
  const t = useTranslations("admin.users.add");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [messageKey, setMessageKey] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ EARLY RETURN MUST BE AFTER HOOKS
  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessageKey(null);
    setIsSuccess(false);

    const result = await createUser(form);

    setMessageKey(result.messageKey);
    setIsSuccess(result.success);

    if (result.success) {
      refreshUsers();
      setTimeout(closeModal, 700);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl ">
        <h2 className="text-xl font-semibold">
          {t("title")}
        </h2>

        <div className="mt-4 space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t("fields.name")}
            className="w-full rounded-md border px-4 py-2"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("fields.email")}
            className="w-full rounded-md border px-4 py-2"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("fields.password")}
            className="w-full rounded-md border px-4 py-2"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-md border px-4 py-2"
          >
            <option value="customer">{t("roles.customer")}</option>
            <option value="manager">{t("roles.manager")}</option>
            <option value="admin">{t("roles.admin")}</option>
          </select>
        </div>

        {messageKey && (
          <p className={`mt-3 text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>
            {t(messageKey)}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={closeModal} className="btn-primary">
            {t("actions.cancel")}
          </button>

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? t("actions.creating") : t("actions.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
