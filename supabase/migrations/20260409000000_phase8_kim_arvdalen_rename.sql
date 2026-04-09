-- Phase 8: Rename Kim Johnson to Kim Arvdalen
-- lcc_testimonials and lcc_faqs use lcc_id (UUID FK) not slug, so unaffected
UPDATE public.lccs
SET
  name = 'Kim Arvdalen',
  slug = 'kim-arvdalen'
WHERE slug = 'kim-johnson';
