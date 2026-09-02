"use client";

import { useState } from "react";
import { Key, Globe, Check, Save, AlertCircle, Loader2, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { changeUserPasswordAction } from "@/actions/auth";

export default function OwnerSettingsPage() {
  const { language, setLanguage, languages, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(language);
  const [prefSaved, setPrefSaved] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLanguageSelect = (code: string) => {
    setSelectedLang(code);
    setLanguage(code);
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 4000);
  };

  const handleSavePreferences = () => {
    setLanguage(selectedLang);
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 4000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!currentPassword.trim()) {
      errors["current_password"] = "Current password is required.";
    }
    if (!newPassword.trim()) {
      errors["new_password"] = "New password is required.";
    } else if (newPassword.length < 6) {
      errors["new_password"] = "New password must be at least 6 characters.";
    }
    if (!confirmPassword.trim()) {
      errors["confirm_password"] = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      errors["confirm_password"] = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPasswordLoading(true);

    try {
      const formData = new FormData();
      formData.set("current_password", currentPassword);
      formData.set("new_password", newPassword);
      formData.set("confirm_password", confirmPassword);

      const res = await changeUserPasswordAction(formData);

      if (res.error) {
        setPasswordError(res.error);
        if (res.field) {
          setFieldErrors({ [res.field]: res.error });
        }
      } else if (res.success) {
        setPasswordSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFieldErrors({});
        setTimeout(() => setPasswordSuccess(null), 5000);
      }
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="border-b pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("settings.title", "Account & Interface Settings")}</h1>
        <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">{t("settings.subtitle", "Manage language preference, password, and security settings")}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-8 shadow-sm text-xs">
        {prefSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>{t("settings.saved_success", "Settings and language preference saved successfully!")}</span>
          </div>
        )}

        {/* Language Selection Section */}
        <div className="space-y-4">
          <div className="border-b pb-2 flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-600" />
              <span>{t("settings.language_section_title", "Select Interface Language")}</span>
            </h3>
            <span className="text-[11px] font-semibold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              {languages.find((l) => l.code === selectedLang)?.nativeName} ({selectedLang.toUpperCase()})
            </span>
          </div>

          <p className="hidden sm:block text-xs text-muted-foreground leading-relaxed">
            {t("settings.language_section_desc", "Choose your preferred language. The dashboard menus, buttons, labels, and notifications will update automatically across all pages and persist upon login.")}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {languages.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? "border-orange-600 bg-orange-500/10 ring-2 ring-orange-500/30 text-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-sm text-foreground">{lang.nativeName}</span>
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>{lang.name}</span>
                    <span className="uppercase text-[10px] font-semibold opacity-70">({lang.code})</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="space-y-4 pt-2 border-t">
          <div className="border-b pb-2 flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-orange-600" />
              <span>Change Password</span>
            </h3>
            <span className="text-[10px] text-muted-foreground">Supabase Auth Verified</span>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            {/* Current Password */}
            <div className="space-y-1">
              <label htmlFor="owner_current_password" className="font-bold text-foreground flex items-center justify-between">
                <span>Current Password *</span>
                {fieldErrors["current_password"] && (
                  <span className="text-destructive text-[11px] font-medium">{fieldErrors["current_password"]}</span>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="owner_current_password"
                  name="current_password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (fieldErrors["current_password"]) {
                      setFieldErrors((prev) => ({ ...prev, current_password: "" }));
                    }
                  }}
                  placeholder="Enter your current password"
                  className={`w-full rounded-xl border bg-background pl-9 pr-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                    fieldErrors["current_password"]
                      ? "border-destructive ring-1 ring-destructive focus:ring-destructive"
                      : "border-border focus:ring-orange-500/50"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1">
                <label htmlFor="owner_new_password" className="font-bold text-foreground flex items-center justify-between">
                  <span>New Password *</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="owner_new_password"
                    name="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors["new_password"]) {
                        setFieldErrors((prev) => ({ ...prev, new_password: "" }));
                      }
                    }}
                    placeholder="Min 6 characters"
                    className={`w-full rounded-xl border bg-background pl-9 pr-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                      fieldErrors["new_password"]
                        ? "border-destructive ring-1 ring-destructive focus:ring-destructive"
                        : "border-border focus:ring-orange-500/50"
                    }`}
                  />
                </div>
                {fieldErrors["new_password"] && (
                  <p className="text-destructive text-[11px] font-medium pt-0.5">{fieldErrors["new_password"]}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label htmlFor="owner_confirm_password" className="font-bold text-foreground flex items-center justify-between">
                  <span>Confirm New Password *</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="owner_confirm_password"
                    name="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors["confirm_password"]) {
                        setFieldErrors((prev) => ({ ...prev, confirm_password: "" }));
                      }
                    }}
                    placeholder="Re-enter new password"
                    className={`w-full rounded-xl border bg-background pl-9 pr-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                      fieldErrors["confirm_password"]
                        ? "border-destructive ring-1 ring-destructive focus:ring-destructive"
                        : "border-border focus:ring-orange-500/50"
                    }`}
                  />
                </div>
                {fieldErrors["confirm_password"] && (
                  <p className="text-destructive text-[11px] font-medium pt-0.5">{fieldErrors["confirm_password"]}</p>
                )}
              </div>
            </div>

            <div className="flex justify-center sm:justify-start pt-1">
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-800 disabled:opacity-50 transition-all cursor-pointer"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying & Updating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" /> Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Save Actions */}
        <div className="pt-4 border-t flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-700/30 hover:bg-orange-800 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{t("settings.save_btn", "Save Preferences")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
