"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, X, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loggingOut) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loggingOut, onClose]);

  // Prevent background scrolling when modal is open
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
    setLoggingOut(true);
    try {
      await onConfirm();
    } finally {
      setLoggingOut(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={loggingOut ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div
        className="w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-card-foreground animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loggingOut}
          className="absolute right-4 top-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-40 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Body */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Glowing Icon Badge */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500/20 to-red-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10">
            <LogOut className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 id="logout-dialog-title" className="text-lg sm:text-xl font-black text-foreground tracking-tight">
              {t("logout.modal_title", "Are you sure you want to logout?")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm mx-auto leading-relaxed">
              {t(
                "logout.confirm_message",
                "You will be securely logged out of your session. You can sign back in anytime to continue managing your projects."
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 w-full pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loggingOut}
              className="w-full sm:flex-1 rounded-xl border bg-card px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loggingOut}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/30 hover:from-rose-700 hover:to-red-700 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer text-center"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("logout.logging_out", "Logging out...")}</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>{t("nav.logout", "Logout")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
