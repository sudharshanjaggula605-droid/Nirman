-- Migration 009: Tenders, Tender Documents, and Tender Images
-- Represents published tenders for contractor discovery.

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

-- View to dynamically filter active, unexpired tenders for public discovery on Home Page
CREATE OR REPLACE VIEW public.active_public_tenders AS
SELECT *
FROM public.tenders
WHERE status = 'active'
  AND bid_deadline > NOW();
