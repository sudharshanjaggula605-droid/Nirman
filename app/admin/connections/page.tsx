"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Building2,
  User,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAdminConnectionsAction, type AdminConnectionItem } from "@/actions/admin";

export default function AdminConnectionsPage() {
  const [connections, setConnections] = useState<AdminConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState<AdminConnectionItem | null>(null);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await getAdminConnectionsAction();
      if (res.success && res.connections) {
        setConnections(res.connections);
      }
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const filteredConnections = connections.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.tender_title.toLowerCase().includes(q) ||
      c.owner_name.toLowerCase().includes(q) ||
      c.owner_email.toLowerCase().includes(q) ||
      c.contractor_name.toLowerCase().includes(q) ||
      c.contractor_email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.tender_id.toLowerCase().includes(q)
    );
  });

  const totalValue = connections.reduce((acc, c) => acc + (c.bid_amount || 0), 0);
  const avgValue = connections.length > 0 ? totalValue / connections.length : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Bid Awards / Connections</h1>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
              {connections.length} Established
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time audit record of accepted Owner ↔ Contractor pairings and awarded construction projects
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConnections}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Connections</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-white">{connections.length}</div>
          <p className="text-[11px] text-emerald-400 font-medium">All accepted contract pairings</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Awarded Value</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{(totalValue / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-[11px] text-slate-400 font-mono">{formatCurrency(totalValue)} total</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Project Value</span>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">
            ₹{(avgValue / 100000).toFixed(1)} Lakhs
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Per awarded construction tender</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by tender, owner name, contractor company, phone, or city..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Connections Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading awarded connections...</div>
        ) : filteredConnections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 font-extrabold text-slate-300">
                  <th className="p-4">Tender / Project</th>
                  <th className="p-4">Property Owner</th>
                  <th className="p-4">Accepted Contractor</th>
                  <th className="p-4">Contract Amount</th>
                  <th className="p-4">Awarded On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredConnections.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Tender */}
                    <td className="p-4">
                      <div className="font-bold text-white max-w-[220px] truncate">{c.tender_title}</div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-amber-500" /> {c.city} • ID: {c.tender_id.slice(0, 8)}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{c.owner_name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-500" /> {c.owner_email}
                      </div>
                      {c.owner_phone && c.owner_phone !== "N/A" && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" /> {c.owner_phone}
                        </div>
                      )}
                    </td>

                    {/* Contractor */}
                    <td className="p-4">
                      <div className="font-bold text-amber-400">{c.contractor_name}</div>
                      <div className="text-[11px] text-slate-300">Contact: {c.contractor_contact_person}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-500" /> {c.contractor_email}
                      </div>
                      {c.contractor_phone && c.contractor_phone !== "N/A" && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" /> {c.contractor_phone}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <span className="font-black text-sm text-emerald-400">{formatCurrency(c.bid_amount)}</span>
                      <span className="block text-[10px] text-slate-400">Accepted Quotation</span>
                    </td>

                    {/* Awarded On */}
                    <td className="p-4 text-slate-300">
                      <div className="font-medium">
                        {new Date(c.accepted_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(c.accepted_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedConnection(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <Award className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-400">No Owner ↔ Contractor connections found</p>
            <p className="text-[11px] text-slate-500">
              When an Owner accepts a Contractor&apos;s bid, it will be automatically recorded here.
            </p>
          </div>
        )}
      </div>

      {/* INSPECTION MODAL */}
      {selectedConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Connection Record</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Tender ID: {selectedConnection.tender_id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConnection(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tender Project
                </span>
                <span className="text-sm font-black text-white block">{selectedConnection.tender_title}</span>
                <span className="text-slate-400 font-medium">Location: {selectedConnection.city}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Property Owner
                  </span>
                  <span className="font-bold text-white block">{selectedConnection.owner_name}</span>
                  <span className="text-slate-400 block">{selectedConnection.owner_email}</span>
                  <span className="text-slate-400 block">{selectedConnection.owner_phone}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Awarded Contractor
                  </span>
                  <span className="font-bold text-white block">{selectedConnection.contractor_name}</span>
                  <span className="text-slate-400 block">Contact: {selectedConnection.contractor_contact_person}</span>
                  <span className="text-slate-400 block">{selectedConnection.contractor_email}</span>
                  <span className="text-slate-400 block">{selectedConnection.contractor_phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Accepted Quotation
                  </span>
                  <span className="text-base font-black text-emerald-400 block">
                    {formatCurrency(selectedConnection.bid_amount)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Award Date & Time
                  </span>
                  <span className="font-bold text-white block">
                    {new Date(selectedConnection.accepted_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(selectedConnection.accepted_at).toLocaleTimeString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedConnection(null)}
                className="px-5 py-2 rounded-xl bg-amber-600 text-slate-950 font-bold text-xs hover:bg-amber-500 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
