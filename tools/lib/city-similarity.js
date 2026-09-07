function substantiveMain(html) {
  let main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  // Only remove a complete, explicitly shared section. Never match across siblings.
  const tokens = [...main.matchAll(/<\/?section\b[^>]*>/gi)];
  const ranges = []; let depth = 0; let start = 0; let opening = '';
  for (const token of tokens) {
    if (!/^<\//.test(token[0])) {
      if (depth++ === 0) { start = token.index; opening = token[0]; }
    } else if (depth > 0 && --depth === 0) {
      const section = main.slice(start, token.index + token[0].length);
      const explicitShared = /data-seo-shared=["'](?:pricing|process|cta|navigation)["']/i.test(opening);
      const legacyShared = /class=["'][^"']*\b(?:seo-lead|seo-links)\b/i.test(opening) || /<span class="eyebrow">(?:Процес|Вартість|Вартість і строки)<\/span>/i.test(section);
      if ((explicitShared || legacyShared) && !/data-seo-city-specific=["']true["']/i.test(opening)) ranges.push([start, token.index + token[0].length]);
    }
  }
  for (const [from, to] of ranges.reverse()) main = main.slice(0, from) + ' ' + main.slice(to);
  return main.replace(/<(script|style|form|nav)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
}
function normalize(html) {
  return substantiveMain(html).replace(/<[^>]+>/g, ' ').replace(/&[a-z0-9#]+;/gi,' ').toLowerCase().replace(/[^a-zа-яіїєґ0-9\s-]/gi,' ').replace(/\s+/g,' ').trim();
}
function ngrams(text, size=5) {
  const words=text.split(/\s+/).filter(Boolean); const result=new Set();
  for (let i=0;i<=words.length-size;i++) result.add(words.slice(i,i+size).join(' '));
  return result;
}
module.exports={normalize,ngrams,substantiveMain};
