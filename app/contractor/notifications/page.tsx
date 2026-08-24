"use client";

import { Bell, CheckCircle2, FileText, CreditCard, Clock } from "lucide-react";

export default function ContractorNotificationsPage() {
  const NOTIFICATIONS = [
    { id: "1", title: "Bid Accepted!", desc: "Owner Rajesh Kumar accepted your quotation of ₹32.5L for Modern Duplex Villa.", time: "2 hours ago", type: "accepted" },
    { id: "2", title: "New Tender Published", desc: "Commercial Office Fit-out in Bengaluru is now open for bidding.", time: "1 day ago", type: "tender" },
    { id: "3", title: "Milestone Disbursement Released", desc: "Payment of ₹10,00,000 for Milestone 2 has been processed.", time: "3 days ago", type: "payment" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-xs text-muted-foreground">Alerts for bid acceptances, payment disbursements, and tender updates</p>
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
