-- ============================================================================
-- NIRMAN Construction Tender & Contractor Management Platform
-- COMPLETE SUPABASE POSTGRESQL SCHEMA (Master Migration Script)
-- ============================================================================

-- 001. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 002. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'owner', 'contractor');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('pending', 'approved', 'rejected', 'blocked');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('draft', 'tender', 'awarded', 'active', 'completed', 'cancelled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_status') THEN
        CREATE TYPE tender_status AS ENUM ('draft', 'active', 'closing_soon', 'closed', 'awarded', 'cancelled', 'completed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
        CREATE TYPE bid_status AS ENUM ('pending', 'under_review', 'accepted', 'rejected', 'withdrawn');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_status') THEN
        CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'requested', 'approved', 'paid', 'rejected', 'cancelled');
    END IF;
END $$;

-- 003. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL,
    status account_status NOT NULL DEFAULT 'pending',
    avatar_url TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 004. OWNERS
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    company_name TEXT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    identity_document_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 005. CONTRACTORS
CREATE TABLE IF NOT EXISTS public.contractors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gst_number TEXT UNIQUE NULL,
    pan_number TEXT UNIQUE NULL,
    license_number TEXT UNIQUE NULL,
    years_of_experience INTEGER DEFAULT 0,
    description TEXT,
    logo_url TEXT NULL,
    license_document_url TEXT NULL,
    certificate_document_url TEXT NULL,
    website_url TEXT NULL,
    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
    total_projects INTEGER NOT NULL DEFAULT 0 CHECK (total_projects >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 006. PROJECT CATEGORIES
CREATE TABLE IF NOT EXISTS public.project_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 007. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.project_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT,
    area_sqft NUMERIC CHECK (area_sqft > 0),
    estimated_budget NUMERIC CHECK (estimated_budget >= 0),
    location TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    latitude NUMERIC NULL,
    longitude NUMERIC NULL,
    start_date DATE NULL,
    expected_completion_date DATE NULL,
    status project_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 008. PROJECT FILES
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 009. TENDERS & TENDER FILES
CREATE TABLE IF NOT EXISTS public.tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    budget_min NUMERIC CHECK (budget_min >= 0),
    budget_max NUMERIC CHECK (budget_max >= budget_min),
    bid_deadline TIMESTAMPTZ NOT NULL,
    status tender_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tender_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tender_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW public.active_public_tenders AS
SELECT *
FROM public.tenders
WHERE status = 'active'
  AND bid_deadline > NOW();

-- 010. BIDS & BREAKDOWNS
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
    quotation_amount NUMERIC NOT NULL CHECK (quotation_amount > 0),
    estimated_completion_days INTEGER NOT NULL CHECK (estimated_completion_days > 0),
    proposed_start_date DATE NULL,
    proposal TEXT NOT NULL,
    additional_notes TEXT NULL,
    status bid_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_contractor_tender_bid UNIQUE (tender_id, contractor_id)
);

