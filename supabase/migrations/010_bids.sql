-- Migration 010: Bids and Bid Cost Breakdowns
-- Handles bids submitted by contractors on tenders and their cost breakdowns.

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
