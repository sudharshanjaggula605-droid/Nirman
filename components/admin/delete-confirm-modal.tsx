"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, X, Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  itemName?: string;
  role?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Account",
  itemName,
  role = "User",
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, deleting, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={deleting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-7 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150 relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Danger Icon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
            <Trash2 className="h-6 w-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 id="delete-dialog-title" className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              {itemName ? <strong className="text-slate-200">{itemName}</strong> : `this ${role}`}?
              This action cannot be undone and will permanently remove all associated account data.
            </p>
          </div>
        </div>

        {/* Buttons Action Group */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-rose-600/30 hover:from-rose-700 hover:to-red-700 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
