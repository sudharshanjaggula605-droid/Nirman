"use client";

import { useState, useEffect } from "react";
import { Search, ShieldCheck, Users, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { approveUserAction } from "@/actions/admin";

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleTab, setRoleTab] = useState<"owner" | "contractor" | "admin">("owner");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (data) setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesRole = u.role === roleTab;
    const matchesStatus = statusFilter === "ALL" || u.status?.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || u.full_name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);

    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleApprove = async (id: string) => {
    setMessage(null);
    const res = await approveUserAction(id);
    if (res?.error) {
      setMessage("Error approving user: " + res.error);
    } else {
      setMessage("User status set to Approved.");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "approved" } : u)));
    }
  };

  const handleBlock = async (id: string) => {
    setMessage(null);
    try {
      await supabase.from("profiles").update({ status: "blocked" }).eq("id", id);
      setMessage("User status set to Blocked.");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "blocked" } : u)));
    } catch (err: any) {
      setMessage("Error blocking user: " + err.message);
    }
  };

  const handleUnblock = async (id: string) => {
    setMessage(null);
    try {
      await supabase.from("profiles").update({ status: "approved" }).eq("id", id);
      setMessage("User unblocked and status restored to Approved.");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "approved" } : u)));
    } catch (err: any) {
      setMessage("Error unblocking user: " + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Management Directory</h1>
          <p className="text-xs text-slate-400">View and govern all registered Property Owners, Contractors, and Admins.</p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-amber-500/10 p-4 text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Role Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setRoleTab("owner")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            roleTab === "owner" ? "bg-amber-600 text-white shadow-md" : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" /> Property Owners
        </button>
        <button
          onClick={() => setRoleTab("contractor")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            roleTab === "contractor" ? "bg-amber-600 text-white shadow-md" : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck className="h-4 w-4" /> Contractors
        </button>
        <button
          onClick={() => setRoleTab("admin")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            roleTab === "admin" ? "bg-amber-600 text-white shadow-md" : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> System Admins
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">Status:</span>
          {["ALL", "APPROVED", "PENDING", "REJECTED", "BLOCKED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                statusFilter === st
                  ? "bg-amber-600 text-white"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                  <th className="p-3.5">User Full Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Registered On</th>
                  <th className="p-3.5 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredUsers.map((u) => {
                  const statusUpper = (u.status || "APPROVED").toUpperCase();
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">{u.full_name}</td>
                      <td className="p-3.5 text-slate-300">{u.email}</td>
                      <td className="p-3.5 font-bold capitalize text-amber-400">{u.role}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          statusUpper === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : statusUpper === "BLOCKED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {statusUpper === "PENDING" && (
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          )}

                          {statusUpper !== "BLOCKED" ? (
                            <button
                              onClick={() => handleBlock(u.id)}
                              className="rounded-lg bg-rose-950 text-rose-400 border border-rose-800/50 px-3 py-1 text-xs font-bold hover:bg-rose-900"
                            >
                              Block Account
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblock(u.id)}
                              className="rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-3 py-1 text-xs font-bold hover:bg-emerald-900"
                            >
                              Unblock Account
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2 text-slate-400">
            <Users className="h-8 w-8 text-slate-500 mx-auto" />
            <div className="text-xs font-bold text-white">No Users Found</div>
            <p className="text-[11px]">No registered accounts match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
