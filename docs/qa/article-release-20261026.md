# MAX SITE editorial release — 2026-10-26

Baseline: main and live receipt `a295e70535822a21652dbc5e98a6eaa813dbd433`, 31 articles / 92 sitemap URLs. Current PR48 prices preserved, no additional discount.

One original article: `/blog/peredacha-saytu-vlasnyku-dostupy-kod-domen/`. Scope: evidence-based acceptance of ownership/control, code-to-release correspondence, service renewals, and safe handover order. The sample register is explicitly illustrative, not a client case. Official GitHub, Cloudflare and Google sources support only their specific technical statements. No new service or outcome claims.

Minimal integration: blog hub link, one contextual link from the existing site-scope article, explicit intent-map owner, blog sitemap. Existing page titles/descriptions, all prices, main hero/motion, forms, analytics, consent and service scope unchanged. New article CTA uses the existing separate project form. Original screenshots/content from other businesses are not copied.

Regression coverage: new article unit test and read-only desktop/mobile browser test, including navigation/back, anchors, mobile menu, overflow and JavaScript errors. All browser requests are intercepted: no actual leads, analytics or external mutations. Article browser test added to production read-only smoke.

The historical PR48 price-only SHA test normalizes exactly the two new editorial insertions before comparing original hashes; its price counts and original baseline hashes remain unchanged.

Local baseline SEO/unit/build: pass, 92/92 pages, 5,467 internal links, zero errors. Local browser execution unavailable: Chromium socket creation is restricted; escalation itself failed with a runtime bwrap readonly mount error. Full browser and Lighthouse gates must pass in existing GitHub Actions before merge. No bypass or weakened thresholds.

Dependency audit: production 0 advisories. Full dev-tool audit: 4 high / 1 moderate (chromium-bidi, follow-redirects, puppeteer-core, zod, qs). Deferred for separate approved maintenance; no dependency or lockfile changes in this editorial release.
