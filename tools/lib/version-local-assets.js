const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const within = (parent, child) => child === parent || child.startsWith(parent + path.sep);
const decodeAmpersands = value => value.replace(/&(?:amp|#0*38|#x0*26);/gi, '&');

function fingerprintAssetUrl(value, { root, pageFile, siteUrl, publicBasePath = '/', cache = new Map(), kind }) {
  const decoded = decodeAmpersands(value);
  if (/^(?:data|javascript|blob):/i.test(decoded) || !decoded || decoded.startsWith('#')) return value;
  try {
    const origin = new URL(siteUrl).origin;
    if (!publicBasePath.startsWith('/') || !publicBasePath.endsWith('/')) throw Error('Invalid public base path');
    const relativePage = path.relative(root, pageFile);
    if (!within(path.resolve(root), path.resolve(pageFile))) return value;
    const pageUrl = new URL(relativePage.split(path.sep).map(encodeURIComponent).join('/'), origin + publicBasePath);
    const assetUrl = new URL(decoded, pageUrl);
    if (assetUrl.origin !== origin || !['http:', 'https:'].includes(assetUrl.protocol) || assetUrl.username || assetUrl.password) return value;
    if (!assetUrl.pathname.startsWith(publicBasePath)) return value;
    const relativeAsset = decodeURIComponent(assetUrl.pathname.slice(publicBasePath.length));
    if (relativeAsset.includes('\0') || relativeAsset.includes('\\')) return value;
    if (kind === 'script' ? !/\.m?js$/i.test(relativeAsset) : !/\.css$/i.test(relativeAsset)) return value;
    const rootReal = fs.realpathSync(root);
    const assetFile = path.resolve(root, relativeAsset);
    if (!within(path.resolve(root), assetFile)) return value;
    const assetReal = fs.realpathSync(assetFile);
    // Reject symlinks/traversal outside the generated public directory.
    if (!within(rootReal, assetReal) || !fs.statSync(assetReal).isFile()) return value;
    let digest = cache.get(assetReal);
    if (!digest) {
      digest = createHash('sha256').update(fs.readFileSync(assetReal)).digest('hex').slice(0, 16);
      cache.set(assetReal, digest);
    }
    const hashIndex = decoded.indexOf('#');
    const fragment = hashIndex === -1 ? '' : decoded.slice(hashIndex);
    const withoutFragment = hashIndex === -1 ? decoded : decoded.slice(0, hashIndex);
    const queryIndex = withoutFragment.indexOf('?');
    const originalPath = queryIndex === -1 ? withoutFragment : withoutFragment.slice(0, queryIndex);
    const parts = queryIndex === -1 ? [] : withoutFragment.slice(queryIndex + 1).split('&');
    let inserted = false;
    const versioned = [];
    for (const part of parts) {
      const name = part.split('=', 1)[0];
      let isVersion = false;
      try { isVersion = decodeURIComponent(name.replace(/\+/g, ' ')) === 'v'; } catch {}
      if (isVersion) {
        if (!inserted) versioned.push(`v=${digest}`);
        inserted = true;
      } else if (part) versioned.push(part);
    }
    if (!inserted) versioned.push(`v=${digest}`);
    return `${originalPath}?${versioned.join('&')}${fragment}`.replace(/&/g, '&amp;');
  } catch (error) {
    // Missing/invalid references remain unchanged for the existing link audit.
    // This function never resolves or reads outside the public build directory.
    return value;
  }
}

function versionHtmlAssets(html, options) {
  const scanner = /<!--[\s\S]*?-->|<(script|style|link)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  let output = '';
  let cursor = 0;
  let count = 0;
  let match;
  while ((match = scanner.exec(html))) {
    const kind = match[1]?.toLowerCase();
    let tag = match[0];
    const rel = tag.match(/\srel\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] || '';
    const attr = kind === 'script' ? 'src' : kind === 'link' && rel.toLowerCase().split(/\s+/).includes('stylesheet') ? 'href' : '';
    if (attr) {
      tag = tag.replace(new RegExp(`(\\s${attr}\\s*=\\s*)(["'])([\\s\\S]*?)\\2`, 'i'), (whole, prefix, quote, value) => {
        const updated = fingerprintAssetUrl(value, { ...options, kind: kind === 'script' ? 'script' : 'style' });
        if (updated !== value) count += 1;
        return prefix + quote + updated + quote;
      });
    }
    output += html.slice(cursor, match.index) + tag;
    cursor = scanner.lastIndex;
    // Inline JS/CSS and HTML comments are raw text; never rewrite tag-like strings inside them.
    if (kind === 'script' || kind === 'style') {
      const end = new RegExp(`</${kind}\\s*>`, 'gi');
      end.lastIndex = cursor;
      const closing = end.exec(html);
      const endIndex = closing ? end.lastIndex : html.length;
      output += html.slice(cursor, endIndex);
      cursor = endIndex;
      scanner.lastIndex = endIndex;
    }
  }
  return { html: output + html.slice(cursor), count };
}

function versionBuiltHtmlAssets(root, options) {
  const cache = new Map();
  let count = 0;
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && file.endsWith('.html')) {
        const original = fs.readFileSync(file, 'utf8');
        const result = versionHtmlAssets(original, { ...options, root, pageFile: file, cache });
        if (result.html !== original) fs.writeFileSync(file, result.html);
        count += result.count;
      }
    }
  }
  visit(root);
  return count;
}

module.exports = { fingerprintAssetUrl, versionHtmlAssets, versionBuiltHtmlAssets };
