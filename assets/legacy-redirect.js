/* GitHub Pages fallback only: the HTTP response remains 200, not a server 301. */
(() => {
  const targets = {
    '/stvorennya-lendingiv/': '/stvorennya-landing-page/',
    '/korporatyvni-sajty/': '/stvorennya-korporatyvnoho-saytu/',
    '/internet-magazyn-pid-klyuch/': '/stvorennya-internet-mahazynu/'
  };
  const pathname = location.pathname.replace(/index\.html$/, '');
  const target = targets[pathname];
  if (!target) return;
  // Keep attribution and anchor intact; destinations are an explicit same-origin allowlist.
  const destination = target + location.search + location.hash;
  const link = document.querySelector('[data-legacy-destination]');
  if (link) link.setAttribute('href', destination);
  location.replace(destination);
})();
