"use client";
import { useState } from "react";
import ChatMessage from "../ChatMessage";

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-96 h-[75vh] bg-white shadow-2xl rounded-t-2xl border flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold text-lg">Shopping Assistant</h2>
        <button onClick={onClose} className="text-xl">✖</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">Ask me anything about our bags or shoes 😊</p>
        ) : (
          messages.map((m, i) => <ChatMessage key={i} role={m.role} text={m.text} />)
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-3 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
