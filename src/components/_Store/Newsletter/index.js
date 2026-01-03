"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiMail } from "react-icons/fi";
import { HiOutlineArrowRight, HiCheckCircle } from "react-icons/hi2";

export default function NewsletterCta() {
  const t = useTranslations("newsletterCta");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setEmail("");
  };

  return (
    <div className="w-full py-12 lg:py-32 bg-neutral-900">
      
      {/* MAIN TITLE */}
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          {t("headline")}
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {t("title")}
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {status === "success" ? (
        <div className="flex flex-col items-center space-y-3 text-center">
          <HiCheckCircle size={48} className="text-green-500" />
          <p className="text-green-400 font-medium">{t("success")}</p>
        </div>
      ) : (
        <>
          {/* INLINE FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-center gap-4 max-w-xl mx-auto px-4"
          >
            {/* INPUT */}
            <div className="relative w-full">
              <FiMail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                value={email}
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                }}
                placeholder={t("emailPlaceholder")}
                className="
                  w-full pl-12 pr-4 py-3 
                  bg-neutral-800  
                  border border-neutral-700 
                  text-gray-100
                  placeholder:text-gray-500 
                  rounded-xl 
                  focus:border-gray-400 
                  focus:ring-0 
                  outline-none 
                  transition-all
                "
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="
                w-full md:w-auto whitespace-nowrap 
                bg-white text-black 
                py-3 px-6 rounded-xl 
                font-semibold 
                flex items-center justify-center gap-2 
                hover:bg-gray-200 curosor-pointer 
                active:scale-[0.98]
                transition
              "
            >
              {t("button")}
              <HiOutlineArrowRight size={18} className="rtl:rotate-180" />
            </button>
          </form>

          {/* ERROR MESSAGE */}
          {status === "error" && (
            <p className="text-sm text-red-400 mt-3 text-center">
              {t("error")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
