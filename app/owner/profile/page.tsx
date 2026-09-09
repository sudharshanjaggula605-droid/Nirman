"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Globe, Save, CheckCircle2, ShieldCheck, AlertCircle, Info, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateOwnerProfileAction } from "@/actions/user-settings";

export default function OwnerProfilePage() {
  const [profile, setProfile] = useState<any>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    google_maps_url: "",
    about_me: "",
    avatar_url: "",
  });
  const [initialEmail, setInitialEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchOwnerProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: owner } = await supabase
          .from("owners")
          .select("*")
          .eq("id", user.id)
          .single();

        // Exact registered contact number from user's actual registration / account data
        const registeredPhone =
          prof?.phone ||
          owner?.phone ||
          user.user_metadata?.phone ||
          user.phone ||
          "";

        const currentEmail = prof?.email || user.email || "";

        setProfile({
          full_name: prof?.full_name || owner?.full_name || user.user_metadata?.full_name || "",
          email: currentEmail,
          phone: registeredPhone,
          address: owner?.address || prof?.address || "",
          city: owner?.city || prof?.city || user.user_metadata?.city || "",
          state: owner?.state || prof?.state || user.user_metadata?.state || "",
          pincode: owner?.pincode || prof?.pincode || "",
          google_maps_url: owner?.google_maps_url || "",
          about_me: owner?.about_me || "",
          avatar_url: prof?.avatar_url || "",
        });
        setInitialEmail(currentEmail);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOwnerProfile();
  }, []);

  // Compute profile completion percentage
  const fields = [
    profile.full_name,
    profile.email,
    profile.phone,
    profile.address,
    profile.city,
    profile.state,
    profile.pincode,
  ];
  const filledFields = fields.filter((f) => Boolean(f && f.trim())).length;
  const completionPercentage = Math.min(100, Math.round((filledFields / fields.length) * 100));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const res = await updateOwnerProfileAction({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        google_maps_url: profile.google_maps_url,
        about_me: profile.about_me,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update profile.");
      } else {
        setMessage(res.message || "Profile updated successfully!");
        if (res.email) {
          setProfile((prev: any) => ({ ...prev, email: res.email }));
          setInitialEmail(res.email);
        }
      }
    } catch (err: any) {
      setErrorMessage("Error saving profile: " + (err.message || "Please try again."));
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Owner Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your personal details and default property information.</p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-2.5 shadow-sm">
          <div className="text-xs font-bold text-foreground">
            Profile Completion: <span className="text-orange-600 font-extrabold">{completionPercentage}%</span>
          </div>
          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Information Section */}
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2 border-b pb-3">
            <User className="h-4 w-4" /> Personal & Account Information
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-extrabold text-2xl shadow-lg ring-4 ring-orange-500/10 shrink-0">
              {profile.full_name?.charAt(0) || "O"}
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-bold text-sm text-foreground">{profile.full_name || "Property Owner"}</div>
              <div className="text-xs text-muted-foreground">{profile.email}</div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" /> Account Status: Approved
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder={loading ? "Loading registered number..." : "Registered Contact Number"}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Account Login Email *</span>
                <span className="text-[10px] font-semibold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                  Authentication Credential
                </span>
              </label>
              {profile.email?.trim().toLowerCase() !== initialEmail?.toLowerCase() && (
                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Email will change on save
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="owner@example.com"
                className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
              This email is your active login address. If changed, your previous email will be invalidated immediately and you must use this new email to log in.
            </p>
          </div>
        </div>

        {/* Property Information Section */}
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2 border-b pb-3">
            <MapPin className="h-4 w-4" /> Default Property / Location Details
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Default Property Location / Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Plot 42, Jubilee Hills"
              className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Hyderabad"
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">State</label>
              <input
                type="text"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                placeholder="Telangana"
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Pincode</label>
              <input
                type="text"
                value={profile.pincode}
                onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                placeholder="500033"
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Google Maps Location (Optional)
              </label>
              <input
                type="url"
                value={profile.google_maps_url}
                onChange={(e) => setProfile({ ...profile, google_maps_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">About Me / Owner Notes (Optional)</label>
              <textarea
                rows={3}
                value={profile.about_me}
                onChange={(e) => setProfile({ ...profile, about_me: e.target.value })}
                placeholder="Brief description about your property requirements or construction background..."
                className="w-full rounded-xl border bg-background/60 p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving Changes..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
