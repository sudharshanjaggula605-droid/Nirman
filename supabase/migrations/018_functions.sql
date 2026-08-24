-- Migration 018: Database Stored Functions
-- Server-side business logic and administrative procedures.

-- 1. Function: Approve User
CREATE OR REPLACE FUNCTION public.approve_user(
    p_target_user_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role user_role;
    v_target_role user_role;
BEGIN
    -- Check caller admin role
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrative users can perform this action.';
    END IF;

    -- Get target user role
    SELECT role INTO v_target_role FROM public.profiles WHERE id = p_target_user_id;
    IF v_target_role IS NULL THEN
        RAISE EXCEPTION 'Target profile not found.';
    END IF;

    -- Update profile status
    UPDATE public.profiles
    SET status = 'approved',
        updated_at = NOW()
    WHERE id = p_target_user_id;

    -- Record admin action
    INSERT INTO public.admin_actions (admin_id, target_user_id, action, reason)
    VALUES (p_admin_id, p_target_user_id, 'APPROVE_USER', p_reason);

    -- Send Notification
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_target_user_id,
        'Account Approved',
        'Your account application has been approved. You now have full access to NIRMAN.',
        'account_approved',
        p_target_user_id
    );
END;
$$;


-- 2. Function: Reject User
CREATE OR REPLACE FUNCTION public.reject_user(
    p_target_user_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role user_role;
BEGIN
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrative users can perform this action.';
    END IF;

    UPDATE public.profiles
    SET status = 'rejected',
        updated_at = NOW()
    WHERE id = p_target_user_id;

    INSERT INTO public.admin_actions (admin_id, target_user_id, action, reason)
    VALUES (p_admin_id, p_target_user_id, 'REJECT_USER', p_reason);

    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_target_user_id,
        'Account Application Update',
        COALESCE(p_reason, 'Your account application was not approved by administration.'),
        'account_rejected',
        p_target_user_id
    );
END;
$$;


-- 3. Function: Block User
CREATE OR REPLACE FUNCTION public.block_user(
    p_target_user_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role user_role;
BEGIN
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrative users can perform this action.';
    END IF;

    UPDATE public.profiles
    SET status = 'blocked',
        updated_at = NOW()
    WHERE id = p_target_user_id;

    INSERT INTO public.admin_actions (admin_id, target_user_id, action, reason)
    VALUES (p_admin_id, p_target_user_id, 'BLOCK_USER', p_reason);
END;
$$;


-- 4. Function: Transactional Bid Acceptance
CREATE OR REPLACE FUNCTION public.accept_bid(
    p_bid_id UUID,
    p_owner_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tender_id UUID;
    v_project_id UUID;
    v_contractor_id UUID;
    v_tender_owner_id UUID;
    v_bid_status bid_status;
    v_other_bid RECORD;
BEGIN
    -- Retrieve bid and associated tender details
    SELECT b.tender_id, b.contractor_id, b.status, t.project_id, t.owner_id
    INTO v_tender_id, v_contractor_id, v_bid_status, v_project_id, v_tender_owner_id
    FROM public.bids b
    JOIN public.tenders t ON t.id = b.tender_id
    WHERE b.id = p_bid_id;

    IF v_tender_id IS NULL THEN
        RAISE EXCEPTION 'Bid not found.';
    END IF;

    -- Verify owner permissions
    IF v_tender_owner_id != p_owner_id THEN
        RAISE EXCEPTION 'Unauthorized: You are not the owner of this tender.';
    END IF;

    IF v_bid_status = 'accepted' THEN
        RAISE EXCEPTION 'This bid has already been accepted.';
    END IF;

    -- Step 1: Accept the selected bid
    UPDATE public.bids
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = p_bid_id;

    -- Step 2: Reject all other bids for this tender
    UPDATE public.bids
    SET status = 'rejected',
        updated_at = NOW()
    WHERE tender_id = v_tender_id
      AND id != p_bid_id;

    -- Step 3: Update Tender status to awarded
    UPDATE public.tenders
    SET status = 'awarded',
        updated_at = NOW()
    WHERE id = v_tender_id;

    -- Step 4: Update Project status to active
    UPDATE public.projects
    SET status = 'active',
        updated_at = NOW()
    WHERE id = v_project_id;

    -- Step 5: Increment total awarded projects for contractor
    UPDATE public.contractors
    SET total_projects = total_projects + 1,
        updated_at = NOW()
    WHERE id = v_contractor_id;

    -- Step 6: Notify accepted contractor
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        v_contractor_id,
        'Bid Accepted!',
        'Congratulations! Your bid has been accepted by the property owner. Project management has commenced.',
        'bid_accepted',
        v_project_id
    );

    -- Step 7: Notify rejected contractors
    FOR v_other_bid IN
        SELECT contractor_id FROM public.bids WHERE tender_id = v_tender_id AND id != p_bid_id
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (
            v_other_bid.contractor_id,
            'Tender Awarded',
            'Another bid was selected for this tender. Thank you for participating.',
            'bid_rejected',
            v_tender_id
        );
    END LOOP;

END;
$$;


-- 5. Helper Function: Recalculate Contractor Rating
CREATE OR REPLACE FUNCTION public.recalculate_contractor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_contractor_id UUID;
    v_avg NUMERIC(3,2);
    v_count INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_contractor_id := OLD.contractor_id;
    ELSE
        v_contractor_id := NEW.contractor_id;
    END IF;

    SELECT COALESCE(ROUND(AVG(rating), 2), 0.00), COUNT(*)
    INTO v_avg, v_count
    FROM public.reviews
    WHERE contractor_id = v_contractor_id;

    UPDATE public.contractors
    SET average_rating = v_avg,
        total_reviews = v_count,
        updated_at = NOW()
    WHERE id = v_contractor_id;

    RETURN NULL;
END;
$$;
