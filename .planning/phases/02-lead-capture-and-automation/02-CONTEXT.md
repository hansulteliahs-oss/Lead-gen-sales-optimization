# Phase 2: Lead Capture and Automation - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Public `/[lccSlug]` landing page where families submit interest, triggering a lead record in the correct LCC's pipeline and a Make.com webhook for automated nurture (SMS + email within 60 seconds, 3+ touchpoint follow-up sequence). Includes the Make.com callback endpoint for updating lead stage/contact timestamps, and the referral webhook trigger when a lead reaches Signed. No LCC dashboard UI — that's Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Landing page content & style
- Route: `/[lccSlug]` — dynamic public page, not protected by middleware
- Page structure: LCC intro section (LCC name + headline) above the form — not just the form alone
- Intro headline: "Interested in au pair childcare? Fill out the form below and [LCC Name] will be in touch."
- Visual style: Clean but slightly warmer than the login page — white background, slightly larger typography, warmer feel. Still Tailwind utility classes only — no new design system components
- Slug format: first initial + last name, auto-derived at LCC creation (e.g., Sarah Johnson → `s-johnson`). Stored in `lccs.slug` column. URL-safe, lowercase, hyphen-separated

### Post-submit family experience
- After successful form submission: redirect to `/[lccSlug]/thank-you`
- Thank-you page message: "Thanks! [LCC Name] will reach out to you shortly."
- Thank-you page includes a "Learn more about au pairs" link — URL is a per-LCC configurable field stored in `lccs` table (operator sets at onboarding). Requires a `learn_more_url` column in `lccs`
- Thank-you page: confirmation message + learn more link only — no other CTAs

### TCPA consent
- Checkbox is required — form cannot be submitted without checking it (hard block, client-side validation)
- Consent text (dynamic per page, inserts LCC name):
  > "By checking this box, I consent to receive automated SMS text messages and emails from [LCC Name] regarding au pair childcare services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of any purchase or service."
- Data stored on lead record: verbatim consent text + submission timestamp + submitter IP address
- Consent text references the specific LCC's name (not a generic brand name)

### Duplicate submission behavior
- Uniqueness key: `(email, lcc_id)` — one lead per email per LCC. A family can appear on multiple LCC pages as separate leads
- On duplicate submission: silent upsert — update the existing lead record (timestamp, message) rather than creating a new one. No error shown to the family
- Make.com webhook only fires on first submission (new lead creation). On upsert of an existing lead, the webhook is NOT re-triggered to avoid double-messaging the family

### Make.com webhook trigger
- Trigger point: inside the form's server action — after INSERT/upsert commits, before redirect to thank-you page
- Webhook failure behavior: lead is always committed first. If the webhook call fails (network error, Make.com down), the failure is logged server-side and the family still sees the success/thank-you redirect. No retry logic — operator can re-trigger manually
- Webhook payload: lead ID only. Make.com fetches full lead details by calling back to `GET /api/leads/[id]`
- The `GET /api/leads/[id]` endpoint is secured by shared secret header (e.g., `Authorization: Bearer <MAKE_SECRET>`). Secret stored in env var `MAKE_WEBHOOK_SECRET`
- Each LCC has their own Make.com webhook URL stored in `lccs` table (per AUTO-06). App fires the URL stored for that LCC on lead creation

### UTM / lead source capture
- UTM params captured server-side at page render (Next.js dynamic route reads searchParams). Stored as hidden form fields, submitted with the form
- Fields stored on lead record: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- If no UTM params present, values are null (no synthetic "direct" label)
- No referrer domain capture at this phase

### Form fields
- Required fields: name, email, phone
- Optional field: message (free text)
- No additional fields — keep the form short for conversion
- Phone validation: US format only, 10 digits. Client-side hint shown ("(555) 867-5309"). Store as raw digits for Make.com/Twilio compatibility

### Make.com callback API (pipeline stage updates)
- Endpoint: `POST /api/leads/[id]/callback`
- Auth: same shared secret header as the lead fetch endpoint (`MAKE_WEBHOOK_SECRET`)
- Payload: `{ stage?: string, last_contacted_at?: ISO timestamp }`
- Allowed stage transitions via callback: **Interested → Contacted only**. Other stage transitions (Contacted → Qualified, Qualified → Signed) are handled by the operator manually via the dashboard (Phase 3+)
- Referral trigger: LCC has a separate Make.com webhook URL for referral automation, stored in `lccs` table as a second URL (e.g., `lccs.referral_webhook_url`). App fires this URL when a lead's stage is set to Signed

### Claude's Discretion
- Exact Supabase schema additions (column names for slug, learn_more_url, referral_webhook_url, UTM fields, TCPA consent fields)
- Middleware matcher update to exclude `/[lccSlug]` routes from auth protection
- Error handling for 404 when an unknown slug is accessed (LCC not found)
- Form loading/disabled state during submission
- Exact phone number validation regex
- Styling details (exact color values, spacing, typography sizes within "slightly warmer" direction)

</decisions>

<specifics>
## Specific Ideas

- The `/[lccSlug]/thank-you` page includes a per-LCC configurable "learn more" link — operator sets this URL at LCC onboarding (Phase 4 operator admin will surface this, but the column and functionality are built here)
- Lead deduplication: `UNIQUE(email, lcc_id)` constraint on the leads table enforces this at DB level — upsert uses ON CONFLICT DO UPDATE
- The `GET /api/leads/[id]` endpoint for Make.com to fetch lead details should return all fields Make.com needs to personalize messages: family name, email, phone, message, source, UTM fields, LCC name, LCC slug, consent timestamp

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `utils/supabase/server.ts` — async createClient() for server components and server actions
- `utils/supabase/admin.ts` — admin client with service role for bypassing RLS (needed for API route endpoints that Make.com calls — not authenticated as any user)
- `app/(auth)/login/actions.ts` — server action pattern to follow for the lead capture form action
- `app/(auth)/login/page.tsx` — form UI pattern (Tailwind utility classes, simple inputs, submit button) as baseline; Phase 2 page should be warmer but structurally similar

### Established Patterns
- Server actions: form `action={serverAction}` pattern (no fetch/POST from client). Lead form follows this — no client component needed unless adding real-time validation
- Supabase client pattern: always `await createClient()` in server context
- Middleware exclusion: `matcher` in `middleware.ts` uses negative lookahead — `/[lccSlug]` and `/[lccSlug]/thank-you` must be added to the exclusion list (or a positive allowlist)
- JWT auth: `getClaims()` is the secure pattern; do not use `getSession()`

### Integration Points
- `middleware.ts` matcher — must exclude `/[lccSlug]` from the auth protection pattern. Currently excludes `_next/static`, `_next/image`, `favicon.ico`, `api`. Need to add `[lccSlug]` public routes
- `lccs` table — needs new columns: `slug`, `learn_more_url`, `referral_webhook_url`
- `leads` table — needs new columns: `consent_text`, `consent_timestamp`, `consent_ip`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- New Next.js API routes under `app/api/` — currently none exist
- Make.com webhook secret: `MAKE_WEBHOOK_SECRET` env var (add to `.env.local` and `.env.example`)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-lead-capture-and-automation*
*Context gathered: 2026-03-17*
