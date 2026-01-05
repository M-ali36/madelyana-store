"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("settingsPage");

  const [userData, setUserData] = useState(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load user settings
  useEffect(() => {
    const loadData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);

        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setEmail(currentUser.email || "");
      }

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="text-gray-600">{t("loading")}</div>;
  }

  // Update profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage("");

    try {
      const currentUser = auth.currentUser;

      await updateDoc(doc(db, "users", currentUser.uid), {
        fullName,
        phone
      });

      setMessage(t("successProfile"));
    } catch (error) {
      console.error(error);
      setMessage(t("failedProfile"));
    }

    setSaving(false);
  };

  // Update email
  const handleChangeEmail = async () => {
    setSaving(true);
    setMessage("");

    try {
      await updateEmail(auth.currentUser, email);
      setMessage(t("successEmail"));
    } catch (error) {
      console.error(error);
      setMessage(t("failedEmail"));
    }

    setSaving(false);
  };

  // Update password
  const handleChangePassword = async () => {
    setSaving(true);
    setMessage("");

    try {
      const currentUser = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      setMessage(t("successPassword"));
      setNewPassword("");
      setCurrentPassword("");
    } catch (error) {
      console.error(error);
      setMessage(t("failedPassword"));
    }

    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {t("title")}
      </h1>

      {message && (
        <div className="mb-4 p-3 rounded-md bg-blue-100 border border-blue-300 text-blue-800 text-sm">
          {message}
        </div>
      )}

      {/* PROFILE INFORMATION */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("profileInfo")}</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">{t("fullName")}</p>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-gray-300 rounded-md px-3 py-2 border"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-1">{t("phone")}</p>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-gray-300 rounded-md px-3 py-2 border"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-gray-800 transition"
          >
            {t("saveChanges")}
          </button>
        </div>
      </div>

      {/* EMAIL */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("changeEmail")}</h2>

        <p className="text-sm text-gray-600 mb-3">
          {t("emailWarning")}
        </p>

        <input
          type="email"
          className="w-full border-gray-300 rounded-md px-3 py-2 border mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleChangeEmail}
          disabled={saving}
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-gray-800 transition"
        >
          {t("updateEmail")}
        </button>
      </div>

      {/* PASSWORD */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{t("changePassword")}</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">{t("currentPassword")}</p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border-gray-300 rounded-md px-3 py-2 border"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-1">{t("newPassword")}</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-gray-300 rounded-md px-3 py-2 border"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-gray-800 transition"
          >
            {t("updatePassword")}
          </button>
        </div>
      </div>
    </div>
  );
}
