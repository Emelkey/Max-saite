# MASTER 4.0 — content, evidence and authority audit

Audit date: 2026-09-06
Scope: repository source only; no claim that a local file is already live.
Safety rule: no client, result, review, office, award, legal identity or market statistic was inferred.

> Baseline record, captured before MASTER 4.0 remediation. Counts and gaps below
> describe that starting point, not the final release. The release candidate now
> has 110 HTML documents / 88 indexable URLs after adding the cost calculator.
> See `MASTER_4_0_RELEASE_CHECKLIST_2026-09-07.md` and the generated check artifacts
> for final links, metadata, editorial review, tests and deployment status.

## Executive result

The site already has a useful technical/content foundation, but the competitive proof layer is not complete. A fresh source crawl found **109 HTML documents and 87 indexable pages**: 28 articles, 20 niche pages, 7 city pages, 3 cases and the supporting/service layer. The key blockers are not another large batch of URLs. They are:

1. only three verifiable case URLs instead of the five-case 90-day target;
2. no approved client reviews or before/after business/search evidence;
3. unresolved search-intent overlap between the home page, the national service page, the business-site page and the Ukraine geo page;
4. weak contextual proof links from money pages and weak inlink support for many article/niche URLs;
5. incomplete author/entity evidence and structured-data fields;
6. the initial 35 short-description gap has been remediated in the current working tree, but still needs final QA and deployment verification;
7. no completed 16-month GSC/backlink cleanup decision set;
8. linkable assets and off-page placements are only partially delivered.

No indexation, canonical or redirect decision should be made from this document alone. The required GSC export and backlink evidence are not present in the repository.

## Audit method and evidence limits

- Parsed current HTML source, excluding `.git`, `node_modules`, `release` and `artifacts`.
- Counted indexability from the robots meta directive and the explicit 404 exception.
- Counted incoming links by distinct source URL, not raw repeated links.
- Reviewed current keyword/intent maps, case pages, About/founder pages, organization schema, city registry, content plans, download assets and off-page policy.
- Compared main-body five-word shingles for the four overlapping URL candidates. This detects literal copy reuse only; it is **not** a substitute for a live SERP overlap sample or GSC query/page data.
- Did not use old report counts as current facts. `docs/seo/route-inventory.csv` is stale: it records 104 documents, 78 indexable pages, 3 indexable cities and 2 cases, while the current source has 109/87/7/3.

## Fresh source inventory

| Type | Indexable source documents |
|---|---:|
| Home | 1 |
| Service/supporting pages | 24 |
| City directory | 1 |
| City pages | 7 |
| Niche directory | 1 |
| Niche pages | 20 |
| Blog directory | 1 |
| Articles | 28 |
| Portfolio directory | 1 |
| Cases | 3 |
| **Total** | **87** |

## Query-to-URL ownership and cannibalization

| Intent | Current owner | Source finding | Safe decision now |
|---|---|---|---|
| Brand / entity | `/` | Keyword map says brand owner, but title and H1 also target generic sites, SEO and Google Ads | Keep; sharpen brand/entity emphasis only after query/page baseline is saved |
| National “site under key” | `/stvorennya-saytiv/` | Clear commercial title/H1 and the primary national owner in the map | Keep as national money-page owner |
| Business website | `/stvorennya-saytu-dlya-biznesu/` | Distinct multi-page business framing, but vocabulary overlaps the national owner | Keep pending 16-month query/page comparison |
| Ukraine geo | `/mista/stvorennya-sajtiv-ukrayina/` | Title/H1 compete for national “sites for business in Ukraine” language and the page has only two distinct inlink sources | Preserve for now; evaluate for consolidation only after GSC/link evidence |

Main-content five-word shingle overlap was low: home ↔ national 0.15%, home ↔ business 0.11%, home ↔ Ukraine 0.09%, national ↔ business 6.26%, national ↔ Ukraine 0%, business ↔ Ukraine 0.07%. These values show that the bodies are not literal copies; they do **not** prove separate search intent.

Required before a 301, noindex or owner change:

1. 16-month GSC query export and page export (or all available history if the property is newer), including clicks, impressions, CTR and position;
2. current backlinks/referring domains by URL;
3. two dated organic top-10 samples for the competing query pair, with country, language and device recorded;
4. revenue/lead role of each URL from GA4/CRM without PII;
5. proposed destination, link migration plan, rollback and 2/7/14/30-day monitoring.

The working decisions are recorded in `master-4-0-query-url-decision-register.csv`.

## Internal-link and proof-flow audit

Fresh link-graph facts:

