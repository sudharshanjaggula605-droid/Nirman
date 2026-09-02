"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Shield,
  Paperclip,
  Image as ImageIcon,
  X,
  ExternalLink,
  Download,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessageAction,
  getChatContactsAction,
  getConversationMessagesAction,
} from "@/actions/messages";

export default function ContractorMessagesPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<"ALL" | "admin" | "owner">("ALL");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  // Mobile: "contacts" or "chat"
  const [mobileView, setMobileView] = useState<"contacts" | "chat">("contacts");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await getChatContactsAction();
        if (res.currentUserId) setCurrentUserId(res.currentUserId);
        if (res.contacts && res.contacts.length > 0) {
          const others = res.contacts.filter((p: any) => p.id !== res.currentUserId);
          const adminProf = others.find((p: any) => p.role === "admin");
          const owners = others.filter((p: any) => p.role === "owner");
          let final: any[] = [];
          if (adminProf) {
            final.push(adminProf);
          } else {
            final.push({ id: "5b7ec4ee-e9e8-43a1-ba7e-56bfc3f71c05", full_name: "NIRMAN Admin Support", role: "admin" });
          }
          final = [...final, ...owners];
          setContacts(final);
          setSelectedContact(final[0]);
        }
      } catch (err) {
        console.error("Error loading contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    }
    loadContacts();
  }, []);

  useEffect(() => {
    if (!selectedContact || !currentUserId) return;
    let isSubscribed = true;

    async function fetchMessages(silent = false) {
      if (!silent) setLoadingChat(true);
      try {
        const res = await getConversationMessagesAction(selectedContact.id);
        if (isSubscribed && res.messages) {
          setMessages(res.messages);
          window.dispatchEvent(new Event("chat_read_updated"));
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        if (isSubscribed && !silent) setLoadingChat(false);
      }
    }

    fetchMessages(false);

    const channel = supabase
      .channel(`contractor_chat_${currentUserId}_${selectedContact.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => fetchMessages(true))
      .subscribe();

    const interval = setInterval(() => fetchMessages(true), 4000);

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [selectedContact, currentUserId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Image size should be under 10MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setSelectedImage(ev.target?.result as string); setSelectedImageName(file.name); };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputContent.trim() && !selectedImage) || !selectedContact || !currentUserId || sending) return;
    const messageText = inputContent.trim();
    const photoDataUrl = selectedImage;
    setInputContent(""); setSelectedImage(null); setSelectedImageName(null); setSending(true);
    const tempMsg = { id: Date.now().toString(), sender_id: currentUserId, receiver_id: selectedContact.id, content: messageText, image_url: photoDataUrl, attachment_url: photoDataUrl, created_at: new Date().toISOString(), read: false };
    setMessages((prev) => [...prev, tempMsg]);
    const result = await sendMessageAction(selectedContact.id, messageText, photoDataUrl || undefined);
    if (result?.error) console.error("Failed to send message:", result.error);
    setSending(false);
  };

  const extractImage = (msg: any) => {
    if (!msg) return null;
    if (msg.image_url?.trim()) return msg.image_url.trim();
    if (msg.attachment_url?.trim()) return msg.attachment_url.trim();
    const text = (msg.content || "").toString();
    if (text.includes("[ATTACHMENT]:")) return text.split("[ATTACHMENT]:")[1]?.trim();
    if (text.startsWith("data:image/") || (text.startsWith("http") && (text.includes(".png") || text.includes(".jpg") || text.includes(".jpeg") || text.includes(".webp")))) return text.trim();
    return null;
  };

  const cleanText = (msg: any) => {
    if (!msg) return "";
    const text = (msg.content || "").toString();
    if (text.includes("[ATTACHMENT]:")) return text.split("[ATTACHMENT]:")[0]?.trim();
    if (text.startsWith("data:image/") || (text.startsWith("http") && (text.includes(".png") || text.includes(".jpg")))) return "";
    return text;
  };

  const cap = (str?: string) => str ? str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "";

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const match = !q || c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    return match && (tabFilter === "ALL" || c.role === tabFilter);
  });

  const handleSelectContact = (c: any) => {
    setSelectedContact(c);
    setMobileView("chat");
  };

  // ─────────────────────────────────────────────────────────────
  // CONTACTS LIST PANEL
  // ─────────────────────────────────────────────────────────────
  const ContactsPanel = (
    <div className="flex flex-col h-full">
      {/* Search + Filter */}
      <div className="p-3 border-b space-y-2 bg-muted/20">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contact..."
            className="w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl text-[11px] font-bold">
          {(["ALL", "admin", "owner"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTabFilter(f)}
              className={`py-1.5 rounded-lg text-center transition-all capitalize ${
                tabFilter === f
                  ? f === "owner" ? "bg-blue-600 text-white shadow-sm" : "bg-amber-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "All" : f === "admin" ? "Admin" : "Owners"}
            </button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto divide-y">
        {loadingContacts ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading contacts...</div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((c) => {
            const isSelected = selectedContact?.id === c.id;
            const isAdmin = c.role === "admin";
            const name = cap(isAdmin ? "NIRMAN Admin Support" : c.full_name);
            return (
              <button
                key={c.id}
                onClick={() => handleSelectContact(c)}
                className={`w-full p-3 flex items-center gap-3 text-left transition-all hover:bg-accent ${isSelected ? "bg-amber-500/10 border-l-4 border-amber-600" : ""}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs text-white shadow-sm ${isAdmin ? "bg-amber-600" : "bg-blue-600"}`}>
                  {isAdmin ? <Shield className="h-4 w-4" /> : name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-xs text-foreground truncate">{name}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${isAdmin ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"}`}>
                      {isAdmin ? "ADMIN" : "OWNER"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{isAdmin ? "Official Platform Support" : c.email || "Platform Partner"}</p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <User className="h-6 w-6 mx-auto mb-1" />
            No contacts match your search.
          </div>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // CHAT PANEL
  // ─────────────────────────────────────────────────────────────
  const ChatPanel = selectedContact ? (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 border-b bg-muted/20 flex items-center gap-3 shrink-0">
        {/* Back button — mobile only */}
        <button
          type="button"
          onClick={() => setMobileView("contacts")}
          className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          aria-label="Back to contacts"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs text-white shadow-sm ${selectedContact.role === "admin" ? "bg-amber-600" : "bg-blue-600"}`}>
          {selectedContact.role === "admin" ? <Shield className="h-4 w-4" /> : cap(selectedContact.full_name).substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-foreground truncate">
              {cap(selectedContact.role === "admin" ? "NIRMAN Admin Support" : selectedContact.full_name)}
            </h3>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${selectedContact.role === "admin" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"}`}>
              {selectedContact.role}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {selectedContact.role === "admin" ? "Platform Administration & Support" : "Property Owner • Project Chat"}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingChat && messages.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((m) => {
            const isSelf = m.sender_id === currentUserId;
            const imgUrl = extractImage(m);
            const text = cleanText(m);
            const senderName = isSelf ? "You" : selectedContact.role === "admin" ? "NIRMAN Support" : cap(selectedContact.full_name);
            return (
              <div key={m.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] sm:max-w-lg rounded-2xl p-3 text-xs space-y-1.5 shadow-sm ${isSelf ? "bg-amber-600 text-white rounded-br-none" : "bg-muted text-foreground border rounded-bl-none"}`}>
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-bold pb-1 border-b border-current/10">
                    <span>{senderName}</span>
                    <span>{new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {text && <p className="leading-relaxed whitespace-pre-wrap">{text}</p>}
                  {imgUrl && (
                    <button type="button" onClick={() => setPreviewModalImg(imgUrl)} className="group text-left block focus:outline-none">
                      <img src={imgUrl} alt="Attachment" className="max-h-48 max-w-full rounded-xl border border-white/20 object-cover group-hover:opacity-90 transition-opacity cursor-pointer" />
                      <span className="text-[10px] opacity-75 underline font-bold inline-flex items-center gap-1 pt-0.5">
                        <ExternalLink className="h-3 w-3" /> View full
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground py-12">
            <MessageSquare className="h-7 w-7" />
            <div className="text-xs font-bold text-foreground">No Chat History</div>
            <p className="text-[11px]">Send a message to start the conversation.</p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex flex-col gap-2 bg-card shrink-0">
        {selectedImage && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-600 w-fit">
            <ImageIcon className="h-4 w-4 shrink-0" />
            <span className="font-bold truncate max-w-[160px]">{selectedImageName || "Photo"}</span>
            <button type="button" onClick={() => { setSelectedImage(null); setSelectedImageName(null); }} className="p-1 rounded-full hover:bg-amber-500/20 text-rose-500">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.png,.jpg,.jpeg,.webp" onChange={handleImageChange} className="hidden" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors shrink-0" title="Attach file">
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 rounded-xl border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button type="submit" disabled={sending || (!inputContent.trim() && !selectedImage)} className="p-2 rounded-xl bg-amber-600 text-white shadow-md hover:bg-amber-700 disabled:opacity-50 shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-muted-foreground">
      <MessageSquare className="h-8 w-8" />
      <div className="text-xs font-bold text-foreground">No Contact Selected</div>
      <p className="text-[11px]">Select a contact to start messaging.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
        <MessageSquare className="h-5 w-5 text-amber-600 shrink-0" />
        <h1 className="text-base font-extrabold text-foreground tracking-tight truncate">Messages</h1>
      </div>

      {/* Layout */}
      <div className="flex-1 overflow-hidden">
        {/* ── MOBILE: show one panel at a time ── */}
        <div className="md:hidden h-full">
          {mobileView === "contacts" ? ContactsPanel : ChatPanel}
        </div>

        {/* ── DESKTOP: two columns ── */}
        <div className="hidden md:grid md:grid-cols-12 h-full">
          <div className="md:col-span-4 border-r overflow-hidden flex flex-col">
            {ContactsPanel}
          </div>
          <div className="md:col-span-8 overflow-hidden flex flex-col">
            {ChatPanel}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-white mb-4">
              <span className="text-xs font-extrabold flex items-center gap-2"><ImageIcon className="h-4 w-4 text-amber-400" /> Image Preview</span>
              <div className="flex items-center gap-2">
                <a href={previewModalImg} download="nirman_attachment.png" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors">
                  <Download className="h-4 w-4" /> Save
                </a>
                <button type="button" onClick={() => setPreviewModalImg(null)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="w-full flex-1 flex items-center justify-center overflow-auto">
              <img src={previewModalImg} alt="Full Preview" className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl border border-slate-800 shadow-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
