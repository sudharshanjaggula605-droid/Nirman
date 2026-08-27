"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Save,
  Clock,
  ImageIcon,
  PlusCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContractorProfilePage() {
  const [profile, setProfile] = useState<any>({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    years_of_experience: 5,
    total_projects: 15,
    specializations: "Residential & Civil Construction",
    gst_number: "",
    license_number: "",
    description: "",
    is_admin_verified: true,
    average_rating: 4.9,
    total_reviews: 24,
  });

  const [portfolioPhotos, setPortfolioPhotos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchContractorProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: cont } = await supabase
          .from("contractors")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: portData } = await supabase
          .from("contractor_portfolio")
          .select("*")
          .eq("contractor_id", user.id)
          .order("created_at", { ascending: false });

        if (portData) setPortfolioPhotos(portData);

        if (prof) {
          setProfile({
            company_name: cont?.company_name || prof.full_name || "",
            contact_person: cont?.contact_person || prof.full_name || "",
            email: prof.email || user.email || "",
            phone: cont?.phone || prof.phone || "",
            city: cont?.city || prof.city || "",
            state: cont?.state || prof.state || "",
            years_of_experience: cont?.years_of_experience || 5,
            total_projects: cont?.total_projects || 15,
            specializations: cont?.description || "Residential & Civil Construction",
            gst_number: cont?.gst_number || "",
            license_number: cont?.license_number || "",
            description: cont?.description || "",
            is_admin_verified: prof.status === "approved",
            average_rating: cont?.average_rating || 4.9,
            total_reviews: cont?.total_reviews || 24,
          });
        }
      } catch (err) {
        console.error("Error loading contractor profile:", err);
      }
    }
    fetchContractorProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("contractors")
        .upsert({
          id: user.id,
          company_name: profile.company_name,
          contact_person: profile.contact_person,
          phone: profile.phone,
          email: profile.email,
          city: profile.city,
          state: profile.state,
          years_of_experience: profile.years_of_experience,
          total_projects: profile.total_projects,
          gst_number: profile.gst_number || null,
          license_number: profile.license_number || null,
          description: profile.description,
          updated_at: new Date().toISOString(),
        });

      setMessage("Contractor profile updated successfully!");
    } catch (err: any) {
      setMessage("Error updating profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Contractor Profile & Credentials</h1>
          <p className="text-xs text-muted-foreground">Manage your essential details, project photos, and public company profile.</p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Verification Badge Header */}
      <div className="rounded-2xl bg-card border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-extrabold text-2xl shadow-lg ring-4 ring-orange-500/10 shrink-0">
            {profile.company_name?.charAt(0) || "C"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-foreground">{profile.company_name || "Company Name"}</h2>
              {profile.is_admin_verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified ✓
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Review
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground pt-0.5">
              Proprietor: {profile.contact_person} • Location: {profile.city || "Hyderabad"}
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs font-bold text-amber-500">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-500" /> {profile.average_rating} / 5.0
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{profile.total_reviews} Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Project Photos Gallery */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Previous Project Photos ({portfolioPhotos.length})
          </div>
          <Link
            href="/contractor/portfolio"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Manage / Add Photos
          </Link>
        </div>

        {portfolioPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {portfolioPhotos.map((item) => (
              <div key={item.id} className="relative rounded-xl border bg-muted overflow-hidden h-28 group shadow-sm">
                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute bottom-1 left-1.5 text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded truncate max-w-[90%]">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2 bg-muted/20">
            <p>No previous project photos uploaded yet.</p>
            <Link
              href="/contractor/portfolio"
              className="inline-flex items-center gap-1 font-bold text-orange-600 hover:underline"
            >
              + Upload Project Photos
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company & Contact Info */}
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2 border-b pb-3">
            <Building2 className="h-4 w-4" /> Essential Company Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Company Name</label>
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Contact Person Name</label>
              <input
                type="text"
                value={profile.contact_person}
                onChange={(e) => setProfile({ ...profile, contact_person: e.target.value })}
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Email Address</label>
              <input
                type="email"
                readOnly
                value={profile.email}
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
        </div>

        {/* Work Metrics & Specialization */}
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2 border-b pb-3">
            <Briefcase className="h-4 w-4" /> Work Metrics & Specializations
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Years of Experience</label>
              <input
                type="number"
                value={profile.years_of_experience}
                onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value, 10) })}
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">City / Location</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Specialization & Bio</label>
            <textarea
              rows={3}
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="Detail your construction specialization, equipment owned, and capabilities..."
              className="w-full rounded-xl border bg-background/60 p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        {/* Optional GST & Licenses */}
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2 border-b pb-3">
            <FileText className="h-4 w-4" /> Optional Licenses & Tax Documents
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">GST Number (Optional)</label>
              <input
                type="text"
                value={profile.gst_number}
                onChange={(e) => setProfile({ ...profile, gst_number: e.target.value })}
                placeholder="36AAAAA0000A1Z5"
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Contractor License Number (Optional)</label>
              <input
                type="text"
                value={profile.license_number}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                placeholder="LIC-2024-8849"
                className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving Changes..." : "Save Contractor Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
