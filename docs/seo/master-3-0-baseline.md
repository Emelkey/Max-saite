# MASTER 3.0 — baseline and execution register

Date: 2026-09-02. Source specification: MAX_SITE_SEO_GROWTH_MASTER_3_0_TZ_Codex_2026-09-02.pdf (32 pages).
Base: `d1fe955b0492af9bb80b20e15d12194177e1b757`, production GitHub Pages, repository Emelkey/Max-saite.

## Verified scope

Static HTML/CSS/JavaScript, 109 HTML documents, 87 indexable documents. Existing public URLs stay unchanged. Wave 2 city publication remains gated; no city × service mass generation. The existing founder/header work is already in PR 13 and is not counted as new work.

The source inventory and immutable HTML/metadata/link graph/sitemap snapshots are generated with `node tools/seo-master-baseline.js --version=master-3-0-before`. Inventory HTTP status is deliberately `NOT_FETCHED`: a local file and a meta refresh cannot prove a live 200 or 301 response.

## Findings to fix

1. Baseline counted canonical/style resource links as navigational inlinks; this could hide orphan pages.
2. City similarity only checked priority 1 and its cross-section regular expression could remove substantive content. Proof text must count unless explicitly shared; city-specific copy must never disappear from the comparison.
3. Internal link QA skipped absolute internal URLs and counted self/canonical links as evidence of discoverability.
4. Form delivery treated any HTTP 200 JSON, including `{ok:false}`, as success. Duplicate submission, storage denial and sensitive query-string handling need runtime tests.
5. The Worker drops attribution context, accepts weak phone validation, and has isolate-local rate limiting only. This must not be described as distributed protection or verified production delivery.
6. GitHub workflow deploys every main push; separate QA from explicit final production release.
7. Wave 1 content has appended generic sections and eight FAQs; rebuild focused compositions with 5–7 visible questions rather than add more boilerplate.

## Delivery lanes

| Branch | Scope | Acceptance |
| --- | --- | --- |
| seo/master-3-0-audit-foundation | immutable baseline, inventory, evidence register | source inventory reproducible; no invented metrics |
| seo/master-3-0-technical-fixes | links, forms, schema, release gating | unit + browser + SEO checks |
| seo/master-3-0-city-wave-1 | five existing hubs and data validation | unique useful content, all published-city Jaccard <= 0.55 |
| seo/master-3-0-cases-eeat | existing verified cases and niche briefs | no invented results/permissions/clients |
| seo/master-3-0-content-hub | editorial assets, contextual links | useful original material, canonical owners |
| seo/master-3-0-automation-tests | regression coverage and handover | full QA, release evidence, rollback |

## External acceptance gates (not code completion)

- Search Console exports, comparative windows and SERP overlap need sufficient real observations; incomplete samples stay DATA REQUIRED. Average position is not a fixed ranking for a single keyword.
- A fifth completed client case, testimonials, legal identity and publication consent require owner-provided evidence. Never invent or publish them as placeholders.
- Outreach, editorial links, post-release indexing and 30/60/90-day ranking outcomes require elapsed time and external actions. No guarantee of position 1 or top 10.
- Worker production deployment, real lead delivery and GA4/Ads conversions need independent verification; a static site deployment does not deploy the Worker.
- Raw account exports and personal data stay outside the public repository. Public reports contain methodology and approved aggregates only.

## Release discipline

Separate reviewable PRs, no direct edits to main, tests before release. Only final explicit production dispatch. Preserve previous branches and all unrelated user changes. Final checklist distinguishes implemented, verified, and blocked items.
