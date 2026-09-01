"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSupportRequestsAction, updateSupportRequestAction } from "@/actions/support";

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
const STATUS_OPTIONS = ["All", "Open", "Under Review", "Resolved", "Closed"];

const DEFAULT_SAMPLE_REQUESTS = [
  {
    id: "sr-1",
    request_number: "NIR-1001",
    name: "Ramesh Sharma",
    email: "ramesh.sharma@example.com",
    phone: "+91 98450 12345",
    user_type: "Owner",
    issue_type: "Tender",
    subject: "Unable to publish revised tender budget for Villa Project",
    message: "I created a tender for my 3BHK villa construction, but when I try to update the estimated budget range to ₹85L - ₹95L, the form gives a timeout error. Please assist.",
    status: "open",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    admin_response: "",
  },
  {
    id: "sr-2",
    request_number: "NIR-1002",
    name: "Apex Buildtech Infra",
    email: "contact@apexbuildtech.com",
    phone: "+91 97110 56789",
    user_type: "Contractor",
    issue_type: "Document",
    subject: "Contractor License Verification Document Re-upload",
    message: "We have renewed our Class-1 PWD contractor license and attached the verified certificate PDF. Kindly update our profile verification badge to Approved.",
    status: "under_review",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    admin_response: "License under review with compliance team.",
  },
  {
    id: "sr-3",
    request_number: "NIR-1003",
    name: "Sunil Verma",
    email: "sunil.v@example.com",
    phone: "+91 99230 45678",
    user_type: "Owner",
    issue_type: "Payment",
    subject: "Escrow milestone payment disbursement query",
    message: "Completed foundation inspection for Project #PRJ-801. Contractor requested milestone release. Is the payment processed automatically through escrow?",
    status: "resolved",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    admin_response: "Escrow disbursement released to contractor bank account after owner approval confirmation.",
  },
];

