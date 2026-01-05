"use client";
import { useState } from "react";
import ChatPanel from "../ChatPanel";

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-105 transition"
      >
        💬
      </button>

      {/* Chat Panel */}
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}
