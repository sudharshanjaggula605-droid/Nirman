"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  UserCheck,
  ShieldAlert,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Briefcase,
  Eye,
} from "lucide-react";
import {
  getAllAdminUsersAction,
  approveUserAction,
  deleteUserAction,
  setUserStatusAction,
} from "@/actions/admin";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { UserDetailsModal } from "@/components/admin/user-details-modal";
import { formatDate } from "@/lib/utils";

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleTab, setRoleTab] = useState<"all" | "owner" | "contractor">("all");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAllUsers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAllAdminUsersAction();
      if (res.success && res.users) {
        // Only keep owners and contractors
        setUsers(res.users.filter((u: any) => u.role !== "admin"));
      } else if (res.error) {
        setMessage({ text: "Error loading users: " + res.error, type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: "Failed to connect to database.", type: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleTab === "all" || u.role?.toLowerCase() === roleTab.toLowerCase();
      const userStatus = (u.status || "APPROVED").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || userStatus === statusFilter;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesRole && matchesStatus;

      const fullName = (u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || u.owner?.phone || u.contractor?.phone || "").toLowerCase();
      const company = (u.contractor?.company_name || "").toLowerCase();
      const city = (u.city || u.owner?.city || u.contractor?.city || "").toLowerCase();
      const state = (u.state || u.owner?.state || u.contractor?.state || "").toLowerCase();
      const gst = (u.contractor?.gst_number || "").toLowerCase();

      const matchesSearch =
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        company.includes(q) ||
        city.includes(q) ||
        state.includes(q) ||
        gst.includes(q);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleTab, statusFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleTab, statusFilter, searchQuery, pageSize]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const owners = users.filter((u) => u.role === "owner").length;
    const contractors = users.filter((u) => u.role === "contractor").length;
    const pending = users.filter((u) => (u.status || "").toLowerCase() === "pending").length;
    const approved = users.filter((u) => (u.status || "").toLowerCase() === "approved").length;
    const blocked = users.filter((u) => (u.status || "").toLowerCase() === "blocked").length;
    return { total, owners, contractors, pending, approved, blocked };
  }, [users]);

  // Actions
  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    setMessage(null);
    // Instant optimistic update
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "approved" } : u)));

    const res = await approveUserAction(id);
    if (res?.error) {
      setMessage({ text: "Error approving user: " + res.error, type: "error" });
      // Revert on error
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "pending" } : u)));
    } else {
      setMessage({ text: "User account approved successfully!", type: "success" });
    }
    setActionLoadingId(null);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    setMessage(null);
    const oldStatus = users.find((u) => u.id === id)?.status || "pending";
    // Instant optimistic update
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));

    const res = await setUserStatusAction(id, newStatus);
    if (res?.error) {
      setMessage({ text: "Error updating status: " + res.error, type: "error" });
      // Revert on error
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: oldStatus } : u)));
    } else {
      setMessage({
        text: `User status changed to ${newStatus.toUpperCase()}.`,
        type: "success",
      });
    }
    setActionLoadingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    setMessage(null);
    // Instant optimistic deletion
    setUsers((prev) => prev.filter((u) => u.id !== targetId));
    setUserToDelete(null);

    const res = await deleteUserAction(targetId);
    if (res?.error) {
      setMessage({ text: "Error deleting user: " + res.error, type: "error" });
      fetchAllUsers(true);
    } else {
      setMessage({ text: "User account permanently deleted.", type: "success" });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Users className="h-3.5 w-3.5" /> Registered Platform Users Directory
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Management & Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Complete, real-time database view of all registered Property Owners and Contractors with verification, contact information, and account governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllUsers(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Database"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards (Owners & Contractors) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400">Total Users</div>
          <div className="text-xl sm:text-2xl font-black text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-semibold text-blue-400">Property Owners</div>
          <div className="text-xl sm:text-2xl font-black text-blue-400">{stats.owners}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-semibold text-amber-400">Contractors</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{stats.contractors}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-semibold text-emerald-400">Active Approved</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats.approved}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1 shadow-sm">
          <div className="text-[11px] font-semibold text-rose-400">Pending Approvals</div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">{stats.pending}</div>
        </div>
      </div>

      {/* Notification Message */}
      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-bold border flex items-center justify-between gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search, Filter Bar & Role Tabs */}
      <div className="space-y-4">
        {/* Role Tabs (Only Owners & Contractors) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setRoleTab("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              roleTab === "all"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Users className="h-4 w-4" /> All Users ({users.length})
          </button>

          <button
            onClick={() => setRoleTab("owner")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              roleTab === "owner"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4 text-blue-400" /> Property Owners ({stats.owners})
          </button>

          <button
            onClick={() => setRoleTab("contractor")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              roleTab === "contractor"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Briefcase className="h-4 w-4 text-amber-400" /> Contractors ({stats.contractors})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone number, company, GST, or city..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap justify-between lg:justify-end">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
                <Filter className="h-3 w-3" /> Status:
              </span>
              {["ALL", "APPROVED", "PENDING", "REJECTED", "BLOCKED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Rows per page */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Detailed Table Card */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-xs font-semibold">Fetching user directory from database...</p>
          </div>
        ) : paginatedUsers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Role & Organization</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Registered On</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {paginatedUsers.map((u) => {
                    const statusUpper = (u.status || "APPROVED").toUpperCase();
                    const phoneVal = u.phone || u.owner?.phone || u.contractor?.phone || "Not Provided";
                    const cityVal = u.city || u.owner?.city || u.contractor?.city || "Hyderabad";
                    const stateVal = u.state || u.owner?.state || u.contractor?.state || "Telangana";
                    const companyVal = u.contractor?.company_name;
                    const expVal = u.contractor?.years_of_experience;
                    const isActing = actionLoadingId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* User Full Name & Email (Clickable to view details) */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForModal(u)}
                            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none w-full"
                            title="Click to view complete user details"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 font-extrabold text-amber-400 shrink-0 uppercase group-hover:border-amber-500/60 group-hover:bg-amber-500/10 group-hover:scale-105 transition-all shadow-sm">
                              {(u.full_name || "U")[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm truncate group-hover:text-amber-400 group-hover:underline underline-offset-2 transition-colors flex items-center gap-1.5">
                                <span>{u.full_name || "Unnamed User"}</span>
                                <Eye className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-amber-400 transition-opacity" />
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Mail className="h-3 w-3 text-slate-500 shrink-0" />
                                <span className="truncate">{u.email}</span>
                              </div>
                            </div>
                          </button>
                        </td>

                        {/* Contact Phone */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Phone className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="font-mono text-[11px]">{phoneVal}</span>
                          </div>
                        </td>

                        {/* Role & Org */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                                u.role === "contractor"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {u.role === "contractor"
                                ? "Contractor Partner"
                                : "Property Owner"}
                            </span>
                            {companyVal && (
                              <div className="text-[11px] font-semibold text-slate-300 truncate">
                                {companyVal}
                                {expVal ? ` (${expVal} yrs exp)` : ""}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-slate-300 text-[11px]">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>
                              {cityVal}, {stateVal}
                            </span>
                          </div>
                        </td>

                        {/* Registration Date */}
                        <td className="p-4 text-slate-400 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>{formatDate(u.created_at)}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              statusUpper === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : statusUpper === "BLOCKED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                : statusUpper === "REJECTED"
                                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {statusUpper === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                            {statusUpper === "PENDING" && <Clock className="h-3 w-3" />}
                            {statusUpper === "BLOCKED" && <Ban className="h-3 w-3" />}
                            {statusUpper === "REJECTED" && <XCircle className="h-3 w-3" />}
                            <span>{statusUpper}</span>
                          </span>
                        </td>

                        {/* Governance Action Buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* View Details Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedUserForModal(u)}
                              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors cursor-pointer"
                              title="View Full User Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Approve if Pending */}
                            {statusUpper === "PENDING" && (
                              <button
                                onClick={() => handleApprove(u.id)}
                                disabled={isActing}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                {isActing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Block / Unblock */}
                            {statusUpper !== "BLOCKED" ? (
                              <button
                                onClick={() => handleStatusChange(u.id, "blocked")}
                                disabled={isActing}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40 px-2.5 py-1 text-xs font-bold hover:bg-rose-900 cursor-pointer disabled:opacity-40"
                                title="Block Account"
                              >
                                <Ban className="h-3 w-3" />
                                <span className="hidden sm:inline">Block</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(u.id, "approved")}
                                disabled={isActing}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 text-xs font-bold hover:bg-emerald-900 cursor-pointer disabled:opacity-50"
                                title="Unblock Account"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Unblock</span>
                              </button>
                            )}

                            {/* Delete User */}
                            <button
                              onClick={() => setUserToDelete(u)}
                              disabled={isActing}
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-30"
                              title={`Delete ${u.role === "contractor" ? "Contractor" : "Property Owner"}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-800 gap-3 text-xs text-slate-400 bg-slate-950/40">
              <div>
                Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong className="text-white">
                  {Math.min(currentPage * pageSize, filteredUsers.length)}
                </strong>{" "}
                of <strong className="text-white">{filteredUsers.length}</strong> filtered users (
                {users.length} total)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 font-bold text-white">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl p-12 text-center space-y-3 text-slate-400">
            <Users className="h-10 w-10 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-white">No Matching Users Found</div>
            <p className="text-xs max-w-sm mx-auto">
              No registered user records match your search or filter criteria. Try clearing your filters or refreshing the list.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setRoleTab("all");
              }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUserForModal}
        isOpen={!!selectedUserForModal}
        onClose={() => setSelectedUserForModal(null)}
        onApprove={handleApprove}
        onStatusChange={handleStatusChange}
        onDelete={setUserToDelete}
        isActing={!!actionLoadingId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${
          userToDelete?.role === "contractor"
            ? "Contractor Account"
            : "Property Owner Account"
        }`}
        itemName={
          userToDelete?.contractor?.company_name ||
          userToDelete?.full_name ||
          userToDelete?.email
        }
        role={userToDelete?.role === "contractor" ? "Contractor" : "Property Owner"}
      />
    </div>
  );
}
