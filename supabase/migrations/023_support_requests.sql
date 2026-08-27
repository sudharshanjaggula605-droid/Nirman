-- Migration 023: Support Requests Table, Sequence, Storage & RLS Policies
-- Support and Inquiry workflow connecting Landing Page Contact Us to Admin Dashboard.

-- 1. Create Sequence for Request Numbers starting at 1001
CREATE SEQUENCE IF NOT EXISTS public.support_request_seq START WITH 1001;

-- 2. Create support_requests table
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

-- Indexes for fast admin queries & filtering
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON public.support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_type ON public.support_requests(user_type);
CREATE INDEX IF NOT EXISTS idx_support_requests_issue_type ON public.support_requests(issue_type);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON public.support_requests(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (Public & Authenticated) can submit a support request
DROP POLICY IF EXISTS "Allow public insert to support_requests" ON public.support_requests;
CREATE POLICY "Allow public insert to support_requests" 
ON public.support_requests 
FOR INSERT 
WITH CHECK (true);

-- Policy 2: Admin can select all support requests
DROP POLICY IF EXISTS "Allow admin select all support_requests" ON public.support_requests;
CREATE POLICY "Allow admin select all support_requests" 
ON public.support_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Admin can update all support requests (status, response)
DROP POLICY IF EXISTS "Allow admin update support_requests" ON public.support_requests;
CREATE POLICY "Allow admin update support_requests" 
ON public.support_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Logged-in Users (Owner/Contractor) can view their own support requests
DROP POLICY IF EXISTS "Allow users to view own support_requests" ON public.support_requests;
CREATE POLICY "Allow users to view own support_requests" 
ON public.support_requests 
FOR SELECT 
USING (
  user_id IS NOT NULL AND user_id = auth.uid()
);

-- 4. Storage Bucket Setup for Attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Allow public insert to support-attachments" ON storage.objects;
CREATE POLICY "Allow public insert to support-attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'support-attachments');

DROP POLICY IF EXISTS "Allow public select from support-attachments" ON storage.objects;
CREATE POLICY "Allow public select from support-attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'support-attachments');
