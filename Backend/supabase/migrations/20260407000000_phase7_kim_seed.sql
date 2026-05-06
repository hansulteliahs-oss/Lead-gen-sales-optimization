-- =============================================================
-- Phase 7: Kim Arvdalen Seed Migration
-- Seeds website copy, testimonials, and FAQs for the kim-arvdalen LCC row.
-- All AI-drafted placeholder copy — operator swaps with real content before live demo.
-- Idempotent: DELETE before INSERT for testimonials and FAQs.
-- =============================================================

-- =============================================================
-- Section 1 — CONT-01: Update kim-johnson's website copy
-- =============================================================

UPDATE public.lccs
SET
  headline    = 'Your Local Guide to Finding the Perfect Au Pair',
  subheadline = 'I help families across the area discover the au pair program — a childcare solution that combines flexibility, cultural connection, and real affordability.',
  bio_teaser  = 'As a certified Local Childcare Consultant with Cultural Care Au Pair, I''ve spent years guiding families through the process of welcoming an au pair into their home. From your first question to your au pair''s arrival, I''m here every step of the way — making a complex process feel personal and simple.',
  bio         = 'I grew up in a family that believed deeply in the power of community, and that belief has shaped everything I do as a Local Childcare Consultant. After years of working in early childhood education and family services, I joined Cultural Care Au Pair because I saw firsthand how transformative the right childcare arrangement could be — not just for the children, but for the entire family.

Over the past several years I''ve helped dozens of families in our community navigate the au pair program from start to finish. I love the moments when a family realizes how much more affordable and flexible an au pair can be compared to traditional daycare, and I especially love hearing about the friendships and cultural exchanges that blossom long after the initial placement.

When I''m not working with families, you''ll find me volunteering at our local school, hiking with my own kids, and hosting neighbourhood get-togethers that more often than not turn into lively conversations about raising confident, curious children. I''d love to sit down with your family and explore whether the au pair program might be the right fit.',
  photo_url   = NULL
WHERE slug = 'kim-johnson';

-- =============================================================
-- Section 2 — CONT-02: Seed testimonials for kim-johnson
-- DELETE first for idempotency, then INSERT 3 testimonials.
-- =============================================================

DELETE FROM public.lcc_testimonials
WHERE lcc_id = (SELECT id FROM public.lccs WHERE slug = 'kim-johnson');

INSERT INTO public.lcc_testimonials (lcc_id, family_name, quote, order_index)
VALUES
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'The Martinez Family',
    'Kim was an absolute lifesaver for us. She walked us through every step of the process with patience and warmth, and thanks to her guidance we found an au pair who has become like a member of our family.',
    0
  ),
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'Sarah T.',
    'I was overwhelmed before I called Kim. Within an hour she had answered every question I had and made the whole thing feel totally doable. Highly recommend!',
    1
  ),
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'The Nguyen Family',
    'Having an au pair has opened our children''s eyes to a whole new culture and language. Kim matched us with someone who fits our family perfectly, and the cultural exchange has been a gift we didn''t expect.',
    2
  );

-- =============================================================
-- Section 3 — CONT-03: Seed FAQs for kim-johnson
-- DELETE first for idempotency, then INSERT 6 FAQs.
-- =============================================================

DELETE FROM public.lcc_faqs
WHERE lcc_id = (SELECT id FROM public.lccs WHERE slug = 'kim-johnson');

INSERT INTO public.lcc_faqs (lcc_id, question, answer, order_index)
VALUES
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'How much does the au pair program cost?',
    'The total annual cost of hosting an au pair with Cultural Care is typically between $20,000 and $25,000 — which includes the agency fee, the au pair''s weekly stipend, and room and board. When you compare this to full-time daycare or a nanny, it is often significantly more affordable, especially for families with two or more children. I''m happy to walk you through a detailed cost comparison based on your specific situation.',
    0
  ),
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'How long does the matching process take?',
    'Most families complete their matching process in four to eight weeks, though timelines vary depending on how many profiles you review and how quickly you connect with au pair candidates. Cultural Care provides a dedicated matching platform where you can browse profiles, watch videos, and schedule video calls. As your Local Childcare Consultant, I''m here to help you narrow down candidates and feel confident in your choice.',
    1
  ),
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'What does a typical living arrangement look like?',
    'Au pairs live with your family as part of your household. They have their own private bedroom and access to shared living spaces. They receive a weekly stipend (set by the U.S. Department of State), meals, and use of a vehicle for childcare duties. In return, they provide up to 45 hours of childcare per week. Many families find this arrangement creates a warm, collaborative dynamic that benefits everyone — including the children.',
    2
  ),
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'What happens if the au pair isn''t the right fit?',
    'Cultural Care has a formal rematch process for situations where the placement isn''t working out. You are never locked into an arrangement that isn''t right for your family. The agency supports both the host family and the au pair through the transition, and I will personally help you navigate the process and begin a new search as quickly as possible. Rematches are more common than people expect, and most families find a great fit on their second match.',
    3
  ),
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'Does the au pair need a visa, and who handles it?',
    'Yes — au pairs enter the United States on a J-1 Exchange Visitor visa, which is sponsored by Cultural Care Au Pair as a U.S. Department of State designated program. Cultural Care handles all visa paperwork, SEVIS registration, and compliance requirements on behalf of both the au pair and the host family. As a host family, you do not need to navigate the visa process yourself — it is fully managed by the agency.',
    4
  ),
  (
    (SELECT id FROM public.lccs WHERE slug = 'kim-johnson'),
    'What''s the difference between an au pair and a nanny?',
    'The main differences are cost, structure, and cultural exchange. A nanny is typically a local hired employee with market-rate wages ($40,000–$60,000 or more per year) and no cultural immersion component. An au pair is a young adult from abroad who lives with your family, earns a government-set stipend (currently $244.85/week), and participates in a structured cultural exchange program. Au pairs are ideal for families seeking affordable full-time childcare, flexibility across the week, and the enriching experience of welcoming someone from another culture into their home.',
    5
  );
