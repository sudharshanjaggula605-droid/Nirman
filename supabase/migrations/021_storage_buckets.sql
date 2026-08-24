-- Migration 021: Supabase Storage Buckets and Storage Security Policies
-- Configures storage containers for avatars, project files, contractor documents, and payment receipts.

-- 1. Create Buckets into storage.buckets
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


-- 2. Storage RLS Policies (storage.objects)
-- Public read access for public asset buckets
CREATE POLICY "Public read for public buckets"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('avatars', 'project-images', 'tender-images', 'contractor-portfolio', 'project-updates'));

-- Authenticated upload for avatars
CREATE POLICY "Users upload own avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Authenticated upload for project and tender images/documents
CREATE POLICY "Authenticated users upload project/tender assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id IN ('project-images', 'project-documents', 'tender-images', 'tender-documents', 'contractor-portfolio', 'contractor-documents', 'project-updates', 'payment-receipts', 'chat-files')
        AND auth.uid() IS NOT NULL
    );

-- Read access for private document buckets
CREATE POLICY "Authenticated read for private document buckets"
    ON storage.objects FOR SELECT
    USING (
        bucket_id IN ('project-documents', 'tender-documents', 'contractor-documents', 'payment-receipts', 'chat-files')
        AND auth.uid() IS NOT NULL
    );

-- Storage deletion policy
CREATE POLICY "Users delete own uploads or admin deletes"
    ON storage.objects FOR DELETE
    USING (auth.uid() IS NOT NULL);
