-- =============================================================
-- Phase 1: Foundation Schema
-- =============================================================

-- LCC tenant registry
CREATE TABLE IF NOT EXISTS public.lccs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles: links auth.users to role and optional LCC assignment
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('operator', 'lcc')),
  lcc_id UUID REFERENCES public.lccs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads table -- minimal for Phase 1; extended in Phase 2
-- Includes enough columns to verify RLS cross-tenant isolation
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id UUID NOT NULL REFERENCES public.lccs(id) ON DELETE CASCADE,
  family_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Enable RLS on all tables
-- =============================================================

ALTER TABLE public.lccs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- RLS Policies
-- =============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_select_lcc'
  ) THEN
    CREATE POLICY "leads_select_lcc"
    ON public.leads FOR SELECT
    TO authenticated
    USING (
      lcc_id = (
        (SELECT auth.jwt()) -> 'app_metadata' ->> 'lcc_id'
      )::uuid
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_insert_lcc'
  ) THEN
    CREATE POLICY "leads_insert_lcc"
    ON public.leads FOR INSERT
    TO authenticated
    WITH CHECK (
      lcc_id = (
        (SELECT auth.jwt()) -> 'app_metadata' ->> 'lcc_id'
      )::uuid
    );
  END IF;
END $$;

-- =============================================================
-- Performance Indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS leads_lcc_id_idx ON public.leads (lcc_id);
CREATE INDEX IF NOT EXISTS profiles_lcc_id_idx ON public.profiles (lcc_id);

-- =============================================================
-- Custom Access Token Hook
-- Injects role and lcc_id into JWT app_metadata at token issuance.
-- After running this migration, REGISTER the hook manually:
--   Supabase Dashboard > Auth > Hooks > Custom Access Token Hook
--   Select function: public.custom_access_token_hook
-- =============================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
  user_lcc_id UUID;
BEGIN
  SELECT role, lcc_id
  INTO user_role, user_lcc_id
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Ensure app_metadata key exists
  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  -- Inject role (default 'unknown' if profile missing)
  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(COALESCE(user_role, 'unknown'))
  );

  -- Inject lcc_id only for LCC users (null for operator)
  IF user_lcc_id IS NOT NULL THEN
    claims := jsonb_set(
      claims,
      '{app_metadata,lcc_id}',
      to_jsonb(user_lcc_id::text)
    );
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant hook access to read profiles
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
