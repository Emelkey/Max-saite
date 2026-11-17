# Priority content review — 2026-10-31

Base: `ce088208b4315b153d8bc892a81cd24cdd98ca71` (main).

## Scope

- Cherkasy: practical first-version choices for service companies, agreed page limits, catalogue/store decision, relevant internal links.
- Dnipro: services as well as B2B catalogue intent; explicit first-release scope and acceptance examples; catalogue decision and timing resources; online-work FAQ.
- Cleaning niche: priced scope, residential/commercial intent, briefing and service links.
- Cities hub: customer-facing online-service explanation instead of rollout roadmap. The current base had already removed the literal Wave/QA text; this change removes the remaining implementation-oriented roadmap.
- Founder: remove the contradictory statement that the publicly displayed name awaits approval.

No new testimonials, external proof, offices, local-client claims, metrics or guaranteed results. Existing owner-related project disclosure is retained. Prices, forms, analytics, attribution and ad settings are unchanged. No new routes.

## Geography decision

`seo/cities.json` has six indexable city routes plus one nationwide route, and sixteen deferred city routes. All sixteen keep `state: noindex` and `index: false`; their HTML and exclusion from `sitemap-cities.xml` remain unchanged. The historical readiness register lacks confirmed serviceability and demand evidence for these deferred cities. This review does not invent that evidence or replace old GSC observations with unverified current statuses.

Cherkasy's related-city data previously named noindex Poltava and Kropyvnytskyi even though the page did not render those links. Its related-city list now uses existing indexable Kyiv and Dnipro. The hub links only published routes and offers a direct project discussion path for other locations, without announcing a local office or city launch.

Before enabling another city: verify actual serviceability and demand, add genuinely distinct useful content, review real local conditions without fabricated clients, then check robots/canonical, visible links, sitemap and similarity together. A city name substitution is not sufficient.

## Source and verification notes

Dnipro is rendered from `seo/city-wave1-content.json` with `node tools/render-master3-cities.js dnipro`. Cherkasy and cleaning are curated HTML; historical bulk apply scripts are not the active build source and must not be rerun indiscriminately. The cities hub's existing template is updated to preserve customer-facing copy on future runs.

Substantive review dates on the three priority pages and matching schema/sitemap entries are updated; historical case/research dates are not changed. The price-only test's original ledger remains intact. An explicit scoped editorial fixture re-baselines only the five content/data files changed here, retaining exact price-occurrence and whole-file hashes. Separate regressions preserve forms, executable scripts, existing project blocks and all deferred city pages byte-for-byte against the starting commit.

This branch is for draft review only. It does not authorize merging or deploying.

## Local checks before draft PR

- `npm ci --cache /tmp/maxsite-npm-cache`: passed with the unchanged lockfile.
- `npm run seo:check`: passed; 158 unit tests, 93/93 canonical pages, 5,511 internal links, production-package audit: 0 errors.
- `node tools/verify-edge-contract.js --config-only`: passed.
- City main-content similarity: all pairs pass; highest 5-gram Jaccard score 0.0646 (limit 0.55).
- Independent diff review: no scope or accuracy issues; forms, executable scripts, robots and visible FAQ/schema parity verified.
- Local browser QA could not execute: bundled browser download was unavailable; system Chromium startup was blocked by environment socket restrictions, and the supported escalation failed before test execution. New focused browser scenarios are included for normal CI; full browser/Lighthouse results must be read from the exact-head GitHub run before calling the PR ready.
