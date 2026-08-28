-- Migration 025: Ensure Messages Columns & Relax Constraints for Direct Messaging
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url TEXT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
ALTER TABLE public.messages ALTER COLUMN conversation_id DROP NOT NULL;
