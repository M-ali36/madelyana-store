"use client";

import { useEffect, useRef } from "react";
import { HiX } from "react-icons/hi";
import gsap from "gsap";
import { useLocale } from "next-intl";

export default function Notification({ id, message, type, duration, onClose, locale }) {
  const ref = useRef(null);
  const isAr = locale === 'ar' ? true : false

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { x: isAr ? 0 : 50, autoAlpha: 0 },
      { x: isAr ? 50 : 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" }
    );

    const timer = setTimeout(() => {
      closeNotification();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const closeNotification = () => {
    gsap.to(ref.current, {
      x: isAr ? -50 : 50,
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => onClose(id),
    });
  };

  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-400 text-black",
    info: "bg-blue-500 text-white",
  };

  return (
    <div
      ref={ref}
      className={`w-full max-w-sm shadow-xl rounded-lg p-4 gap-2 flex justify-between items-center ${typeClasses[type]}`}
    >
      <span className="font-medium h-5">{message}</span>

      <button onClick={closeNotification} className="cursor-pointer">
        <HiX className="w-5 h-5 opacity-80 hover:opacity-100 transition" />
      </button>
    </div>
  );
}
