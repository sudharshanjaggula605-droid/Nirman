-- Migration 022: Seed Data
-- Seeds initial default project categories.

INSERT INTO public.project_categories (name, description, is_active)
VALUES
    ('Residential', 'Independent houses, residential complexes, and individual home builds.', true),
    ('Commercial', 'Office buildings, retail spaces, malls, and commercial complexes.', true),
    ('Industrial', 'Warehouses, manufacturing plants, factories, and industrial sheds.', true),
    ('Villa', 'Luxury villas, farmhouses, and gated community villas.', true),
    ('Apartment', 'Multi-story apartment units, flats, and residential towers.', true),
    ('Renovation', 'Remodeling, structural upgrades, and building restoration.', true),
    ('Interior', 'Interior fit-outs, space design, cabinetry, and finishing work.', true),
    ('Other', 'Custom specialized construction and civil engineering projects.', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;
