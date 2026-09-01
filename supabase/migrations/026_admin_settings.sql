-- Migration 026: Admin Settings and Platform Configuration Table
-- Supports Admin Profile, Notifications, User Management, Tender Management, Security, and System Settings.

CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notification_preferences JSONB NOT NULL DEFAULT '{
        "new_owner_registration": true,
        "new_contractor_registration": true,
        "new_tender": true,
        "new_support_request": true,
        "new_issue_report": false,
        "new_bid_activity": true
    }'::jsonb,
    user_management_settings JSONB NOT NULL DEFAULT '{
        "owner_approval": "manual",
        "contractor_approval": "manual",
        "account_status": "active"
    }'::jsonb,
    tender_management_settings JSONB NOT NULL DEFAULT '{
        "tender_approval": true,
        "tender_moderation": true,
        "reported_tender_handling": true
    }'::jsonb,
    system_settings JSONB NOT NULL DEFAULT '{
        "platform_name": "NIRMAN",
        "support_email": "support@nirman.com",
        "support_phone": "+91 98765 43210",
        "maintenance_mode": false,
        "system_status": "operational"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Only Admins can view and update admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin settings" ON public.admin_settings
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update admin settings" ON public.admin_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
