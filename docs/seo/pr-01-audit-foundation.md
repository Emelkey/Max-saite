# PR 01 — audit foundation

**Branch:** `seo/master-2-0-audit-foundation`

## Scope

- read-only inventory of 104 HTML documents;
- route inventory with metadata/schema/link/sitemap data;
- immutable pre-change HTML, metadata, sitemap, robots and link graph snapshots;
- Search Console baseline (146 exported dimension rows);
- baseline architecture/risk documentation;
- redirect constraints and first alias map.

## Changed production URLs

None. This PR intentionally changes only tooling, documentation and non-public artifacts.

## SEO before/after

- Before: baseline scattered across prior reports; no machine-readable MASTER 2.0 inventory.
- After: reproducible inventory, 16-month-requested GSC snapshot (available property history 02–26.08.2026), risk register and rollback constraints.

## Risks

- No production behavior changes.
- GSC baseline is limited by the young property history.
- Local Lighthouse could not start because no Chromium executable is installed; automated browser runtime is added in the automation PR.

## Tests

- `node tools/seo-master-baseline.js`
- `node tools/audit-site.js` → 78/78 sitemap pages, 0 errors

## Rollback

Revert this documentation/tooling commit. No application files or production URL behavior need restoration.

## Screenshots

- Desktop before: `artifacts/seo/baseline/home-desktop.png`
- Mobile before: `artifacts/seo/baseline/home-mobile.png`
- Final comparison: `artifacts/screenshots/master-2-0/home-desktop.jpg`, `home-mobile.jpg`
