-- Phase 5: AI Personalization
-- Add generated_intro_message column to leads for per-lead Claude message caching (AI-01, AI-02)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS generated_intro_message TEXT;
