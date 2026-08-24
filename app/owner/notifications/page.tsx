"use client";

import { Bell, CheckCircle2, FileText, CreditCard, Clock } from "lucide-react";

export default function OwnerNotificationsPage() {
  const NOTIFICATIONS = [
    { id: "1", title: "New Proposal Received", desc: "BuildPro Constructions submitted a bid of ₹32.5L for Modern Duplex Villa.", time: "1 hour ago" },
    { id: "2", title: "Milestone Update Submitted", desc: "Contractor submitted Milestone 3 progress update & site photo for verification.", time: "4 hours ago" },
    { id: "3", title: "Tender Closing Soon", desc: "Commercial Office Fit-out tender closes in 48 hours.", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-xs text-muted-foreground">Stay updated on new contractor bids, milestone progress updates, and payment requests</p>
      </div>

      <div className="space-y-3">
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className="flex items-start gap-4 p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">{n.title}</span>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </div>
              <p className="text-xs text-muted-foreground">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