- **42 indexable pages** have no more than two distinct internal source pages linking to them.
- Individual case inlink sources: Formula Chystoty 9, MAX SITE 7, FO-DEZ 6.
- Home plus seven principal money pages currently have **zero direct links to individual case URLs**. Generic `/portfolio/` links do not satisfy a relevant case-to-offer proof bridge.
- The exact-ish anchor “Створення сайтів під ключ” appears about 177 times in source references, largely because of shared navigation/footer patterns. This should be replaced in shared chrome with branded or descriptive variants; exact commercial anchors should be contextual, not sitewide.
- Every article tested has at least one link to a relevant commercial page, but many articles have only one or two distinct sources linking into them.
- Most unsupported niche pages receive only the niche directory as an inlink and have no relevant verified case.

Recommended implementation order:

1. Add contextual proof blocks on the national, business, landing, corporate and SEO-build money pages using only the three existing case URLs where relevant.
2. Do not force 2–4 cases onto a service if no relevant evidence exists. Custom software and ecommerce need a real matching case before they can meet the intended proof depth.
3. Link each case back to its actual service, niche and city context. Do not imply the project operated in a city unless verified.
4. Create 2–4 contextual inlinks to priority articles from related money, case and guide pages.
5. Remove exact-match commercial anchor repetition from shared footer/header templates; retain natural branded anchors.

### Exact money-page case-link plan

All eight URLs below had zero direct links to individual cases at audit time. Use the anchors as natural editorial labels, not as a sitewide block copied verbatim. “Adjacent proof” demonstrates a process or implementation pattern; it must not be presented as a sector-specific case.

| Money page | Direct case links to add | Safe anchor text | Evidence note |
|---|---|---|---|
| `/` | `/portfolio/formula-chystoty/` | Кейс сервісного сайту «Формула Чистоти» | Relevant client implementation |
| `/` | `/portfolio/fo-dez/` | Як побудовано сайт послуг FO-DEZ | Relevant client implementation |
| `/` | `/portfolio/max-site/` | Self-case архітектури MAX SITE | Must retain the self-case label |
| `/stvorennya-saytiv/` | `/portfolio/formula-chystoty/` | Структура та мобільні звернення у «Формулі Чистоти» | Relevant website build |
| `/stvorennya-saytiv/` | `/portfolio/fo-dez/` | Архітектура послуг і CTA у FO-DEZ | Relevant website build |
| `/stvorennya-saytiv/` | `/portfolio/max-site/` | Як MAX SITE перевіряє власну SEO-архітектуру | Self-case, no ranking claim |
| `/stvorennya-saytu-dlya-biznesu/` | `/portfolio/formula-chystoty/` | Бізнес-сайт «Формули Чистоти» | Relevant service-business case |
| `/stvorennya-saytu-dlya-biznesu/` | `/portfolio/fo-dez/` | Бізнес-сайт FO-DEZ | Relevant service-business case |
| `/stvorennya-saytu-dlya-biznesu/` | `/portfolio/max-site/` | Self-case бізнес-платформи MAX SITE | Self-case, qualitative only |
| `/stvorennya-program/` | `/portfolio/max-site/` | Сценарії аналітики й контролю заявок у MAX SITE | Adjacent proof only; not a software client case |
| `/stvorennya-program/` | `/portfolio/formula-chystoty/` | Форми та мобільні сценарії у «Формулі Чистоти» | Adjacent integration proof only |
| `/stvorennya-program/` | `/portfolio/fo-dez/` | Сценарії звернення у FO-DEZ | Adjacent integration proof only |
| `/stvorennya-landing-page/` | `/portfolio/formula-chystoty/` | Конверсійні сценарії «Формули Чистоти» | Relevant landing-pattern proof; do not call it a one-page project unless verified |
| `/stvorennya-landing-page/` | `/portfolio/fo-dez/` | Мобільні CTA та контактний сценарій FO-DEZ | Relevant landing-pattern proof |
| `/stvorennya-landing-page/` | `/portfolio/max-site/` | CTA та адаптивні сценарії у self-case MAX SITE | Adjacent self-case proof |
| `/stvorennya-korporatyvnoho-saytu/` | `/portfolio/formula-chystoty/` | Структура послуг компанії «Формула Чистоти» | Adjacent multi-page proof; not labelled corporate unless verified |
| `/stvorennya-korporatyvnoho-saytu/` | `/portfolio/fo-dez/` | Представлення напрямів компанії FO-DEZ | Adjacent multi-page proof |
| `/stvorennya-korporatyvnoho-saytu/` | `/portfolio/max-site/` | Архітектура напрямів у self-case MAX SITE | Adjacent self-case proof |
| `/stvorennya-internet-mahazynu/` | `/portfolio/max-site/` | Технічна SEO-архітектура у self-case MAX SITE | Adjacent technical proof only; not ecommerce evidence |
| `/stvorennya-internet-mahazynu/` | `/portfolio/formula-chystoty/` | Мобільний шлях до заявки у «Формулі Чистоти» | Adjacent conversion proof only |
| `/stvorennya-internet-mahazynu/` | `/portfolio/fo-dez/` | Адаптивні CTA у FO-DEZ | Adjacent conversion proof only |
| `/seo-sajt-pid-google/` | `/portfolio/max-site/` | Self-case SEO-архітектури та QA MAX SITE | Relevant technical self-case |
| `/seo-sajt-pid-google/` | `/portfolio/formula-chystoty/` | SEO-структура послуг «Формули Чистоти» | Relevant qualitative case; no ranking claim |
| `/seo-sajt-pid-google/` | `/portfolio/fo-dez/` | Тематичні URL і внутрішні переходи FO-DEZ | Relevant qualitative case; no ranking claim |

