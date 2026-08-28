"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Shield,
  CheckCircle2,
  Mail,
  Building2,
  Paperclip,
  Image as ImageIcon,
  X,
  ExternalLink,
  Download,
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 1. Load contacts using Server Action for 100% UUID accuracy
  useEffect(() => {
    async function loadContractorContacts() {
      try {
        const res = await getChatContactsAction();
        if (res.currentUserId) {
          setCurrentUserId(res.currentUserId);
        }

        if (res.contacts && res.contacts.length > 0) {
          const otherProfiles = res.contacts.filter((p: any) => p.id !== res.currentUserId);
          
          const adminProf = otherProfiles.find((p: any) => p.role === "admin");
          const owners = otherProfiles.filter((p: any) => p.role === "owner");

          let finalContacts: any[] = [];
          if (adminProf) {
            finalContacts.push(adminProf);
          } else {
            finalContacts.push({
              id: "5b7ec4ee-e9e8-43a1-ba7e-56bfc3f71c05",
              full_name: "NIRMAN Admin Support",
              role: "admin",
            });
          }

          finalContacts = [...finalContacts, ...owners];
          setContacts(finalContacts);
          setSelectedContact(finalContacts[0]); // Default to NIRMAN Admin Support
        }
      } catch (err) {
        console.error("Error loading contractor contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    }

    loadContractorContacts();
  }, []);

  // 2. Fetch conversation messages for selected contact
  useEffect(() => {
    if (!selectedContact || !currentUserId) return;

    let isSubscribed = true;

    async function fetchChatMessages() {
      setLoadingChat(true);
      try {
        const res = await getConversationMessagesAction(selectedContact.id);
        if (isSubscribed && res.messages) {
          setMessages(res.messages);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("chat_read_updated"));
          }
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
      } finally {
        if (isSubscribed) setLoadingChat(false);
      }
    }

    fetchChatMessages();

    // Supabase Real-time listener
    const channel = supabase
      .channel(`contractor_chat_${currentUserId}_${selectedContact.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchChatMessages();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchChatMessages();
    }, 3000);

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [selectedContact, currentUserId]);

              {/* Chat Thread */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingChat && messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Loading chat messages...</div>
                ) : messages.length > 0 ? (
                  messages.map((m) => {
                    const isSelf = m.sender_id === currentUserId;
                    const imgUrl = extractImageFromMsg(m);
                    const cleanText = getCleanTextFromMsg(m);

                    const senderName = isSelf
                      ? "You (Contractor)"
                      : selectedContact.role === "admin"
                      ? "NIRMAN Admin Support"
                      : capitalize(selectedContact.full_name);

                    return (
                      <div key={m.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-md sm:max-w-lg rounded-2xl p-4 text-xs space-y-2 shadow-sm ${
                            isSelf
                              ? "bg-amber-600 text-white rounded-br-none"
                              : "bg-muted text-foreground border rounded-bl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-90 font-bold border-b border-white/10 pb-1">
                            <span>{senderName}</span>
                            <span className="font-mono text-[9px]">
                              {new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {cleanText && <p className="leading-relaxed whitespace-pre-wrap">{cleanText}</p>}

                          {imgUrl && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewModalImg(imgUrl)}
                                className="group text-left block focus:outline-none"
                              >
                                <img
                                  src={imgUrl}
                                  alt="Attached Screenshot"
                                  className="max-h-60 max-w-full rounded-xl border border-white/20 my-1 object-cover group-hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                                />
                                <span className="text-[10px] opacity-90 underline font-bold inline-flex items-center gap-1 pt-0.5 group-hover:text-amber-300">
                                  <ExternalLink className="h-3 w-3" /> Click to Enlarge & Save
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    <div className="text-xs font-bold text-foreground">No Chat History</div>
                    <p className="text-[11px]">Send a message or screenshot to start direct communication.</p>
                  </div>
                )}
              </div>

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setSelectedImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // 3. Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputContent.trim() && !selectedImage) || !selectedContact || !currentUserId || sending) return;

    const messageText = inputContent.trim();
    const photoDataUrl = selectedImage;

    setInputContent("");
    setSelectedImage(null);
    setSelectedImageName(null);
    setSending(true);

    const tempMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      receiver_id: selectedContact.id,
      content: messageText,
      image_url: photoDataUrl,
      attachment_url: photoDataUrl,
      created_at: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMsg]);

    const result = await sendMessageAction(selectedContact.id, messageText, photoDataUrl || undefined);
    if (result?.error) {
      console.error("Failed to send message:", result.error);
    }
    setSending(false);
  };

  const extractImageFromMsg = (msg: any) => {
    if (!msg) return null;
    if (msg.image_url && typeof msg.image_url === "string" && msg.image_url.trim()) return msg.image_url.trim();
    if (msg.attachment_url && typeof msg.attachment_url === "string" && msg.attachment_url.trim()) return msg.attachment_url.trim();
    
    const text = (msg.content || msg.message || "").toString();
    if (text.includes("[ATTACHMENT]:")) {
      const parts = text.split("[ATTACHMENT]:");
      return parts[1]?.trim();
    }

    if (
      text.startsWith("data:image/") ||
      (text.startsWith("http") && (text.includes(".png") || text.includes(".jpg") || text.includes(".jpeg") || text.includes(".webp") || text.includes("base64")))
    ) {
      return text.trim();
    }

    return null;
  };

  const getCleanTextFromMsg = (msg: any) => {
    if (!msg) return "";
    const text = (msg.content || msg.message || "").toString();
    if (text.includes("[ATTACHMENT]:")) {
      return text.split("[ATTACHMENT]:")[0]?.trim();
    }
    if (
      text.startsWith("data:image/") ||
      (text.startsWith("http") && (text.includes(".png") || text.includes(".jpg") || text.includes(".jpeg") || text.includes(".webp") || text.includes("base64")))
    ) {
      return "";
    }
    return text;
  };

  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = c.full_name?.toLowerCase().includes(query);
    const emailMatch = c.email?.toLowerCase().includes(query);
    const matchesSearch = !searchQuery || nameMatch || emailMatch;

    const matchesTab = tabFilter === "ALL" || c.role === tabFilter;

    return matchesSearch && matchesTab;
  });

  const capitalize = (str?: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-600" /> Contractor Communication Console
          </h1>
          <p className="text-xs text-muted-foreground">
            Direct real-time communication with NIRMAN Admin Support and Property Owners.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Left Directory */}
        <div className="md:col-span-4 lg:col-span-4 rounded-2xl border bg-card flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b space-y-3 bg-muted/20">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contact..."
                className="w-full rounded-xl border bg-background pl-10 pr-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setTabFilter("ALL")}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  tabFilter === "ALL" ? "bg-amber-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTabFilter("admin")}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  tabFilter === "admin" ? "bg-amber-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setTabFilter("owner")}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  tabFilter === "owner" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Owners
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y">
            {loadingContacts ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading contacts...</div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((c) => {
                const isSelected = selectedContact?.id === c.id;
                const isAdmin = c.role === "admin";
                const displayName = capitalize(isAdmin ? "NIRMAN Admin Support" : c.full_name);

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-all hover:bg-accent ${
                      isSelected ? "bg-amber-500/10 border-l-4 border-amber-600" : ""
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-extrabold text-xs text-white shadow-sm ${
                        isAdmin ? "bg-amber-600" : "bg-blue-600"
                      }`}
                    >
                      {isAdmin ? <Shield className="h-5 w-5" /> : displayName.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-xs text-foreground truncate">{displayName}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                            isAdmin
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {isAdmin ? "ADMIN" : "OWNER"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {isAdmin ? "Official Platform Support" : c.email || "Platform Partner"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2 text-muted-foreground text-xs">
                <User className="h-6 w-6 mx-auto text-muted-foreground" />
                <p>No contacts match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Thread */}
        <div className="md:col-span-8 lg:col-span-8 rounded-2xl border bg-card flex flex-col overflow-hidden shadow-sm">
          {selectedContact ? (
            <>
              {/* Active Contact Bar */}
              <div className="p-4 border-b bg-muted/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl font-bold text-xs text-white shadow-sm ${
                      selectedContact.role === "admin" ? "bg-amber-600" : "bg-blue-600"
                    }`}
                  >
                    {selectedContact.role === "admin" ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      capitalize(selectedContact.full_name).substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">
                        {capitalize(selectedContact.role === "admin" ? "NIRMAN Platform Admin Support" : selectedContact.full_name)}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          selectedContact.role === "admin"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {selectedContact.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedContact.role === "admin"
                        ? "Platform Administration & Support Channel"
                        : "Property Owner • Direct Tender & Project Chat"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-time Active</span>
                </div>
              </div>

              {/* Chat Thread */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingChat && messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Loading chat messages...</div>
                ) : messages.length > 0 ? (
                  messages.map((m) => {
                    const isSelf = m.sender_id === currentUserId;
                    const imgUrl = extractImageFromMsg(m);
                    const cleanText = getCleanTextFromMsg(m);

                    const senderName = isSelf
                      ? "You (Contractor)"
                      : selectedContact.role === "admin"
                      ? "NIRMAN Admin Support"
                      : capitalize(selectedContact.full_name);

                    return (
                      <div key={m.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-md sm:max-w-lg rounded-2xl p-4 text-xs space-y-2 shadow-sm ${
                            isSelf
                              ? "bg-amber-600 text-white rounded-br-none"
                              : "bg-muted text-foreground border rounded-bl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-90 font-bold border-b border-white/10 pb-1">
                            <span>{senderName}</span>
                            <span className="font-mono text-[9px]">
                              {new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {cleanText && <p className="leading-relaxed whitespace-pre-wrap">{cleanText}</p>}

                          {imgUrl && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewModalImg(imgUrl)}
                                className="group text-left block focus:outline-none"
                              >
                                <img
                                  src={imgUrl}
                                  alt="Attached Screenshot"
                                  className="max-h-60 max-w-full rounded-xl border border-white/20 my-1 object-cover group-hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                                />
                                <span className="text-[10px] opacity-90 underline font-bold inline-flex items-center gap-1 pt-0.5 group-hover:text-amber-300">
                                  <ExternalLink className="h-3 w-3" /> Click to Enlarge & Save
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    <div className="text-xs font-bold text-foreground">No Chat History</div>
                    <p className="text-[11px]">Send a message or screenshot to start direct communication.</p>
                  </div>
                )}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t flex flex-col gap-2 bg-card shrink-0">
                {selectedImage && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-600 dark:text-amber-400 w-fit">
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span className="font-bold truncate max-w-xs">{selectedImageName || "Photo Attachment"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedImageName(null);
                      }}
                      className="p-1 rounded-full hover:bg-amber-500/20 text-rose-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Attach Screenshot or Payment Photo"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder={`Write message or attach issue photo for ${capitalize(selectedContact.full_name)}...`}
                    className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputContent.trim() && !selectedImage)}
                    className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md hover:bg-amber-700 disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-muted-foreground">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs font-bold text-foreground">No Contact Selected</div>
              <p className="text-[11px]">Select a contact from the list on the left to begin messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Full Image Preview Popup Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-white mb-4">
              <span className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-amber-400" /> Image Attachment Preview
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={previewModalImg}
                  download="nirman_chat_attachment.png"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-colors shadow-md"
                >
                  <Download className="h-4 w-4" />
                  <span>Save / Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Close Preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Image Body */}
            <div className="w-full flex-1 flex items-center justify-center overflow-auto p-2">
              <img
                src={previewModalImg}
                alt="Full Attachment Preview"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl border border-slate-800 shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
