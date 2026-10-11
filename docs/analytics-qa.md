# Analytics QA without contaminating production

- Prefer the built local site and mocked lead responses. Block all outbound analytics and lead requests in browser tests. Never send a synthetic customer lead to production.
- To inspect the production UI manually, use a fresh isolated browser context and append `?maxsite_qa=1`. This disables this tab's production Google collection and custom analytics, including `generate_lead`, across same-tab navigation. It does not change lead delivery, validation or server acknowledgement. Do not submit a real form as a test.
- The reserved legacy pairs `utm_source=codex_qa&utm_medium=test` and `utm_source=codex_qa&utm_medium=qa` also identify QA. Generic `test` labels alone do not. Any ordinary campaign attribution or supported ad-click parameter takes precedence, clears the test session and allows normal measurement. `?maxsite_qa=0` explicitly exits the test session. Closing the isolated context discards it.
- `tools/verify-live-ga4.js` downloads the live Google tag but intercepts collector requests locally, blocks other external destinations and never submits a form. Its report confirms only request generation; it does not claim transport, GA4 processing or Ads import. Historical QA records remain untouched.
- Use `lead_form_start`, `lead_form_submit` and `lead_form_success` as the custom funnel. Do not add the legacy `form_start`/`form_submit` aliases to those counts; GA4 enhanced measurement may also produce those names. `click_phone` is intent, not a verified telephone call.
- The production-origin browser suite serves local build bytes under an intercepted production URL so parser timing, saved consent and QA guards are tested without contacting production.

## Campaign-to-form attribution

- The consented tab keeps its entry `landing_path` across same-site navigation; `pageUrl` and page/service metadata still identify the form's current page. Without analytics storage consent, the path is not persisted and falls back to the current route.
- A new explicit campaign replaces the previous campaign's permitted fields as one set. Missing fields become empty, so a newsletter cannot inherit an earlier Google click ID, medium or search term. Repeated reads on the same document do not create another entry.
- The paid website-development page's quote actions open `/obgovoryty-proiekt/?format=website`; only the fixed “Сайт під ключ” label is prefilled. The inline quote form and old `#lead` deep links remain available.
- These checks verify browser behavior and locally mocked acknowledgement. They do not establish whether historical GA4 leads were genuine, whether a production lead reached Telegram, or whether Google Ads imported a conversion. Reconcile real lead IDs/contact records with the account reports separately; do not delete historical events or infer a defect solely from GA4/GSC count differences.
