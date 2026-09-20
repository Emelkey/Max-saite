// Public HTML/HTTP evidence only. A successful check is NOT Google index status.
const { createHash } = require('node:crypto');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
  .map(match => [match[1].toLowerCase(), (match[2] ?? match[3] ?? match[4]).replace(/&amp;/g, '&')]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => attrs(match[0]));
const blocked = value => /(?:^|[,\s])(?:noindex|none)(?:$|[,\s])/i.test(value || '');

function inspectHtml(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || html;
  const meta = tags(head, 'meta');
  const canonicals = tags(head, 'link').filter(t => (t.rel || '').toLowerCase().split(/\s+/).includes('canonical')).map(t => t.href || '');
  const directives = meta.filter(t => /^(robots|googlebot)$/i.test(t.name || '')).map(t => ({ name: t.name, content: t.content || '' }));
  const h1Count = (html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').match(/<h1\b/gi) || []).length;
  return { canonicals, directives, metaNoindex: directives.some(t => blocked(t.content)), h1Count,
    title: head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null };
}

// X-Robots-Tag values can be scoped to a bot. Do not call otherbot:noindex a Google block.
function googleHeaderNoindex(value = '') {
  let scope = '*';
  return value.split(',').some(part => {
    const scoped = part.trim().match(/^([\w*-]+)\s*:\s*(.*)$/);
    if (scoped) { scope = scoped[1].toLowerCase(); part = scoped[2]; }
    return ['*', 'googlebot'].includes(scope) && blocked(part.trim());
  });
}

function evaluateObservation(row, { origin, expectedCanonical }) {
  const issues = [];
  if (row.error) issues.push('FETCH_ERROR');
  const last = row.chain?.at(-1);
  if (!last || last.status !== 200) issues.push('HTTP_NOT_200');
  if ((row.chain?.length || 0) > 1) issues.push('CANONICAL_ROUTE_REDIRECTS');
  if (row.contentType && !/text\/html/i.test(row.contentType)) issues.push('NOT_HTML');
  if (row.metaNoindex || googleHeaderNoindex(row.xRobotsTag)) issues.push('NOINDEX');
  if ((row.canonicals || []).length !== 1 || row.canonicals[0] !== expectedCanonical) issues.push('CANONICAL_MISMATCH');
  if (row.h1Count !== 1) issues.push('H1_COUNT');
  if (!row.title) issues.push('MISSING_TITLE');
  if (last && new URL(last.url).origin !== origin) issues.push('FINAL_ORIGIN_MISMATCH');
  return { ...row, expectedCanonical, issues, htmlHttpPass: issues.length === 0,
    googleIndexStatus: 'NOT_CHECKED', robotsTxtPolicyStatus: 'NOT_EVALUATED',
    scope: 'HTTP response + HTML directives. No claim about Google-selected canonical, robots.txt rules, indexing or ranking.' };
}

function summarize(rows, expectedRoutes) {
  const pages = rows.filter(row => expectedRoutes.has(row.route));
  const missing = [...expectedRoutes].filter(route => !pages.some(row => row.route === route));
  return { expectedPageCount: expectedRoutes.size, observedPageCount: pages.length,
    htmlHttpPassed: pages.filter(r => r.htmlHttpPass).length,
    htmlHttpFailed: pages.filter(r => !r.htmlHttpPass).length,
    missingRoutes: missing, fetchErrors: rows.filter(r => r.error).length,
    issues: pages.flatMap(r => (r.issues || []).map(issue => ({ route: r.route, issue }))),
    ok: expectedRoutes.size > 0 && !missing.length && pages.length === expectedRoutes.size && pages.every(r => r.htmlHttpPass) && !rows.some(r => r.error),
    googleIndexStatus: 'NOT_CHECKED', robotsTxtPolicyStatus: 'NOT_EVALUATED' };
}
module.exports = { inspectHtml, googleHeaderNoindex, evaluateObservation, summarize, sha256 };
