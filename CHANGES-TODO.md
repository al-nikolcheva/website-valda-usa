# VALDA site — review notes & changes

Running list from the walkthrough of the new build (localhost:3000).

## Done (this session)
- **Heroes (all inner pages via PinnedHero)** — rebuilt: ~82vh so most of the image + the title show on load, title stacked in one column on the image, next section peeks below. Removed the full-screen pinned/dissolve behavior that made you scroll to find the image.
- **Product page overview** — profile cut now sits **straight on the page** (removed the boxed/gradient/shadow panel + "Profile section" caption). Key-facts line rebuilt as a **roomy bordered grid** (3-up), values no longer cut off.
- **Catalogue** — the hidden "Technical catalogue →" arrow is gone; both catalogues now show as a clear **titled tab switcher** (Catalogue / Technical catalogue) so a customer sees both.
- **Homepage hero** — converted from the fixed-video scroll-over-pinned pattern to the same clean 86vh hero in normal flow (removed the 100svh spacer). Now consistent with every other page.
- **Opening animations = click/tap, not hover** — removed hover-to-open (broken on mobile). Now tap to open, tap to close, with a clear "Tap to open" cue on each card. Keyboard-accessible too.
- **Homepage elevation (coordinated pass, keeps ink+blue palette):**
  - Hero no longer renders black — reworked the overlays so the factory footage/architecture stays visible behind the readable headline (darkened only where the copy sits).
  - Fixed content contradictions: factory count is now **three** in every place (hero stat removed the numeric collision; factories section reads "Three factories. One standard." + stat = 3). "Family-owned since 1998" now appears **once**.
  - Section rhythm: deliberate chapters — white (produce) → paper (factories) → thin white cert strip → **dark ink** projects → paper (FAQ) → white (consultation) → image band. Two dark anchors (hero + projects) give the page structure.
  - Numbered chapter eyebrows **01 What we produce / 02 Our factories / 03 Selected work**, matching the product-page numbering.
  - Product grid elevated: taller 4:5 cards, index numbers, hairline caption rule, hover arrow chip.
  - Removed the duplicate cert-logo block from the FAQ column (logos already live in the dedicated cert strip).

## Homepage rebuilt as a client journey (Simpas-calibrated, 2026-09-26)
Studied simpasus.com live. Their site is a *client journey*, not a stack of sections. Rebuilt the homepage around the sentence: "they produce there, they ship here, I send a drawing, I get my certified windows."
- **New centerpiece: "From your drawing to your site."** (`components/how-it-works.tsx`) — dark numbered journey: 01 You send your project → 02 We engineer and quote → 03 We manufacture → 04 Tested and certified → 05 We ship to your site.
- **New order:** hero → 01 What we do → How it works → 02 Who we are (family business since 1998) → 03 Certified (real section: what every system is approved for, client-first, certs on request) → 04 Selected work → 05 Catalogues (surfaces the interactive catalogue) → FAQ → one Consultation CTA.
- Removed the duplicate trailing CTA band (was double-CTA with the consultation block + blue footer).
- **Positioning: US is the primary market** — European-made, delivered/certified across the US. Copy adjusted; "worldwide" is now secondary.

## To do (noted, not done yet)
- **CONFIRM FACTORY COUNT (2 or 3).** Set to three this session (2 Sofia + 1 Veliko Tarnovo, per the 2026 catalogue). An older note said two. Whatever is correct must be swept sitewide (hero stat, who-we-are section, /about).
- **Apply the same journey/US-primary treatment to /about and inner pages** so the whole site matches the new homepage.
- **Overall clarity pass (Simpas-style).** Cut the "text here, text there" density; tell it plainly and structured: European manufacturer → we export worldwide → windows / doors / facades / sliding → in PVC & aluminium → these are our projects → this is about us → our 3 factories → how we produce → how we export → how we're energy efficient. Applies most to **homepage + About**.
- **Homepage hero** (the video one) — apply the same "see it + title, no confusion" treatment if it still feels off.
- **Em-dashes in product copy** — the system paragraphs (from `valda-products.json`) still contain "—" (e.g. CS 77 copy). User dislikes these; strip them from the data copy.
- Re-check every hero image crop/position now that heroes are 82vh (some `imagePosition` values may want tuning).

## Open questions / decisions for Aleksandra
- Homepage hero: keep the factory video, or a cleaner still image + title like the inner pages?
- About page: want me to restructure it into the clear "who we are / what we make / how we produce / export / energy" flow?
