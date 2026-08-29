# PR 04 — Cases and E-E-A-T

**Branch:** `seo/master-2-0-cases-eeat`

## Changed URLs

- `/portfolio/formula-chystoty/`
- `/portfolio/fo-dez/`
- `/portfolio/max-site/`
- `/portfolio/`
- `/pro-nas/`
- `/zasnovnyk/`

## Scope

- Expand Formula Chystoty and FO-DEZ into evidence-led case studies.
- Add an explicitly labelled MAX SITE self-case.
- Add task, constraints, scope, structure, design, technology, SEO, analytics and visible outcomes.
- Add desktop/mobile evidence galleries with explicit dimensions.
- Add `CreativeWork`, publisher, author and dates without fake ratings.
- Add an evidence register and empty review store.
- Strengthen ownership, access, process and customer-protection language.

## Acceptance checks

- All three case URLs are indexable, canonical and present in sitemap.
- Every case has a live verification URL, except that the self-case points to MAX SITE itself.
- No unverified testimonial, launch date, ranking, revenue, lead count or rating is published.
- Founder and legal identity gaps remain labelled `DATA REQUIRED` in the internal evidence register.
- Forms retain consent and existing analytics instrumentation.

## SEO before → after

| Control | Before | After |
|---|---|---|
| Detailed client cases | 2 brief entries | 2 evidence-led case studies |
| MAX SITE proof | No self-case | Clearly labelled self-case |
| Evidence policy | Informal | Versioned evidence register |
| Reviews schema | Risk of unsupported claims | Empty verified-review store; no rating schema |
| Case schema | Inconsistent | CreativeWork/author/publisher/dates/image |

## Tests and screenshots

- `npm run seo:schema`: visible/schema consistency passes.
- `npm run seo:links`: case/service links pass.
- Playwright case route: no console errors or overflow.
- `artifacts/screenshots/master-2-0/case-desktop.jpg`
- `artifacts/screenshots/master-2-0/case-mobile.jpg`

## Risks

- Founder full legal name, legal requisites and third-party reviews remain `DATA REQUIRED`; nothing is fabricated.
- A verified launch date or business metric may only be added with source evidence and permission.

## Rollback

Revert the PR commit. No redirect or URL removal is involved.
