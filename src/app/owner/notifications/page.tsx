"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, DollarSign, MessageSquare, FileText, Sparkles } from "lucide-react";
import { markNotificationsAsReadAction } from "@/backend/actions/notifications";

export default function OwnerNotificationsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: "New Bid Received",
      message: "ABC Constructions submitted a bid of ₹28.50 Lakhs for 3BHK Independent Villa.",
      type: "new_bid",
      time: "10 mins ago",
      isRead: false,
    },
    {
      id: "n-2",
      title: "Project Milestone Update",
      message: "Contractor uploaded brick work site inspection photos for 3BHK Independent Villa.",
      type: "project_update",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: "n-3",
      title: "Payment Request",
      message: "Contractor requested release for Milestone #2 (Slab & Brick Work - ₹10.50 Lakhs).",
      type: "payment_request",
      time: "Yesterday",
      isRead: true,
    },
  ]);

  const markAllAsRead = async () => {
    setIsUpdating(true);
    try {
      await markNotificationsAsReadAction();
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    } finally {
      // 1. Update local state so all notifications are marked as read
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setIsUpdating(false);
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-orange-600" /> Notifications
          </h1>
          <p className="text-xs text-muted-foreground">Stay updated on new contractor bids, project updates, and payment requests.</p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={isUpdating || !hasUnread}
          className="text-xs font-bold text-orange-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isUpdating ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl border p-4 transition-all flex items-start gap-4 ${
              !n.isRead
                ? "bg-blue-500/10 border-blue-500/30 dark:bg-blue-950/20 shadow-sm"
                : "bg-card border-border/40 opacity-75"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 font-bold ${
              !n.isRead ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"
            }`}>
              {n.type === "new_bid" ? <FileText className="h-5 w-5" /> : n.type === "payment_request" ? <DollarSign className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-2 ${
                  !n.isRead ? "font-extrabold text-foreground text-sm" : "font-normal text-muted-foreground"
                }`}>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 inline-block shrink-0 animate-pulse" />
                  )}
                  {n.title}
                </span>
                <span className="text-muted-foreground text-[11px] font-normal">{n.time}</span>
              </div>
              <p className={`text-xs leading-relaxed ${
                !n.isRead ? "text-foreground font-medium" : "text-muted-foreground font-normal"
              }`}>
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
