"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";

export default function TikTokModal({ videoUrl, open, onClose }) {
  if (!open) return null;

  // Disable scroll & smoother while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const smoother = window.ScrollSmoother?.get();
    smoother?.paused(true);

    return () => {
      document.body.style.overflow = "";
      smoother?.paused(false);
    };
  }, []);

  const embedUrl = videoUrl.replace("/video/", "/embed/");

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-xl max-w-2xl w-full animate-[pop_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 end-3 text-neutral-700 hover:text-neutral-900 transition"
        >
          <HiX className="w-7 h-7" />
        </button>

        {/* TikTok iframe */}
        <div className="aspect-[9/16] w-full bg-black">
          <iframe
            src={embedUrl}
            allow="autoplay"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes pop {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
