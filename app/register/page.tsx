"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HardHat, UserCheck, Building2, AlertCircle } from "lucide-react";
import { registerAction } from "@/actions/auth";

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "contractor" ? "contractor" : "owner";

  const [role, setRole] = useState<"owner" | "contractor">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
            <HardHat className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create NIRMAN Account</h1>
          <p className="text-xs text-muted-foreground">
            Join India's transparent construction tender & contractor platform
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1 border">
          <button
            type="button"
            onClick={() => setRole("owner")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              role === "owner"
                ? "bg-card text-orange-600 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Property Owner
          </button>
          <button
            type="button"
            onClick={() => setRole("contractor")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              role === "contractor"
                ? "bg-card text-orange-600 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Contractor
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <input
                name="full_name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="+91 9876543210"
                className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="user@example.com"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {role === "contractor" && (
            <div className="space-y-4 pt-2 border-t">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Company Name</label>
                <input
                  name="company_name"
                  type="text"
                  required
                  placeholder="BuildPro Constructions Pvt Ltd"
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Contact Person</label>
                <input
                  name="contact_person"
                  type="text"
                  required
                  placeholder="Manager / Proprietor Name"
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>
          )}

          <div className="rounded-lg bg-orange-500/10 p-3 text-[11px] text-orange-600 dark:text-orange-400 border border-orange-500/20">
            Note: All new accounts are submitted for Admin Verification. You will gain dashboard access once approved.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting Application..." : `Register as ${role === "owner" ? "Property Owner" : "Contractor"}`}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-12 text-center text-sm text-muted-foreground">Loading registration form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
