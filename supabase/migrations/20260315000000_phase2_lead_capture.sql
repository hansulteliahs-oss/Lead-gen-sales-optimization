-- =============================================================
-- Phase 2: Lead Capture Schema Extension
-- Apply in Supabase Dashboard SQL Editor AFTER Phase 1 migration
-- =============================================================

-- ---------------------------------------------------------------
-- Extend public.lccs with per-LCC Make.com webhook URLs and
-- configurable learn-more link (AUTO-06)
-- Note: slug column already exists from Phase 1 migration
-- ---------------------------------------------------------------
ALTER TABLE public.lccs
  ADD COLUMN IF NOT EXISTS webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS learn_more_url TEXT;

-- ---------------------------------------------------------------
-- Extend public.leads with all Phase 2 required columns
-- ---------------------------------------------------------------
ALTER TABLE public.leads
  -- Family contact info (LEAD-02, PIPE-03)
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  -- Pipeline stage (PIPE-01)
  ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'Interested'
    CHECK (stage IN ('Interested', 'Contacted', 'Qualified', 'Signed')),
  -- TCPA consent fields (LEAD-03)
  ADD COLUMN IF NOT EXISTS consent_text TEXT,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip TEXT,
  -- UTM tracking (LEAD-06)
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  -- Automation tracking (AUTO-04, PIPE-02)
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  -- Sign-up tracking (PIPE-05)
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- ---------------------------------------------------------------
-- Deduplication constraint (LEAD-04 — silent upsert)
-- One lead per email per LCC; duplicates use ON CONFLICT DO UPDATE
-- ---------------------------------------------------------------
ALTER TABLE public.leads
  ADD CONSTRAINT IF NOT EXISTS leads_email_lcc_unique UNIQUE (email, lcc_id);

-- ---------------------------------------------------------------
-- RLS policy: operator SELECT access for future dashboard reads
-- (service role bypasses RLS in API routes; this policy enables
-- operator JWT reads via their authenticated session)
-- ---------------------------------------------------------------
CREATE POLICY IF NOT EXISTS "leads_select_operator"
ON public.leads FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'operator'
);

-- ---------------------------------------------------------------
-- Performance indexes
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS leads_stage_idx ON public.leads (stage);
CREATE INDEX IF NOT EXISTS leads_lcc_stage_idx ON public.leads (lcc_id, stage);
