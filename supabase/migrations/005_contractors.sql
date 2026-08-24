-- Migration 005: Contractors Profile Table
-- Stores specific contractor details with verification numbers and performance aggregates.

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
