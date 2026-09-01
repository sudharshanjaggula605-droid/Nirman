"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Bell,
  Users,
  FileText,
  Shield,
  Server,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Key,
  Lock,
  Smartphone,
  Activity,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Radio,
  Sliders,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  getAdminFullSettingsAction,
  updateAdminProfileAction,
  updateAdminNotificationSettingsAction,
  updateAdminUserManagementSettingsAction,
  updateAdminTenderManagementSettingsAction,
  updateAdminSystemSettingsAction,
  updateAdminPasswordAction,
  getAdminSecurityAuditAction,
  NotificationPreferences,
  UserManagementSettings,
  TenderManagementSettings,
  SystemSettings,
  AdminProfileData,
} from "@/actions/admin-settings";
import { formatDate } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "all" | "profile" | "notifications" | "users" | "tenders" | "security" | "system"
  >("all");

  // Section 1: Profile State
  const [profile, setProfile] = useState<AdminProfileData>({
    id: "",
    full_name: "NIRMAN Administrator",
    email: "admin@nirman.com",
    phone: "",
    avatar_url: null,
    role: "admin",
    status: "approved",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section 2: Notifications State
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    new_owner_registration: true,
    new_contractor_registration: true,
    new_tender: true,
    new_support_request: true,
    new_issue_report: false,
    new_bid_activity: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState<string | null>(null);

  // Section 3: User Management State
  const [userManagement, setUserManagement] = useState<UserManagementSettings>({
    owner_approval: "manual",
    contractor_approval: "manual",
    account_status: "active",
  });
  const [savingUsers, setSavingUsers] = useState(false);
  const [userSuccessMsg, setUserSuccessMsg] = useState<string | null>(null);

  // Section 4: Tender Management State
  const [tenderManagement, setTenderManagement] = useState<TenderManagementSettings>({
    tender_approval: true,
    tender_moderation: true,
    reported_tender_handling: true,
  });
  const [savingTenders, setSavingTenders] = useState(false);
  const [tenderSuccessMsg, setTenderSuccessMsg] = useState<string | null>(null);

  // Section 5: Security State
  const [passwordState, setPasswordState] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Section 6: System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    platform_name: "NIRMAN",
    support_email: "support@nirman.com",
    support_phone: "+91 98765 43210",
    maintenance_mode: false,
    system_status: "operational",
  });
  const [savingSystem, setSavingSystem] = useState(false);
  const [systemSuccessMsg, setSystemSuccessMsg] = useState<string | null>(null);
  const [systemErrorMsg, setSystemErrorMsg] = useState<string | null>(null);

  // Load initial settings from database
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await getAdminFullSettingsAction();
        if (res.success) {
          if (res.profile) {
            setProfile(res.profile);
            if (res.profile.avatar_url) setAvatarPreview(res.profile.avatar_url);
          }
          if (res.notifications) setNotifications(res.notifications);
          if (res.userManagement) setUserManagement(res.userManagement);
          if (res.tenderManagement) setTenderManagement(res.tenderManagement);
          if (res.systemSettings) setSystemSettings(res.systemSettings);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Fetch security logs
  const loadSecurityAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await getAdminSecurityAuditAction();
      if (res.success && res.logs) {
        setAuditLogs(res.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    loadSecurityAudit();
  }, []);

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        setProfileErrorMsg("Profile photo must be less than 3MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setProfileErrorMsg(null);
    }
  };

  // 1. Update Admin Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    if (!profile.full_name.trim()) {
      setProfileErrorMsg("Please enter your full name.");
      return;
    }

    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append("full_name", profile.full_name.trim());
      fd.append("phone", profile.phone.trim());
      if (avatarFile) {
        fd.append("avatar", avatarFile);
      }

      const res = await updateAdminProfileAction(fd);
      if (res.success) {
        setProfileSuccessMsg("Admin profile updated successfully!");
        if (res.avatar_url) {
          setProfile((p) => ({ ...p, avatar_url: res.avatar_url }));
        }
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      } else {
        setProfileErrorMsg(res.error || "Unable to update profile. Please try again.");
      }
    } catch (err) {
      setProfileErrorMsg("Unable to update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Toggle Notification setting
  const handleToggleNotification = async (key: keyof NotificationPreferences) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updated);
    setSavingNotifications(true);
    setNotifSuccessMsg(null);

    const res = await updateAdminNotificationSettingsAction(updated);
    if (res.success) {
      setNotifSuccessMsg("Notification preferences saved!");
      setTimeout(() => setNotifSuccessMsg(null), 3000);
    }
    setSavingNotifications(false);
  };

  // 3. User Management Settings Save
  const handleUserManagementChange = async (
    key: keyof UserManagementSettings,
    val: any
  ) => {
    const updated = {
      ...userManagement,
      [key]: val,
    };
    setUserManagement(updated);
    setSavingUsers(true);
    setUserSuccessMsg(null);

    const res = await updateAdminUserManagementSettingsAction(updated);
    if (res.success) {
      setUserSuccessMsg("User management policy updated!");
      setTimeout(() => setUserSuccessMsg(null), 3000);
    }
    setSavingUsers(false);
  };

  // 4. Tender Management Settings Save
  const handleTenderManagementToggle = async (
    key: keyof TenderManagementSettings
  ) => {
    const updated = {
      ...tenderManagement,
      [key]: !tenderManagement[key],
    };
    setTenderManagement(updated);
    setSavingTenders(true);
    setTenderSuccessMsg(null);

    const res = await updateAdminTenderManagementSettingsAction(updated);
    if (res.success) {
      setTenderSuccessMsg("Tender management policy updated!");
      setTimeout(() => setTenderSuccessMsg(null), 3000);
    }
    setSavingTenders(false);
  };

  // 5. Change Password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);

    if (passwordState.newPassword.length < 6) {
      setPasswordErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordErrorMsg("Password confirmation does not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await updateAdminPasswordAction(passwordState.newPassword);
      if (res.success) {
        setPasswordSuccessMsg("Password updated successfully!");
        setPasswordState({ newPassword: "", confirmPassword: "" });
        await loadSecurityAudit();
        setTimeout(() => setPasswordSuccessMsg(null), 4000);
      } else {
        setPasswordErrorMsg(res.error || "Unable to update password.");
      }
    } catch (err) {
      setPasswordErrorMsg("Unable to update password. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  // 6. Update System Settings
  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSystemSuccessMsg(null);
    setSystemErrorMsg(null);

    if (!systemSettings.platform_name.trim()) {
      setSystemErrorMsg("Platform name cannot be empty.");
      return;
    }
    if (
      !systemSettings.support_email.trim() ||
      !/\S+@\S+\.\S+/.test(systemSettings.support_email)
    ) {
      setSystemErrorMsg("Please enter a valid support email address.");
      return;
    }

    setSavingSystem(true);
    try {
      const res = await updateAdminSystemSettingsAction(systemSettings);
      if (res.success) {
        setSystemSuccessMsg("System configuration saved successfully!");
        setTimeout(() => setSystemSuccessMsg(null), 4000);
      } else {
        setSystemErrorMsg(res.error || "Unable to save system settings.");
      }
    } catch (err) {
      setSystemErrorMsg("Unable to save system settings. Please try again.");
    } finally {
      setSavingSystem(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl pb-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
          <h2 className="text-sm font-bold text-slate-200">Loading Admin Settings...</h2>
          <p className="text-xs text-slate-400">Fetching configuration from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Sliders className="h-3.5 w-3.5" /> Administration & Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Configure administrator profile, notification triggers, user approval policies, tender moderation, and core system parameters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                systemSettings.maintenance_mode
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  systemSettings.maintenance_mode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
              {systemSettings.maintenance_mode ? "Maintenance Mode Active" : "System Operational"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADMIN PROFILE SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <User className="h-5 w-5 text-amber-500" />
              <span>Admin Profile</span>
            </div>
            <p className="text-xs text-slate-400">
              Manage your administrator personal information, contact phone, and avatar.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            Role: SUPER ADMIN
          </span>
        </div>

        {profileSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}
        {profileErrorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{profileErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Photo
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative h-16 w-16 rounded-2xl border-2 border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-extrabold text-lg text-amber-500">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "A"}
                  </span>
                )}
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>Change Photo</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG or WebP (Max 3MB).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="admin-full-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-500" /> Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="admin-full-name"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Admin Name"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-500" /> Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400">Primary Supabase Auth credentials account</span>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="admin-phone" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-500" /> Phone Number
              </label>
              <input
                id="admin-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. NOTIFICATIONS PREFERENCES SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <Bell className="h-5 w-5 text-amber-500" />
              <span>Notifications</span>
            </div>
            <p className="text-xs text-slate-400">
              Control administrative real-time alert triggers and system push notification preferences.
            </p>
          </div>
          {savingNotifications && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </span>
          )}
        </div>

        {notifSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{notifSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner Registration */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">New Owner Registration</div>
              <p className="text-[11px] text-slate-400">Receive alert when a property owner registers</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification("new_owner_registration")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                notifications.new_owner_registration
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {notifications.new_owner_registration ? "ON" : "OFF"}
            </button>
          </div>

          {/* Contractor Registration */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">New Contractor Registration</div>
              <p className="text-[11px] text-slate-400">Alert on new civil contractor licenses submitted</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification("new_contractor_registration")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                notifications.new_contractor_registration
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {notifications.new_contractor_registration ? "ON" : "OFF"}
            </button>
          </div>

          {/* New Tender */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">New Tender</div>
              <p className="text-[11px] text-slate-400">Notify admin when owners publish construction tenders</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification("new_tender")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                notifications.new_tender
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {notifications.new_tender ? "ON" : "OFF"}
            </button>
          </div>

          {/* New Support Request */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">New Support Request</div>
              <p className="text-[11px] text-slate-400">Instant notification on Contact page user inquiries</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification("new_support_request")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                notifications.new_support_request
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {notifications.new_support_request ? "ON" : "OFF"}
            </button>
          </div>

          {/* New Issue/Report */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">New Issue/Report</div>
              <p className="text-[11px] text-slate-400">Escrow dispute, contractor complaints, or tender reports</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification("new_issue_report")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                notifications.new_issue_report
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {notifications.new_issue_report ? "ON" : "OFF"}
            </button>
          </div>

          {/* New Bid Activity */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">New Bid Activity</div>
              <p className="text-[11px] text-slate-400">High-value BOQ bids placed by verified contractors</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification("new_bid_activity")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                notifications.new_bid_activity
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {notifications.new_bid_activity ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. USER MANAGEMENT SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <Users className="h-5 w-5 text-amber-500" />
              <span>User Management</span>
            </div>
            <p className="text-xs text-slate-400">
              Configure verification policies for Property Owners and Civil Contractors.
            </p>
          </div>
          {savingUsers && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </span>
          )}
        </div>

        {userSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{userSuccessMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Owner Approval Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Owner Registration Approval</div>
              <p className="text-[11px] text-slate-400">
                Require administrative verification before property owners can create tenders
              </p>
            </div>
            <select
              value={userManagement.owner_approval}
              onChange={(e) => handleUserManagementChange("owner_approval", e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="manual">Manual Approval</option>
              <option value="auto">Automatic Approval</option>
            </select>
          </div>

          {/* Contractor Approval Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Contractor Registration Approval</div>
              <p className="text-[11px] text-slate-400">
                Require manual document review (GST, PAN, PWD Class License) before bidding
              </p>
            </div>
            <select
              value={userManagement.contractor_approval}
              onChange={(e) => handleUserManagementChange("contractor_approval", e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="manual">Manual Approval</option>
              <option value="auto">Automatic Approval</option>
            </select>
          </div>

          {/* Global Account Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Platform Account Registration Status</div>
              <p className="text-[11px] text-slate-400">
                Allow new users to create accounts on NIRMAN or temporarily suspend signups
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleUserManagementChange("account_status", "active")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  userManagement.account_status === "active"
                    ? "bg-emerald-500 text-slate-950 border-emerald-500 ring-2 ring-emerald-500/30"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => handleUserManagementChange("account_status", "suspended")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  userManagement.account_status === "suspended"
                    ? "bg-rose-500 text-white border-rose-500 ring-2 ring-rose-500/30"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                Suspended
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TENDER MANAGEMENT SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <FileText className="h-5 w-5 text-amber-500" />
              <span>Tender Management</span>
            </div>
            <p className="text-xs text-slate-400">
              Configure publish verification, content moderation, and reported tender workflows.
            </p>
          </div>
          {savingTenders && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </span>
          )}
        </div>

        {tenderSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{tenderSuccessMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Tender Approval */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Tender Approval</div>
              <p className="text-[11px] text-slate-400">
                Require admin approval before new construction tenders are publicly published
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTenderManagementToggle("tender_approval")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                tenderManagement.tender_approval
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tenderManagement.tender_approval ? "ON" : "OFF"}
            </button>
          </div>

          {/* Tender Moderation */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Tender Moderation</div>
              <p className="text-[11px] text-slate-400">
                Allow administrators to edit, hide, or moderate suspicious tender BOQs
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTenderManagementToggle("tender_moderation")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                tenderManagement.tender_moderation
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tenderManagement.tender_moderation ? "ON" : "OFF"}
            </button>
          </div>

          {/* Reported Tender Handling */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Reported Tender Handling</div>
              <p className="text-[11px] text-slate-400">
                Allow admins to review reported tenders and flag fraudulent tender listings
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTenderManagementToggle("reported_tender_handling")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                tenderManagement.reported_tender_handling
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tenderManagement.reported_tender_handling ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SECURITY SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <Shield className="h-5 w-5 text-amber-500" />
              <span>Security</span>
            </div>
            <p className="text-xs text-slate-400">
              Manage account authentication credentials, two-factor verification, and audit logs.
            </p>
          </div>
        </div>

        {passwordSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{passwordSuccessMsg}</span>
          </div>
        )}
        {passwordErrorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{passwordErrorMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Change Password Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-500" /> Change Administrator Password
                </div>
                <p className="text-[11px] text-slate-400">
                  Update your Supabase authentication password with minimum 6 characters
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordState.newPassword}
                      onChange={(e) =>
                        setPasswordState((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordState.confirmPassword}
                    onChange={(e) =>
                      setPasswordState((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword || !passwordState.newPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <Key className="h-3.5 w-3.5 text-amber-400" /> Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-amber-500" /> Two-Factor Authentication
              </div>
              <p className="text-[11px] text-slate-400">
                Add an additional security layer using TOTP authenticator app verification
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-400 border border-slate-700">
              OFF
            </span>
          </div>

          {/* Active Sessions */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Active Sessions</div>
                <p className="text-[11px] text-slate-400">
                  Currently active administrative browser session
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Current Session Active
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="space-y-0.5">
                <div className="text-slate-200 font-semibold">Web Browser Console (Next.js SSR)</div>
                <div className="text-[11px]">Authenticated as: <strong className="text-slate-100">{profile.email}</strong></div>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white"
              >
                View Sessions
              </button>
            </div>
          </div>

          {/* Login & Admin Activity Logs */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-500" /> Login Activity & Audit Logs
                </div>
                <p className="text-[11px] text-slate-400">
                  Recent platform administrative actions and security events
                </p>
              </div>
              <button
                type="button"
                onClick={loadSecurityAudit}
                disabled={loadingAudit}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold"
              >
                <RefreshCw className={`h-3 w-3 ${loadingAudit ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>

            {auditLogs.length > 0 ? (
              <div className="space-y-2 pt-1">
                {auditLogs.slice(0, 4).map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200 uppercase text-[11px]">
                        {log.action?.replace("_", " ")}
                      </div>
                      <div className="text-[10px] text-slate-400">{log.reason || "System event"}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900 text-center text-[11px] text-slate-400">
                No recent security incidents or suspicious login events.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SYSTEM SETTINGS SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <Server className="h-5 w-5 text-amber-500" />
              <span>System Settings</span>
            </div>
            <p className="text-xs text-slate-400">
              Core platform metadata, support contacts, and maintenance mode controls.
            </p>
          </div>
        </div>

        {systemSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{systemSuccessMsg}</span>
          </div>
        )}
        {systemErrorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{systemErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveSystemSettings} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Platform Name */}
            <div className="space-y-1.5">
              <label htmlFor="platform-name" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-amber-500" /> Platform Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="platform-name"
                type="text"
                value={systemSettings.platform_name}
                onChange={(e) =>
                  setSystemSettings((s) => ({ ...s, platform_name: e.target.value }))
                }
                placeholder="NIRMAN"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Support Email */}
            <div className="space-y-1.5">
              <label htmlFor="support-email" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-500" /> Support Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="support-email"
                type="email"
                value={systemSettings.support_email}
                onChange={(e) =>
                  setSystemSettings((s) => ({ ...s, support_email: e.target.value }))
                }
                placeholder="support@nirman.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Support Phone */}
            <div className="space-y-1.5">
              <label htmlFor="support-phone" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-amber-500" /> Support Phone
              </label>
              <input
                id="support-phone"
                type="tel"
                value={systemSettings.support_phone}
                onChange={(e) =>
                  setSystemSettings((s) => ({ ...s, support_phone: e.target.value }))
                }
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Maintenance Mode & System Status Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">Maintenance Mode</div>
                <p className="text-[11px] text-slate-400">
                  When enabled, normal visitors see maintenance notice while Admin remains authorized
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSystemSettings((s) => ({
                    ...s,
                    maintenance_mode: !s.maintenance_mode,
                  }))
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  systemSettings.maintenance_mode
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {systemSettings.maintenance_mode ? "ON" : "OFF"}
              </button>
            </div>

            {/* Live System Status Display */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">System Status</div>
                <p className="text-[11px] text-slate-400">Overall platform uptime and database health</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSystem}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingSystem ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
