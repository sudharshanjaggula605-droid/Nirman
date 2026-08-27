"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HardHat,
  UserCheck,
  Building2,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { registerOwnerAction, registerContractorAction } from "@/actions/auth";

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "contractor" ? "contractor" : "owner";

  const [role, setRole] = useState<"owner" | "contractor">(defaultRole);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State - Owner
  const [ownerData, setOwnerData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    property_location: "",
    city: "",
    state: "",
    pincode: "",
    google_maps_url: "",
    terms_accepted: false,
    privacy_accepted: false,
  });

  // Form State - Contractor (Streamlined & User-Friendly)
  const [contractorData, setContractorData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    city: "",
    specialization: "Residential Construction",
    years_of_experience: "5",
    password: "",
    confirm_password: "",
    terms_accepted: false,
    privacy_accepted: false,
  });

  // Optional Previous Project Photos (2–5 photos)
  const [projectPhotos, setProjectPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=800&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const handleRoleSwitch = (newRole: "owner" | "contractor") => {
    setRole(newRole);
    setStep(1);
    setError(null);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    if (projectPhotos.length >= 5) {
      setError("You can upload a maximum of 5 project photos during registration.");
      return;
    }
    setProjectPhotos([...projectPhotos, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
    setError(null);
  };

  const handleRemovePhoto = (index: number) => {
    setProjectPhotos(projectPhotos.filter((_, i) => i !== index));
  };

  const handleOwnerStepValidation = () => {
    setError(null);
    if (step === 1) {
      if (!ownerData.full_name || !ownerData.email || !ownerData.phone || !ownerData.password) {
        setError("Please fill in all required personal details.");
        return false;
      }
      if (ownerData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return false;
      }
      if (ownerData.password !== ownerData.confirm_password) {
        setError("Passwords do not match.");
        return false;
      }
    }
    if (step === 2) {
      if (!ownerData.property_location || !ownerData.city || !ownerData.state || !ownerData.pincode) {
        setError("Please fill in all property and location details.");
        return false;
      }
    }
    return true;
  };

  const handleContractorStepValidation = () => {
    setError(null);
    if (step === 1) {
      if (
        !contractorData.full_name ||
        !contractorData.email ||
        !contractorData.phone ||
        !contractorData.company_name ||
        !contractorData.city ||
        !contractorData.years_of_experience ||
        !contractorData.password
      ) {
        setError("Please fill in all required essential information.");
        return false;
      }
      if (contractorData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return false;
      }
      if (contractorData.password !== contractorData.confirm_password) {
        setError("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    const isValid = role === "owner" ? handleOwnerStepValidation() : handleContractorStepValidation();
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerData.terms_accepted || !ownerData.privacy_accepted) {
      setError("You must accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("role", "owner");
    formData.set("full_name", ownerData.full_name);
    formData.set("email", ownerData.email);
    formData.set("phone", ownerData.phone);
    formData.set("password", ownerData.password);
    formData.set("address", ownerData.property_location);
    formData.set("city", ownerData.city);
    formData.set("state", ownerData.state);
    formData.set("pincode", ownerData.pincode);

    const res = await registerOwnerAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleContractorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorData.terms_accepted || !contractorData.privacy_accepted) {
      setError("You must accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("role", "contractor");
    formData.set("contact_person", contractorData.full_name);
    formData.set("email", contractorData.email);
    formData.set("phone", contractorData.phone);
    formData.set("company_name", contractorData.company_name);
    formData.set("city", contractorData.city);
    formData.set("specialization", contractorData.specialization);
    formData.set("years_of_experience", contractorData.years_of_experience);
    formData.set("password", contractorData.password);

    projectPhotos.forEach((photo) => formData.append("project_photos", photo));

    const res = await registerContractorAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const maxSteps = role === "owner" ? 3 : 2;

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Dynamic Ambient Backlight */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-600/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-600/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-2xl space-y-6 rounded-3xl border border-border/60 bg-card/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/10 mx-auto">
            <HardHat className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Join <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">NIRMAN</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {role === "owner" ? "Register as Property Owner" : "Register as Licensed Contractor"}
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1.5 border border-border/50">
          <button
            type="button"
            onClick={() => handleRoleSwitch("owner")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
              role === "owner"
                ? "bg-card text-orange-600 shadow-md ring-1 ring-orange-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Property Owner
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch("contractor")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
              role === "contractor"
                ? "bg-card text-orange-600 shadow-md ring-1 ring-orange-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Contractor
          </button>
        </div>

        {/* Step Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Step {step} of {maxSteps}</span>
            <span className="text-orange-600">
              {role === "owner"
                ? step === 1
                  ? "Personal Details"
                  : step === 2
                  ? "Property & Location"
                  : "Verification"
                : step === 1
                ? "Essential Information"
                : "Previous Project Photos & Verification"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-300"
              style={{ width: `${(step / maxSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-2xl bg-destructive/10 p-4 text-xs font-medium text-destructive border border-destructive/20 space-y-1 shadow-inner">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Registration Note</span>
            </div>
            <p className="text-[11px] leading-relaxed text-destructive/90">{error}</p>
          </div>
        )}

        {/* OWNER FORM */}
        {role === "owner" && (
          <form onSubmit={handleOwnerSubmit} className="space-y-5">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Step 1 – Personal Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={ownerData.full_name}
                      onChange={(e) => setOwnerData({ ...ownerData, full_name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={ownerData.phone}
                      onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={ownerData.email}
                    onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                    placeholder="owner@example.com"
                    className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Password *</label>
                    <input
                      type="password"
                      required
                      value={ownerData.password}
                      onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={ownerData.confirm_password}
                      onChange={(e) => setOwnerData({ ...ownerData, confirm_password: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Step 2 – Property / Location Details
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Property Location *</label>
                  <input
                    type="text"
                    required
                    value={ownerData.property_location}
                    onChange={(e) => setOwnerData({ ...ownerData, property_location: e.target.value })}
                    placeholder="Plot 42, Jubilee Hills"
                    className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={ownerData.city}
                    onChange={(e) => setOwnerData({ ...ownerData, city: e.target.value })}
                    className="rounded-xl border bg-background/60 p-2.5 text-xs text-foreground"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={ownerData.state}
                    onChange={(e) => setOwnerData({ ...ownerData, state: e.target.value })}
                    className="rounded-xl border bg-background/60 p-2.5 text-xs text-foreground"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={ownerData.pincode}
                    onChange={(e) => setOwnerData({ ...ownerData, pincode: e.target.value })}
                    className="rounded-xl border bg-background/60 p-2.5 text-xs text-foreground"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Step 3 – Verification & Agreement
                </div>
                <div className="rounded-2xl bg-muted/40 p-4 border space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={ownerData.terms_accepted}
                      onChange={(e) => setOwnerData({ ...ownerData, terms_accepted: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="terms" className="text-xs text-foreground cursor-pointer">
                      I agree to the <span className="font-bold text-orange-600 underline">Terms & Conditions</span>.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={ownerData.privacy_accepted}
                      onChange={(e) => setOwnerData({ ...ownerData, privacy_accepted: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="privacy" className="text-xs text-foreground cursor-pointer">
                      I agree to the <span className="font-bold text-orange-600 underline">Privacy Policy</span>.
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
                >
                  Next Step <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Owner Account"}
                </button>
              )}
            </div>
          </form>
        )}

        {/* STREAMLINED CONTRACTOR FORM */}
        {role === "contractor" && (
          <form onSubmit={handleContractorSubmit} className="space-y-5">
            {/* CONTRACTOR STEP 1: ESSENTIAL DETAILS */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Essential Contractor Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={contractorData.full_name}
                        onChange={(e) => setContractorData({ ...contractorData, full_name: e.target.value })}
                        placeholder="Rajesh Kumar"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={contractorData.email}
                        onChange={(e) => setContractorData({ ...contractorData, email: e.target.value })}
                        placeholder="contractor@company.com"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        value={contractorData.phone}
                        onChange={(e) => setContractorData({ ...contractorData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Company / Business Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={contractorData.company_name}
                        onChange={(e) => setContractorData({ ...contractorData, company_name: e.target.value })}
                        placeholder="BuildPro Constructions"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">City / Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={contractorData.city}
                        onChange={(e) => setContractorData({ ...contractorData, city: e.target.value })}
                        placeholder="Hyderabad"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Specialization *</label>
                    <select
                      value={contractorData.specialization}
                      onChange={(e) => setContractorData({ ...contractorData, specialization: e.target.value })}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-semibold"
                    >
                      <option value="Residential Construction">Residential Construction</option>
                      <option value="Commercial Construction">Commercial Construction</option>
                      <option value="Renovation & Facelift">Renovation & Facelift</option>
                      <option value="Interior Fit-out">Interior Fit-out</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Years of Exp *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={contractorData.years_of_experience}
                      onChange={(e) => setContractorData({ ...contractorData, years_of_experience: e.target.value })}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        value={contractorData.password}
                        onChange={(e) => setContractorData({ ...contractorData, password: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        value={contractorData.confirm_password}
                        onChange={(e) => setContractorData({ ...contractorData, confirm_password: e.target.value })}
                        placeholder="Re-enter password"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTRACTOR STEP 2: OPTIONAL PREVIOUS PROJECT PHOTOS (2-5 PHOTOS) & AGREEMENT */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4" /> Previous Project Photos (Optional)
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">2 to 5 Photos</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add photos of past construction projects to display in your portfolio. You can add, edit, or delete project photos later from your Contractor Dashboard.
                </p>

                {/* Add Photo Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Enter project photo image URL (e.g. https://...)"
                    className="flex-1 rounded-xl border bg-background/60 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    disabled={projectPhotos.length >= 5}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" /> Add Photo
                  </button>
                </div>

                {/* Photos Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {projectPhotos.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl border bg-muted overflow-hidden group h-24 shadow-sm">
                      <img src={url} alt={`Project ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white opacity-90 hover:opacity-100 shadow-md"
                        title="Remove Photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1.5 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">
                        Photo #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Agreement Checkboxes */}
                <div className="rounded-2xl bg-muted/40 p-4 border space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="contractorTerms"
                      checked={contractorData.terms_accepted}
                      onChange={(e) => setContractorData({ ...contractorData, terms_accepted: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="contractorTerms" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I agree to the <span className="font-bold text-orange-600 underline">Contractor Partner Terms & Conditions</span>.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="contractorPrivacy"
                      checked={contractorData.privacy_accepted}
                      onChange={(e) => setContractorData({ ...contractorData, privacy_accepted: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="contractorPrivacy" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I agree to the <span className="font-bold text-orange-600 underline">Privacy Policy</span>. Additional credentials like GST & licenses can be filled later.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* CONTRACTOR BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
                >
                  Next Step (Project Photos) <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Contractor Account"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading registration portal...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