For `/stvorennya-program/` and `/stvorennya-internet-mahazynu/`, the present set does **not** satisfy a genuine sector-case target. If these links are added, the block must be called “Суміжні приклади підходу”, not “Кейси програм” or “Кейси інтернет-магазинів”. Two real matching cases remain an evidence gate.

The URL-level queue is in `master-4-0-internal-link-actions.csv`.

## Cases and evidence

| Requirement | Formula Chystoty | FO-DEZ | MAX SITE self-case |
|---|---|---|---|
| Name, niche and live URL | Present | Present | Present |
| Public verification date | 2026-09-02 | 2026-09-02 | Local build captures dated 2026-09-02 |
| Problem and constraints | Present | Present | Present |
| Scope / IA / UX / technical outline | Present | Present | Present |
| SEO and analytics outline | Present, qualitative | Present, qualitative | Present, qualitative |
| Client publication permission | DATA REQUIRED | DATA REQUIRED | Not a client case |
| Launch date | DATA REQUIRED | DATA REQUIRED | DATA REQUIRED if published as a dated launch |
| Initial KPI and baseline | DATA REQUIRED | DATA REQUIRED | Baseline evidence exists in internal reports but needs an approved public presentation |
| Before/after GSC, GA4, CWV or leads | DATA REQUIRED | DATA REQUIRED | DATA REQUIRED for public quantitative claims |
| Approved client review | DATA REQUIRED | DATA REQUIRED | Not applicable |

Only **three** case URLs exist. The five-case target cannot be truthfully marked complete until two real projects, scope, live URL, screenshots/data and publication permission are supplied. The repository names Benish Group as a conditional candidate, but it must not be published before real launch and permission. Use `master-4-0-case-evidence-intake.md` for both missing cases and metric upgrades to the current cases.

## About, founder, reviews and entity schema

What is already present:

- `/pro-nas/` explains process, ownership of access, client controls, contract scope, staged payment, warranty boundaries and remote coverage.
- `/zasnovnyk/` explains responsibilities, QA, access control and evidence policy.
- A real founder photo is used.
- Schema does not fabricate ratings: current source contains 0 `Review` and 0 `AggregateRating` nodes; `seo/reviews.json` is intentionally empty.
- Public `sameAs` values currently include Telegram and Instagram where normalized.

Evidence gaps:

- founder full public name: DATA REQUIRED;
- legal entity / approved legal wording: DATA REQUIRED;
- verified public experience/certifications: DATA REQUIRED;
- client reviews with written publication permission and source: DATA REQUIRED;
- legalName: missing from all Organization nodes and must not be guessed;
- Organization `image`, `founder` and `contactPoint`: missing from all 107 detected Organization nodes;
- only one Person node exists and its visible/schema name is the generic “Засновник MAX SITE”; it must not be replaced with a guessed identity.

Safe schema sequence:

1. Add a verified logo/image URL and a phone `ContactPoint` only if the visible phone and service coverage remain current.
2. Add `founder` only together with the approved public full name and matching visible biography.
3. Add `legalName` only from approved legal documentation.
4. Keep `Review`/`AggregateRating` absent until eligible reviews exist and the visible page presents the same evidence.

## City Wave 1 and geo quality

Current indexable city/geo URLs are Kyiv, Lviv, Odesa, Dnipro, Kharkiv, Cherkasy and Ukraine. The five requested Wave 1 cities have hand-authored scenarios and passed the existing local similarity gate. Cherkasy is supported by the cleaning case. Ukraine remains a national geo hub pending the cannibalization decision.

All other city files should remain noindex until they pass the content gate. A city page needs at least four of the following six before indexation:

