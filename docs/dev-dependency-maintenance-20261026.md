# Development dependency maintenance — 2026-10-26

Authorized MAX-SITE-3: separate narrow maintenance package after blog-navigation fix. Ran targeted `npm update puppeteer-core follow-redirects qs --package-lock-only` under existing declared dependency ranges. No npm audit fix --force, overrides, audit suppression, new direct dependency or production code change.

Paths:
- lighthouse -> puppeteer-core25.9.0 to25.16.0 -> chromium-bidi17.0.2 to157.0.8090-0 -> zod3.25.76 to4.6.7. Protocol/browser support dependencies updated with Puppeteer; Lighthouse stays13.4.1, Playwright stays1.62.1.
- http-server -> http-proxy -> follow-redirects1.16.0 to1.16.2.
- http-server -> union -> qs6.15.3 to6.16.1.

Fresh audit before: five vulnerable package paths, four high/one moderate. After: zero vulnerabilities including development tools; production-only remains zero. This does not imply prior shipped static assets were vulnerable.

Acceptance: locked install, complete SEO/unit/build/edge/Ads checks, Chromium/WebKit desktop/mobile suite, Lighthouse mobile budgets and production audit. Final dependency tree changes15 package versions, all attributable to the three targeted paths; package.json unchanged. No workflows or CI recovery patches changed. Production build files must be byte-identical to parent package except revision receipt. Exact deployment and live smoke required before marking complete.
