"use client";

import { useState, useEffect } from "react";
import { Send, Building2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction } from "@/actions/messages";

export default function ContractorMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [ownerPartner, setOwnerPartner] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadMessages() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        // Fetch messages where user is sender or receiver
        const { data: chatData } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: true });

        if (chatData) {
          setMessages(chatData);
        }

        // Fetch owner profile to chat with
        const { data: ownerProf } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "owner")
          .limit(1)
          .single();

        if (ownerProf) {
          setOwnerPartner(ownerProf);
        }
      } catch (err) {
        console.error("Error loading contractor chat messages:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ownerPartner?.id) return;

    const textToSend = input;
    setInput("");

    // Optimistic UI update
    const tempMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      receiver_id: ownerPartner.id,
      content: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const res = await sendMessageAction(ownerPartner.id, textToSend);
    if (res?.error) {
      console.error("Failed to send message:", res.error);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-xs uppercase">
            {ownerPartner?.full_name?.substring(0, 2) || "PO"}
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">
              {ownerPartner?.full_name || "Property Owner"}
            </h3>
            <p className="text-[11px] text-muted-foreground">Property Owner • Direct Tender Chat</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length > 0 ? (
          messages.map((m) => {
            const isSelf = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                <div className={`max-w-md rounded-2xl p-4 text-xs space-y-1 shadow-sm ${isSelf ? "bg-orange-600 text-white" : "bg-muted text-foreground border"}`}>
                  <div className="font-semibold text-[10px] opacity-80">{isSelf ? "You" : ownerPartner?.full_name || "Owner"}</div>
                  <p className="leading-relaxed">{m.content}</p>
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 px-1">
                  {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
            <User className="h-8 w-8 text-muted-foreground" />
            <div className="text-xs font-bold text-foreground">No Messages Yet</div>
            <p className="text-[11px]">Send a message to start direct communication with property owners.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2 bg-card">
        <input
          type="text"
          placeholder="Write message to property owner..."
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
