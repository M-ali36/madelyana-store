"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addContactMessage } from "@/lib/firebase/contactMessages";
import Toast from "@/components/Ui/Toast";

export default function ContactForm() {
  const t = useTranslations("contact.form");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addContactMessage(form);
      setToast({ type: "success", text: t("success") });

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (err) {
      setToast({ type: "error", text: t("error") });
    }

    setLoading(false);
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          text={toast.text}
          onClose={() => setToast(null)}
        />
      )}

      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Name */}
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder={t("name")}
            required
            className="form-input"
          />

          {/* Email */}
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder={t("email")}
            required
            className="form-input"
          />

          {/* Phone */}
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder={t("phone")}
            className="form-input"
          />

          {/* Subject (Select) */}
          <select
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            required
            className="form-select"
          >
            <option value="" disabled>
              {t("subject")}
            </option>

            <option value="product">
              {t("subjects.productInquiry")}
            </option>

            <option value="orderStatus">
              {t("subjects.orderStatus")}
            </option>

            <option value="returns">
              {t("subjects.returns")}
            </option>

            <option value="shipping">
              {t("subjects.shipping")}
            </option>

            <option value="wholesale">
              {t("subjects.wholesale")}
            </option>

            <option value="customOrder">
              {t("subjects.customOrder")}
            </option>

            <option value="support">
              {t("subjects.support")}
            </option>

            <option value="other">
              {t("subjects.other")}
            </option>
          </select>
        </div>

        {/* Message */}
        <textarea
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder={t("message")}
          required
          rows={6}
          className="form-textarea mt-4"
        ></textarea>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            mt-6 w-full py-3 
            bg-neutral-900 text-white 
            rounded-xl 
            hover:bg-neutral-700 
            transition 
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "..." : t("submit")}
        </button>
      </form>
    </>
  );
}
