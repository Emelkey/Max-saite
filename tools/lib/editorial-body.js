// Case studies use a main/section layout; blog posts use article.article-body.
// Never count the global header, footer or lead form as editorial substance.
function editorialBody(html, route) {
  const article = html.match(/<article\b[^>]*class="[^"]*\barticle-body\b[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
  if (article) return article[1];
  if (!route.startsWith('/portfolio/')) return '';
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  return main.split(/<section\b[^>]*class="[^"]*\bseo-lead\b/i)[0]
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ');
}
module.exports = { editorialBody };
