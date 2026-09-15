# MAX SITE landing and lead implementation — 2026-09-15

The general Ads destination and eight related landings put the product, audience, applicable price and primary contact action in the first hero column. Compact mobile spacing keeps the main action above the open consent panel at 320–412px. Two existing portfolio images explain the task and delivered web scope; Formula Chystoty and FO-DEZ are explicitly identified as projects related to the owner. The shop and Ads pages do not present those service websites as ecommerce or advertising-result cases.

## Scope

- Nine existing landings: general website development, its legacy alias, landing pages, business websites, corporate websites, online shops, Google Ads, Cherkasy and cleaning businesses.
- Existing Formula Chystoty and FO-DEZ case pages gain the relationship disclosure and relevant service links. The required MAX SITE self-case link remains available.
- Prices retain their product limits: landing 10,500 UAH; business 19,700 UAH; shop 34,300 UAH; corporate individual quote; Ads management 6,800 UAH/month with advertising spend separate. No new numerical deadline or revision-count promise is introduced.
- Comment fields visibly say optional. Contact number, Telegram destination, form consent and the build-injected endpoint remain unchanged.
- A client success now requires `ok: true` and a server `lead_id` exactly equal to the request ID. Missing or mismatched IDs produce an unconfirmed-delivery error and no `generate_lead`; the client never invents a server acknowledgement.
- Consented attribution is captured at script startup and immediately after the consent choice, including pages without forms. Consent revocation clears stored attribution. No additional GA4 pageview/config call is introduced.
- Production GA is disabled before the HTML tag outside the exact `https://maxsite.com.ua` origin, and the fallback tag loader also stays off. Local dataLayer assertions are diagnostics, not proof of an actual GA4 network event.
- Five rows of the existing authority-target register were reviewed against official public pages. They remain `RESEARCHED_NOT_CONTACTED`; no outreach, registration, payment or review publication occurred.

Canonical URLs, robots directives, sitemap membership, H1/title metadata, generated contextual links, city indexation policy and other businesses' repositories are preserved. The legacy Ads path remains HTTP 200 with its canonical pointing to `/stvorennya-saytiv/`.

## Verification

Use the existing repository quality workflow:

```sh
npm ci
npm run seo:check
node tools/verify-edge-contract.js --config-only
npm run test:browser
npm run lighthouse
node tools/audit-site.js --root release/max-site-production --site-url https://maxsite.com.ua
```

The implementation adds substantive acknowledgement, HTTP 500, timeout, concurrent-submit, consent/navigation and mobile-overlap checks to the existing suites. Network delivery and Google endpoints in browser tests are intercepted; no live message is sent by those tests. Screenshot evidence compares the archived baseline `50080215cb7fda4c08676a80c2c216d2a189437e` with the candidate build. Lighthouse is a local simulated mobile lab gate, not field performance or business impact.

## Required release dependency

**Do not publish the strict acknowledgement client until the live lead Worker is independently shown to return the matching `lead_id`.** The repository Worker does so, and unit tests verify that contract, but this does not prove the deployed Worker version. The available Wrangler session could not read versions because Cloudflare authentication was unavailable. No Worker code, bindings or migrations were changed.

One owner-approved TEST delivery remains necessary: agreed contact, Telegram receipt, matching technical ID and a clearly labelled test record. A successful mock or a public Worker HTTP 405 is not a delivery proof. Current live-delivery status is `BLOCKED_LIVE_DELIVERY`.

After that dependency and the concrete release approval are satisfied, merge the reviewed PR and run `pages.yml` through `workflow_dispatch` on `main`. A skipped deploy on PR/push is expected. Verify the exact main SHA using `tools/verify-production-release.js`; verify Worker publication separately. Baseline rollback target is `50080215cb7fda4c08676a80c2c216d2a189437e`; an approved revert/release must pass the same gate.

## External acceptance stays separate

Ads drafts/configuration, GA4/Ads goal reconciliation, owner lead classification, Search Console access/recrawl, consented independent reviews and commercial economics are recorded in the private delivery packet, not claimed as completed by this code change. No advertising account, budget, conversion action, access permission or external message was changed. No new monitoring automation was created.
