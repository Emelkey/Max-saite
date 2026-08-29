# MAX SITE post-release monitoring

## Day 0–7

- Verify the GitHub Pages workflow and production checksum.
- Open homepage, primary service, five Wave 1 cities, three cases and one article on desktop/mobile.
- Submit a controlled test lead and verify success/error state without exposing PII in GA4.
- Verify `sitemap.xml`, all child sitemaps, robots, canonical, JSON-LD and 404.
- Inspect key URLs in Search Console; do not request indexing for noindex roadmap pages.
- Monitor 404/5xx, form delivery and console errors daily.

## Day 14–30

- Export query/page/device data from Search Console.
- Compare non-brand impressions, clicks, CTR and average position to the baseline period.
- Review city hub indexing and any `Crawled - currently not indexed` pattern.
- Investigate queries where multiple URLs compete.
- Improve snippets only where impressions are sufficient to interpret CTR.
- Add contextual links and proof only when they help the page.

## Day 45–90

- Evaluate Wave 1 by city query group, landing page and key event.
- Run the SERP Decision Gate before any city × service URL.
- Publish at most 2–5 reviewed candidates, not a full matrix.
- Start Wave 2 only if Wave 1 quality and indexing remain stable.
- Add verified case evidence and relevant referring domains.

## Weekly dashboard

Track organic clicks, impressions, non-brand clicks, city query groups, landing pages, key events, conversion rate, indexed/excluded pages, CWV, new referring domains, content changes, anomalies and next actions. Rankings are diagnostic signals, not guarantees.

## Alert thresholds

- More than 10% of indexable URLs disappear from indexed coverage.
- Form success drops to zero after a release.
- A key template fails canonical/schema or returns 4xx/5xx.
- City similarity exceeds 0.55.
- Organic clicks decline for two comparable weekly periods without known seasonality.
