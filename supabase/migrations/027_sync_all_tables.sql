-- ============================================================================
-- NIRMAN FULL SUPABASE SCHEMA SYNCHRONIZATION MIGRATION
-- Migration: 027_sync_all_tables.sql
-- Description: Safely creates missing tables, adds missing columns, and sets RLS
-- ============================================================================

-- 1. ADMIN SETTINGS TABLE
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
        "system_status": "operational",
        "payment_settings": {
            "razorpay_enabled": true,
            "static_qr_enabled": true,
            "static_qr_image": "/images/static_upi_qr.png",
            "upi_id": "nirman@upi",
            "display_name": "NIRMAN Technologies Pvt Ltd",
            "payment_instructions": "Scan using GPay, PhonePe, Paytm, or BHIM UPI app to pay ₹199."
        }
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings row if not exists
INSERT INTO public.admin_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- 2. SUPPORT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    user_type TEXT NOT NULL DEFAULT 'other',
    issue_type TEXT NOT NULL DEFAULT 'general',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- open, under_review, resolved, closed
    admin_response TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DIRECT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    tender_id UUID REFERENCES public.tenders(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ENSURE CRITICAL COLUMNS ON CORE TABLES
-- Projects Table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS contractor_id UUID REFERENCES public.contractors(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS contractor_name TEXT;

-- Tenders Table
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS budget_min NUMERIC;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS budget_max NUMERIC;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS bid_deadline TIMESTAMPTZ;

-- Payments Table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_reference TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'CONTRACTOR_SELECTION_FEE';

-- Bids Table
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS proposed_start_date DATE;
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admin Settings Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view admin settings" ON public.admin_settings;
    CREATE POLICY "Admins can view admin settings" ON public.admin_settings
        FOR SELECT TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

    DROP POLICY IF EXISTS "Admins can update admin settings" ON public.admin_settings;
    CREATE POLICY "Admins can update admin settings" ON public.admin_settings
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
END $$;

-- Support Requests Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own support requests" ON public.support_requests;
    CREATE POLICY "Users can view own support requests" ON public.support_requests
        FOR SELECT TO authenticated
        USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

    DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.support_requests;
    CREATE POLICY "Anyone can submit support requests" ON public.support_requests
        FOR INSERT TO anon, authenticated
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Admins can manage support requests" ON public.support_requests;
    CREATE POLICY "Admins can manage support requests" ON public.support_requests
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
END $$;

-- Direct Messages Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;
    CREATE POLICY "Users can view their direct messages" ON public.direct_messages
        FOR SELECT TO authenticated
        USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

    DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
    CREATE POLICY "Users can send direct messages" ON public.direct_messages
        FOR INSERT TO authenticated
        WITH CHECK (sender_id = auth.uid());
END $$;