1. dated local SERP-intent evidence;
2. real service availability;
3. unique city economics or buying context with a source;
4. a city case or verified city experience;
5. contextual links from the city directory/cases;
6. content that is not a doorway or city-name substitution.

No new city × service URLs are approved.

## Article and niche cleanup

The current source has 28 indexable articles and 20 indexable niche pages.

- The pre-remediation audit found 35 indexable meta descriptions shorter than 110 characters. The current working tree now has **0 descriptions below 110 and 0 above 170 characters**. This is an editorial quality improvement, not a ranking guarantee; final diff, build and production-source verification remain required.
- All 28 articles have a visible MAX SITE author/editor signal, but three lack a reliable substantive review date and nine additional articles lack a visible primary-source section where factual claims may need support.
- Most articles have only one or two distinct internal inlink sources.
- Only cleaning has a directly relevant verified client case. Several rebuilt niche pages link to the MAX SITE self-case, which proves site architecture/QA but does not prove sector client results.
- No keep/merge/noindex/410 decision is safe without GSC history, backlinks, intent fit and unique-value review.

`master-4-0-content-pruning-inventory.csv` preserves the pre-remediation description lengths and recommended actions as an audit trail. Its index decisions remain current: it is not a deletion list, and “HOLD_EVALUATE” means preserve the URL until the data gate is complete.

## Linkable assets

Delivered and public-ready in source:

- budget estimator with transparent MAX SITE starting-price assumptions;
- downloadable brief;
- downloadable technical-specification template;
- downloadable launch/QA checklist;
- technology comparison covering Next.js and WordPress;
- city-page decision guidance and an internal decision gate.

Still required:

- 2026 Ukraine pricing research using 50–100 comparable public proposals, dated methodology, table, median and ranges;
- a fuller TCO comparison covering Next.js, WordPress, Shopify and Horoshop with sourced platform facts;
- anonymized GSC/CWV benchmark based on owned and permitted datasets;
- five dated city SERP studies based on two complete organic top-10 samples each;
- calculator export/share result if the interactive tool is intended as a link-earning asset.

The delivery/gate register is in `master-4-0-linkable-assets-register.csv`.

## Off-page authority

No editorial placement or referring-domain result can be completed by adding a local file. The repository contains a safe policy and target cadence, but no placement evidence log was present. `master-4-0-outreach-log.csv` provides the required audit trail.

Target cadence remains 3–5 relevant referring domains per month, measured as a quality target rather than a guarantee. Prioritize client shared cases, technology partners, expert comments, Ukrainian business/digital publications, local founder communities, event contributions and original research. Prohibited: PBNs, rentals, mass catalogue packages, forced exchanges, hidden anchors, bought reviews and keyword-rich sitewide credits.

## Owner/data gates

| Gate | Why required | Safe state until supplied |
|---|---|---|
| GSC query + page exports | Cannibalization and cleanup decisions | Preserve current owner URLs; no redirect/noindex |
| Backlink export by URL | Merge/410/link equity risk | Preserve URLs |
| GA4/CRM aggregate export without PII | Business value and case results | No conversion/result claim |
| Founder public full name | Person/founder schema and biography | Keep generic role only |
| Legal wording/details | legalName and trust block | Omit legalName |
| Case permission, live URL, scope, screenshots and results | Two missing cases and upgrades to existing cases | Stay at three cases |
| Review text, author role, source and written permission | Review content/schema | Keep reviews empty |
| Public-proposal sample and method | Pricing research | Do not label internal tariffs as market research |
| Outreach approval and contact owner | Editorial links | Keep as planned/manual |

## Definition of done for this lane

- [x] Fresh source counts recorded without relying on stale inventory.
- [x] Four-way query ownership risk documented without premature redirect/noindex.
- [x] Current case/evidence completeness assessed.
- [x] About, founder, reviews and schema gaps assessed.
- [x] Wave 1 city scope and geo gate restated.
- [x] Article/niche cleanup inventory created.
- [x] Internal-link action queue created.
- [x] Case evidence intake created.
- [x] Linkable-asset register and outreach log created.
- [x] Rewrite the 35 short descriptions in the working tree; current range is 110–170 characters.
- [ ] Verify the rewritten descriptions in the final build and deployed production source.
- [ ] Add relevant case blocks and contextual inlinks in production source.
- [ ] Reduce shared exact-match anchor repetition.
- [ ] Supply GSC/backlink/GA4/CRM exports and make data-backed index decisions.
- [ ] Supply evidence and publish two additional full cases.
- [ ] Collect approved reviews and complete verified entity fields.
- [ ] Earn and verify off-page placements over elapsed time.

The unchecked items are production work, owner-data gates or time-dependent outcomes. They must not be marked complete from a document-only audit.
