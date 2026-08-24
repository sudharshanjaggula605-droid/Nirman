-- Migration 002: Enums
-- Defines custom ENUM types for NIRMAN business workflows.

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
