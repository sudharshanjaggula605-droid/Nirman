"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  MapPin,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  DollarSign,
  Calendar,
  Save,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { editBidAction, deleteBidAction } from "@/actions/bids";

export default function ContractorMyBidsPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingBid, setEditingBid] = useState<any>(null);
  const [editQuotation, setEditQuotation] = useState("");
  const [editDays, setEditDays] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editProposal, setEditProposal] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editMaterialCost, setEditMaterialCost] = useState("");
  const [editLabourCost, setEditLabourCost] = useState("");
  const [editEquipmentCost, setEditEquipmentCost] = useState("");
  const [editOtherCost, setEditOtherCost] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal State
  const [deletingBid, setDeletingBid] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchContractorBids = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("bids")
        .select(`
          *,
          tender:tenders(*, project:projects(*), owner:owners(full_name)),
          cost_breakdown:bid_cost_breakdowns(*)
        `)
        .eq("contractor_id", user.id)
        .order("submitted_at", { ascending: false });

      if (data) setBids(data);
    } catch (err) {
      console.error("Error fetching contractor bids:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorBids();
  }, []);

  const handleOpenEdit = (bid: any) => {
    const cb = Array.isArray(bid.cost_breakdown) ? bid.cost_breakdown[0] : bid.cost_breakdown;
    setEditingBid(bid);
    setEditQuotation(bid.quotation_amount?.toString() || "");
    setEditDays(bid.estimated_completion_days?.toString() || "");
    setEditStartDate(bid.proposed_start_date || "");
    setEditProposal(bid.proposal || "");
    setEditNotes(bid.additional_notes || "");
    setEditMaterialCost(cb?.material_cost?.toString() || "0");
    setEditLabourCost(cb?.labour_cost?.toString() || "0");
    setEditEquipmentCost(cb?.equipment_cost?.toString() || "0");
    setEditOtherCost(cb?.other_cost?.toString() || "0");
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBid) return;

    setSavingEdit(true);
    setEditError(null);

    const fd = new FormData();
    fd.append("bid_id", editingBid.id);
    fd.append("quotation_amount", editQuotation);
    fd.append("estimated_completion_days", editDays);
    fd.append("proposed_start_date", editStartDate);
    fd.append("proposal", editProposal);
    fd.append("additional_notes", editNotes);
    fd.append("material_cost", editMaterialCost);
    fd.append("labour_cost", editLabourCost);
    fd.append("equipment_cost", editEquipmentCost);
    fd.append("other_cost", editOtherCost);

    try {
      const res = await editBidAction(fd);
      if (res.error) {
        setEditError(res.error);
      } else {
        await fetchContractorBids();
        setEditingBid(null);
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update bid.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBid) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteBidAction(deletingBid.id);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        await fetchContractorBids();
        setDeletingBid(null);
      }
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete bid.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBids = bids.filter((b) => {
    if (activeTab === "all") return true;
    return b.status?.toLowerCase() === activeTab;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Submitted Bids</h1>
          <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
            Manage your contractor quotations, edit proposals, or review owner acceptance status
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto scrollbar-none">
        {(["all", "pending", "accepted", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-orange-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab} {tab === "all" ? `(${bids.length})` : ""}
          </button>
        ))}
      </div>

      {/* Bids List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">Loading submitted bids...</div>
      ) : filteredBids.length > 0 ? (
        <div className="space-y-4">
          {filteredBids.map((bid) => {
            const statusUpper = (bid.status || "PENDING").toUpperCase();
            const isAccepted = statusUpper === "ACCEPTED";
            const cb = Array.isArray(bid.cost_breakdown) ? bid.cost_breakdown[0] : bid.cost_breakdown;

            return (
              <div
                key={bid.id}
                className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{bid.tender?.title || "Construction Tender"}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-orange-500" /> Owner: {bid.tender?.owner?.full_name || "Property Owner"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" /> {bid.tender?.project?.city || "Hyderabad"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        statusUpper === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : statusUpper === "REJECTED"
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}
                    >
                      {statusUpper === "ACCEPTED" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : statusUpper === "REJECTED" ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {statusUpper}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Proposed Quotation</span>
                    <span className="text-base font-black text-emerald-600">{formatCurrency(bid.quotation_amount || 0)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Est. Completion</span>
                    <span className="text-sm font-bold text-foreground">{bid.estimated_completion_days || 180} Days</span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Submitted Date</span>
                    <span className="text-sm font-bold text-foreground">
                      {new Date(bid.submitted_at || Date.now()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Cost Breakdown</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      Mat: {formatCurrency(cb?.material_cost || 0)} • Lab: {formatCurrency(cb?.labour_cost || 0)}
                    </span>
                  </div>
                </div>

                {/* Proposal snippet */}
                {bid.proposal && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground">Proposal Note:</span>
                    <p className="text-xs text-foreground bg-muted/20 p-3 rounded-xl border leading-relaxed line-clamp-2">
                      {bid.proposal}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    {isAccepted ? "✓ This bid is accepted. Contract is locked." : "Pending Owner review"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isAccepted}
                      onClick={() => handleOpenEdit(bid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title={isAccepted ? "Cannot edit an accepted bid" : "Edit Bid"}
                    >
                      <Edit className="h-3.5 w-3.5 text-amber-500" /> Edit Bid
                    </button>

                    <button
                      type="button"
                      disabled={isAccepted}
                      onClick={() => {
                        setDeletingBid(bid);
                        setDeleteError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title={isAccepted ? "Cannot delete an accepted bid" : "Delete Bid"}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Bid
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Bids Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You haven't submitted any bids in this category yet. Browse active tenders in the marketplace to submit your BOQ proposal.
          </p>
          <div className="pt-2">
            <Link
              href="/contractor/tenders"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition-all"
            >
              Browse Active Tenders
            </Link>
          </div>
        </div>
      )}

      {/* EDIT BID MODAL */}
      {editingBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border bg-card text-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Edit Submitted Quotation</h3>
                <p className="text-[11px] text-muted-foreground">Tender: {editingBid.tender?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBid(null)}
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
                <label className="font-bold text-foreground">Total Quotation (₹) *</label>
                <input
                  type="number"
                  required
                  value={editQuotation}
                  onChange={(e) => setEditQuotation(e.target.value)}
                  placeholder="2800000"
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Est. Completion (Days) *</label>
                  <input
                    type="number"
                    required
                    value={editDays}
                    onChange={(e) => setEditDays(e.target.value)}
                    placeholder="180"
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Proposed Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t">
                <span className="font-bold text-foreground block">Cost Breakdown Items (₹)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold">Material Cost</label>
                    <input
                      type="number"
                      value={editMaterialCost}
                      onChange={(e) => setEditMaterialCost(e.target.value)}
                      placeholder="1500000"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold">Labour Cost</label>
                    <input
                      type="number"
                      value={editLabourCost}
                      onChange={(e) => setEditLabourCost(e.target.value)}
                      placeholder="800000"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold">Equipment Cost</label>
                    <input
                      type="number"
                      value={editEquipmentCost}
                      onChange={(e) => setEditEquipmentCost(e.target.value)}
                      placeholder="300000"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold">Other Overhead</label>
                    <input
                      type="number"
                      value={editOtherCost}
                      onChange={(e) => setEditOtherCost(e.target.value)}
                      placeholder="200000"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t">
                <label className="font-bold text-foreground">Proposal Statement *</label>
                <textarea
                  rows={3}
                  required
                  value={editProposal}
                  onChange={(e) => setEditProposal(e.target.value)}
                  placeholder="Describe your execution approach, materials brand, and quality assurance..."
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Additional Notes / Warranty</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. 10-year structural warranty with waterproofing certificate"
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setEditingBid(null)}
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
                      <Save className="h-4 w-4" /> Save Updated Bid
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {deletingBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border bg-card text-foreground shadow-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Are you sure you want to delete this bid?</h3>
              <p className="text-xs text-muted-foreground">
                This will permanently remove your quotation of{" "}
                <strong className="text-foreground">{formatCurrency(deletingBid.quotation_amount)}</strong> for{" "}
                <strong className="text-foreground">{deletingBid.tender?.title}</strong> from the database.
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
                onClick={() => setDeletingBid(null)}
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
                {isDeleting ? "Deleting..." : "Yes, Delete Bid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
