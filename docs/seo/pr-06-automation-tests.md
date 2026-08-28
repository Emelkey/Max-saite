# PR 06 — Automation, tests and rollout gate

**Branch:** `seo/master-2-0-automation-tests`

## Changed public behavior

- `/sitemap.xml` becomes a sitemap index.
- Adds `/sitemap-services.xml`, `/sitemap-cities.xml`, `/sitemap-niches.xml`, `/sitemap-cases.xml`, `/sitemap-blog.xml`.
- All indexable pages receive a consistent Organization/WebSite/WebPage/Breadcrumb schema graph.
- All local images receive intrinsic dimensions; visible content and canonical URLs remain unchanged.

## Scope

- Add sitemap index and five child sitemaps.
- Add deterministic route, metadata, canonical, sitemap, robots, schema, link and content checks.
- Add unit contracts, Playwright desktop/mobile QA and Lighthouse mobile budgets.
- Add intrinsic width/height to local images.
- Add one `npm run seo:check` release gate.
- Make GitHub Pages deployment depend on all quality gates.
- Add monitoring and rollback runbooks.

## Commands

```bash
npm ci
npm run seo:check
npm run test:browser
npm run lighthouse
npm run screenshots
```

## Verified result

- SEO contracts: 109 HTML pages, 87 indexable canonical URLs, 0 errors.
- Browser QA: 25 passed, 1 intentionally skipped desktop-only duplicate.
- Lighthouse mobile: performance 88–100, accessibility 92–96, best practices 100, SEO 100.
- Production package audit: 87/87 pages pass, 5,127 internal links checked, 0 errors.
- Desktop/mobile evidence: `artifacts/screenshots/master-2-0/`.

## SEO before → after

| Control | Before | After |
|---|---|---|
| Release gate | Basic source/package audit | Deterministic SEO + unit + browser + Lighthouse + package audit |
| Sitemap | One flat file | Index + 5 typed child maps |
| Schema contract | Parse-only | Required graph types + visible FAQ checks + no fake local/rating schema |
| Image stability | Mixed | 235 image elements normalized with dimensions |
| Mobile QA | Manual | 26 test cases across desktop/mobile projects (25 pass, 1 intentional desktop skip) |

## Screenshots

- Home: `home-desktop.jpg`, `home-mobile.jpg`
- Service: `service-desktop.jpg`, `service-mobile.jpg`
- City: `city-desktop.jpg`, `city-mobile.jpg`
- Case: `case-desktop.jpg`, `case-mobile.jpg`
- Blog: `blog-desktop.jpg`, `blog-mobile.jpg`

All files are under `artifacts/screenshots/master-2-0/`.

## Risk

The stricter deployment gate can block a release when quality regresses. This is intentional; use the failing artifact instead of bypassing the check.

## Rollback

Revert the PR through GitHub. Restore the previous single sitemap only if all 87 indexable URLs remain represented and robots points to the correct file.
