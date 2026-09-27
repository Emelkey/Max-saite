# MAX SITE Google Ads connector export — 2026-09-27

- Source: Windsor.ai Google Ads connector, connected account `778-225-5000` (`MAX SITE`).
- Assembled: 2026-09-27 12:54 UTC from reads made earlier in this session. Windsor did not provide per-query retrieval timestamps. Account timezone: `Europe/Kiev`; currency: UAH.
- Export collection mode: read-only. These files were assembled before the later 27.09 native UI pause of RSA `820333812947`; that change and its readback are documented in the parent package `execution-report.md`. The call asset phone was redacted from the public snapshot and `assets.csv`; no customer data is in this export.
- Metric window: 2026-08-30 through 2026-09-26 inclusive. Static entity views and change events use the dates indicated in the JSON keys and CSV names.

## Files

| File | Raw rows | Coverage |
|---|---:|---|
| `snapshot-2026-09-27.json` | 1 campaign, 1 traffic ad group, 2 traffic RSAs, 24 keyword metric rows, 64 ad group criteria, 14 conversion actions, 11 assets, 6 change events | Connector result arrays plus account metadata, settings and device/network/location/time breakdowns |
| `search-terms-2026-08-30_to_2026-09-26.csv` | 192 | Visible search-term rows; 107 clicks and 7,868.5944 UAH, or 66.88% of campaign clicks and 68.20% of cost |
| `campaign-criteria-2026-09-27.csv` | 240 | 236 negative keywords, 2 language targets, 1 Ukraine location target, 1 other criterion |
| `source-baseline-2026-09-27.json` | 1 supplied source file | Original companion baseline transcribed from Windsor reads on 27.09; source for the package's three `baseline-*.csv` files and 13 selected search-term examples |

## Limits

- The ad group and RSA connector views return only the group and two ads with traffic in the metric window. They do **not** certify the full six-group/eight-RSA inventory or current statuses of no-traffic entities.
- The ad group criteria view exposes 64 rows across six group IDs, but its `ad_group_criterion_status` and `ad_group_criterion_criterion_id` fields came back null; treat status and criterion ID as unavailable in this export.
- Windsor did not return conversion-action IDs or campaign custom-goal membership with a compatible field combination. The 14 action rows identify actions by name and expose status, role, category and counting type, but a native readback is required for exact goal membership.
- `campaign_target_spend_cpc_bid_ceiling_micros=null` is the connector response, not by itself proof that a native CPC limit is absent.
- Campaign criteria are current connector rows, not an import file. Search terms are privacy-filtered. Do not infer intent for undisclosed traffic or sum impression share, Quality Score or other non-additive fields.
- The `cost` column is Google Ads served cost in UAH. This export does not include billed charges, payment state, automatic rules, auto-apply settings or real lead quality.
- The 2026-09-27 partial-day metrics are excluded from the CSVs and 28-day snapshot.
- No cell in the CSV source data started with `=`, `+`, `-` or `@`; the export writer also guards such cells if present.
