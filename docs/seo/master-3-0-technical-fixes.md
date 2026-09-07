# MASTER 3.0 — technical changes

2026-09-02; based on foundation commit `5dfa19b`.

## Implemented

- Navigation graph now uses actual anchors, resolves same-origin absolute links, ignores self-inlinks, checks local fragments and client redirects. Removed four homepage shortcuts to unpublished/noindex city content (the pages remain intact).
- One central schema builder replaces shared identity nodes and generates FAQ questions **and answers from visible content**. Fixed three mismatched answers; 87 indexable graphs normalized. No new ratings or local offices.
- Consent defaults execute before Google tags; choices are necessary / analytics / all, with an editable footer control. Form-contact consent remains independent. URL query strings and fragments are removed from Google page context and lead referrers. gclid is gated on separate advertising consent. This is a technical implementation, not legal certification.
- Strict analytics event parameter allowlist. No names, phones, comments or arbitrary URLs accepted.
- Honest lead acknowledgement (`HTTP success AND ok:true`), timeout, concurrent-submit guard, retry ID, no forced redirect on delivery error. Browser storage denial no longer breaks forms.
- Worker validates contact and explicit form consent, bounds actual request bytes, forwards allowed context, strips URL queries, handles transport/Telegram body errors, and deduplicates concurrent retries within one isolate. Per-isolate protection is **not distributed**; deploy and real delivery are separate release gates.
- Preview packages replace robots directives with one noindex directive instead of appending a conflicting tag.
- CI runs on PRs/main; production deployment only on explicit manual dispatch from main after all QA. QA token has no Pages write permission.
- Browser QA tests the built production package, not source files with intentionally empty endpoint configuration.

## Evidence

`npm run seo:check`: 109 documents, 87 indexable, all gates passed before final content work (4 noindex-link warnings subsequently removed).
`node --test tests/unit/lead-delivery.test.js`: 7/7 passed.
`npm run test:browser`: 33 passed, 3 platform-specific skips. Desktop/mobile header, wheel scrolling, navigation, contact links, success/error acknowledgement, consent revocation and PII tests pass.

An initial browser run exposed a test-environment problem: source assets deliberately lacked the production endpoint. Tests now build and serve the production artifact so a fallback-only source configuration cannot falsely pass delivery QA. No real lead was sent; endpoint responses are mocked.

## Risk and rollback

Shared consent/schema/script changes affect all pages. Inspect first-visit mobile overlay and Lighthouse before release. Revert the technical PR to restore old behavior; do not selectively restore the permissive false-success handler. Worker rollback is independent of Pages rollback. Never roll back consent by asserting a fabricated user grant.

References: [Google Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode), [Google implementation guide](https://developers.google.com/tag-platform/security/guides/consent).
