# MASTER 3.0 — niches and evidence

Date: 2026-09-02. Branch: `seo/master-3-0-cases-eeat`.

## Implemented

- Five existing niche pages rebuilt from `seo/niche-content.json`: shops, medical services, manufacturing, property, courses. Each has distinct operational requirements, three substantial sections, input checklist, acceptance criteria, five niche FAQs and contextual service links.
- Shop pricing corrected to the published store starting price (34,300 UAH). Integration/LMS/booking/payment scope separated from basic page pricing.
- No invented medical reviewer, legal details, local office, niche client or customer result. Medical copy requires client professional review rather than giving clinical advice.
- Three existing cases have visible editorial review dates, distinct from unknown project launch dates; case schema uses Article and the shared publisher.
- Formula Chystoty and FO-DEZ public URLs checked. FO-DEZ currently presents Bila Tserkva; legacy screenshots explicitly marked as an earlier version, not a fresh capture.
- MAX SITE self-case replaces illustrative concept images in its evidence gallery with four actual local production-build screenshots. Capture date/source are visible and recorded in a manifest.
- Fixed `case_live_site_click` for `.portfolio-case` links and H1 case names.

## Acceptance and open evidence

Local SEO/schema/link/unit/build checks run after content generation. Real self-case desktop and mobile captures visually inspected. Full responsive and Lighthouse suite belongs to the final QA lane.

The requested five completed cases are **not complete**: only three existing projects are documented. B2B CLEAN URL/scope/permission and a fifth project remain DATA REQUIRED. Founder full public name, legal registration, launch dates, client reviews and business metrics are also gated in `evidence-register.md`. No fabricated case was used to satisfy a count.

## Risk / rollback

No new URLs or indexation changes. Editorial copy should be reviewed by the business owner. Revert this lane's commit(s) to restore prior niche/case text and galleries without changing other SEO work.
