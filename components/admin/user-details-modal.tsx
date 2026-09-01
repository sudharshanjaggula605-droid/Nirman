"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  Briefcase,
  CreditCard,
  Hash,
  Copy,
  ExternalLink,
  Trash2,
  Check,
} from "lucide-react";
import { formatDate, maskAadhaar } from "@/lib/utils";
import { useState } from "react";

interface UserDetailsModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onDelete?: (user: any) => void;
  isActing?: boolean;
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onApprove,
  onStatusChange,
  onDelete,
  isActing = false,
}: UserDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Background scroll lock & escape listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusUpper = (user.status || "APPROVED").toUpperCase();
  const isContractor = user.role === "contractor";

  // Data extraction with fallbacks
  const fullName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed User";
  const email = user.email || "N/A";
  const phone = user.phone || user.owner?.phone || user.contractor?.phone || "N/A";
  const companyName = user.contractor?.company_name || user.owner?.company_name || user.company_name || null;
  const city = user.city || user.owner?.city || user.contractor?.city || "Hyderabad";
  const state = user.state || user.owner?.state || user.contractor?.state || "Telangana";
  const address = user.address || user.owner?.address || user.property_location || "N/A";
  const pincode = user.pincode || user.owner?.pincode || null;
  const specialization = user.contractor?.description || user.specialization || "Residential & Civil Construction";
  const yearsExp = user.contractor?.years_of_experience ?? user.years_of_experience ?? 5;
  const totalProjects = user.contractor?.total_projects ?? 0;
  const gstNumber = user.contractor?.gst_number || "Not Registered";
  const licenseNumber = user.contractor?.license_number || "Verified Contractor";
  const aadhaarNumber = user.aadhaar_number || user.contractor?.aadhaar_number || null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-6 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-black text-xl shadow-inner uppercase">
              {fullName[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {fullName}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    isContractor
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {isContractor ? "Contractor Partner" : "Property Owner"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    statusUpper === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : statusUpper === "BLOCKED"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      : statusUpper === "REJECTED"
                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {statusUpper === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                  {statusUpper === "PENDING" && <Clock className="h-3 w-3" />}
                  {statusUpper === "BLOCKED" && <Ban className="h-3 w-3" />}
                  {statusUpper === "REJECTED" && <XCircle className="h-3 w-3" />}
                  <span>{statusUpper}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Registered on {formatDate(user.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close user details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {/* Section 1: Contact & Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Personal & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-500" /> Email Address
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate">{email}</span>
                  <button
                    onClick={() => handleCopy(email, "email")}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-500" /> Contact Number
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white">{phone}</span>
                  <button
                    onClick={() => handleCopy(phone, "phone")}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedField === "phone" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Business & Role Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {isContractor ? "Contractor Firm Information" : "Property Owner Details"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companyName && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1 sm:col-span-2">
                  <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-500" /> Company / Business Name
                  </span>
                  <div className="font-bold text-white text-sm">{companyName}</div>
                </div>
              )}

              {isContractor && (
                <>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                    <span className="text-slate-400 text-[11px] font-medium">Years of Experience</span>
                    <div className="font-extrabold text-white text-sm">{yearsExp} Years</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                    <span className="text-slate-400 text-[11px] font-medium">Completed Projects</span>
                    <div className="font-extrabold text-white text-sm">{totalProjects} Projects</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1 sm:col-span-2">
                    <span className="text-slate-400 text-[11px] font-medium">Specialization / Scope</span>
                    <div className="font-semibold text-slate-200">{specialization}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                    <span className="text-slate-400 text-[11px] font-medium">GST Identification</span>
                    <div className="font-mono font-bold text-slate-300">{gstNumber}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                    <span className="text-slate-400 text-[11px] font-medium">Trade License</span>
                    <div className="font-mono font-bold text-slate-300">{licenseNumber}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Location Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Location & Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1 sm:col-span-2">
                <span className="text-slate-400 text-[11px] font-medium">Address / Property Location</span>
                <div className="font-semibold text-white">{address}</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium">City</span>
                <div className="font-bold text-white">{city}</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium">State {pincode ? `& Pincode` : ""}</span>
                <div className="font-bold text-white">
                  {state} {pincode ? `(${pincode})` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Security & Identity KYC */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Identity & Security Compliance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-slate-500" /> Aadhaar KYC Status
                </span>
                <div className="font-mono font-bold text-amber-400">
                  {aadhaarNumber ? maskAadhaar(aadhaarNumber) : "Verified via Phone / Email"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Hash className="h-3 w-3 text-slate-500" /> User Reference ID
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[160px]">
                    {user.id}
                  </span>
                  <button
                    onClick={() => handleCopy(user.id, "userId")}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Copy User ID"
                  >
                    {copiedField === "userId" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 sm:p-6 bg-slate-950/80 shrink-0 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(user);
                }}
                disabled={isActing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" /> Delete User
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Governance Actions */}
            {statusUpper === "PENDING" && onApprove && (
              <button
                onClick={() => {
                  onApprove(user.id);
                  onClose();
                }}
                disabled={isActing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve User
              </button>
            )}

            {statusUpper !== "BLOCKED" && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(user.id, "blocked");
                  onClose();
                }}
                disabled={isActing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-800/50 bg-rose-950/60 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-900 transition-all cursor-pointer disabled:opacity-40"
              >
                <Ban className="h-4 w-4" /> Block User
              </button>
            )}

            {statusUpper === "BLOCKED" && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(user.id, "approved");
                  onClose();
                }}
                disabled={isActing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-800/50 bg-emerald-950/60 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-900 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Unblock User
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
