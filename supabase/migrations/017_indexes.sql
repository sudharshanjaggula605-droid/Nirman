-- Migration 017: Database Performance Indexes
-- Speed up frequent joins, filtering, and query operations.

-- Projects Indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_city ON public.projects(city);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects(category_id);

-- Tenders Indexes
CREATE INDEX IF NOT EXISTS idx_tenders_status ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_owner_id ON public.tenders(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenders_project_id ON public.tenders(project_id);
CREATE INDEX IF NOT EXISTS idx_tenders_bid_deadline ON public.tenders(bid_deadline);

-- Bids Indexes
CREATE INDEX IF NOT EXISTS idx_bids_tender_id ON public.bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_bids_contractor_id ON public.bids(contractor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);

-- Project Management Indexes
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_milestone_id ON public.project_updates(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner_id ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_contractor_id ON public.payments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_contractor_id ON public.reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON public.reviews(project_id);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Messaging Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Admin Action & Audit Indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
