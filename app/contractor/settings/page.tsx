"use client";

import { useState } from "react";
import { Key, Bell, Save, Globe, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ContractorSettingsPage() {
  const { language, setLanguage, languages, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(language);
  const [saved, setSaved] = useState(false);

  const handleLanguageSelect = (code: string) => {
    setSelectedLang(code);
    setLanguage(code);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handleSaveAll = () => {
    setLanguage(selectedLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">{t("settings.title", "Account & Security Settings")}</h1>
        <p className="text-xs text-muted-foreground">{t("settings.subtitle", "Manage language preference, password, notification preferences, and security settings")}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-8 shadow-sm text-xs">
        {saved && (
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

          <p className="text-xs text-muted-foreground leading-relaxed">
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
          <h3 className="font-bold text-sm text-foreground border-b pb-2 flex items-center gap-2">
            <Key className="h-4 w-4 text-orange-600" />
            <span>{t("settings.password_section_title", "Password & Security")}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="contractor-new-pass" className="font-semibold text-foreground">
                {t("settings.new_password", "New Password")}
              </label>
              <input
                id="contractor-new-pass"
                type="password"
                placeholder={t("settings.password_placeholder", "At least 6 characters")}
                aria-label="New password"
                className="w-full rounded-lg border bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="contractor-confirm-pass" className="font-semibold text-foreground">
                {t("settings.confirm_password", "Confirm New Password")}
              </label>
              <input
                id="contractor-confirm-pass"
                type="password"
                placeholder={t("settings.confirm_placeholder", "Re-enter new password")}
                aria-label="Confirm new password"
                className="w-full rounded-lg border bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="space-y-4 pt-2 border-t">
          <h3 className="font-bold text-sm text-foreground border-b pb-2 flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-600" />
            <span>{t("settings.notifications_title", "Notification Preferences")}</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-700 h-4 w-4 rounded" />
              <span className="text-foreground">{t("settings.notif_bid_accepted", "Email alerts when property owner accepts a bid")}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-700 h-4 w-4 rounded" />
              <span className="text-foreground">{t("settings.notif_new_tenders", "Notifications for new tender openings matching my category")}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-700 h-4 w-4 rounded" />
              <span className="text-foreground">{t("settings.notif_milestone_payment", "Disbursement & milestone payment alerts")}</span>
            </label>
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-700/30 hover:bg-orange-800 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{t("settings.save_btn", "Save Preferences")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

