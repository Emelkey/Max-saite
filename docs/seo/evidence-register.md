# MAX SITE evidence register

Updated: 2026-09-02

This register prevents unverified claims from reaching production. `DATA REQUIRED` is intentional and must not be replaced with assumptions.

| Evidence | Status | Required source | Publication rule |
|---|---|---|---|
| Founder full public name | DATA REQUIRED | Written confirmation from the founder | Update visible biography and Person schema together |
| Legal entity / registration details | DATA REQUIRED | Official registration or approved legal wording | Publish only the exact approved details |
| Formula Chystoty launch date | DATA REQUIRED | Repository release or owner confirmation | Add `dateCreated` only after verification |
| FO-DEZ launch date | DATA REQUIRED | Repository release or owner confirmation | Add `dateCreated` only after verification |
| Formula Chystoty client review | DATA REQUIRED | Written permission plus source URL/screenshot | Add verbatim approved text, author role and source |
| FO-DEZ client review | DATA REQUIRED | Written permission plus source URL/screenshot | Add verbatim approved text, author role and source |
| Case traffic / leads / revenue | DATA REQUIRED | Read-only GA4/GSC/CRM export and owner permission | State period, source and measurement caveats |
| Certificates or awards | DATA REQUIRED | Public verifiable certificate URL | Do not mention until verified |
| B2B CLEAN case | DATA REQUIRED | Exact live URL, scope of MAX SITE work, permission, implementation screenshots | Do not invent or publish a placeholder client case |
| Fifth completed case | DATA REQUIRED | Owner-supplied project and publication permission | Remain at three verifiable cases until supplied |
| Self-case screenshots | VERIFIED LOCAL BUILD | Four captures in `assets/portfolio/max-site-*-20260902.jpg` with manifest | Label local production build; do not imply business results |
| Client live URLs | VERIFIED 2026-09-02 | `https://www.formula-chistoty.ck.ua/`, `https://www.fodez.com.ua/` | Availability/content only; older screenshot versions labeled |

## Verification rules

1. Never infer identity, office, team size, experience, customer count, rankings or revenue.
2. Every quantitative case claim must include source, date range and comparison basis.
3. A client review needs written publication permission.
4. `Review` or `AggregateRating` schema is prohibited while `seo/reviews.json` is empty.
5. Case screenshots may support only visible implementation facts, not business outcomes.
