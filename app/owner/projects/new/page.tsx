"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HardHat, Building2, MapPin, Layers, Upload, ArrowRight, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { createProjectAndPublishTender } from "@/actions/projects";

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("Residential");
  const [propertyType, setPropertyType] = useState("Villa / Duplex");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [pincode, setPincode] = useState("500033");
  const [areaSqft, setAreaSqft] = useState("2400");
  const [estimatedBudget, setEstimatedBudget] = useState("3500000");
  const [startDate, setStartDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [bidDeadline, setBidDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const handleAction = async (actionType: "draft" | "publish") => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("category_id", "1"); // Defaults to category
    formData.set("property_type", propertyType);
    formData.set("area_sqft", areaSqft);
    formData.set("estimated_budget", estimatedBudget);
    formData.set("location", address);
    formData.set("city", city);
    formData.set("state", state);
    formData.set("pincode", pincode);
    formData.set("start_date", startDate);
    formData.set("expected_completion_date", completionDate);
    formData.set("bid_deadline", bidDeadline);
    formData.set("actionType", actionType);

    const result = await createProjectAndPublishTender(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(actionType === "publish" ? "/" : "/owner/dashboard");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-3xl">
      <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-8 shadow-xl">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Create Project & Publish Tender</h1>
            <p className="text-xs text-muted-foreground">Multi-step construction project creation wizard</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 border-b pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step === i
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                    : step > i
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i ? <Check className="h-4 w-4" /> : i}
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground hidden sm:block">
                {i === 1 ? "Basic Info" : i === 2 ? "Location" : i === 3 ? "Details" : i === 4 ? "Uploads" : "Publish"}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Step 1: Basic Information</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Duplex Villa Construction"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category / Construction Type</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Interior">Interior</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Property Type</label>
                <input
                  type="text"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  placeholder="Independent Villa / Office Space"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Detailed Description & Specifications</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify structural details, flooring, electrical, plumbing requirements..."
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Step 2: Project Site Location</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Site Address / Plot Number</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot 42, Road No 10, Jubilee Hills"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Project Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Step 3: Area, Budget & Dates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Built-up Area (Sq.ft)</label>
                <input
                  type="number"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Completion Date</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-orange-600 font-bold">Bid Deadline *</label>
                <input
                  type="date"
                  required
                  value={bidDeadline}
                  onChange={(e) => setBidDeadline(e.target.value)}
                  className="w-full rounded-lg border border-orange-500/50 bg-background px-3 py-2 text-xs text-foreground font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Uploads */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Step 4: Blueprints & Attachments</h3>

            <div className="rounded-xl border-2 border-dashed p-8 text-center space-y-2 bg-muted/20">
              <Upload className="h-8 w-8 text-orange-500 mx-auto" />
              <div className="text-xs font-bold text-foreground">Upload Drawings, BOQ or CAD Files</div>
              <p className="text-[11px] text-muted-foreground">PDF, DWG, PNG up to 25MB (Will upload to Supabase Storage)</p>
            </div>
          </div>
        )}

        {/* Step 5: Review & Actions */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Step 5: Review & Publish Tender</h3>

            <div className="rounded-xl bg-muted/40 p-4 border space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Title:</span> <strong className="text-foreground">{title || "Modern Duplex Villa"}</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location:</span> <strong className="text-foreground">{city}, {state}</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Area & Budget:</span> <strong className="text-orange-600">{areaSqft} Sq.ft | ₹{parseFloat(estimatedBudget || "0").toLocaleString()}</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bid Deadline:</span> <strong className="text-foreground">{bidDeadline}</strong></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction("draft")}
                className="flex-1 rounded-xl border bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-accent disabled:opacity-50"
              >
                Save Draft
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction("publish")}
                className="flex-1 rounded-xl bg-orange-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Tender (Make Live)"}
              </button>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between pt-4 border-t">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
          ) : <div />}

          {step < 5 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
            >
              Next Step <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
