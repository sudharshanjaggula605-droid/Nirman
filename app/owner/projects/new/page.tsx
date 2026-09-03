"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Layers, Upload, ArrowRight, ArrowLeft, Check, AlertCircle, FileText, X } from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";
import { createProjectAndPublishTender } from "@/actions/projects";

export default function CreateProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Attachments State
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number; type: string; file?: File }>>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFilesSelect = (selectedFiles: File[]) => {
    const newItems = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type || file.name.split(".").pop() || "file",
      file,
    }));
    setAttachments((prev) => [...prev, ...newItems]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAction = async (actionType: "draft" | "publish") => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("category_name", categoryName);
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

    if (attachments.length > 0) {
      const serialized = attachments.map((att) => ({
        name: att.name,
        size: att.size,
        type: att.type,
        url: "#",
      }));
      formData.set("attachments", JSON.stringify(serialized));
    }

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
          <NirmanLogo size="md" />
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
          <div className="space-y-5">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Step 4: Blueprints & Attachments</h3>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.zip,.cad,.doc,.docx,.xlsx"
              onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  handleFilesSelect(Array.from(e.dataTransfer.files));
                }
              }}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center space-y-3 transition-all ${
                isDragging
                  ? "border-orange-600 bg-orange-500/10 shadow-inner"
                  : "border-border hover:border-orange-500/50 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 mx-auto">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-foreground">
                  Click or Drag & Drop Drawings, BOQ or CAD Files
                </div>
                <p className="text-[11px] text-muted-foreground">
                  PDF, DWG, DXF, PNG, ZIP up to 25MB (Will upload to project documents)
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition-all pointer-events-none"
              >
                Browse Files from Device
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Selected Documents & Blueprints ({attachments.length})</span>
                  <button
                    type="button"
                    onClick={() => setAttachments([])}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between rounded-xl border bg-card p-3 text-xs shadow-sm transition-all hover:border-orange-500/30"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 shrink-0 font-bold">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="truncate text-left space-y-0.5">
                          <p className="font-bold text-foreground truncate">{att.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {(att.size / (1024 * 1024)).toFixed(2)} MB • {att.name.split(".").pop()?.toUpperCase() || "DOCUMENT"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(att.id);
                        }}
                        className="p-1.5 rounded-lg border hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
                        title="Remove File"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              <div className="flex justify-between"><span className="text-muted-foreground">Attached Files:</span> <strong className="text-foreground">{attachments.length} Document(s)</strong></div>
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