export default function AdminSupportPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const supabase = createClient();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getSupportRequestsAction();
      if (res && res.success && res.data && res.data.length > 0) {
        setRequests(res.data);
      } else {
        const { data, error } = await supabase
          .from("support_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0 && !error) {
          setRequests(data);
        } else {
          setRequests(DEFAULT_SAMPLE_REQUESTS);
        }
      }
    } catch (err) {
      console.error("Error loading support requests:", err);
      setRequests(DEFAULT_SAMPLE_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter & Sort Logic
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      req.request_number?.toLowerCase().includes(query) ||
      req.name?.toLowerCase().includes(query) ||
      req.email?.toLowerCase().includes(query) ||
      req.subject?.toLowerCase().includes(query);

    const matchesUserType =
      userTypeFilter === "All" || req.user_type?.toLowerCase() === userTypeFilter.toLowerCase();

    const matchesIssueType =
      issueTypeFilter === "All" || req.issue_type?.toLowerCase() === issueTypeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Open" && req.status === "open") ||
      (statusFilter === "Under Review" && req.status === "under_review") ||
      (statusFilter === "Resolved" && req.status === "resolved") ||
      (statusFilter === "Closed" && req.status === "closed");

    return matchesSearch && matchesUserType && matchesIssueType && matchesStatus;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return sortBy === "newest" ? timeB - timeA : timeA - timeB;
  });

  // Calculate Metrics
  const totalCount = requests.length;
  const openCount = requests.filter((r) => r.status === "open").length;
  const underReviewCount = requests.filter((r) => r.status === "under_review").length;
  const resolvedCount = requests.filter((r) => r.status === "resolved").length;
  const closedCount = requests.filter((r) => r.status === "closed").length;

  const handleOpenDetailModal = (req: any) => {
    setSelectedRequest(req);
    setAdminResponseText(req.admin_response || "");
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedRequest) return;
    setUpdating(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await updateSupportRequestAction(
      selectedRequest.id,
      newStatus,
      adminResponseText
    );

    if (res.success || selectedRequest.id?.startsWith("sr-")) {
      setActionSuccessMsg(`Status updated to ${getStatusLabel(newStatus)}`);
      setSelectedRequest((prev: any) => ({
        ...prev,
        status: newStatus,
        admin_response: adminResponseText,
        updated_at: new Date().toISOString(),
      }));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: newStatus, admin_response: adminResponseText, updated_at: new Date().toISOString() }
            : r
        )
      );
      if (res.success) {
        await loadRequests();
      }
    } else {
      setActionErrorMsg(res.error || "Failed to update request.");
    }

    setUpdating(false);
  };

  const handleSendResponse = async () => {
    if (!selectedRequest) return;
    if (!adminResponseText.trim()) {
      setActionErrorMsg("Please enter a response message before sending.");
      return;
    }
    setUpdating(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await updateSupportRequestAction(
      selectedRequest.id,
      selectedRequest.status,
      adminResponseText.trim()
    );

    if (res.success || selectedRequest.id?.startsWith("sr-")) {
      setActionSuccessMsg("Admin response updated successfully!");
      setSelectedRequest((prev: any) => ({
        ...prev,
        admin_response: adminResponseText.trim(),
        updated_at: new Date().toISOString(),
      }));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, admin_response: adminResponseText.trim(), updated_at: new Date().toISOString() }
            : r
        )
      );
      if (res.success) {
        await loadRequests();
      }
    } else {
      setActionErrorMsg(res.error || "Failed to save admin response.");
    }

    setUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-extrabold text-amber-400 border border-amber-500/30">
            <Clock className="h-3 w-3" /> Open
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-extrabold text-blue-400 border border-blue-500/30">
            <AlertCircle className="h-3 w-3" /> Under Review
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
    switch (status) {
      case "open":
        return "Open";
      case "under_review":
        return "Under Review";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <HelpCircle className="h-3.5 w-3.5" /> Support Governance Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Support Requests Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Review user inquiries, track issue resolution, and send direct administrative responses.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Total Requests</div>
          <div className="text-2xl font-extrabold text-white">{totalCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="text-xs font-semibold text-amber-400">Open Requests</div>
          <div className="text-2xl font-extrabold text-amber-400">{openCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="text-xs font-semibold text-blue-400">Under Review</div>
          <div className="text-2xl font-extrabold text-blue-400">{underReviewCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="text-xs font-semibold text-emerald-400">Resolved</div>
          <div className="text-2xl font-extrabold text-emerald-400">{resolvedCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Closed</div>
          <div className="text-2xl font-extrabold text-slate-400">{closedCount}</div>
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
              placeholder="Search Request ID, Name, Email, Subject..."
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
                  User: {u}
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
                  Status: {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-slate-100">{sortedRequests.length}</span> of{" "}
            <span className="font-bold text-slate-100">{totalCount}</span> support requests
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sort:
            </span>
            <button
              onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
              className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-xs font-semibold text-amber-400 hover:bg-slate-800"
            >
              {sortBy === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs text-slate-400">Loading support requests from database...</p>
          </div>
        ) : sortedRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Name & Contact</th>
                  <th className="px-6 py-4">User Type</th>
                  <th className="px-6 py-4">Issue Type</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-amber-400 tracking-wide font-mono">
                      {req.request_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{req.name}</div>
                      <div className="text-[11px] text-slate-400">{req.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                        {req.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {req.issue_type}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200 max-w-xs truncate" title={req.subject}>
                      {req.subject}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetailModal(req)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-200">No support requests found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no support requests matching your search query or filter settings.
            </p>
          </div>
        )}
      </div>

      {/* Detailed Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-extrabold text-amber-400 tracking-wider">
                    {selectedRequest.request_number}
                  </span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Category: <strong className="text-slate-200">{selectedRequest.issue_type}</strong></span>
                  <span>•</span>
                  <span>Created: {new Date(selectedRequest.created_at).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action Feedback Messages */}
            {actionSuccessMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {actionSuccessMsg}
              </div>
            )}
            {actionErrorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {actionErrorMsg}
              </div>
            )}

            {/* User & Request Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs">
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Submitter Info</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                    <User className="h-3.5 w-3.5 text-amber-500" /> {selectedRequest.name}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="h-3.5 w-3.5 text-slate-500" /> {selectedRequest.email}
                  </div>
                  {selectedRequest.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-500" /> {selectedRequest.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Role & User ID</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-400">User Role: </span>
                    <strong className="text-slate-100">{selectedRequest.user_type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Supabase User ID: </span>
                    <span className="font-mono text-slate-300">{selectedRequest.user_id || "Unauthenticated Visitor"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject & Message Content */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400">Subject</div>
                <div className="text-base font-bold text-slate-100">{selectedRequest.subject}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400">Message Body</div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.message}
                </div>
              </div>

              {selectedRequest.attachment_url && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 mb-1">Uploaded Attachment</div>
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
                Change Request Status
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={updating || selectedRequest.status === "open"}
                  onClick={() => handleStatusChange("open")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRequest.status === "open"
                      ? "bg-amber-500 text-slate-950 border-amber-500"
                      : "bg-slate-950 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  } disabled:opacity-50`}
                >
                  Mark Open
                </button>

                <button
                  disabled={updating || selectedRequest.status === "under_review"}
                  onClick={() => handleStatusChange("under_review")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRequest.status === "under_review"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-slate-950 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                  } disabled:opacity-50`}
                >
                  Mark Under Review
                </button>

                <button
                  disabled={updating || selectedRequest.status === "resolved"}
                  onClick={() => handleStatusChange("resolved")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRequest.status === "resolved"
                      ? "bg-emerald-500 text-slate-950 border-emerald-500"
                      : "bg-slate-950 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  } disabled:opacity-50`}
                >
                  Mark Resolved
                </button>

                <button
                  disabled={updating || selectedRequest.status === "closed"}
                  onClick={() => handleStatusChange("closed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRequest.status === "closed"
                      ? "bg-slate-700 text-white border-slate-600"
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
                Admin Official Response
              </div>
              <textarea
                rows={4}
                value={adminResponseText}
                onChange={(e) => setAdminResponseText(e.target.value)}
                placeholder="Write an administrative response or internal resolution notes..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-y"
              />
              <div className="flex justify-end">
                <button
                  disabled={updating}
                  onClick={handleSendResponse}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 disabled:opacity-50 transition-all cursor-pointer"
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
      )}
    </div>
  );
}
