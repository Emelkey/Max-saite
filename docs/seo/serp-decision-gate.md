# SERP Decision Gate — 28.08.2026

## Rule

- overlap ≥ 60%: one canonical owner, no new URL;
- overlap ≤ 40%: a separate URL may be considered if it has independent value and proof;
- overlap 41–59% or an unstable sample: manual review, default **no new URL**.

## Decision

Current local SERPs surface city-specific studios and local service pages (for example, separate results for Kyiv, Lviv, Odesa, Dnipro and Kharkiv), so the **existing** five Wave 1 city hubs remain valid owners. This is not approval for multiplying city × service pages.

No new city × service URL is approved in this release. `landing + city`, `ecommerce + city` and `software + city` are handled through deliberate internal linking between the city hub and the existing national money page until GSC and a stable manual top-10 comparison prove a separate intent.

MASTER 3.0 correction (2026-09-02): unverified numerical overlaps have been replaced with `UNKNOWN` in both intent and keyword maps. No current measured top-10 overlap sample is available in this repository. These blanks are evidence gaps, not zero overlap. Record the query pair, country, language, device, date, two organic top-10 lists and intersection method before applying the thresholds above. Existing hubs remain the owners without creating new city × service URLs; this is not a claim that a fresh quantitative gate has passed.
