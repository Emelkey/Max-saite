const entity = require('../../seo/site-entity.json');
const text = value => value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const types = node => [].concat(node?.['@type'] || []);

function buildGraph({nodes, canonical, title, description, main}) {
  // MAX SITE publicly describes a remote Ukraine-wide service and does not
  // publish a verified customer-facing office address. ProfessionalService is
  // a LocalBusiness subtype, so retaining it would imply a physical location.
  const retained = nodes.filter(node => !types(node).some(type => ['Organization', 'WebSite', 'WebPage', 'FAQPage', 'ProfessionalService'].includes(type)));
  const questions = [...main.matchAll(/<details\b[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)].map(match => ({
    '@type': 'Question', name: text(match[1]), acceptedAnswer: {'@type': 'Answer', text: text(match[2])}
  })).filter(question => question.name && question.acceptedAnswer.text);
  for (const node of retained) {
    // Only these articles received a substantive, dated MASTER 4 editorial review.
    // Preserve publication dates and do not stamp unrelated pages on each build.
    if (/\/blog\/[^/]+\/$/.test(canonical) && /data-master4-editorial/.test(main) && types(node).includes('Article')) {
      node.dateModified = '2026-09-07';
    }
    if (/\/portfolio\/[^/]+\/$/.test(canonical) && types(node).some(type => ['CreativeWork','Article'].includes(type))) {
      node['@type'] = 'Article';
      node['@id'] = `${canonical}#article`;
      node.headline = text(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || title);
      node.mainEntityOfPage = {'@id': `${canonical}#webpage`};
      node.author = {'@id': entity.organization['@id']};
      node.publisher = {'@id': entity.organization['@id']};
      node.dateModified = '2026-09-02';
    }
    if (types(node).includes('Service')) {
      node['@id'] ||= `${canonical}#service`;
      node.url = canonical;
      node.provider = {'@id': entity.organization['@id']};
      node.areaServed ||= 'UA';
    }
  }
  return {'@context': 'https://schema.org', '@graph': [
    entity.organization,
    {...entity.website, inLanguage: 'uk-UA'},
    {'@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, inLanguage: 'uk-UA', isPartOf: {'@id': entity.website['@id']}},
    ...retained,
    ...(questions.length ? [{'@type': 'FAQPage', '@id': `${canonical}#faq`, mainEntity: questions}] : [])
  ]};
}
module.exports = {buildGraph};
