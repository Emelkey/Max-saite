# MASTER 3.0 — five existing city hubs

Routes unchanged: Kyiv, Lviv, Odesa, Dnipro, Kharkiv. No new city/service combinations, no Wave 2 indexation changes.

## Content model

`seo/cities.json` holds grammar, publication state, canonical metadata, links and a content key. `seo/city-wave1-content.json` holds hand-authored introductory copy, five business scenarios, four decision-table rows, two detailed city-specific sections, six questions/answers, CTA and explicit block order per city. Render with `node tools/render-master3-cities.js` then `npm run seo:schema:normalize`.

- Kyiv: procurement vs fast service purchase; real branches vs district duplicates.
- Lviv: multilingual consistency; bookings and course enrolment with honest availability.
- Odesa: expired offers; logistics quotation and changing property availability.
- Dnipro: industrial specifications; RFQ and accounting integration.
- Kharkiv: evidence of expertise; resilient enquiry handling and bounded MVP.

These are explicit **editorial scenarios**, not unsupported claims about market shares or existing local clients. Market-specific demand estimates and full SERP comparisons remain DATA REQUIRED. Shared pricing/process/CTA are marked separately. Both real portfolio links remain visible and are not misrepresented as local work.

## Validation

- All 23 city records validated; 7 existing published/indexable records unchanged.
- All 21 pairs of published city/national hubs included in corrected 5-gram comparison; no preceding content swallowed by pricing exclusion. Proof text retained.
- Five priority pages each have 5 scenarios, 4 decision rows, 2 bespoke explanatory sections, 6 FAQs, 6 service links, 2 proof links and 3 related city links.
- `npm run seo:check` passes; schema uses the exact visible FAQ answers. 14 unit tests pass, including regression fixtures against cross-section removal.

## SERP integrity correction

The previous map recorded 20% overlap or 41–59 despite incomplete samples. Those numbers are not evidence and are replaced with UNKNOWN. Existing URL ownership is preserved conservatively; no new URL may pass the city × service decision gate without two full dated top-10 organic samples and a recorded comparison.

Rollback: revert the city PR, keeping the technical safety fixes. Rerendering from this data is deterministic. Existing noindex city files are not deleted.
