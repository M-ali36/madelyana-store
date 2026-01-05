"use client";

import { auth, db } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/Ui/Link";
import { useLocale, useTranslations } from "next-intl";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------
  // Email + Password Login
  // ---------------------------------------------------
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
      if (snap.exists()) {
        role = snap.data().role || "user";
      }

      // Save cookies
      document.cookie = `firebase_id_token=${token}; path=/; max-age=86400; secure`;
      document.cookie = `auth_role=${role}; path=/; max-age=86400; secure`;

      setTimeout(() => {
        router.replace(role === "admin" ? "/admin" : "/customer");
      }, 200);
    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") setError(t("emailNotFound"));
      else if (err.code === "auth/wrong-password") setError(t("incorrectPassword"));
      else setError(t("loginFailed"));
    }

    setLoading(false);
  };

  // ---------------------------------------------------
  // Google Login
  // ---------------------------------------------------
  const handleGoogleLogin = async () => {
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      let role = "user";

      if (!snap.exists()) {
        await setDoc(ref, {
          fullName: user.displayName || "",
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString(),
        });
      } else {
        role = snap.data().role || "user";
      }

      const token = await user.getIdToken(true);

      document.cookie = `firebase_id_token=${token}; path=/; max-age=86400; secure`;
      document.cookie = `auth_role=${role}; path=/; max-age=86400; secure`;

      router.replace(
        locale === "ar"
          ? `/ar${role === "admin" ? "/admin" : "/customer"}`
          : role === "admin"
          ? "/admin"
          : "/customer"
      );
    } catch (err) {
      console.error(err);
      setError(t("googleFailed"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          {t("login")}
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 text-red-700 px-4 py-3 text-sm border border-red-300">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t("email")}
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t("password")}
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded-md font-medium transition ${
            loading
              ? "bg-gray-400"
              : "bg-primary text-neutral-900 shadow hover:bg-primary-dark"
          }`}
        >
          {loading ? t("loggingIn") : t("login")}
        </button>

        {/* Separator */}
        <div className="flex items-center justify-center my-4">
          <span className="text-gray-400 text-sm">{t("or")}</span>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {t("continueGoogle")}
        </button>

        {/* Register Link */}
        <p className="text-sm text-center text-gray-600 mt-6">
          {t("noAccount")}{" "}
          <Link href="/register" locale={locale} className="text-primary font-medium hover:underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
