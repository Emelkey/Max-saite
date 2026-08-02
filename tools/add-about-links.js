const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function collectHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if ([".git", "release", "node_modules"].includes(entry.name)) return [];
      return collectHtml(target);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [target] : [];
  });
}

let changed = 0;

const googleTag = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-1YBWT9NNR1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-1YBWT9NNR1');
  </script>`;

for (const file of collectHtml(root)) {
  let html = fs.readFileSync(file, "utf8");
  const original = html;

  html = html.replaceAll("G-TS8DMMKK34", "G-1YBWT9NNR1");

  if (!html.includes("googletagmanager.com/gtag/js?id=G-1YBWT9NNR1")) {
    html = html.replace(/<head>(\s*)/i, `<head>\n${googleTag}$1`);
  }

  html = html.replace(
    /(<a href="[^"]*portfolio\/?">Портфоліо<\/a>)(\s*)(<a href="[^"]*blog\/?">Блог<\/a>)/g,
    '$1$2<a href="/pro-nas/">Про нас</a>$2$3'
  );

  html = html.replace(
    /(<div><h3>Компанія<\/h3><a href="[^"]*portfolio\/?">Портфоліо \/ Кейси<\/a>)(?!<a href="[^"]*pro-nas)/g,
    '$1<a href="/pro-nas/">Про нас</a>'
  );

  html = html.replace(/<a href="index\.html">Про нас<\/a>/g, '<a href="/pro-nas/">Про нас</a>');

  html = html
    .replace(/styles\.css\?v=[^"']+/g, "styles.css?v=20260802-trust-v2")
    .replace(/assets\/analytics-config\.js\?v=[^"']+/g, "assets/analytics-config.js?v=20260802-ga4-property")
    .replace(/script\.js\?v=[^"']+/g, "script.js?v=20260802-p0-final");

  if (html !== original) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`HTML files updated with About links: ${changed}`);
