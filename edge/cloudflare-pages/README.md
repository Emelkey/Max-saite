# Cloudflare Pages edge candidate

This directory is a reviewed **migration input**, not the current hosting output.
Nothing here changes DNS or the live GitHub Pages site by itself.

- `_redirects` defines six exact HTTP 301 rules from the canonical redirect registry.
- `_headers` defines HSTS and baseline response headers. CSP is deliberately
  `Report-Only` until form, analytics and browser compatibility have been observed.
- Before a separately approved cutover, copy both files into the root of
  `release/max-site-production` and follow
  [`docs/seo/master-4-0-edge-migration-runbook.md`](../../docs/seo/master-4-0-edge-migration-runbook.md).

Cloudflare Pages applies these files to static responses. If Pages Functions or an
advanced `_worker.js` is introduced, the equivalent redirects and headers must be
implemented in that code instead.
