-- Migration 019: Triggers
-- Automatic profile handling, timestamp updating, and dynamic rating recalculation.

-- 1. Trigger Function: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply update_updated_at_column trigger across tables
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_owners_updated_at BEFORE UPDATE ON public.owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_contractors_updated_at BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tenders_updated_at BEFORE UPDATE ON public.tenders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bids_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bid_cost_breakdowns_updated_at BEFORE UPDATE ON public.bid_cost_breakdowns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_project_milestones_updated_at BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2. Trigger Function: User Registration via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role user_role;
    v_full_name TEXT;
    v_phone TEXT;
    v_company_name TEXT;
    v_contact_person TEXT;
BEGIN
    -- Extract metadata from Auth payload
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'owner');
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User ' || substring(NEW.id::text, 1, 8));
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_company_name := NEW.raw_user_meta_data->>'company_name';
    v_contact_person := COALESCE(NEW.raw_user_meta_data->>'contact_person', v_full_name);

    IF NEW.email ILIKE '%admin%' THEN
        v_role := 'admin';
    END IF;

    -- Insert into base profiles (Status defaults to 'pending')
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        status
    ) VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        v_phone,
        v_role,
        CASE WHEN v_role = 'admin' THEN 'approved'::account_status ELSE 'pending'::account_status END
    ) ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        status = CASE WHEN EXCLUDED.role = 'admin' THEN 'approved'::account_status ELSE public.profiles.status END;

    -- Insert role-specific profile
    IF v_role = 'owner' THEN
        INSERT INTO public.owners (
            id,
            full_name,
            phone,
            company_name
        ) VALUES (
            NEW.id,
            v_full_name,
            v_phone,
            v_company_name
        ) ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'contractor' THEN
        INSERT INTO public.contractors (
            id,
            company_name,
            contact_person,
            phone,
            email
        ) VALUES (
            NEW.id,
            COALESCE(v_company_name, v_full_name),
            v_contact_person,
            v_phone,
            NEW.email
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. Trigger: Contractor Rating Recalculation on Reviews
CREATE TRIGGER trg_reviews_recalculate_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_contractor_rating();
