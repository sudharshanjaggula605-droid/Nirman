"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  Search,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Paperclip,
  Send,
  Loader2,
  X,
  User,
  Mail,
  Phone,
  ExternalLink,
  Tag,
  Calendar,
  RefreshCw,
  Filter,
} from "lucide-react";
import { getSupportRequestsAction, updateSupportRequestAction } from "@/actions/support";
import { formatDate } from "@/lib/utils";

const USER_TYPE_OPTIONS = ["All", "Owner", "Contractor", "General Visitor"];
const ISSUE_TYPE_OPTIONS = [
  "All",
  "Account / Login",
  "Registration",
  "Tender",
  "Bidding",
  "Project",
  "Payment",
  "Document",
  "Technical Problem",
  "Other",
];
const STATUS_OPTIONS = ["All", "Pending", "In Progress", "Resolved", "Closed"];

export default function AdminSupportPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const [issueTypeFilter, setIssueTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Selected Request Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [adminResponseText, setAdminResponseText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedRequest && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [selectedRequest]);

  // Escape key handler
  useEffect(() => {
    if (!selectedRequest) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !updating) {
        setSelectedRequest(null);
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedRequest, updating]);

  const loadRequests = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getSupportRequestsAction();
      if (res && res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error loading support requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Normalize status for consistent filtering
  const normalizeStatus = (
    status: string | null | undefined
  ): "pending" | "in_progress" | "resolved" | "closed" => {
    const s = (status || "").toLowerCase().trim();
    if (s === "open" || s === "pending") return "pending";
    if (s === "under_review" || s === "in_progress") return "in_progress";
    if (s === "resolved") return "resolved";
    if (s === "closed") return "closed";
    return "pending";
  };

  // Filter & Sort Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (req?.request_number || "").toLowerCase().includes(query) ||
        (req?.name || "").toLowerCase().includes(query) ||
        (req?.email || "").toLowerCase().includes(query) ||
        (req?.phone || "").toLowerCase().includes(query) ||
        (req?.subject || "").toLowerCase().includes(query) ||
        (req?.message || "").toLowerCase().includes(query);

      const matchesUserType =
        userTypeFilter === "All" ||
        (req?.user_type || "").toLowerCase() === userTypeFilter.toLowerCase();

      const matchesIssueType =
        issueTypeFilter === "All" ||
        (req?.issue_type || "").toLowerCase() === issueTypeFilter.toLowerCase();

      const reqStatusNormalized = normalizeStatus(req?.status);
      let matchesStatus = true;
      if (statusFilter === "Pending") matchesStatus = reqStatusNormalized === "pending";
      else if (statusFilter === "In Progress") matchesStatus = reqStatusNormalized === "in_progress";
      else if (statusFilter === "Resolved") matchesStatus = reqStatusNormalized === "resolved";
      else if (statusFilter === "Closed") matchesStatus = reqStatusNormalized === "closed";

      return matchesSearch && matchesUserType && matchesIssueType && matchesStatus;
    });
  }, [requests, searchQuery, userTypeFilter, issueTypeFilter, statusFilter]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const timeA = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b?.created_at ? new Date(b.created_at).getTime() : 0;
      if (sortBy === "oldest") return timeA - timeB;
      return timeB - timeA;
    });
  }, [filteredRequests, sortBy]);

  // Metrics Count
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => normalizeStatus(r?.status) === "pending").length;
    const inProgress = requests.filter((r) => normalizeStatus(r?.status) === "in_progress").length;
    const resolved = requests.filter((r) => normalizeStatus(r?.status) === "resolved").length;
    const closed = requests.filter((r) => normalizeStatus(r?.status) === "closed").length;
    return { total, pending, inProgress, resolved, closed };
  }, [requests]);

  const handleOpenDetailModal = (req: any) => {
    setSelectedRequest(req);
    setAdminResponseText(req?.admin_response || "");
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  const handleStatusChange = async (
    newStatus: "pending" | "in_progress" | "resolved" | "closed"
  ) => {
    if (!selectedRequest) return;
    setUpdating(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await updateSupportRequestAction(
      selectedRequest.id,
      newStatus,
      adminResponseText
    );

    if (res.success) {
      const label = getStatusLabel(newStatus);
      setActionSuccessMsg(`Status updated to "${label}"`);
      setSelectedRequest((prev: any) => ({
        ...prev,
        status: newStatus,
        admin_response: adminResponseText,
        updated_at: new Date().toISOString(),
      }));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: newStatus,
                admin_response: adminResponseText,
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );
      await loadRequests();
    } else {
      setActionErrorMsg(res.error || "Failed to update request status.");
    }

    setUpdating(false);
  };

  const handleSendResponse = async () => {
    if (!selectedRequest) return;
    if (!adminResponseText.trim()) {
      setActionErrorMsg("Please enter a response message before saving.");
      return;
    }
    setUpdating(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await updateSupportRequestAction(
      selectedRequest.id,
      selectedRequest.status || "in_progress",
      adminResponseText.trim()
    );

    if (res.success) {
      setActionSuccessMsg("Admin official response saved successfully!");
      setSelectedRequest((prev: any) => ({
        ...prev,
        admin_response: adminResponseText.trim(),
        updated_at: new Date().toISOString(),
      }));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                admin_response: adminResponseText.trim(),
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );
      await loadRequests();
    } else {
      setActionErrorMsg(res.error || "Failed to save admin response.");
    }

    setUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-extrabold text-amber-400 border border-amber-500/30">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-extrabold text-blue-400 border border-blue-500/30">
            <AlertCircle className="h-3 w-3" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-extrabold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-extrabold text-slate-400 border border-slate-700">
            <XCircle className="h-3 w-3" /> Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-extrabold text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const renderModal = () => {
    if (!selectedRequest || !mounted || typeof document === "undefined") return null;

    const currentNormStatus = normalizeStatus(selectedRequest.status);

    const modalJsx = (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
        onClick={updating ? undefined : () => setSelectedRequest(null)}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-8 space-y-6 shadow-2xl my-auto animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                  {selectedRequest.request_number || "NIR-1000"}
                </span>
                {getStatusBadge(selectedRequest.status)}
                {currentNormStatus === "pending" && !selectedRequest.admin_response && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-400 border border-rose-500/30 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> NEW / UNREAD
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-500" /> Category:{" "}
                  <strong className="text-slate-200">{selectedRequest.issue_type || "General"}</strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-500" />{" "}
                  {formatDate(selectedRequest.created_at)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              disabled={updating}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Feedback Messages */}
          {actionSuccessMsg && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
              <button
                onClick={() => setActionSuccessMsg(null)}
                className="text-emerald-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {actionErrorMsg && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-bold text-rose-400 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionErrorMsg}</span>
              </div>
              <button
                onClick={() => setActionErrorMsg(null)}
                className="text-rose-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Submitter & Role Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs">
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                User & Contact Info
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                  <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />{" "}
                  <span className="truncate">{selectedRequest.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />{" "}
                  <span className="truncate">{selectedRequest.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />{" "}
                  <span>{selectedRequest.phone || "No phone provided"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Role & Authentication
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-400">User Role: </span>
                  <strong className="text-amber-400 uppercase font-bold">
                    {selectedRequest.user_type || "Visitor"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Account ID: </span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {selectedRequest.user_id ? (
                      <span className="text-emerald-400">
                        Verified User ({String(selectedRequest.user_id).slice(0, 8)}...)
                      </span>
                    ) : (
                      <span className="text-slate-400">Visitor Contact</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subject & Message Content */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400">Subject</div>
              <div className="text-sm sm:text-base font-extrabold text-white">
                {selectedRequest.subject || "No Subject"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400">Message / Issue Description</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedRequest.message || "No message content provided."}
              </div>
            </div>

            {selectedRequest.attachment_url && (
              <div className="pt-1">
                <div className="text-xs font-bold text-slate-400 mb-1.5">Uploaded Attachment</div>
                <a
                  href={selectedRequest.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Paperclip className="h-4 w-4" /> View / Download Attachment
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            )}
          </div>

          {/* Status Workflow Action Bar */}
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Update Request Status
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={updating || currentNormStatus === "pending"}
                onClick={() => handleStatusChange("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentNormStatus === "pending"
                    ? "bg-amber-500 text-slate-950 border-amber-500 ring-2 ring-amber-500/30"
                    : "bg-slate-950 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                } disabled:opacity-50`}
              >
                Mark Pending
              </button>

              <button
                disabled={updating || currentNormStatus === "in_progress"}
                onClick={() => handleStatusChange("in_progress")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentNormStatus === "in_progress"
                    ? "bg-blue-500 text-white border-blue-500 ring-2 ring-blue-500/30"
                    : "bg-slate-950 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                } disabled:opacity-50`}
              >
                Mark In Progress
              </button>

              <button
                disabled={updating || currentNormStatus === "resolved"}
                onClick={() => handleStatusChange("resolved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentNormStatus === "resolved"
                    ? "bg-emerald-500 text-slate-950 border-emerald-500 ring-2 ring-emerald-500/30"
                    : "bg-slate-950 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                } disabled:opacity-50`}
              >
                Mark Resolved
              </button>

              <button
                disabled={updating || currentNormStatus === "closed"}
                onClick={() => handleStatusChange("closed")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentNormStatus === "closed"
                    ? "bg-slate-700 text-white border-slate-600 ring-2 ring-slate-600/30"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                } disabled:opacity-50`}
              >
                Close Request
              </button>
            </div>
          </div>

          {/* Admin Response Form */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Official Response / Resolution Notes
            </div>
            <textarea
              rows={4}
              value={adminResponseText}
              onChange={(e) => setAdminResponseText(e.target.value)}
              placeholder="Write an official administrative response or resolution notes..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-y"
            />
            <div className="flex justify-end">
              <button
                disabled={updating}
                onClick={handleSendResponse}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Response...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Save Response
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalJsx, document.body);
  };

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <HelpCircle className="h-3.5 w-3.5" /> Support & Inquiries Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Support & Contact Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time database records of all issues, inquiries, and requests submitted through the Contact page by Property Owners, Contractors, and Visitors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadRequests(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Database"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Total Inquiries</div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm">
          <div className="text-xs font-semibold text-amber-400">Pending</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400">{stats.pending}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm">
          <div className="text-xs font-semibold text-blue-400">In Progress</div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-400">{stats.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm">
          <div className="text-xs font-semibold text-emerald-400">Resolved</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">{stats.resolved}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Closed</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-400">{stats.closed}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Request ID, Name, Email, Phone, Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter by User Type */}
          <div>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="All">User Role: All</option>
              {USER_TYPE_OPTIONS.filter((u) => u !== "All").map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Issue Type */}
          <div>
            <select
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="All">Category: All</option>
              {ISSUE_TYPE_OPTIONS.filter((i) => i !== "All").map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="All">Status: All</option>
              {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-slate-100">{sortedRequests.length}</span> of{" "}
            <span className="font-bold text-slate-100">{stats.total}</span> requests
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support Requests Table List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-500" />
            <p className="text-xs">Loading support requests from database...</p>
          </div>
        ) : sortedRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                  <th className="p-4">Request #</th>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Category & Subject</th>
                  <th className="p-4">Submitted On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {sortedRequests.map((req) => {
                  const norm = normalizeStatus(req?.status);
                  const isNew = norm === "pending" && !req?.admin_response;

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetailModal(req)}
                    >
                      <td className="p-4 font-mono font-bold text-amber-400">
                        <div className="flex items-center gap-1.5">
                          <span>{req?.request_number || "NIR-1000"}</span>
                          {isNew && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{req?.name || "Anonymous"}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span>{req?.email || "No email"}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">{req?.user_type || "Visitor"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-200 font-mono text-[11px]">
                        {req?.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-amber-500" />
                            <span>{req.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-bold mb-1">
                          {req?.issue_type || "General"}
                        </div>
                        <div className="font-medium text-slate-200 line-clamp-1 max-w-xs">
                          {req?.subject || "No Subject"}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>{formatDate(req?.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(req?.status)}</td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDetailModal(req)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-400" /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <HelpCircle className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-200">No support requests in database</h3>
            <p className="text-xs max-w-sm mx-auto">
              Any issue or inquiry submitted through the Contact page will automatically appear here in real time.
            </p>
          </div>
        )}
      </div>

      {/* Render Modal via Portal */}
      {renderModal()}
    </div>
  );
}
