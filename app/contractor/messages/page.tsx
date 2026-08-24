"use client";

import { useState } from "react";
import { Send, Paperclip, Image as ImageIcon, User, Building2 } from "lucide-react";

export default function ContractorMessagesPage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Rajesh Kumar (Owner)", text: "Hi, please confirm if the first floor slab casting is completed?", time: "10:30 AM", isSelf: false },
    { id: 2, sender: "You", text: "Yes sir, slab casting was completed yesterday evening. Curing is underway.", time: "10:35 AM", isSelf: true },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "You", text: input, time: "Just now", isSelf: true }]);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-xs">
            RK
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Rajesh Kumar (Property Owner)</h3>
            <p className="text-[11px] text-muted-foreground">Project: Modern Duplex Villa Construction</p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.isSelf ? "items-end" : "items-start"}`}>
            <div className={`max-w-md rounded-2xl p-4 text-xs space-y-1 shadow-sm ${m.isSelf ? "bg-orange-600 text-white" : "bg-muted text-foreground border"}`}>
              <div className="font-semibold text-[10px] opacity-80">{m.sender}</div>
              <p className="leading-relaxed">{m.text}</p>
            </div>
            <span className="text-[9px] text-muted-foreground mt-1 px-1">{m.time}</span>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2 bg-card">
        <input
          type="text"
          placeholder="Type your message to property owner..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
        <button type="submit" className="p-2.5 rounded-xl bg-orange-600 text-white shadow-md hover:bg-orange-700">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
