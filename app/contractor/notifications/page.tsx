"use client";

import { useState } from "react";
import { Bell, CheckCircle2, DollarSign, MessageSquare, FileText, Sparkles } from "lucide-react";

export default function ContractorNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "cn-1",
      title: "Bid Accepted! 🎉",
      message: "Congratulations! Your bid of ₹28.50 Lakhs for 3BHK Independent Villa has been accepted.",
      type: "bid_accepted",
      time: "15 mins ago",
      unread: true,
    },
    {
      id: "cn-2",
      title: "New Tender Published",
      message: "A new Residential Villa tender in Jubilee Hills looking for BOQ quotes matching your specialization.",
      type: "new_tender",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: "cn-3",
      title: "Payment Released",
      message: "Property owner approved & released Milestone #1 payment of ₹7.00 Lakhs.",
      type: "payment_update",
      time: "Yesterday",
      unread: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-orange-600" /> Contractor Notifications
          </h1>
          <p className="text-xs text-muted-foreground">Updates on bid acceptance, new tender alerts, and milestone payouts.</p>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-orange-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl border p-4 transition-all flex items-start gap-4 ${
              n.unread ? "bg-orange-500/5 border-orange-500/30" : "bg-card"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 shrink-0 font-bold">
              {n.type === "bid_accepted" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <FileText className="h-5 w-5" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">{n.title}</span>
                <span className="text-muted-foreground text-[11px] font-normal">{n.time}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
