"use client";

import { auth, db } from "@/lib/firebaseClient";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RegisterTab({ redirectTo = "/" }) {
  const t = useTranslations("register");
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!fullName || !email || !password || !confirm) {
      setError(t("allRequired"));
      return;
    }

    if (password !== confirm) {
      setError(t("passwordNotMatch"));
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      router.replace(redirectTo);
    } catch (err) {
      console.error(err);
      setError(t("registerFailed"));
    }
  };

  const handleGoogleSignup = async () => {
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: user.displayName || "",
          email: user.email,
          role: "user",
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

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
        <label className="block mb-1 text-sm">{t("fullName")}</label>
        <input
          type="text"
          onChange={(e) => setFullName(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm">{t("email")}</label>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm">{t("password")}</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 text-sm">{t("confirmPassword")}</label>
        <input
          type="password"
          onChange={(e) => setConfirm(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
      </div>

      <button
        onClick={handleRegister}
        className="w-full py-2 mb-4 bg-neutral-900 text-white rounded-md"
      >
        {t("register")}
      </button>

      <div className="flex justify-center py-4 text-gray-500 text-sm">
        {t("or")}
      </div>

      <button
        onClick={handleGoogleSignup}
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
