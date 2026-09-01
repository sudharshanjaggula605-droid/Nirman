"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  Lock,
  Calendar,
  Building,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>({
    full_name: "Super Administrator",
    email: "admin@nirman.com",
    phone: "",
    role: "admin",
    status: "approved",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [passwordState, setPasswordState] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadAdminProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (prof) {
            setProfile({
              full_name: prof.full_name || "Administrator",
              email: prof.email || user.email || "admin@nirman.com",
              phone: prof.phone || user.phone || user.user_metadata?.phone || "",
              role: prof.role || "admin",
              status: prof.status || "approved",
              created_at: prof.created_at || user.created_at,
            });
          }
        }
      } catch (err) {
        console.error("Error loading admin profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            full_name: profile.full_name,
            phone: profile.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
      setMessage("Admin profile updated successfully!");
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.newPassword || passwordState.newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters long.");
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordState.newPassword,
      });
      if (error) throw error;
      setPasswordMsg("Password changed successfully!");
      setPasswordState({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err: any) {
      setPasswordMsg(err.message || "Failed to update password.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            Administrator Profile & Credentials
          </h1>
          <p className="text-xs text-slate-400">
            Manage your superuser administrator credentials, contact details, and security configuration
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
          <Shield className="h-3.5 w-3.5" /> Root Administrator
        </div>
      </div>

      {/* Admin Information Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-xl text-slate-300 text-xs">
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-extrabold text-2xl shadow-lg shrink-0">
              {profile.full_name?.charAt(0) || "A"}
            </div>
            <div>
              <div className="text-base font-bold text-white">{profile.full_name}</div>
              <div className="text-xs text-slate-400 flex items-center gap-2 pt-0.5">
                <span>{profile.email}</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold uppercase">Superuser Role</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-500" /> Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-500" /> Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500">Root email tied to primary platform auth</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-500" /> Contact Phone
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-amber-500" /> Department / Jurisdiction
              </label>
              <input
                type="text"
                defaultValue="Platform Operations & Compliance"
                disabled
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Update Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-xl text-slate-300 text-xs">
        <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
          <Key className="h-4 w-4 text-amber-500" />
          <h3 className="font-bold text-sm text-white">Security & Password Management</h3>
        </div>

        {passwordMsg && (
          <div className={`p-3.5 rounded-xl border font-semibold flex items-center gap-2 animate-in fade-in ${
            passwordMsg.includes("success")
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}>
            <Lock className="h-4 w-4 shrink-0" />
            <span>{passwordMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-white">New Admin Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-white">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Lock className="h-4 w-4 text-amber-500" />
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
