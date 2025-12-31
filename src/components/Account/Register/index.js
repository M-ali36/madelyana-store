"use client";

import { auth, db } from "@/lib/firebaseClient";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import Link from "@/components/Ui/Link";
import { useLocale } from "next-intl"; 

export default function RegisterPage() {
  const locale = useLocale();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!fullName || !email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
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

      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Registration failed");
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

      const token = await user.getIdToken(true);

      document.cookie = `firebase_id_token=${token}; path=/; max-age=86400; secure`;
      document.cookie = `auth_role=user; path=/; max-age=86400; secure`;

      window.location.href = "/customer";
    } catch (err) {
      console.log(err);
      setError("Google signup failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Register
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 text-red-700 px-4 py-3 text-sm border border-red-300">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* Register button */}
        <button
          onClick={handleRegister}
          className="w-full py-2 mb-4 bg-primary text-black font-medium rounded-md shadow hover:bg-primary-dark transition"
        >
          Register
        </button>

        {/* Separator */}
        <div className="flex items-center justify-center my-4">
          <span className="text-gray-400 text-sm">— OR —</span>
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign up with Google
        </button>

        {/* Login Link */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" locale={locale} className="text-primary font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
