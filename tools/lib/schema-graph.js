const entity = require('../../seo/site-entity.json');
const text = value => value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const types = node => [].concat(node?.['@type'] || []);

function buildGraph({nodes, canonical, title, description, main}) {
  const retained = nodes.filter(node => !types(node).some(type => ['Organization', 'WebSite', 'WebPage', 'FAQPage'].includes(type)));
  const questions = [...main.matchAll(/<details\b[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)].map(match => ({
    '@type': 'Question', name: text(match[1]), acceptedAnswer: {'@type': 'Answer', text: text(match[2])}
  })).filter(question => question.name && question.acceptedAnswer.text);
  for (const node of retained) {
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
