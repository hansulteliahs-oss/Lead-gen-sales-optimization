---
name: LCC Lead Engine — Marketing Site
description: Personal-brand editorial column for Local Childcare Consultants placing au pairs in SoCal families. Deep wine-magenta ink on aged-cream paper (Cultural Care's brand hue rotated into the typographic system), single Fraunces serif system, mono cost figures, brighter magenta accent for hover and emphasis.
colors:
  ink: "oklch(36% 0.105 358)"
  ink-soft: "oklch(36% 0.105 358 / 0.74)"
  ink-rule: "oklch(36% 0.105 358 / 0.20)"
  ink-faint: "oklch(36% 0.105 358 / 0.08)"
  paper: "oklch(96.2% 0.022 78)"
  paper-deep: "oklch(93% 0.028 74)"
  bark: "oklch(46% 0.030 45)"
  bark-soft: "oklch(46% 0.030 45 / 0.72)"
  spot: "oklch(60% 0.190 358)"
  spot-deep: "oklch(52% 0.200 358)"
typography:
  display:
    fontFamily: "Fraunces, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.75rem, 7vw, 6rem)"
    fontWeight: 300
    lineHeight: 0.96
    letterSpacing: "-0.025em"
    fontVariationSettings: "'opsz' 144, 'SOFT' 0"
  headline:
    fontFamily: "Fraunces, Cormorant Garamond, serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)"
    fontWeight: 300
    lineHeight: 1.0
    letterSpacing: "-0.025em"
    fontVariationSettings: "'opsz' 96, 'SOFT' 0"
  title:
    fontFamily: "Fraunces, Cormorant Garamond, serif"
    fontSize: "clamp(2rem, 4.5vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariationSettings: "'opsz' 72, 'SOFT' 30"
  body:
    fontFamily: "Fraunces, Cormorant Garamond, serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.65
    fontVariationSettings: "'opsz' 24, 'SOFT' 60"
  small:
    fontFamily: "Fraunces, Cormorant Garamond, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    fontVariationSettings: "'opsz' 14, 'SOFT' 60"
  mono-label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  mono-figure:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: "-0.01em"
rounded:
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "2.5rem"
  section-y: "3.5rem"
  section-x: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "1rem 2rem"
    fontWeight: 500
    transition: "background 200ms cubic-bezier(0.22, 1, 0.36, 1)"
  button-primary-hover:
    backgroundColor: "{colors.spot-deep}"
  button-nav:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1rem"
    fontSize: "0.875rem"
    fontWeight: 500
  section-break:
    border: "1px solid {colors.ink-rule}"
  marginalia-label:
    fontFamily: "{typography.mono-label.fontFamily}"
    fontSize: "{typography.mono-label.fontSize}"
    color: "{colors.bark}"
    textTransform: "uppercase"
    letterSpacing: "0.1em"
    pattern: "§ {section-name}"
  cost-block:
    border-top: "1px solid {colors.ink-rule}"
    border-bottom: "1px solid {colors.ink-rule}"
    columns: 2
    column-divider: "1px solid {colors.ink-rule}"
  pull-quote:
    fontFamily: "Fraunces"
    fontStyle: "italic"
    fontWeight: 400
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    color: "{colors.ink}"
    glyph-color: "{colors.spot}"
  nav-bar:
    backgroundColor: "{colors.paper}"
    border-bottom: "1px solid {colors.ink-rule}"
    height: "4rem"
---

# Design System: LCC Lead Engine — Marketing Site

## 1. Overview

**Creative North Star: "The Hearth Letter"**

A personal-brand editorial column you'd find in a thoughtful local newsletter — deep wine-magenta ink on aged cream paper, set in a single variable serif (Fraunces) with monospace accents reserved for cost figures and section labels. The site reads as if Kim wrote it herself, sat down at a desk, and laid out the column for a tired parent reading it at 10pm.

The previous "Soft-Pink Welcome" system was the family-services category default that PRODUCT.md Principle 5 explicitly refuses. This system is the antidote: serious without being corporate, place-grounded without using a single beach icon. Every color has a structural job. Every typographic move is editorial, not decorative. The ink hue is rotated to magenta (hue 358) — the same family as Cultural Care's brand color, applied here as readable dark text rather than a saturated CTA fill. The brighter `spot` token (lighter L, higher chroma) handles hover and emphasis within the same hue family.

**Key characteristics:**
- Single Fraunces variable family carrying every text role through the optical-size axis (display→body)
- JetBrains Mono used only for cost figures, section labels, and footer meta — three places, total
- One ink hue (deep wine-magenta, in Cultural Care's hue family), one paper hue (aged cream), one bark hue (warm structural brown for mono labels), one spot accent (brighter magenta for hover and emphasis, same hue as ink) — strict role assignment
- Squared 4-pixel buttons. Pill buttons are gone. Cards are gone.
- Asymmetric grids (7/3, 1/3) replace the centered container-bound default
- Section breaks are a single hairline rule plus a `§ Section` mono marginalia in the left margin — replacing the eyebrow→h2→body→card stack used 5× on the old home page
- Hover state is a single-color shift to spot-deep, plus a 200ms ease-out-quart transition. No translate, no shadow, no scale.

## 2. Colors: Wine-Magenta on Cream, Strict Roles

A **Committed** color strategy: one saturated ink carries 30–60% of the surface (every word of body copy and every CTA). Bark is structural; spot is editorial; paper holds the page.

### Roles

- **Ink** `oklch(36% 0.105 358)` — deep wine-magenta, in the same hue family as Cultural Care's brand color (`#DC0079`) but pulled down to L=36% so it functions as readable dark text, not a saturated CTA fill. **Every word of text on the site.** Body, headlines, links, footer, brand mark. Also the fill of every primary CTA. Contrast on paper: ~9:1. Comfortably AAA.
- **Ink-soft** (74% alpha) — secondary body copy, lede paragraphs, the ink-tinted muted that replaces the old slate gray.
- **Ink-rule** (20% alpha) — every divider, table border, accordion separator, nav border. The site's only line color.
- **Paper** `oklch(96.2% 0.022 78)` — aged-cream. Section background, page background, nav background. **No alternating stripes; the page is one paper.**
- **Paper-deep** `oklch(93% 0.028 74)` — reserved. Currently unused; available for one future panel surface (e.g. a CTA overlay) without inventing a new token.
- **Bark** `oklch(46% 0.030 45)` — warm dry-bark brown. **Structural, not content.** Used exclusively on: the mono `§ Section` marginalia labels, mono cost-block labels, footer mono text, the right-column hero meta. Replaces every "muted gray" in the old system. Body copy never uses bark — that's ink-soft's job.
- **Spot** `oklch(60% 0.190 358)` — editorial magenta. A calibrated nod to Cultural Care's brand color (`#DC0079`), pulled back ~15% in chroma so it reads editorial, not neon. **Used ~6 places on a typical page**: the testimonial opening glyph, the inline-link underline color, the `→` prefix on the hero footnote.
- **Spot-deep** `oklch(52% 0.200 358)` — link text, button hover state. The single hover color across the entire interactive vocabulary. Contrast on paper ≈ 5.5:1 (AA).

### Named Rules

**The One-Ink Rule.** Every word of text on the site is `ink` or `ink-soft`. Body copy is never bark, never spot, never paper-deep. Bark belongs to mono labels and structure; spot belongs to underlines and hovers. No exceptions.

**No Section Stripes.** The old system alternated `bg-white` and `bg-surface` per section for rhythm. This system uses a single paper background with thin `ink-rule` hairlines as section breaks. Rhythm is typographic, not chromatic.

**Hover-Only Spot.** `spot-deep` appears at rest only on link borders. Buttons are `ink` at rest, `spot-deep` on hover. The site has no static spot-colored fill on any large surface.

## 3. Typography

**Single family:** Fraunces (Google, variable, free). Hierarchy is achieved through the **optical-size axis** (`opsz` 14–144) plus weight contrast (300 ↔ 700) — not through a second family.

**Mono accent:** JetBrains Mono (Google, free) at weights 500/600. Used in three places: `§ Section` marginalia labels, cost-block labels and figures, footer text. These are intentional editorial gestures — the mono signals "data" or "structural metadata," not "developer tool."

### Hierarchy (Fraunces, opsz axis)

- **Display** (weight 300, opsz 144, size `clamp(2.75rem, 7vw, 6rem)`, line-height 0.96, tracking -0.025em) — Hero H1 only. One per page. Italic word inside takes weight 400 + spot-deep color for editorial emphasis.
- **Headline** (weight 300, opsz 96, size `clamp(2.5rem, 5.5vw, 4.25rem)`, line-height 1.0) — Subroute H1, CTA section H2.
- **Title** (weight 400, opsz 72, size `clamp(2rem, 4.5vw, 3.25rem)`, line-height 1.05) — Home-page section H2, subroute section H2.
- **Body large / lede** (weight 400, opsz 24, size 1.2rem, line-height 1.65) — All running body copy.
- **Body** (weight 400, opsz 14, size 1rem, line-height 1.55) — Secondary copy, captions.
- **Mono label** (JetBrains Mono 500, 0.6875rem, uppercase, tracking 0.08em, color `bark`) — Cost-block labels, hero metadata, section-rule marginalia.
- **Mono figure** (JetBrains Mono 600, 1.75rem, color `ink`, tracking -0.01em) — Cost figures only. Currently 2 instances on the home page, 2 on `/au-pairs`.

### Named Rules

**Single-family hierarchy.** No second serif, no sans, no display-only family. If a contrast is needed beyond what optical-size + weight provides, the move is mono (used sparingly), not a second serif.

**Display weight is 300, not 800.** The hero feels editorial because the large type is light, not heavy. This is the inverse of the old system's 800-weight humanist sans. Don't reach for 700+ at display sizes; that pulls the system back toward the SaaS-marketing reflex.

**Italic earns its keep.** Italic in display H1 carries one emphasis word (and gets `spot-deep` color). Italic in pull-quotes carries the entire quotation. Italic is never decorative.

## 4. Elevation & Shape

**The system is flat.** No shadows on cards, no shadows on buttons, no glassmorphism, no inner shadows, no glows. Hover is a color shift, full stop.

### Shape vocabulary

- **Cards: gone.** Replaced with section breaks (a hairline + marginalia label) and inline content with `max-w-[64ch]` reading widths. The old system's `rounded-2xl` `bg-white` `border` `shadow-sm` pattern is fully retired.
- **Buttons: 4-pixel rounded squares** (`rounded` in Tailwind = 4px). No pills. No shadows. No transform on hover. Background shifts ink → spot-deep over 200ms ease-out-quart.
- **Tables: hairline rows, no container shape.** Border-top + border-bottom on each row. `mono` headers in `bark`. No row striping (the old pink/white alternation is gone with section stripes).
- **Pull-quotes:** No container. Just typography. The opening `“` glyph is `spot`, the rest of the quote is `ink`, italic, large.

## 5. Components

### Buttons (primary, the only button kind)

| Variant | Padding | Font size | Used on |
|---|---|---|---|
| `lg` (hero, CTA section) | `py-4 px-8` | `text-base` (1rem) | Hero CTA, bottom-of-page CTAs |
| `md` (inline hero) | `py-3.5 px-7` | `text-base` | Hero "Start with Cultural Care" |
| `sm` (nav) | `py-2.5 px-4` | `text-sm` (0.875rem) | Sticky nav top-right |

All three variants share: `bg-brand-ink`, `text-brand-paper`, `rounded` (4px), `font-medium`, hover→`bg-brand-spot-deep`, `transition-colors duration-200 ease-out-quart`.

### Inline links

`text-brand-spot-deep` color, `font-medium`, `border-b border-brand-spot-deep pb-0.5`. Hover: `text-brand-ink border-brand-ink`. Used on every "Read more →" / "Learn more →" / "See all →" / "See full breakdown →".

### Section break

A one-pixel `border-t border-brand-ink-rule` hairline followed by a section that uses a `1fr_3fr` (or `1fr_4fr`) two-column grid: marginalia label (mono, bark, `§ Section`) in the left column, content in the right. Replaces every `eyebrow → h2 → body → card` stack from the old system.

### Cost block

A two-cell `border-y` row inside the running content. Each cell: mono label in `bark`, mono figure in `ink` (size 1.75rem, weight 600), small ink-soft note. Vertical divider is `md:border-r border-brand-ink-rule`. Stacks single-column on mobile.

### Pull-quote testimonial

A `<figure>`/`<blockquote>` with no container. Italic Fraunces at headline scale (clamp(1.5rem, 3vw, 2.25rem)). Opens with a `“` in `spot` color, weight 300, not italic. Attribution is a `<figcaption>` in mono, bark, uppercase, with `—` prefix.

### Navigation (sticky)

- Background: `bg-brand-paper`. Border-bottom: `1px ink-rule`. No shadow.
- Brand mark: Fraunces 500, 1.125rem, `text-brand-ink`, hover→`spot-deep`.
- Nav links: 0.875rem, `text-brand-ink-soft`, active state→`text-brand-ink font-medium`.
- CTA: `sm` button variant.
- Mobile: hamburger toggles a `max-h` dropdown (legacy — flagged for migration to `grid-template-rows` in `harden`).

### Accordion (Radix-backed)

- Border-bottom only between items (`border-brand-ink-rule`). No card wrapping.
- Trigger: `font-medium text-brand-ink` at rest, `text-brand-spot-deep` on hover. ChevronDown in `text-brand-bark`, rotates 180° on open.
- Content: `text-brand-ink-soft`, body-large size with `opsz-body`.

## 6. Do's and Don'ts

### Do
- Use Fraunces for every text role. Adjust hierarchy via opsz axis + weight (300↔700), not by adding fonts.
- Use `mono` strictly for cost figures, `§ Section` marginalia, and footer text.
- Use the `1fr_3fr` (or `1fr_4fr`) section grid for every new section.
- Carry oklch in source. Don't introduce hex literals; if a fallback is needed, add it as a comment.
- Use `transition-colors duration-200 ease-out-quart` for hover. No translate, no shadow.
- Keep ink off bark territory and bark off ink territory. Body copy is ink-soft. Mono labels are bark.

### Don't
- **Don't reintroduce cards.** No `rounded-2xl bg-white border shadow-sm` blocks. The system is post-card.
- **Don't reintroduce pills.** All buttons are `rounded` (4px). Pill = template territory.
- **Don't add a second font family.** Adding a sans alongside Fraunces collapses the editorial commitment.
- **Don't use bark for body copy** — that drifts the system back toward "muted-gray-on-warm" tension. Body copy is ink-soft.
- **Don't use spot for body copy or large fills.** Spot is hover-and-underline only, plus the testimonial glyph.
- **Don't alternate section background colors.** The page is one paper. Section rhythm is hairlines + spacing, not chromatic stripes.
- **Don't ship `#fff` or `#000`** anywhere. Paper and ink are tinted; new tokens stay in oklch.
- **Don't animate `max-height` for new transitions.** The legacy mobile menu still does — slated for replacement in `harden`.
- **Don't add a third hue without a stated reason.** Spot is the only accent. A second accent would collapse the role-assignment discipline that holds this system together.
- **Don't ship a category-template signal:** no waves, no palms, no script fonts, no smiling-stock-family imagery, no "Hey Mama!" copy, no hero-metric stat blocks, no identical-card grids. PRODUCT.md anti-references remain in force.
