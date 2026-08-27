-- Migration 020: Row Level Security (RLS) Policies
-- Enforces data protection and role-based access across all application tables.

-- Helper Functions for Security Policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'approved'
  );
$$;

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_cost_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_update_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;


-- 1. Profiles Policies
CREATE POLICY "Profiles are viewable by user themselves or Admin"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles can be updated by owner or Admin"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin can insert/delete profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());


-- 2. Owners & Contractors Profiles Policies
CREATE POLICY "Owners profile viewable by self, relevant contractor, or admin"
    ON public.owners FOR SELECT
    USING (auth.uid() = id OR public.is_admin() OR public.is_approved());

CREATE POLICY "Owners update own profile"
    ON public.owners FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Owners insert own profile"
    ON public.owners FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Contractors profile viewable publicly"
    ON public.contractors FOR SELECT
    USING (true);

CREATE POLICY "Contractors update own profile"
    ON public.contractors FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Contractors insert own profile"
    ON public.contractors FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());


-- 3. Project Categories
CREATE POLICY "Categories viewable by everyone"
    ON public.project_categories FOR SELECT
    USING (true);

CREATE POLICY "Categories manageable by admin"
    ON public.project_categories FOR ALL
    USING (public.is_admin());


-- 4. Projects Policies
CREATE POLICY "Owners can manage own projects"
    ON public.projects FOR ALL
    USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Approved contractors can view published tender/active projects"
    ON public.projects FOR SELECT
    USING (
        status IN ('tender', 'awarded', 'active', 'completed')
        OR owner_id = auth.uid()
        OR public.is_admin()
    );


-- 5. Project Images & Documents
CREATE POLICY "View project media"
    ON public.project_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (p.owner_id = auth.uid() OR p.status IN ('tender', 'awarded', 'active', 'completed') OR public.is_admin())
        )
    );

CREATE POLICY "Manage project media"
    ON public.project_images FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR public.is_admin()
    );

CREATE POLICY "View project documents"
    ON public.project_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Manage project documents"
    ON public.project_documents FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR public.is_admin()
    );


-- 6. Tenders Policies
CREATE POLICY "Public & Contractors view active unexpired tenders"
    ON public.tenders FOR SELECT
    USING (
        (status = 'active' AND bid_deadline > NOW())
        OR owner_id = auth.uid()
        OR public.is_admin()
    );

CREATE POLICY "Owners manage own tenders"
    ON public.tenders FOR ALL
    USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "View tender images & documents"
    ON public.tender_images FOR SELECT
    USING (true);

CREATE POLICY "Manage tender images"
    ON public.tender_images FOR ALL
    USING (EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND t.owner_id = auth.uid()) OR public.is_admin());

CREATE POLICY "View tender documents"
    ON public.tender_documents FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND (t.status = 'active' OR t.owner_id = auth.uid() OR public.is_admin())));

CREATE POLICY "Manage tender documents"
    ON public.tender_documents FOR ALL
    USING (EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND t.owner_id = auth.uid()) OR public.is_admin());


-- 7. Bids Policies
CREATE POLICY "Contractors manage own bids"
    ON public.bids FOR ALL
    USING (contractor_id = auth.uid() AND public.is_approved() OR public.is_admin());

CREATE POLICY "Owners view bids on own tenders"
    ON public.bids FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.tenders t WHERE t.id = tender_id AND t.owner_id = auth.uid())
        OR contractor_id = auth.uid()
        OR public.is_admin()
    );

CREATE POLICY "Bids cost breakdown access"
    ON public.bid_cost_breakdowns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.bids b
            JOIN public.tenders t ON t.id = b.tender_id
            WHERE b.id = bid_id AND (b.contractor_id = auth.uid() OR t.owner_id = auth.uid() OR public.is_admin())
        )
    );


-- 8. Contractor Portfolio
CREATE POLICY "Portfolio public view"
    ON public.contractor_portfolio FOR SELECT
    USING (true);

CREATE POLICY "Contractor portfolio management"
    ON public.contractor_portfolio FOR ALL
    USING (contractor_id = auth.uid() OR public.is_admin());


-- 9. Project Management (Milestones, Updates, Images)
CREATE POLICY "Milestones viewable by project participants"
    ON public.project_milestones FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())
        ) OR EXISTS (
            SELECT 1 FROM public.tenders t
            JOIN public.bids b ON b.tender_id = t.id
            WHERE t.project_id = project_id AND b.contractor_id = auth.uid() AND b.status = 'accepted'
        )
    );

CREATE POLICY "Manage project milestones"
    ON public.project_milestones FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR public.is_admin()
    );

CREATE POLICY "Updates viewable by project participants"
    ON public.project_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (p.owner_id = auth.uid() OR public.is_admin())
        ) OR contractor_id = auth.uid()
    );

CREATE POLICY "Contractors insert project updates"
    ON public.project_updates FOR INSERT
    WITH CHECK (contractor_id = auth.uid() AND public.is_approved());

CREATE POLICY "View update images"
    ON public.project_update_images FOR SELECT
    USING (true);

CREATE POLICY "Insert update images"
    ON public.project_update_images FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.project_updates u WHERE u.id = project_update_id AND u.contractor_id = auth.uid()) OR public.is_admin()
    );


-- 10. Payments
CREATE POLICY "Payments viewable by involved owner/contractor/admin"
    ON public.payments FOR SELECT
    USING (owner_id = auth.uid() OR contractor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owners insert payments"
    ON public.payments FOR INSERT
    WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Update payments status"
    ON public.payments FOR UPDATE
    USING (owner_id = auth.uid() OR contractor_id = auth.uid() OR public.is_admin());


-- 11. Reviews
CREATE POLICY "Reviews viewable publicly"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Owners create reviews for completed projects"
    ON public.reviews FOR INSERT
    WITH CHECK (
        owner_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND p.owner_id = auth.uid() AND p.status = 'completed'
        )
    );


-- 12. Messaging
CREATE POLICY "Conversations viewable by participants"
    ON public.conversations FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = id AND cp.user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Participants view conversation participant entries"
    ON public.conversation_participants FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Messages viewable by participants"
    ON public.messages FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Messages insertable by conversation participants"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid())
    );


-- 13. Notifications
CREATE POLICY "Notifications viewable by recipient"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Notifications updated by recipient"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());


-- 14. Admin Actions & Activity Logs
CREATE POLICY "Admin actions viewable by admin"
    ON public.admin_actions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Activity logs viewable by admin"
    ON public.activity_logs FOR ALL
    USING (public.is_admin());
