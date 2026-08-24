-- Migration 004: Owners Profile Table
-- Stores specific property owner details. One-to-one relationship with public.profiles.

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
