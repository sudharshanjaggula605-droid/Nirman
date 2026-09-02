"use client";

import { useState, Suspense, useRef } from "react";
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
  Shield,
  CreditCard,
  Check,
  Upload,
  Camera,
} from "lucide-react";
import { registerOwnerAction, registerContractorAction } from "@/actions/auth";
import { capitalizeWords, formatIndianPhoneNumber, isValidIndianPhoneNumber } from "@/lib/utils";

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "contractor" ? "contractor" : "owner";

  const [role, setRole] = useState<"owner" | "contractor">(defaultRole);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State - Owner
  const [ownerData, setOwnerData] = useState({
    first_name: "",
    last_name: "",
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

  // Form State - Contractor
  const [contractorData, setContractorData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    city: "",
    specialization: "Residential Construction",
    years_of_experience: "5",
    aadhaar_number: "",
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
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const handleRoleSwitch = (newRole: "owner" | "contractor") => {
    setRole(newRole);
    setStep(1);
    setError(null);
    setFieldErrors({});
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

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - projectPhotos.length;
    if (remainingSlots <= 0) {
      setError("You can upload a maximum of 5 project photos.");
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select valid image files (JPG, PNG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProjectPhotos((prev) => {
            if (prev.length >= 5) return prev;
            return [...prev, event.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    setError(null);
    if (photoFileInputRef.current) {
      photoFileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setProjectPhotos(projectPhotos.filter((_, i) => i !== index));
  };

  // Helper to format Aadhaar as XXXX XXXX XXXX
  const handleAadhaarChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setContractorData((prev) => ({ ...prev, aadhaar_number: formatted }));
    if (fieldErrors["contractor_aadhaar"]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next["contractor_aadhaar"];
        return next;
      });
    }
  };

  // Helper to scroll and focus first invalid input
  const scrollToFirstInvalid = (errors: Record<string, string>) => {
    setFieldErrors(errors);
    const firstKey = Object.keys(errors)[0];
    if (firstKey) {
      const el = document.getElementById(firstKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }
  };

  // ==========================================
  // OWNER VALIDATION
  // ==========================================
  const validateOwnerStep = () => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!ownerData.first_name.trim()) errors["owner_first_name"] = "First name is required.";
      if (!ownerData.last_name.trim()) errors["owner_last_name"] = "Last name is required.";
      if (!ownerData.email.trim() || !/\S+@\S+\.\S+/.test(ownerData.email)) {
        errors["owner_email"] = "Please enter a valid email address.";
      }
      if (!ownerData.phone.trim() || !isValidIndianPhoneNumber(ownerData.phone)) {
        errors["owner_phone"] = "Please enter a valid 10-digit mobile number.";
      }
      if (!ownerData.password) {
        errors["owner_password"] = "Password is required.";
      } else if (ownerData.password.length < 6) {
        errors["owner_password"] = "Password must be at least 6 characters long.";
      }
      if (!ownerData.confirm_password) {
        errors["owner_confirm_password"] = "Please confirm your password.";
      } else if (ownerData.password !== ownerData.confirm_password) {
        errors["owner_confirm_password"] = "Passwords do not match.";
      }
    }

    if (step === 2) {
      if (!ownerData.property_location.trim()) {
        errors["owner_property_location"] = "Property / Plot location is required.";
      }
      if (!ownerData.city.trim()) errors["owner_city"] = "City / Location is required.";
      if (!ownerData.state.trim()) errors["owner_state"] = "State is required.";
      if (!ownerData.pincode.trim() || ownerData.pincode.length < 6) {
        errors["owner_pincode"] = "Please enter a valid 6-digit Pincode.";
      }
      if (!ownerData.terms_accepted) {
        errors["owner_terms"] = "Please accept the Terms & Conditions to continue.";
      }
      if (!ownerData.privacy_accepted) {
        errors["owner_privacy"] = "Please accept the Privacy Policy to continue.";
      }
    }

    if (Object.keys(errors).length > 0) {
      scrollToFirstInvalid(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  // ==========================================
  // CONTRACTOR VALIDATION
  // ==========================================
  const validateContractorStep = () => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!contractorData.first_name.trim()) errors["contractor_first_name"] = "First name is required.";
      if (!contractorData.last_name.trim()) errors["contractor_last_name"] = "Last name is required.";
      if (!contractorData.email.trim() || !/\S+@\S+\.\S+/.test(contractorData.email)) {
        errors["contractor_email"] = "Please enter a valid email address.";
      }
      if (!contractorData.phone.trim() || !isValidIndianPhoneNumber(contractorData.phone)) {
        errors["contractor_phone"] = "Please enter a valid 10-digit mobile number.";
      }
      if (!contractorData.company_name.trim()) {
        errors["contractor_company_name"] = "Company / Business name is required.";
      }
      if (!contractorData.city.trim()) errors["contractor_city"] = "City / Location is required.";
      if (!contractorData.years_of_experience.trim()) {
        errors["contractor_years_of_experience"] = "Years of Experience is required.";
      }
      if (!contractorData.password) {
        errors["contractor_password"] = "Password is required.";
      } else if (contractorData.password.length < 6) {
        errors["contractor_password"] = "Password must be at least 6 characters long.";
      }
      if (!contractorData.confirm_password) {
        errors["contractor_confirm_password"] = "Please confirm your password.";
      } else if (contractorData.password !== contractorData.confirm_password) {
        errors["contractor_confirm_password"] = "Passwords do not match.";
      }
    }

    if (step === 2) {
      if (!contractorData.terms_accepted) {
        errors["contractor_terms"] = "Please accept the Terms & Conditions to continue.";
      }
      if (!contractorData.privacy_accepted) {
        errors["contractor_privacy"] = "Please accept the Privacy Policy to continue.";
      }
    }

    if (Object.keys(errors).length > 0) {
      scrollToFirstInvalid(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const nextStep = () => {
    const isValid = role === "owner" ? validateOwnerStep() : validateContractorStep();
    if (isValid) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setFieldErrors({});
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // SUBMISSION HANDLER
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isValid = role === "owner" ? validateOwnerStep() : validateContractorStep();
    if (!isValid) return;

    setLoading(true);

    try {
      const formData = new FormData();
      if (role === "owner") {
        formData.append("first_name", ownerData.first_name.trim());
        formData.append("last_name", ownerData.last_name.trim());
        formData.append("full_name", `${ownerData.first_name.trim()} ${ownerData.last_name.trim()}`);
        formData.append("email", ownerData.email.trim().toLowerCase());
        formData.append("phone", formatIndianPhoneNumber(ownerData.phone.trim()));
        formData.append("password", ownerData.password);
        formData.append("property_location", ownerData.property_location.trim());
        formData.append("city", ownerData.city.trim());
        formData.append("state", ownerData.state.trim());
        formData.append("pincode", ownerData.pincode.trim());
        formData.append("google_maps_url", ownerData.google_maps_url.trim());

        const res = await registerOwnerAction(formData);
        if (res && res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
      } else {
        formData.append("first_name", contractorData.first_name.trim());
        formData.append("last_name", contractorData.last_name.trim());
        formData.append("contact_person", `${contractorData.first_name.trim()} ${contractorData.last_name.trim()}`);
        formData.append("email", contractorData.email.trim().toLowerCase());
        formData.append("phone", formatIndianPhoneNumber(contractorData.phone.trim()));
        formData.append("company_name", contractorData.company_name.trim());
        formData.append("city", contractorData.city.trim());
        formData.append("specialization", contractorData.specialization);
        formData.append("years_of_experience", contractorData.years_of_experience);
        formData.append("aadhaar_number", contractorData.aadhaar_number.replace(/\s/g, ""));
        formData.append("password", contractorData.password);

        projectPhotos.forEach((photo) => {
          formData.append("project_photos", photo);
        });

        const res = await registerContractorAction(formData);
        if (res && res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
      }

      // Show Confirmation Dialog & Reset Form State
      setShowSuccessModal(true);
    } catch (err: any) {
      if (err.message && err.message.includes("NEXT_REDIRECT")) {
        // Handled by server redirect
        return;
      }
      console.error("Registration error:", err);
      setError(err.message || "Unable to complete registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalCloseAndRedirect = () => {
    // Reset all form state
    setOwnerData({
      first_name: "",
      last_name: "",
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
    setContractorData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company_name: "",
      city: "",
      specialization: "Residential Construction",
      years_of_experience: "5",
      aadhaar_number: "",
      password: "",
      confirm_password: "",
      terms_accepted: false,
      privacy_accepted: false,
    });
    setProjectPhotos([]);
    setShowSuccessModal(false);
    window.location.href = `/account-pending?role=${role}`;
  };
  return (
    <div className="container mx-auto flex min-h-0 sm:min-h-[calc(100vh-8rem)] items-center justify-center px-3 sm:px-4 py-4 sm:py-12">
      {/* Confirmation Dialog / Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center space-y-6 shadow-2xl text-slate-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">✓ Submission Successful</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your information has been submitted successfully.
              </p>
              <p className="text-xs text-slate-400">
                Thank you for using NIRMAN. Our administration team will review your account credentials.
              </p>
            </div>

            <button
              onClick={handleModalCloseAndRedirect}
              className="w-full rounded-xl bg-orange-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-5 sm:space-y-8 rounded-2xl sm:rounded-3xl border bg-card p-4 sm:p-10 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-1 sm:space-y-2">
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Direct Verification & Bidding Platform
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Create NIRMAN Account</h1>
          <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Join India's verified construction marketplace. Create your account in simple steps.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-muted/60 border">
          <button
            type="button"
            onClick={() => handleRoleSwitch("owner")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              role === "owner"
                ? "bg-background text-orange-600 shadow-sm border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4" /> Property Owner
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch("contractor")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              role === "contractor"
                ? "bg-background text-orange-600 shadow-sm border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HardHat className="h-4 w-4" /> Civil Contractor
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                step === 1 ? "bg-orange-600 text-white" : "bg-emerald-600 text-white"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "text-foreground" : "text-muted-foreground"}>
              {role === "owner" ? "Personal & Contact" : "Business Information"}
            </span>
          </div>

          <span className="text-muted-foreground">──────</span>

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                step === 2 ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "text-foreground" : "text-muted-foreground"}>
              {role === "owner" ? "Property & Location" : "Step 2: Project Photos"}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OWNER FORM */}
        {/* ========================================================================= */}
        {role === "owner" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Personal & Account Information
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="owner_first_name" className="text-xs font-bold text-foreground">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="owner_first_name"
                        type="text"
                        value={ownerData.first_name}
                        onChange={(e) => {
                          setOwnerData({ ...ownerData, first_name: capitalizeWords(e.target.value) });
                          if (fieldErrors["owner_first_name"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["owner_first_name"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Vinay"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["owner_first_name"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["owner_first_name"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_first_name"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="owner_last_name" className="text-xs font-bold text-foreground">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="owner_last_name"
                        type="text"
                        value={ownerData.last_name}
                        onChange={(e) => {
                          setOwnerData({ ...ownerData, last_name: capitalizeWords(e.target.value) });
                          if (fieldErrors["owner_last_name"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["owner_last_name"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Kumar"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["owner_last_name"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["owner_last_name"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_last_name"]}</p>
                    )}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="owner_email" className="text-xs font-bold text-foreground">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="owner_email"
                        type="email"
                        value={ownerData.email}
                        onChange={(e) => {
                          setOwnerData({ ...ownerData, email: e.target.value.toLowerCase().trim() });
                          if (fieldErrors["owner_email"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["owner_email"];
                              return n;
                            });
                          }
                        }}
                        placeholder="vinay@gmail.com"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["owner_email"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["owner_email"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_email"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="owner_phone" className="text-xs font-bold text-foreground">
                      Phone Number (+91) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="owner_phone"
                        type="tel"
                        value={ownerData.phone}
                        onChange={(e) => {
                          setOwnerData({ ...ownerData, phone: e.target.value });
                          if (fieldErrors["owner_phone"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["owner_phone"];
                              return n;
                            });
                          }
                        }}
                        placeholder="+91 9876543210"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["owner_phone"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["owner_phone"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_phone"]}</p>
                    )}
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="owner_password" className="text-xs font-bold text-foreground">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="owner_password"
                        type="password"
                        value={ownerData.password}
                        onChange={(e) => {
                          setOwnerData({ ...ownerData, password: e.target.value });
                          if (fieldErrors["owner_password"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["owner_password"];
                              return n;
                            });
                          }
                        }}
                        placeholder="At least 6 characters"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["owner_password"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["owner_password"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_password"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="owner_confirm_password" className="text-xs font-bold text-foreground">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="owner_confirm_password"
                        type="password"
                        value={ownerData.confirm_password}
                        onChange={(e) => {
                          setOwnerData({ ...ownerData, confirm_password: e.target.value });
                          if (fieldErrors["owner_confirm_password"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["owner_confirm_password"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Re-enter password"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["owner_confirm_password"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["owner_confirm_password"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_confirm_password"]}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Property & Construction Site Details
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="owner_property_location" className="text-xs font-bold text-foreground">
                    Property / Plot Address *
                  </label>
                  <input
                    id="owner_property_location"
                    type="text"
                    value={ownerData.property_location}
                    onChange={(e) => {
                      setOwnerData({ ...ownerData, property_location: capitalizeWords(e.target.value) });
                      if (fieldErrors["owner_property_location"]) {
                        setFieldErrors((prev) => {
                          const n = { ...prev };
                          delete n["owner_property_location"];
                          return n;
                        });
                      }
                    }}
                    placeholder="Plot 42, Jubilee Hills"
                    className={`w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      fieldErrors["owner_property_location"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                    }`}
                  />
                  {fieldErrors["owner_property_location"] && (
                    <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_property_location"]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="owner_city" className="text-xs font-bold text-foreground">
                      City / Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="owner_city"
                        type="text"
                        value={ownerData.city}
                        onChange={(e) => {
                          setOwnerData({ ...ownerData, city: capitalizeWords(e.target.value) });
                          if (fieldErrors["owner_city"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["owner_city"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Hyderabad"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["owner_city"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["owner_city"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_city"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="owner_state" className="text-xs font-bold text-foreground">
                      State *
                    </label>
                    <input
                      id="owner_state"
                      type="text"
                      value={ownerData.state}
                      onChange={(e) => {
                        setOwnerData({ ...ownerData, state: capitalizeWords(e.target.value) });
                        if (fieldErrors["owner_state"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["owner_state"];
                            return n;
                          });
                        }
                      }}
                      placeholder="Telangana"
                      className={`w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                        fieldErrors["owner_state"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                      }`}
                    />
                    {fieldErrors["owner_state"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_state"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="owner_pincode" className="text-xs font-bold text-foreground">
                      Pincode *
                    </label>
                    <input
                      id="owner_pincode"
                      type="text"
                      maxLength={6}
                      value={ownerData.pincode}
                      onChange={(e) => {
                        setOwnerData({ ...ownerData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) });
                        if (fieldErrors["owner_pincode"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["owner_pincode"];
                            return n;
                          });
                        }
                      }}
                      placeholder="500033"
                      className={`w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                        fieldErrors["owner_pincode"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                      }`}
                    />
                    {fieldErrors["owner_pincode"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["owner_pincode"]}</p>
                    )}
                  </div>
                </div>

                {/* Checkboxes with error highlight */}
                <div className={`rounded-2xl bg-muted/40 p-4 border space-y-3 pt-2 ${
                  fieldErrors["owner_terms"] || fieldErrors["owner_privacy"] ? "border-rose-500 ring-1 ring-rose-500/30" : ""
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="owner_terms"
                      checked={ownerData.terms_accepted}
                      onChange={(e) => {
                        setOwnerData({ ...ownerData, terms_accepted: e.target.checked });
                        if (fieldErrors["owner_terms"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["owner_terms"];
                            return n;
                          });
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="owner_terms" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I agree to the <span className="font-bold text-orange-600 underline">Terms & Conditions</span> for Property Owners.
                    </label>
                  </div>
                  {fieldErrors["owner_terms"] && (
                    <p className="text-[11px] font-bold text-rose-500 pl-7">{fieldErrors["owner_terms"]}</p>
                  )}

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="owner_privacy"
                      checked={ownerData.privacy_accepted}
                      onChange={(e) => {
                        setOwnerData({ ...ownerData, privacy_accepted: e.target.checked });
                        if (fieldErrors["owner_privacy"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["owner_privacy"];
                            return n;
                          });
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="owner_privacy" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I agree to the <span className="font-bold text-orange-600 underline">Privacy Policy</span>.
                    </label>
                  </div>
                  {fieldErrors["owner_privacy"] && (
                    <p className="text-[11px] font-bold text-rose-500 pl-7">{fieldErrors["owner_privacy"]}</p>
                  )}
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 cursor-pointer"
                >
                  Next Step <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating Account..." : "Create Owner Account"}
                </button>
              )}
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* CONTRACTOR FORM */}
        {/* ========================================================================= */}
        {role === "contractor" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Contractor Details & Business Information
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contractor_first_name" className="text-xs font-bold text-foreground">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_first_name"
                        type="text"
                        value={contractorData.first_name}
                        onChange={(e) => {
                          setContractorData({ ...contractorData, first_name: capitalizeWords(e.target.value) });
                          if (fieldErrors["contractor_first_name"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["contractor_first_name"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Vinay"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["contractor_first_name"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["contractor_first_name"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_first_name"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contractor_last_name" className="text-xs font-bold text-foreground">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_last_name"
                        type="text"
                        value={contractorData.last_name}
                        onChange={(e) => {
                          setContractorData({ ...contractorData, last_name: capitalizeWords(e.target.value) });
                          if (fieldErrors["contractor_last_name"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["contractor_last_name"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Kumar"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["contractor_last_name"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["contractor_last_name"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_last_name"]}</p>
                    )}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contractor_email" className="text-xs font-bold text-foreground">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_email"
                        type="email"
                        value={contractorData.email}
                        onChange={(e) => {
                          setContractorData({ ...contractorData, email: e.target.value.toLowerCase().trim() });
                          if (fieldErrors["contractor_email"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["contractor_email"];
                              return n;
                            });
                          }
                        }}
                        placeholder="vinay@builders.com"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["contractor_email"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["contractor_email"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_email"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contractor_phone" className="text-xs font-bold text-foreground">
                      Phone Number (+91) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_phone"
                        type="tel"
                        value={contractorData.phone}
                        onChange={(e) => {
                          setContractorData({ ...contractorData, phone: e.target.value });
                          if (fieldErrors["contractor_phone"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["contractor_phone"];
                              return n;
                            });
                          }
                        }}
                        placeholder="+91 9876543210"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["contractor_phone"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["contractor_phone"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_phone"]}</p>
                    )}
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label htmlFor="contractor_company_name" className="text-xs font-bold text-foreground">
                    Company / Business Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="contractor_company_name"
                      type="text"
                      value={contractorData.company_name}
                      onChange={(e) => {
                        setContractorData({ ...contractorData, company_name: capitalizeWords(e.target.value) });
                        if (fieldErrors["contractor_company_name"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["contractor_company_name"];
                            return n;
                          });
                        }
                      }}
                      placeholder="M V Builders"
                      className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                        fieldErrors["contractor_company_name"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                      }`}
                    />
                  </div>
                  {fieldErrors["contractor_company_name"] && (
                    <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_company_name"]}</p>
                  )}
                </div>

                {/* City, Specialization, Years of Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="contractor_city" className="text-xs font-bold text-foreground">
                      City / Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_city"
                        type="text"
                        value={contractorData.city}
                        onChange={(e) => {
                          setContractorData({ ...contractorData, city: capitalizeWords(e.target.value) });
                          if (fieldErrors["contractor_city"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["contractor_city"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Hyderabad"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["contractor_city"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["contractor_city"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_city"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Specialization *</label>
                    <select
                      value={contractorData.specialization}
                      onChange={(e) => setContractorData({ ...contractorData, specialization: e.target.value })}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-semibold cursor-pointer"
                    >
                      <option value="Residential Construction">Residential Construction</option>
                      <option value="Commercial Construction">Commercial Construction</option>
                      <option value="Renovation & Facelift">Renovation & Facelift</option>
                      <option value="Interior Fit-out">Interior Fit-out</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contractor_years_of_experience" className="text-xs font-bold text-foreground">
                      Years of Experience *
                    </label>
                    <input
                      id="contractor_years_of_experience"
                      type="number"
                      min={0}
                      value={contractorData.years_of_experience}
                      onChange={(e) => {
                        setContractorData({ ...contractorData, years_of_experience: e.target.value });
                        if (fieldErrors["contractor_years_of_experience"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["contractor_years_of_experience"];
                            return n;
                          });
                        }
                      }}
                      className={`w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-bold ${
                        fieldErrors["contractor_years_of_experience"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                      }`}
                    />
                    {fieldErrors["contractor_years_of_experience"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_years_of_experience"]}</p>
                    )}
                  </div>
                </div>

                {/* Identity Verification (Aadhaar KYC) Section */}
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                      <Shield className="h-4 w-4" /> Identity Verification (Aadhaar)
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      ⏳ Verification Pending
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="contractor_aadhaar" className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Aadhaar Number (12 Digits)</span>
                      <span className="text-[11px] text-muted-foreground">Securely Encrypted</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_aadhaar"
                        type="text"
                        value={contractorData.aadhaar_number}
                        onChange={(e) => handleAadhaarChange(e.target.value)}
                        placeholder="XXXX XXXX XXXX"
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 tracking-wider"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Your Aadhaar number is masked and protected for KYC compliance and verified during admin approval.
                    </p>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contractor_password" className="text-xs font-bold text-foreground">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_password"
                        type="password"
                        value={contractorData.password}
                        onChange={(e) => {
                          setContractorData({ ...contractorData, password: e.target.value });
                          if (fieldErrors["contractor_password"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["contractor_password"];
                              return n;
                            });
                          }
                        }}
                        placeholder="At least 6 characters"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["contractor_password"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["contractor_password"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_password"]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contractor_confirm_password" className="text-xs font-bold text-foreground">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="contractor_confirm_password"
                        type="password"
                        value={contractorData.confirm_password}
                        onChange={(e) => {
                          setContractorData({ ...contractorData, confirm_password: e.target.value });
                          if (fieldErrors["contractor_confirm_password"]) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n["contractor_confirm_password"];
                              return n;
                            });
                          }
                        }}
                        placeholder="Re-enter password"
                        className={`w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                          fieldErrors["contractor_confirm_password"] ? "border-rose-500 ring-1 ring-rose-500/50" : ""
                        }`}
                      />
                    </div>
                    {fieldErrors["contractor_confirm_password"] && (
                      <p className="text-[11px] font-bold text-rose-500">{fieldErrors["contractor_confirm_password"]}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CONTRACTOR STEP 2: PROJECT PHOTOS & AGREEMENT */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4" /> Previous Project Photos (Optional)
                  </span>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {projectPhotos.length}/5 Photos Added
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add photos of past construction projects to showcase in your public portfolio. Click <strong>+ Add Photo</strong> to choose image files directly from your computer or device.
                </p>

                {/* Hidden File Input for Native File Picker */}
                <input
                  type="file"
                  ref={photoFileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handlePhotoFileChange}
                  className="hidden"
                  id="contractor-project-photos-file-input"
                />

                {/* Interactive Upload Controls Area */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    disabled={projectPhotos.length >= 5}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                  >
                    <Upload className="h-4 w-4" />
                    <span>+ Add Photo</span>
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="Or enter image URL (https://...)"
                      className="flex-1 rounded-xl border bg-background/60 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      disabled={!newPhotoUrl.trim() || projectPhotos.length >= 5}
                      className="inline-flex items-center gap-1 rounded-xl border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-accent disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add URL
                    </button>
                  </div>
                </div>

                {/* Clickable Dropzone Area */}
                <div
                  onClick={() => {
                    if (projectPhotos.length < 5) {
                      photoFileInputRef.current?.click();
                    }
                  }}
                  className={`rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer ${
                    projectPhotos.length >= 5
                      ? "border-muted bg-muted/20 cursor-not-allowed opacity-60"
                      : "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/60"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                      <Camera className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      Click to choose photo files from your computer / phone
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      JPG, PNG, WebP supported • Maximum 5 showcase photos
                    </p>
                  </div>
                </div>

                {/* Photos Preview Grid */}
                {projectPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {projectPhotos.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl border bg-muted overflow-hidden group h-28 shadow-sm">
                        <img src={url} alt={`Project ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                          Photo #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agreement Checkboxes */}
                <div
                  id="contractor_consent_group"
                  className={`rounded-2xl bg-muted/40 p-4 border space-y-3 pt-2 ${
                    fieldErrors["contractor_terms"] || fieldErrors["contractor_privacy"] ? "border-rose-500 ring-2 ring-rose-500/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="contractor_terms"
                      checked={contractorData.terms_accepted}
                      onChange={(e) => {
                        setContractorData({ ...contractorData, terms_accepted: e.target.checked });
                        if (fieldErrors["contractor_terms"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["contractor_terms"];
                            return n;
                          });
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="contractor_terms" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I agree to the <span className="font-bold text-orange-600 underline">Contractor Partner Terms & Conditions</span>.
                    </label>
                  </div>
                  {fieldErrors["contractor_terms"] && (
                    <p className="text-[11px] font-bold text-rose-500 pl-7">{fieldErrors["contractor_terms"]}</p>
                  )}

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="contractor_privacy"
                      checked={contractorData.privacy_accepted}
                      onChange={(e) => {
                        setContractorData({ ...contractorData, privacy_accepted: e.target.checked });
                        if (fieldErrors["contractor_privacy"]) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n["contractor_privacy"];
                            return n;
                          });
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="contractor_privacy" className="text-xs text-foreground cursor-pointer leading-relaxed">
                      I agree to the <span className="font-bold text-orange-600 underline">Privacy Policy</span>. Additional credentials like GST & licenses can be filled later.
                    </label>
                  </div>
                  {fieldErrors["contractor_privacy"] && (
                    <p className="text-[11px] font-bold text-rose-500 pl-7">{fieldErrors["contractor_privacy"]}</p>
                  )}
                </div>
              </div>
            )}

            {/* CONTRACTOR BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 cursor-pointer"
                >
                  Next Step (Project Photos) <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating Account..." : "Create Contractor Account"}
                </button>
              )}
            </div>
          </form>
        )}

        <div className="text-center text-xs text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-orange-600 hover:underline">
            Sign In
          </Link>
        </div>
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
