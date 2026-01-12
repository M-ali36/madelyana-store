"use client";

import { useState } from "react";
import LoginTab from "../LoginTab";
import RegisterTab from "../RegisterTab";

export default function AuthTabs({ redirectTo }) {
  const [active, setActive] = useState("login");

  return (
    <div className="bg-white border border-slate-300 rounded-xl shadow p-6">
      {/* TABS HEADER */}
      <div className="flex mb-6 border-b">
        <button
          className={`flex-1 py-2 text-center font-semibold ${
            active === "login"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-gray-500"
          }`}
          onClick={() => setActive("login")}
        >
          Login
        </button>

        <button
          className={`flex-1 py-2 text-center font-semibold ${
            active === "register"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-gray-500"
          }`}
          onClick={() => setActive("register")}
        >
          Register
        </button>
      </div>

      {/* TAB CONTENT */}
      {active === "login" ? (
        <LoginTab redirectTo={redirectTo} />
      ) : (
        <RegisterTab redirectTo={redirectTo} />
      )}
    </div>
  );
}
