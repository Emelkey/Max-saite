// Shared, build-time enhancement of the legacy static page shell. No runtime
// injection, third-party scripts, embeds, cookies or analytics are introduced.
const INSTAGRAM_URL = 'https://www.instagram.com/maxlab.ai/';
const icon = '<svg class="instagram-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
function instagramLink(extraClass = '') {
  return `<a class="instagram-link ${extraClass}" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" aria-label="Instagram MAX SITE @maxlab.ai (нова вкладка)">${icon}<span>Instagram</span></a>`;
}
function enhanceInstagramShell(html) {
  if (!/<header\b[^>]*class="site-header"/.test(html)) return html;
  return html.replace(/(<nav\b[^>]*class="main-nav"[^>]*>)([\s\S]*?)(<\/nav>)/, (match, open, content, close) =>
    content.includes('instagram-link') ? match : open + content + instagramLink('instagram-nav') + close
  ).replace(/<a href="https:\/\/www\.instagram\.com\/maxlab\.ai\/">Instagram<\/a>/g, instagramLink());
}
module.exports = { INSTAGRAM_URL, enhanceInstagramShell };
