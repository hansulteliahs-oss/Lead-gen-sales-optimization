-- =============================================================
-- Phase 6: Website Infrastructure Schema
-- =============================================================

-- =============================================================
-- Section 1 — Extend lccs table with website content columns
-- All nullable — LCCs without website content must not break
-- =============================================================

ALTER TABLE public.lccs ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.lccs ADD COLUMN IF NOT EXISTS subheadline TEXT;
ALTER TABLE public.lccs ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.lccs ADD COLUMN IF NOT EXISTS bio_teaser TEXT;
ALTER TABLE public.lccs ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.lccs ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- =============================================================
-- Section 2 — Create lcc_testimonials table
-- =============================================================

CREATE TABLE IF NOT EXISTS public.lcc_testimonials (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id       UUID        NOT NULL REFERENCES public.lccs(id) ON DELETE CASCADE,
  family_name  TEXT        NOT NULL,
  quote        TEXT        NOT NULL,
  order_index  INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lcc_testimonials ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS lcc_testimonials_lcc_id_idx ON public.lcc_testimonials (lcc_id);

-- =============================================================
-- Section 3 — Create lcc_faqs table
-- =============================================================

CREATE TABLE IF NOT EXISTS public.lcc_faqs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lcc_id      UUID        NOT NULL REFERENCES public.lccs(id) ON DELETE CASCADE,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  order_index INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lcc_faqs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS lcc_faqs_lcc_id_idx ON public.lcc_faqs (lcc_id);

-- =============================================================
-- Section 4 — RLS policies (public read for anon and authenticated)
-- Wrapped in DO blocks for idempotency
-- =============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lcc_testimonials' AND policyname = 'lcc_testimonials_select_public'
  ) THEN
    CREATE POLICY "lcc_testimonials_select_public"
    ON public.lcc_testimonials FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lcc_faqs' AND policyname = 'lcc_faqs_select_public'
  ) THEN
    CREATE POLICY "lcc_faqs_select_public"
    ON public.lcc_faqs FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

-- =============================================================
-- Section 5 — Storage bucket for LCC profile photos
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('lcc-photos', 'lcc-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'lcc_photos_public_read'
  ) THEN
    CREATE POLICY "lcc_photos_public_read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'lcc-photos');
  END IF;
END $$;
