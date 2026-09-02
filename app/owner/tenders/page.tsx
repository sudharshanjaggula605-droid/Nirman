"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  Loader2,
  X,
  Save,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getOwnerTendersAction, editTenderAction, deleteTenderAction } from "@/actions/tenders";

export default function OwnerTendersPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Tender Modal State
  const [editingTender, setEditingTender] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMinBudget, setEditMinBudget] = useState("");
  const [editMaxBudget, setEditMaxBudget] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Tender Modal State
  const [deletingTender, setDeletingTender] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchTenders = async () => {
    try {
      const res = await getOwnerTendersAction();
      if (res.tenders) setTenders(res.tenders);
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const handleOpenEdit = (t: any) => {
    setEditingTender(t);
    setEditTitle(t.title || "");
    setEditDesc(t.description || "");
    setEditMinBudget(t.budget_min?.toString() || "");
    setEditMaxBudget(t.budget_max?.toString() || "");
    setEditDeadline(t.bid_deadline ? new Date(t.bid_deadline).toISOString().split("T")[0] : "");
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTender) return;

    setSavingEdit(true);
    setEditError(null);

    const fd = new FormData();
    fd.append("tender_id", editingTender.id);
    fd.append("title", editTitle);
    fd.append("description", editDesc);
    fd.append("budget_min", editMinBudget);
    fd.append("budget_max", editMaxBudget);
    fd.append("bid_deadline", editDeadline);

    try {
      const res = await editTenderAction(fd);
      if (res.error) {
        setEditError(res.error);
      } else {
        await fetchTenders();
        setEditingTender(null);
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update tender.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTender) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteTenderAction(deletingTender.id);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        await fetchTenders();
        setDeletingTender(null);
      }
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete tender.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">My Published Tenders</h1>
          <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
            Manage your active tenders, review received quotations, or update project specifications
          </p>
        </div>

        <Link
          href="/owner/projects/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all w-full sm:w-auto shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" /> Create New Tender
        </Link>
      </div>

      {/* Tenders Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">Loading your tenders...</div>
        ) : tenders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-extrabold text-foreground">
                  <th className="p-3.5">Tender / Project Title</th>
                  <th className="p-3.5">Budget Range</th>
                  <th className="p-3.5">Bids Received</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {tenders.map((t) => {
                  const bidsCount = t.bids_count ?? 0;
                  const statusUpper = (t.status || "ACTIVE").toUpperCase();
                  const isAwarded = statusUpper === "AWARDED" || statusUpper === "COMPLETED";

                  return (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{t.title}</div>
                        <div className="text-[11px] text-muted-foreground">{t.project?.location || t.project?.city || "Hyderabad"}</div>
                      </td>
                      <td className="p-3.5 font-extrabold text-foreground">
                        {t.budget_min && t.budget_max
                          ? `₹${(t.budget_min / 100000).toFixed(1)}L - ₹${(t.budget_max / 100000).toFixed(1)}L`
                          : "Budget Open"}
                      </td>
                      <td className="p-3.5 font-bold text-orange-600">
                        {bidsCount} {bidsCount === 1 ? "Bid" : "Bids"}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {t.bid_deadline
                          ? new Date(t.bid_deadline).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "No deadline"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAwarded
                              ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                              : statusUpper === "ACTIVE" || statusUpper === "LIVE"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border"
                          }`}
                        >
                          {isAwarded ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {isAwarded ? "AWARDED" : statusUpper === "ACTIVE" ? "LIVE" : statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/owner/tenders/${t.id}/bids`}
                            className="inline-flex items-center gap-1 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition-colors"
                          >
                            <Users className="h-3.5 w-3.5" /> Bids ({bidsCount})
                          </Link>

                          <button
                            type="button"
                            disabled={isAwarded}
                            onClick={() => handleOpenEdit(t)}
                            className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            title={isAwarded ? "Cannot edit awarded tender" : "Edit Tender"}
                          >
                            <Edit className="h-3.5 w-3.5 text-amber-500" /> Edit
                          </button>

                          <button
                            type="button"
                            disabled={isAwarded}
                            onClick={() => {
                              setDeletingTender(t);
                              setDeleteError(null);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            title={isAwarded ? "Cannot delete awarded tender" : "Delete Tender"}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No Published Tenders</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create a construction project to publish live tenders for licensed contractor bidding.
            </p>
            <div className="pt-2">
              <Link
                href="/owner/projects/new"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" /> Create Tender
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* EDIT TENDER MODAL */}
      {editingTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border bg-card text-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Edit Published Tender</h3>
                <p className="text-[11px] text-muted-foreground">Update requirements and budget range</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTender(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tender Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Modern 3-Storey Villa Construction"
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Budget Min (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editMinBudget}
                    onChange={(e) => setEditMinBudget(e.target.value)}
                    placeholder="3000000"
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Budget Max (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editMaxBudget}
                    onChange={(e) => setEditMaxBudget(e.target.value)}
                    placeholder="3500000"
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Bidding Deadline *</label>
                <input
                  type="date"
                  required
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Detailed Description / Requirements *</label>
                <textarea
                  rows={4}
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Specify structural requirements, material brands, timeline expectations..."
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setEditingTender(null)}
                  className="px-4 py-2.5 rounded-xl border font-bold text-foreground hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 font-bold text-white shadow-md hover:bg-orange-700 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Updated Tender
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {deletingTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border bg-card text-foreground shadow-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Are you sure you want to delete this tender?</h3>
              <p className="text-xs text-muted-foreground">
                This will remove <strong className="text-foreground">{deletingTender.title}</strong> and any received contractor bids from the marketplace.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingTender(null)}
                className="flex-1 rounded-xl border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Tender"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
