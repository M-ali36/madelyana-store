"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";

function parseTikTokUrl(url) {
  const m = url.match(/tiktok\.com\/@([^/]+)\/video\/(\d+)/);
  return m ? { username: m[1], videoId: m[2] } : null;
}

export default function TikTokModal({ videoUrl, open, onClose }) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const parsed = parseTikTokUrl(videoUrl);

  if (!open) return null;

  useEffect(() => {
    setMounted(true);

    document.body.style.overflow = "hidden";
    const smoother = window.ScrollSmoother?.get();
    smoother?.paused(true);

    return () => {
      document.body.style.overflow = "";
      smoother?.paused(false);
    };
  }, []);

  useEffect(() => {
    if (!parsed || !containerRef.current) return;

    const { username, videoId } = parsed;

    containerRef.current.innerHTML = `
      <blockquote 
        class="tiktok-embed"
        cite="https://www.tiktok.com/@${username}/video/${videoId}"
        data-video-id="${videoId}"
        style="max-width: 605px; min-width: 325px;">
      </blockquote>
    `;

    // force TikTok script to scan again
    setTimeout(() => {
      if (window.tiktokEmbedLoad) {
        window.tiktokEmbedLoad();
      }
    }, 50);
  }, [parsed]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-xl max-w-2xl w-full animate-[pop_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-700 hover:text-neutral-900"
        >
          <HiX className="w-7 h-7" />
        </button>

        <div className="w-full flex justify-center p-4">
          <div ref={containerRef} className="w-full flex justify-center" />
        </div>
      </div>

      <style jsx>{`
        @keyframes pop {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
