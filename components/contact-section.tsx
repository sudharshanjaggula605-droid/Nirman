"use client";

import { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Loader2,
  Mail,
  User,
  Phone,
  FileText,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitSupportRequestAction } from "@/actions/support";

const USER_TYPES = [
  "Owner",
  "Contractor",
  "General Visitor",
];

const ISSUE_TYPES = [
  "Account / Login",
  "Registration",
  "Tender",
  "Bidding",
  "Project",
  "Payment",
  "Document",
  "Technical Problem",
  "Other",
];

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    user_type: "General Visitor",
    issue_type: "Other",
    subject: "",
    message: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, phone, role")
            .eq("id", user.id)
            .single();

          if (profile) {
            setFormData((prev) => ({
              ...prev,
              name: profile.full_name || prev.name,
              email: profile.email || prev.email,
              phone: profile.phone || prev.phone,
              user_type:
                profile.role === "owner"
                  ? "Owner"
                  : profile.role === "contractor"
                  ? "Contractor"
                  : "General Visitor",
            }));
          }
        }
      } catch (err) {
        console.error("Error loading user profile in Contact Us:", err);
      }
    }
    loadCurrentUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg("File size limit is 5MB.");
        return;
      }
      setFile(selectedFile);
      if (errorMsg) setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Client Validation
    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!formData.user_type) {
      setErrorMsg("Please select your user type.");
      return;
    }
    if (!formData.issue_type) {
      setErrorMsg("Please select an issue type.");
      return;
    }
    if (!formData.subject.trim()) {
      setErrorMsg("Please enter a subject.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg("Please describe your issue.");
      return;
    }

    setSubmitting(true);

    try {
      const dataPayload = new FormData();
      dataPayload.append("name", formData.name.trim());
      dataPayload.append("email", formData.email.trim());
      dataPayload.append("phone", formData.phone.trim());
      dataPayload.append("user_type", formData.user_type);
      dataPayload.append("issue_type", formData.issue_type);
      dataPayload.append("subject", formData.subject.trim());
      dataPayload.append("message", formData.message.trim());
      if (file) {
        dataPayload.append("attachment", file);
      }

      const res = await submitSupportRequestAction(dataPayload);

      if (res.success && res.request_number) {
        setSubmittedRequestId(res.request_number);
        setFormData((prev) => ({
          ...prev,
          subject: "",
          message: "",
        }));
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setErrorMsg(res.error || "Unable to submit your request. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMsg("Unable to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="border-t bg-gradient-to-b from-background via-muted/20 to-background py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
              <HelpCircle className="h-4 w-4" /> Customer & Support Center
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Contact NIRMAN Support
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Have questions or need assistance with construction tenders, payments, or account registration? Send us a request.
            </p>
          </div>

          {/* Card Container */}
          <div className="rounded-3xl border bg-card text-card-foreground p-6 sm:p-10 shadow-xl relative overflow-hidden">
            {submittedRequestId ? (
              /* Success State Display */
              <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-foreground">
                    ✓ Request Submitted Successfully
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Thank you for contacting NIRMAN. Our admin team will review your request and contact you if necessary.
                  </p>
                </div>

                <div className="inline-block rounded-2xl border border-orange-500/30 bg-orange-500/10 px-6 py-4">
                  <div className="text-xs uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">
                    Request ID
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-foreground tracking-widest mt-1">
                    {submittedRequestId}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setSubmittedRequestId(null)}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition-all"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              /* Support Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-orange-600" /> Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Kumar"
                      aria-label="Full Name"
                      className="w-full rounded-xl border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-orange-600" /> Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rahul@example.com"
                      aria-label="Email Address"
                      className="w-full rounded-xl border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-orange-600" /> Phone Number (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      aria-label="Phone Number"
                      className="w-full rounded-xl border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>

                  {/* User Type */}
                  <div className="space-y-2">
                    <label htmlFor="contact-user-type" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-orange-600" /> I Am A <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="contact-user-type"
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleChange}
                      aria-label="User Type"
                      className="w-full rounded-xl border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
                      required
                    >
                      {USER_TYPES.map((ut) => (
                        <option key={ut} value={ut}>
                          {ut}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Issue Type */}
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="contact-issue-type" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-orange-600" /> Issue Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="contact-issue-type"
                      name="issue_type"
                      value={formData.issue_type}
                      onChange={handleChange}
                      aria-label="Issue Category"
                      className="w-full rounded-xl border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
                      required
                    >
                      {ISSUE_TYPES.map((it) => (
                        <option key={it} value={it}>
                          {it}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="contact-subject" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-orange-600" /> Subject <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief summary of your query or issue"
                      aria-label="Subject"
                      className="w-full rounded-xl border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-orange-600" /> Message / Details <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your issue or query in detail..."
                      aria-label="Message details"
                      className="w-full rounded-xl border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y"
                      required
                    />
                  </div>

                  {/* Attachment */}
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="contact-file" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-orange-600" /> Attachment (Optional - Images, PDF, DOC up to 5MB)
                    </label>
                    <input
                      id="contact-file"
                      ref={fileInputRef}
                      type="file"
                      aria-label="Attachment upload"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-orange-600 hover:file:bg-orange-500/20 cursor-pointer border rounded-xl bg-background"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-orange-700/30 hover:bg-orange-800 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit Support Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
