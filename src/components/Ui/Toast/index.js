"use client";

import { HiCheckCircle, HiXCircle } from "react-icons/hi";

export default function Toast({ type, text, onClose }) {
  return (
    <div className="fixed top-6 inset-x-0 flex justify-center z-[999999]">
      <div
        className={`
          px-5 py-3 rounded-xl shadow-lg text-white flex items-center gap-3
          ${type === "success" ? "bg-green-600" : "bg-red-600"}
        `}
      >
        {type === "success" ? (
          <HiCheckCircle className="w-6 h-6" />
        ) : (
          <HiXCircle className="w-6 h-6" />
        )}
        <span>{text}</span>

        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}
