-- Remove AI-generated intro message column (AI personalization feature removed)
ALTER TABLE public.leads
  DROP COLUMN IF EXISTS generated_intro_message;
