"use client";

import { auth, db } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoginTab({ redirectTo = "/" }) {
  const t = useTranslations("login");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError(t("enterEmailPassword"));
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const token = await user.getIdToken(true);
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      let role = "user";
      if (snap.exists()) role = snap.data().role || "user";

      document.cookie = `firebase_id_token=${token}; path=/; max-age=86400; secure`;
      document.cookie = `auth_role=${role}; path=/; max-age=86400; secure`;

      router.replace(redirectTo);
    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") setError(t("emailNotFound"));
      else if (err.code === "auth/wrong-password") setError(t("incorrectPassword"));
      else setError(t("loginFailed"));
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace(redirectTo);
    } catch (err) {
      setError(t("googleFailed"));
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-100 text-red-700 px-4 py-3 text-sm border border-red-300">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-1 text-sm">{t("email")}</label>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 text-sm">{t("password")}</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-2 rounded-md bg-neutral-900 text-white font-medium"
      >
        {loading ? t("loggingIn") : t("login")}
      </button>

      <div className="flex justify-center py-4 text-gray-500 text-sm">
        {t("or")}
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center justify-center gap-2"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          className="w-5 h-5"
        />
        {t("continueGoogle")}
      </button>
    </div>
  );
}
