-- =============================================================
-- Seed: Test Users + Tenant Data
-- Run via Supabase Dashboard SQL Editor AFTER migration
-- =============================================================

-- LCC tenant records
-- lcc_id values are fixed UUIDs referenced by user app_metadata below
INSERT INTO public.lccs (id, name, slug, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Test LCC 1', 'lcc1', NOW()),
  ('10000000-0000-0000-0000-000000000002', 'Test LCC 2', 'lcc2', NOW())
ON CONFLICT (id) DO NOTHING;

-- Operator user
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'operator@lcc-lead-engine.com',
  crypt('password', gen_salt('bf')),
  NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"operator@lcc-lead-engine.com"}',
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, lcc_id, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'operator', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- LCC 1 user
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'lcc1@test.com',
  crypt('password', gen_salt('bf')),
  NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '{"sub":"00000000-0000-0000-0000-000000000002","email":"lcc1@test.com"}',
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, lcc_id, created_at) VALUES
  ('00000000-0000-0000-0000-000000000002', 'lcc', '10000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT (id) DO NOTHING;

-- LCC 2 user
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'lcc2@test.com',
  crypt('password', gen_salt('bf')),
  NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  '{"sub":"00000000-0000-0000-0000-000000000003","email":"lcc2@test.com"}',
  'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, lcc_id, created_at) VALUES
  ('00000000-0000-0000-0000-000000000003', 'lcc', '10000000-0000-0000-0000-000000000002', NOW())
ON CONFLICT (id) DO NOTHING;

-- Fake leads: 3 per LCC -- used to verify RLS cross-tenant isolation (AUTH-05)
INSERT INTO public.leads (lcc_id, family_name, email) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Smith Family', 'smith@example.com'),
  ('10000000-0000-0000-0000-000000000001', 'Johnson Family', 'johnson@example.com'),
  ('10000000-0000-0000-0000-000000000001', 'Williams Family', 'williams@example.com'),
  ('10000000-0000-0000-0000-000000000002', 'Brown Family', 'brown@example.com'),
  ('10000000-0000-0000-0000-000000000002', 'Davis Family', 'davis@example.com'),
  ('10000000-0000-0000-0000-000000000002', 'Miller Family', 'miller@example.com');
