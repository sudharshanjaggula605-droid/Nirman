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

-- Default Super Admin Credentials (admin@nirman.com / admin123)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@nirman.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nirman Administrator","role":"admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Nirman Administrator',
  'admin@nirman.com',
  'admin',
  'approved'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'approved';

