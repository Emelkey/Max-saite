# MAX SITE SEO rollback plan

## Before merge

1. Each scope stays in a separate cumulative PR.
2. Record the source commit, changed URLs, test results and screenshots.
3. Do not delete or redirect an indexed URL without a reviewed redirect row.

## Rollback levels

### Content-only regression

Revert the responsible PR commit, rebuild and verify canonical, sitemap and internal links. If a new URL was indexed, prefer restoring the last good content instead of leaving an abrupt 404.

### Layout or JavaScript regression

Revert the automation/content commit that introduced the fault. Re-run `npm run seo:check`, `npm run test:browser` and the affected Lighthouse routes before deployment.

### Form/analytics incident

Preserve the public page when possible, disable only the failing integration, keep a visible phone/Telegram path, and verify no PII was sent to analytics. Restore the last working endpoint/configuration from repository history.

### Full production rollback

Use GitHub's PR revert to create a reviewable rollback commit on `main`. Do not force-push or reset shared history. The Pages workflow will publish the reverted state after all gates pass.

## Post-rollback checks

- production returns 200 for all key URLs;
- forms and contacts work;
- canonical/robots/sitemaps match the restored state;
- no redirect chain or orphan page was introduced;
- Search Console annotation and internal incident note are updated.
