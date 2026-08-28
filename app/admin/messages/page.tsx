"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Building2,
  HardHat,
  Shield,
  CheckCircle2,
  Clock,
  RefreshCw,
  Mail,
  Phone,
  Paperclip,
  Image as ImageIcon,
  X,
  ExternalLink,
  Eye,
  Filter,
  Users,
  Globe,
  Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessageAction,
  getChatContactsAction,
  getAdminMessagesAction,
  markMessagesAsReadAction,
} from "@/actions/messages";

export default function AdminMessagesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "owner" | "contractor">("ALL");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);

  const [viewMode, setViewMode] = useState<"USER_AUDIT" | "ALL_PLATFORM" | "PAIR_MONITOR">("USER_AUDIT");
  const [monitoredOwner, setMonitoredOwner] = useState<any | null>(null);
  const [monitoredContractor, setMonitoredContractor] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await getChatContactsAction();
        if (res.currentUserId) {
          setCurrentAdminId(res.currentUserId);
        }

        if (res.contacts && res.contacts.length > 0) {
          const map: Record<string, any> = {};
          res.contacts.forEach((p: any) => {
            map[p.id] = p;
          });
          setProfilesMap(map);

          const nonAdmins = res.contacts.filter((p: any) => p.role !== "admin");
          setUsers(nonAdmins);

          if (nonAdmins.length > 0) {
            setSelectedUser(nonAdmins[0]);
          }

          const firstOwner = nonAdmins.find((p: any) => p.role === "owner");
          const firstContractor = nonAdmins.find((p: any) => p.role === "contractor");
          if (firstOwner) setMonitoredOwner(firstOwner);
          if (firstContractor) setMonitoredContractor(firstContractor);
        }
      } catch (err) {
        console.error("Error loading profiles for admin chat:", err);
      } finally {
        setLoadingUsers(false);
      }
    }

    loadAdminData();
  }, []);

  // 2. Fetch & synchronize messages based on view mode
  useEffect(() => {
    let isSubscribed = true;

    async function fetchChatMessages() {
      setLoadingChat(true);
      try {
        const res = await getAdminMessagesAction({
          viewMode,
          selectedUserId: selectedUser?.id,
          ownerId: monitoredOwner?.id,
          contractorId: monitoredContractor?.id,
        });

        if (isSubscribed && res.messages) {
          setMessages(res.messages);
          if (selectedUser?.id && typeof window !== "undefined") {
            markMessagesAsReadAction(selectedUser.id);
            window.dispatchEvent(new Event("chat_read_updated"));
          }
        }
      } catch (err) {
        console.error("Error loading admin chat messages:", err);
      } finally {
        if (isSubscribed) setLoadingChat(false);
      }
    }

    fetchChatMessages();

    // Supabase Realtime channel listener
    const channel = supabase
      .channel(`admin_chat_${viewMode}_${Date.now()}`)
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
  }, [selectedUser, viewMode, monitoredOwner, monitoredContractor]);

          {/* Messages Thread */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 bg-slate-950/30">
            {loadingChat && messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading synchronized conversation history...</div>
            ) : messages.length > 0 ? (
              messages.map((m) => {
                const sender = getSenderDetails(m.sender_id);
                const recipientName = getRecipientName(m.receiver_id);
                const imgUrl = extractImageFromMsg(m);
                const cleanText = getCleanTextFromMsg(m);
                const isFromAdmin = m.sender_id === currentAdminId;

                return (
                  <div key={m.id} className={`flex flex-col ${isFromAdmin ? "items-end" : "items-start"}`}>
                    <div className={`max-w-md sm:max-w-xl rounded-2xl p-4 text-xs space-y-2 shadow-md ${sender.bgClass}`}>
                      {/* Sender & Receiver Header */}
                      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 font-extrabold">
                          <span>{sender.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] border font-black uppercase ${sender.badgeClass}`}>
                            {sender.role}
                          </span>
                          <span className="opacity-70 font-normal">→ to {recipientName}</span>
                        </div>
                        <span className="font-mono text-[9px] opacity-75 shrink-0">
                          {new Date(m.created_at || Date.now()).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Text Content */}
                      {cleanText && <p className="leading-relaxed font-normal whitespace-pre-wrap">{cleanText}</p>}

                      {/* Photo Attachment */}
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
                              className="max-h-64 max-w-full rounded-xl border border-white/20 my-1 object-cover group-hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                            />
                            <span className="text-[10px] text-amber-300 underline font-bold inline-flex items-center gap-1 pt-0.5 group-hover:text-amber-200">
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
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                <MessageSquare className="h-8 w-8 text-slate-600" />
                <div className="text-xs font-bold text-white">No Message History</div>
                <p className="text-[11px] max-w-xs">No direct messages or shared photos found for this view selection.</p>
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

  // 3. Admin Send Message to selected User
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputContent.trim() && !selectedImage) || !selectedUser || !currentAdminId || sending) return;

    const messageText = inputContent.trim();
    const photoDataUrl = selectedImage;

    setInputContent("");
    setSelectedImage(null);
    setSelectedImageName(null);
    setSending(true);

    const tempMsg = {
      id: Date.now().toString(),
      sender_id: currentAdminId,
      receiver_id: selectedUser.id,
      content: messageText,
      image_url: photoDataUrl,
      attachment_url: photoDataUrl,
      created_at: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMsg]);

    const result = await sendMessageAction(selectedUser.id, messageText, photoDataUrl || undefined);
    if (result?.error) {
      console.error("Failed to send admin message:", result.error);
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

  // Get rich metadata for message sender
  const getSenderDetails = (senderId: string) => {
    if (senderId === currentAdminId) {
      return {
        name: "NIRMAN Admin Support",
        role: "ADMIN",
        isAdmin: true,
        bgClass: "bg-amber-600 text-white",
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      };
    }

    const prof = profilesMap[senderId];
    if (!prof) {
      return {
        name: "Platform User",
        role: "USER",
        isAdmin: false,
        bgClass: "bg-slate-800 text-white",
        badgeClass: "bg-slate-700 text-slate-300",
      };
    }

    const isContractor = prof.role === "contractor";
    const name = isContractor
      ? prof.contractor?.company_name || prof.full_name
      : prof.full_name || "Platform Partner";

    return {
      name: capitalize(name),
      role: prof.role ? prof.role.toUpperCase() : "USER",
      isAdmin: prof.role === "admin",
      bgClass: isContractor
        ? "bg-amber-950/80 border border-amber-600/30 text-amber-100"
        : "bg-blue-950/80 border border-blue-600/30 text-blue-100",
      badgeClass: isContractor
        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
        : "bg-blue-500/20 text-blue-300 border-blue-500/40",
    };
  };

  const getRecipientName = (receiverId: string) => {
    if (receiverId === currentAdminId) return "NIRMAN Admin Support";
    const prof = profilesMap[receiverId];
    if (!prof) return "Platform User";
    const name = prof.role === "contractor" ? prof.contractor?.company_name || prof.full_name : prof.full_name;
    return capitalize(name || "Platform User");
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = u.full_name?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    const companyMatch = u.contractor?.company_name?.toLowerCase().includes(query);
    const matchesSearch = !searchQuery || nameMatch || emailMatch || companyMatch;

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const ownersList = users.filter((u) => u.role === "owner");
  const contractorsList = users.filter((u) => u.role === "contractor");

  function capitalize(str?: string) {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-amber-400" /> Admin Chat & Governance Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time synchronization of all Owner & Contractor messages, shared photos, and direct admin support.
          </p>
        </div>

        {/* View Mode Switches */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode("USER_AUDIT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              viewMode === "USER_AUDIT" ? "bg-amber-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> User Audit View
          </button>
          <button
            onClick={() => setViewMode("ALL_PLATFORM")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              viewMode === "ALL_PLATFORM" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> All Platform Feed
          </button>
          <button
            onClick={() => setViewMode("PAIR_MONITOR")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              viewMode === "PAIR_MONITOR" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Owner ↔ Contractor Pair
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Left Directory */}
        <div className="md:col-span-4 lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900 flex flex-col overflow-hidden shadow-xl">
          {viewMode === "USER_AUDIT" || viewMode === "ALL_PLATFORM" ? (
            <>
              {/* Directory Filters */}
              <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/60">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search owner or contractor..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <button
                    onClick={() => setRoleFilter("ALL")}
                    className={`py-1.5 rounded-lg text-center transition-all ${
                      roleFilter === "ALL" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({users.length})
                  </button>
                  <button
                    onClick={() => setRoleFilter("owner")}
                    className={`py-1.5 rounded-lg text-center transition-all ${
                      roleFilter === "owner" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Owners ({ownersList.length})
                  </button>
                  <button
                    onClick={() => setRoleFilter("contractor")}
                    className={`py-1.5 rounded-lg text-center transition-all ${
                      roleFilter === "contractor" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Contractors ({contractorsList.length})
                  </button>
                </div>
              </div>

              {/* User List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-800">
                {loadingUsers ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading user directory...</div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const isContractor = u.role === "contractor";
                    const displayName = capitalize(
                      isContractor ? u.contractor?.company_name || u.full_name : u.full_name || "Platform User"
                    );

                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          if (viewMode === "ALL_PLATFORM") setViewMode("USER_AUDIT");
                        }}
                        className={`w-full p-4 flex items-center gap-3.5 text-left transition-all hover:bg-slate-800/60 ${
                          isSelected && viewMode === "USER_AUDIT"
                            ? "bg-amber-500/10 border-l-4 border-amber-500"
                            : ""
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-extrabold text-xs text-white shadow-md ${
                            isContractor ? "bg-amber-600" : "bg-blue-600"
                          }`}
                        >
                          {displayName.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-extrabold text-xs text-white truncate">{displayName}</p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                                isContractor
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{u.email || "No email specified"}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center space-y-2 text-slate-500 text-xs">
                    <User className="h-6 w-6 mx-auto text-slate-600" />
                    <p>No users match search.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Pair Monitor Pair Selection */
            <div className="p-5 space-y-6 flex-1 overflow-y-auto bg-slate-950/60">
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> Owner ↔ Contractor Pair Audit
                </span>
                <p className="text-[11px] text-slate-400">
                  Select a specific Property Owner and Contractor to monitor their 1-on-1 messages, payment proofs & site photos.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">1. Property Owner:</label>
                <select
                  value={monitoredOwner?.id || ""}
                  onChange={(e) => {
                    const owner = ownersList.find((o) => o.id === e.target.value);
                    if (owner) setMonitoredOwner(owner);
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-xs text-white focus:ring-2 focus:ring-blue-500"
                >
                  {ownersList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {capitalize(o.full_name)} ({o.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">2. Contractor Partner:</label>
                <select
                  value={monitoredContractor?.id || ""}
                  onChange={(e) => {
                    const contractor = contractorsList.find((c) => c.id === e.target.value);
                    if (contractor) setMonitoredContractor(contractor);
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-3 text-xs text-white focus:ring-2 focus:ring-amber-500"
                >
                  {contractorsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {capitalize(c.contractor?.company_name || c.full_name)} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Chat Thread Window */}
        <div className="md:col-span-8 lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-900 flex flex-col overflow-hidden shadow-xl">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              {viewMode === "ALL_PLATFORM" ? (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold shadow-lg">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">Live Platform Message Stream</h3>
                    <p className="text-[11px] text-emerald-400 font-bold">Synchronized Feed across All Owners & Contractors</p>
                  </div>
                </>
              ) : viewMode === "PAIR_MONITOR" ? (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold shadow-lg">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      Owner: {capitalize(monitoredOwner?.full_name)} ↔ Contractor: {capitalize(monitoredContractor?.contractor?.company_name || monitoredContractor?.full_name)}
                    </h3>
                    <p className="text-[11px] text-blue-300 font-bold">Dispute Resolution & Payment Audit Mode</p>
                  </div>
                </>
              ) : selectedUser ? (
                <>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl font-extrabold text-sm text-white shadow-lg ${
                      selectedUser.role === "contractor" ? "bg-amber-600" : "bg-blue-600"
                    }`}
                  >
                    {capitalize(
                      selectedUser.role === "contractor"
                        ? selectedUser.contractor?.company_name || selectedUser.full_name
                        : selectedUser.full_name
                    )
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        {capitalize(
                          selectedUser.role === "contractor"
                            ? selectedUser.contractor?.company_name || selectedUser.full_name
                            : selectedUser.full_name
                        )}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          selectedUser.role === "contractor"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {selectedUser.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      All Messages & Photos involving {capitalize(selectedUser.full_name)}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-extrabold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Realtime Synced</span>
            </div>
          </div>

          {/* Messages Thread */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 bg-slate-950/30">
            {loadingChat && messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading synchronized conversation history...</div>
            ) : messages.length > 0 ? (
              messages.map((m) => {
                const sender = getSenderDetails(m.sender_id);
                const recipientName = getRecipientName(m.receiver_id);
                const imgUrl = extractImageFromMsg(m);
                const cleanText = getCleanTextFromMsg(m);
                const isFromAdmin = m.sender_id === currentAdminId;

                return (
                  <div key={m.id} className={`flex flex-col ${isFromAdmin ? "items-end" : "items-start"}`}>
                    <div className={`max-w-md sm:max-w-xl rounded-2xl p-4 text-xs space-y-2 shadow-md ${sender.bgClass}`}>
                      {/* Sender & Receiver Header */}
                      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 font-extrabold">
                          <span>{sender.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] border font-black uppercase ${sender.badgeClass}`}>
                            {sender.role}
                          </span>
                          <span className="opacity-70 font-normal">→ to {recipientName}</span>
                        </div>
                        <span className="font-mono text-[9px] opacity-75 shrink-0">
                          {new Date(m.created_at || Date.now()).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Text Content */}
                      {cleanText && <p className="leading-relaxed font-normal whitespace-pre-wrap">{cleanText}</p>}

                      {/* Photo Attachment */}
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
                              className="max-h-64 max-w-full rounded-xl border border-white/20 my-1 object-cover group-hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                            />
                            <span className="text-[10px] text-amber-300 underline font-bold inline-flex items-center gap-1 pt-0.5 group-hover:text-amber-200">
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
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                <MessageSquare className="h-8 w-8 text-slate-600" />
                <div className="text-xs font-bold text-white">No Message History</div>
                <p className="text-[11px] max-w-xs">No direct messages or shared photos found for this view selection.</p>
              </div>
            )}
          </div>

          {/* Admin Response Bar */}
          {selectedUser && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-2 shrink-0">
              {selectedImage && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-400 w-fit">
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

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                  title="Attach Screenshot or Guidance Image"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder={`Send direct admin message or photo to ${capitalize(selectedUser.full_name)}...`}
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />

                <button
                  type="submit"
                  disabled={sending || (!inputContent.trim() && !selectedImage)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 disabled:opacity-50 transition-all shrink-0"
                >
                  <span>Send Admin Msg</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
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
