-- Migration 012: Payments Table
-- Tracks financial transactions between Property Owner and Contractor.

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