CREATE TABLE IF NOT EXISTS public.bid_cost_breakdowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
    material_cost NUMERIC NOT NULL DEFAULT 0 CHECK (material_cost >= 0),
    labour_cost NUMERIC NOT NULL DEFAULT 0 CHECK (labour_cost >= 0),
    equipment_cost NUMERIC NOT NULL DEFAULT 0 CHECK (equipment_cost >= 0),
    other_cost NUMERIC NOT NULL DEFAULT 0 CHECK (other_cost >= 0),
    total_cost NUMERIC NOT NULL CHECK (total_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 011. PROJECT MANAGEMENT & PORTFOLIO
CREATE TABLE IF NOT EXISTS public.contractor_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT,
    location TEXT,
    image_url TEXT NULL,
    document_url TEXT NULL,
    completion_year INTEGER NULL CHECK (completion_year >= 1900 AND completion_year <= 2100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NULL,
    due_date DATE NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    status milestone_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_update_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_update_id UUID NOT NULL REFERENCES public.project_updates(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 012. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_type TEXT,
    description TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMPTZ NULL,
    transaction_reference TEXT NULL,
    receipt_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 013. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_project_owner_review UNIQUE (project_id, owner_id)
);

-- 014. MESSAGING & REALTIME
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NULL,
    tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    attachment_url TEXT NULL,
    attachment_type TEXT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 015. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id UUID NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 016. ADMIN ACTIONS & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NULL,
    action TEXT NOT NULL,
    reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 017. INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_city ON public.projects(city);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_owner_id ON public.tenders(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenders_project_id ON public.tenders(project_id);
CREATE INDEX IF NOT EXISTS idx_tenders_bid_deadline ON public.tenders(bid_deadline);
CREATE INDEX IF NOT EXISTS idx_bids_tender_id ON public.bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_bids_contractor_id ON public.bids(contractor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_milestone_id ON public.project_updates(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner_id ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_contractor_id ON public.payments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_contractor_id ON public.reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON public.reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- 018. STORED FUNCTIONS
CREATE OR REPLACE FUNCTION public.approve_user(
    p_target_user_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role user_role;
    v_target_role user_role;
BEGIN
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrative users can perform this action.';
    END IF;

    SELECT role INTO v_target_role FROM public.profiles WHERE id = p_target_user_id;
    IF v_target_role IS NULL THEN
        RAISE EXCEPTION 'Target profile not found.';
    END IF;

    UPDATE public.profiles
    SET status = 'approved',
        updated_at = NOW()
    WHERE id = p_target_user_id;

    INSERT INTO public.admin_actions (admin_id, target_user_id, action, reason)
    VALUES (p_admin_id, p_target_user_id, 'APPROVE_USER', p_reason);

    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_target_user_id,
        'Account Approved',
        'Your account application has been approved. You now have full access to NIRMAN.',
        'account_approved',
        p_target_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_user(
    p_target_user_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role user_role;
BEGIN
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrative users can perform this action.';
    END IF;

    UPDATE public.profiles
    SET status = 'rejected',
        updated_at = NOW()
    WHERE id = p_target_user_id;

    INSERT INTO public.admin_actions (admin_id, target_user_id, action, reason)
    VALUES (p_admin_id, p_target_user_id, 'REJECT_USER', p_reason);

    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_target_user_id,
        'Account Application Update',
        COALESCE(p_reason, 'Your account application was not approved by administration.'),
        'account_rejected',
        p_target_user_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.block_user(
    p_target_user_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role user_role;
BEGIN
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrative users can perform this action.';
    END IF;

    UPDATE public.profiles
    SET status = 'blocked',
        updated_at = NOW()
    WHERE id = p_target_user_id;

    INSERT INTO public.admin_actions (admin_id, target_user_id, action, reason)
    VALUES (p_admin_id, p_target_user_id, 'BLOCK_USER', p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_bid(
    p_bid_id UUID,
    p_owner_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tender_id UUID;
    v_project_id UUID;
    v_contractor_id UUID;
    v_tender_owner_id UUID;
    v_bid_status bid_status;
    v_other_bid RECORD;
BEGIN
    SELECT b.tender_id, b.contractor_id, b.status, t.project_id, t.owner_id
    INTO v_tender_id, v_contractor_id, v_bid_status, v_project_id, v_tender_owner_id
    FROM public.bids b
    JOIN public.tenders t ON t.id = b.tender_id
    WHERE b.id = p_bid_id;

    IF v_tender_id IS NULL THEN
        RAISE EXCEPTION 'Bid not found.';
    END IF;

    IF v_tender_owner_id != p_owner_id THEN
        RAISE EXCEPTION 'Unauthorized: You are not the owner of this tender.';
    END IF;

    IF v_bid_status = 'accepted' THEN
        RAISE EXCEPTION 'This bid has already been accepted.';
    END IF;

    UPDATE public.bids
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = p_bid_id;

    UPDATE public.bids
    SET status = 'rejected',
        updated_at = NOW()
    WHERE tender_id = v_tender_id
      AND id != p_bid_id;

    UPDATE public.tenders
    SET status = 'awarded',
        updated_at = NOW()
    WHERE id = v_tender_id;

    UPDATE public.projects
    SET status = 'active',
        updated_at = NOW()
    WHERE id = v_project_id;

    UPDATE public.contractors
    SET total_projects = total_projects + 1,
        updated_at = NOW()
    WHERE id = v_contractor_id;

    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        v_contractor_id,
        'Bid Accepted!',
        'Congratulations! Your bid has been accepted by the property owner. Project management has commenced.',
        'bid_accepted',
        v_project_id
    );

    FOR v_other_bid IN
        SELECT contractor_id FROM public.bids WHERE tender_id = v_tender_id AND id != p_bid_id
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (
            v_other_bid.contractor_id,
            'Tender Awarded',
            'Another bid was selected for this tender. Thank you for participating.',
            'bid_rejected',
            v_tender_id
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_contractor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_contractor_id UUID;
    v_avg NUMERIC(3,2);
    v_count INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_contractor_id := OLD.contractor_id;
    ELSE
        v_contractor_id := NEW.contractor_id;
    END IF;

    SELECT COALESCE(ROUND(AVG(rating), 2), 0.00), COUNT(*)
    INTO v_avg, v_count
    FROM public.reviews
    WHERE contractor_id = v_contractor_id;

    UPDATE public.contractors
    SET average_rating = v_avg,
        total_reviews = v_count,
        updated_at = NOW()
    WHERE id = v_contractor_id;

    RETURN NULL;
END;
$$;

-- 019. TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_owners_updated_at ON public.owners;
CREATE TRIGGER trg_owners_updated_at BEFORE UPDATE ON public.owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_contractors_updated_at ON public.contractors;
CREATE TRIGGER trg_contractors_updated_at BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tenders_updated_at ON public.tenders;
CREATE TRIGGER trg_tenders_updated_at BEFORE UPDATE ON public.tenders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bids_updated_at ON public.bids;
CREATE TRIGGER trg_bids_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bid_cost_breakdowns_updated_at ON public.bid_cost_breakdowns;
CREATE TRIGGER trg_bid_cost_breakdowns_updated_at BEFORE UPDATE ON public.bid_cost_breakdowns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_project_milestones_updated_at ON public.project_milestones;
CREATE TRIGGER trg_project_milestones_updated_at BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role_str TEXT;
    v_role user_role := 'owner'::user_role;
    v_status account_status := 'pending'::account_status;
    v_full_name TEXT;
    v_phone TEXT;
    v_company_name TEXT;
    v_contact_person TEXT;
BEGIN
    v_role_str := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'owner'));
    
    IF v_role_str = 'contractor' THEN
        v_role := 'contractor'::user_role;
    ELSIF v_role_str = 'admin' THEN
        v_role := 'admin'::user_role;
        v_status := 'approved'::account_status;
    ELSE
        v_role := 'owner'::user_role;
    END IF;

    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User ' || substring(NEW.id::text, 1, 8));
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_company_name := NEW.raw_user_meta_data->>'company_name';
    v_contact_person := COALESCE(NEW.raw_user_meta_data->>'contact_person', v_full_name);

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        status
    ) VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        v_phone,
        v_role,
        v_status
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    IF v_role = 'owner' THEN
        INSERT INTO public.owners (
            id,
            full_name,
            phone,
            company_name
        ) VALUES (
            NEW.id,
            v_full_name,
            v_phone,
            v_company_name
        ) ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'contractor' THEN
        INSERT INTO public.contractors (
            id,
            company_name,
            contact_person,
            phone,
            email
        ) VALUES (
            NEW.id,
            COALESCE(v_company_name, v_full_name),
            v_contact_person,
            v_phone,
            NEW.email
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_reviews_recalculate_rating ON public.reviews;
CREATE TRIGGER trg_reviews_recalculate_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_contractor_rating();

-- 020. ROW LEVEL SECURITY (RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'approved'
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_cost_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_update_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by user themselves or Admin" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles can be updated by owner or Admin" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admin can insert/delete profiles" ON public.profiles FOR ALL USING (public.is_admin());

CREATE POLICY "Owners profile viewable by self, relevant contractor, or admin" ON public.owners FOR SELECT USING (auth.uid() = id OR public.is_admin() OR public.is_approved());
CREATE POLICY "Owners update own profile" ON public.owners FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Contractors profile viewable publicly" ON public.contractors FOR SELECT USING (true);
CREATE POLICY "Contractors update own profile" ON public.contractors FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Categories viewable by everyone" ON public.project_categories FOR SELECT USING (true);
CREATE POLICY "Categories manageable by admin" ON public.project_categories FOR ALL USING (public.is_admin());

CREATE POLICY "Owners can manage own projects" ON public.projects FOR ALL USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Approved contractors can view published tender/active projects" ON public.projects FOR SELECT USING (status IN ('tender', 'awarded', 'active', 'completed') OR owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "View project media" ON public.project_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR p.status IN ('tender', 'awarded', 'active', 'completed') OR public.is_admin())));
CREATE POLICY "Manage project media" ON public.project_images FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR public.is_admin());
CREATE POLICY "View project documents" ON public.project_documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Manage project documents" ON public.project_documents FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Public & Contractors view active unexpired tenders" ON public.tenders FOR SELECT USING ((status = 'active' AND bid_deadline > NOW()) OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Owners manage own tenders" ON public.tenders FOR ALL USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "View tender images & documents" ON public.tender_images FOR SELECT USING (true);
CREATE POLICY "Manage tender images" ON public.tender_images FOR ALL USING (EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND t.owner_id = auth.uid()) OR public.is_admin());
CREATE POLICY "View tender documents" ON public.tender_documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND (t.status = 'active' OR t.owner_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Manage tender documents" ON public.tender_documents FOR ALL USING (EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND t.owner_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Contractors manage own bids" ON public.bids FOR ALL USING (contractor_id = auth.uid() AND public.is_approved() OR public.is_admin());
CREATE POLICY "Owners view bids on own tenders" ON public.bids FOR SELECT USING (EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND t.owner_id = auth.uid()) OR contractor_id = auth.uid() OR public.is_admin());
CREATE POLICY "Bids cost breakdown access" ON public.bid_cost_breakdowns FOR ALL USING (EXISTS (SELECT 1 FROM public.bids b JOIN public.tenders t ON t.id = b.tender_id WHERE b.id = bid_id AND (b.contractor_id = auth.uid() OR t.owner_id = auth.uid() OR public.is_admin())));

CREATE POLICY "Portfolio public view" ON public.contractor_portfolio FOR SELECT USING (true);
CREATE POLICY "Contractor portfolio management" ON public.contractor_portfolio FOR ALL USING (contractor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Milestones viewable by project participants" ON public.project_milestones FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())) OR EXISTS (SELECT 1 FROM public.tenders t JOIN public.bids b ON b.tender_id = t.id WHERE t.project_id = project_id AND b.contractor_id = auth.uid() AND b.status = 'accepted'));
CREATE POLICY "Manage project milestones" ON public.project_milestones FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Updates viewable by project participants" ON public.project_updates FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())) OR contractor_id = auth.uid());
CREATE POLICY "Contractors insert project updates" ON public.project_updates FOR INSERT WITH CHECK (contractor_id = auth.uid() AND public.is_approved());
CREATE POLICY "View update images" ON public.project_update_images FOR SELECT USING (true);
CREATE POLICY "Insert update images" ON public.project_update_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.project_updates u WHERE u.id = project_update_id AND u.contractor_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Payments viewable by involved owner/contractor/admin" ON public.payments FOR SELECT USING (owner_id = auth.uid() OR contractor_id = auth.uid() OR public.is_admin());
CREATE POLICY "Owners insert payments" ON public.payments FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Update payments status" ON public.payments FOR UPDATE USING (owner_id = auth.uid() OR contractor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Reviews viewable publicly" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Owners create reviews for completed projects" ON public.reviews FOR INSERT WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid() AND p.status = 'completed'));

CREATE POLICY "Conversations viewable by participants" ON public.conversations FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = id AND cp.user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Participants view conversation participant entries" ON public.conversation_participants FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Messages viewable by participants" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Messages insertable by conversation participants" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()));

CREATE POLICY "Notifications viewable by recipient" ON public.notifications FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Notifications updated by recipient" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admin actions viewable by admin" ON public.admin_actions FOR ALL USING (public.is_admin());
CREATE POLICY "Activity logs viewable by admin" ON public.activity_logs FOR ALL USING (public.is_admin());

-- 021. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('avatars', 'avatars', true),
    ('project-images', 'project-images', true),
    ('project-documents', 'project-documents', false),
    ('tender-images', 'tender-images', true),
    ('tender-documents', 'tender-documents', false),
    ('contractor-portfolio', 'contractor-portfolio', true),
    ('contractor-documents', 'contractor-documents', false),
    ('project-updates', 'project-updates', true),
    ('payment-receipts', 'payment-receipts', false),
    ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Public read for public buckets" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'project-images', 'tender-images', 'contractor-portfolio', 'project-updates'));
CREATE POLICY "Users upload own avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users upload project/tender assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('project-images', 'project-documents', 'tender-images', 'tender-documents', 'contractor-portfolio', 'contractor-documents', 'project-updates', 'payment-receipts', 'chat-files') AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated read for private document buckets" ON storage.objects FOR SELECT USING (bucket_id IN ('project-documents', 'tender-documents', 'contractor-documents', 'payment-receipts', 'chat-files') AND auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own uploads or admin deletes" ON storage.objects FOR DELETE USING (auth.uid() IS NOT NULL);

-- 022. SEED DATA
INSERT INTO public.project_categories (name, description, is_active)
VALUES
    ('Residential', 'Independent houses, residential complexes, and individual home builds.', true),
    ('Commercial', 'Office buildings, retail spaces, malls, and commercial complexes.', true),
    ('Industrial', 'Warehouses, manufacturing plants, factories, and industrial sheds.', true),
    ('Villa', 'Luxury villas, farmhouses, and gated community villas.', true),
    ('Apartment', 'Multi-story apartment units, flats, and residential towers.', true),
    ('Renovation', 'Remodeling, structural upgrades, and building restoration.', true),
    ('Interior', 'Interior fit-outs, space design, cabinetry, and finishing work.', true),
    ('Other', 'Custom specialized construction and civil engineering projects.', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- Default Super Admin Credentials (admin@nirman.com / admin123)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@nirman.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nirman Administrator","role":"admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Nirman Administrator',
  'admin@nirman.com',
  'admin',
  'approved'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'approved';

-- ============================================================================
-- 023. SUPPORT REQUESTS & STORAGE
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS public.support_request_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    request_number TEXT UNIQUE NOT NULL DEFAULT ('NIR-' || nextval('public.support_request_seq')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NULL,
    user_type TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    admin_response TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON public.support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_type ON public.support_requests(user_type);
CREATE INDEX IF NOT EXISTS idx_support_requests_issue_type ON public.support_requests(issue_type);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to support_requests" ON public.support_requests;
CREATE POLICY "Allow public insert to support_requests" ON public.support_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin select all support_requests" ON public.support_requests;
CREATE POLICY "Allow admin select all support_requests" ON public.support_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Allow admin update support_requests" ON public.support_requests;
CREATE POLICY "Allow admin update support_requests" ON public.support_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Allow users to view own support_requests" ON public.support_requests;
CREATE POLICY "Allow users to view own support_requests" ON public.support_requests FOR SELECT USING (
  user_id IS NOT NULL AND user_id = auth.uid()
);

INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', true) ON CONFLICT (id) DO NOTHING;


