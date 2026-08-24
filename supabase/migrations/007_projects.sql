-- Migration 007: Projects Table
-- Stores construction projects created by Property Owners.

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
