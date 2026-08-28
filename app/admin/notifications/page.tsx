"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  UserCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  Filter,
  Check,
  Loader2,
  RefreshCw,
  Tag,
  User,
  HelpCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationsAsReadAction } from "@/actions/notifications";

interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string; // 'support_request', 'user_approval', 'complaint', etc.
  user_type?: string; // 'owner', 'contractor', 'visitor'
  request_number?: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "complaints" | "approvals" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const supabase = createClient();

  const fetchAdminNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch system notifications
      let systemNotifs: AdminNotificationItem[] = [];
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (notifData) {
        systemNotifs = notifData.map((n: any) => ({
          id: n.id,
          title: n.title || "System Alert",
          message: n.message || "",
          type: n.type || "system",
          is_read: n.is_read || false,
          created_at: n.created_at,
          link: n.type === "support_request" ? "/admin/support" : n.type === "user_approval" ? "/admin/approvals" : undefined,
        }));
      }

      // 2. Fetch support requests & complaints directly to ensure all complaints are visible
      const { data: supportData } = await supabase
        .from("support_requests")
        .select("*")
        .order("created_at", { ascending: false });

      let complaintNotifs: AdminNotificationItem[] = [];
      if (supportData) {
        complaintNotifs = supportData.map((sr: any) => {
          const userTypeLabel = sr.user_type === "contractor" ? "Contractor" : sr.user_type === "owner" ? "Owner" : "Visitor";
          return {
            id: `sr-${sr.id}`,
            title: `🚨 ${userTypeLabel} Complaint: ${sr.issue_type || "Support Request"}`,
            message: `${sr.request_number || 'Ticket'} (${sr.name || 'User'} - ${sr.email}): ${sr.subject} - "${sr.message}"`,
            type: "support_request",
            user_type: sr.user_type,
            request_number: sr.request_number,
            is_read: sr.status === "resolved" || sr.status === "closed",
            created_at: sr.created_at,
            link: "/admin/support",
          };
        });
      }

      // Merge and deduplicate by request number / message
      const combined = [...systemNotifs];
      
      // Add support complaints that aren't already represented in systemNotifs
      complaintNotifs.forEach((cn) => {
        const exists = combined.some(
          (n) => n.message.includes(cn.request_number || "___XYZ___") || n.id === cn.id
        );
        if (!exists) {
          combined.push(cn);
        }
      });

      // Sort by newest first
      combined.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(combined);
    } catch (err) {
      console.error("Error fetching admin notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();
    markNotificationsAsReadAction();
  }, []);

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const markSingleAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    if (!id.startsWith("sr-")) {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "unread") return !n.is_read;
    if (filterTab === "complaints") return n.type === "support_request" || n.type === "complaint" || n.title.includes("Complaint");
    if (filterTab === "approvals") return n.type === "user_approval" || n.title.includes("Approval") || n.title.includes("User");
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const complaintsCount = notifications.filter((n) => n.type === "support_request" || n.title.includes("Complaint")).length;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes} mins ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    } catch {
      return "Recently";
    }
  };

  const getNotificationBadgeIcon = (n: AdminNotificationItem) => {
    if (n.type === "support_request" || n.title.includes("Complaint")) {
      return <ShieldAlert className="h-5 w-5 text-rose-600" />;
    }
    if (n.type === "user_approval" || n.title.includes("Approval")) {
      return <UserCheck className="h-5 w-5 text-amber-500" />;
    }
    return <Bell className="h-5 w-5 text-orange-600" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 border border-orange-500/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Admin Notifications & Complaints Center
                {unreadCount > 0 && (
                  <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                    {unreadCount} New
                  </span>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time issue tracking for Contractor & Owner complaints, support tickets, and platform alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminNotifications}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-orange-600" : ""}`} />
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50 transition-all"
          >
            <Check className="h-3.5 w-3.5" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Complaints / Tickets</span>
          <div className="text-2xl font-black text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            {complaintsCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Submitted by Owners & Contractors</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Unread Alerts</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-500" />
            {unreadCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Requires admin attention</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Support Portal</span>
          <div className="pt-1">
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:from-orange-700 hover:to-amber-700 transition-all"
            >
              Open Support Manager <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground">Manage and resolve open support tickets</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto">
        <button
          onClick={() => setFilterTab("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            filterTab === "all"
              ? "bg-orange-600 text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          All Notifications ({notifications.length})
        </button>

        <button
          onClick={() => setFilterTab("complaints")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            filterTab === "complaints"
              ? "bg-orange-600 text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
          Complaints & Issues ({complaintsCount})
        </button>

        <button
          onClick={() => setFilterTab("approvals")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            filterTab === "approvals"
              ? "bg-orange-600 text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 text-amber-500" />
          User Approvals
        </button>

        <button
          onClick={() => setFilterTab("unread")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            filterTab === "unread"
              ? "bg-orange-600 text-white shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Fetching admin notifications & complaints...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Notifications Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filterTab === "unread"
              ? "All notifications have been marked as read!"
              : filterTab === "complaints"
              ? "No owner or contractor complaints reported yet."
              : "Your admin notification list is currently empty."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const isComplaint = n.type === "support_request" || n.title.includes("Complaint");
            return (
              <div
                key={n.id}
                className={`group rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !n.is_read
                    ? isComplaint
                      ? "bg-rose-500/5 border-rose-500/30 shadow-sm"
                      : "bg-orange-500/5 border-orange-500/30 shadow-sm"
                    : "bg-card hover:border-border"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 font-bold ${
                      isComplaint
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                    }`}
                  >
                    {getNotificationBadgeIcon(n)}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground">{n.title}</span>
                      
                      {!n.is_read && (
                        <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-extrabold text-white tracking-wide uppercase shadow-sm">
                          New Unread
                        </span>
                      )}

                      {n.user_type && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize border ${
                            n.user_type === "owner"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                              : n.user_type === "contractor"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                              : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                          }`}
                        >
                          {n.user_type} Issue
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pr-2">{n.message}</p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" /> {formatTime(n.created_at)}
                      </span>
                      {n.request_number && (
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground font-bold">
                          {n.request_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  {n.link && (
                    <Link
                      href={n.link}
                      className="inline-flex items-center gap-1 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition-colors"
                    >
                      View Issue <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => markSingleAsRead(n.id)}
                      className="inline-flex items-center gap-1 rounded-xl border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
