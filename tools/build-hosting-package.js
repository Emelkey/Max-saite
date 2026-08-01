const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const releaseRoot = path.join(root, "release");
const sourceSiteUrl = "https://emelkey.github.io/Max-saite";
const sourceBasePath = "/Max-saite/";

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(name);
const getOption = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : "";
};

const staging = hasFlag("--staging");
const requestedUrl = getOption("--site-url");
const verificationToken = getOption("--search-console-token");
const formEndpoint = getOption("--form-endpoint");
const ga4Id = getOption("--ga4");
const gtmId = getOption("--gtm");

if (!staging && !requestedUrl) {
  console.error("Production package requires --site-url https://your-domain.example");
  process.exit(1);
}

if (ga4Id && !/^G-[A-Z0-9]+$/i.test(ga4Id)) {
  console.error("Invalid GA4 Measurement ID. Expected G-XXXXXXXXXX.");
  process.exit(1);
}

if (gtmId && !/^GTM-[A-Z0-9]+$/i.test(gtmId)) {
  console.error("Invalid GTM Container ID. Expected GTM-XXXXXXX.");
  process.exit(1);
}

if (ga4Id && gtmId) {
  console.error("Use either --ga4 or --gtm, not both.");
  process.exit(1);
}

let targetSiteUrl = sourceSiteUrl;
let targetBasePath = "/";
let targetHostname = "";

if (requestedUrl) {
  const parsedUrl = new URL(requestedUrl);
  if (parsedUrl.protocol !== "https:") {
    console.error("The production site URL must use HTTPS.");
    process.exit(1);
  }

  targetBasePath = parsedUrl.pathname.replace(/\/+$/, "") || "/";
  if (!targetBasePath.endsWith("/")) targetBasePath += "/";
  targetSiteUrl = `${parsedUrl.origin}${targetBasePath === "/" ? "" : targetBasePath.slice(0, -1)}`;
  targetHostname = parsedUrl.hostname;
}

const packageName = staging ? "max-site-staging" : "max-site-production";
const outputDirectory = path.join(releaseRoot, packageName);
const zipPath = path.join(releaseRoot, `${packageName}.zip`);

const publicRootFiles = new Set([
  ".nojekyll",
  "404.html",
  "index.html",
  "privacy.html",
  "robots.txt",
  "script.js",
  "sitemap.xml",
  "styles.css",
]);

const excludedDirectories = new Set([
  ".git",
  ".github",
  ".wrangler",
  "release",
  "tools",
]);

const isTextFile = (file) => /\.(?:html|js|css|xml|txt)$/i.test(file);

const copyEntry = (source, destination) => {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const name of fs.readdirSync(source)) {
      copyEntry(path.join(source, name), path.join(destination, name));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

const addNoindex = (html) => {
  if (/<meta name="robots"[^>]*noindex/i.test(html)) return html;
  return html.replace(/(<meta name="viewport"[^>]*>)/i, '$1<meta name="robots" content="noindex, nofollow" />');
};

const addSearchConsoleToken = (html) => {
  if (!verificationToken) return html;
  const cleanToken = verificationToken.replace(/^.*content=["']?/, "").replace(/["'>].*$/, "").trim();
  if (!cleanToken) return html;
  return html.replace(/(<meta name="viewport"[^>]*>)/i, `$1<meta name="google-site-verification" content="${cleanToken}" />`);
};

const configureAnalytics = (content) => {
  if (!ga4Id && !gtmId) return content;
  return content
    .replace(/enabled:\s*false/, "enabled: true")
    .replace(/measurementId:\s*"[^"]*"/, `measurementId: "${ga4Id || ""}"`)
    .replace(/tagManagerId:\s*"[^"]*"/, `tagManagerId: "${gtmId || ""}"`);
};

const configureFormEndpoint = (content) => {
  if (!formEndpoint) return content;
  const endpoint = new URL(formEndpoint);
  if (endpoint.protocol !== "https:") throw new Error("Form endpoint must use HTTPS.");
  return content.replace(/endpoint:\s*"[^"]*"/, `endpoint: "${endpoint.href.replace(/\/$/, "")}"`);
};

fs.mkdirSync(releaseRoot, { recursive: true });
fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.rmSync(zipPath, { force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const name of fs.readdirSync(root)) {
  const source = path.join(root, name);
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    if (!excludedDirectories.has(name)) copyEntry(source, path.join(outputDirectory, name));
  } else if (publicRootFiles.has(name)) {
    copyEntry(source, path.join(outputDirectory, name));
  }
}

const transformDirectory = (directory) => {
  for (const name of fs.readdirSync(directory)) {
    const file = path.join(directory, name);
    const stat = fs.statSync(file);

    if (stat.isDirectory()) {
      transformDirectory(file);
      continue;
    }

    if (!isTextFile(file)) continue;

    let content = fs.readFileSync(file, "utf8");
    const publicUrlToken = "__MAX_SITE_PUBLIC_URL__";
    content = content.replaceAll(sourceSiteUrl, publicUrlToken);
    content = content.replaceAll(sourceBasePath, targetBasePath);
    content = content.replaceAll(publicUrlToken, staging ? sourceSiteUrl : targetSiteUrl);
    if (staging && file.endsWith(".html")) content = addNoindex(content);
    if (!staging && path.basename(file) === "index.html" && path.dirname(file) === outputDirectory) {
      content = addSearchConsoleToken(content);
    }
    if (file.endsWith("assets/analytics-config.js")) content = configureAnalytics(content);
    if (file.endsWith("assets/telegram-config.js")) content = configureFormEndpoint(content);

    fs.writeFileSync(file, content);
  }
};

transformDirectory(outputDirectory);

if (!staging && targetHostname) {
  fs.writeFileSync(path.join(outputDirectory, "CNAME"), `${targetHostname}\n`);
}

fs.writeFileSync(
  path.join(outputDirectory, ".htaccess"),
  [
    "DirectoryIndex index.html",
    "ErrorDocument 404 /404.html",
    "Options -Indexes",
    "",
    "<IfModule mod_headers.c>",
    "  Header always set X-Content-Type-Options nosniff",
    "  Header always set Referrer-Policy strict-origin-when-cross-origin",
    "  Header always set Permissions-Policy \"camera=(), microphone=(), geolocation=()\"",
    "</IfModule>",
    "",
  ].join("\n")
);

const htmlFiles = [];
const collectHtml = (directory) => {
  for (const name of fs.readdirSync(directory)) {
    const file = path.join(directory, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) collectHtml(file);
    else if (file.endsWith(".html")) htmlFiles.push(file);
  }
};
collectHtml(outputDirectory);

const errors = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (/(?:href|src)=["']\/Max-saite\//.test(html)) {
    errors.push(`Old root-relative base path remains in ${path.relative(outputDirectory, file)}`);
  }
  if (staging && !/<meta name="robots"[^>]*noindex/i.test(html)) errors.push(`Staging noindex missing in ${path.relative(outputDirectory, file)}`);
  if (!staging && html.includes(sourceSiteUrl)) errors.push(`Old public URL remains in ${path.relative(outputDirectory, file)}`);
}

const sitemap = fs.readFileSync(path.join(outputDirectory, "sitemap.xml"), "utf8");
const sitemapCount = [...sitemap.matchAll(/<loc>/g)].length;
if (sitemapCount !== 58) errors.push(`Expected 58 sitemap URLs, found ${sitemapCount}`);

if (errors.length) {
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const zip = spawnSync("zip", ["-qr", zipPath, packageName], {
  cwd: releaseRoot,
  encoding: "utf8",
});

if (zip.status !== 0) {
  console.error(zip.stderr || "Could not create ZIP archive.");
  process.exit(1);
}

console.log(`Mode: ${staging ? "staging (noindex)" : "production"}`);
console.log(`Public path: ${targetBasePath}`);
console.log(`HTML files: ${htmlFiles.length}`);
console.log(`Sitemap URLs: ${sitemapCount}`);
console.log(`Folder: ${outputDirectory}`);
console.log(`Archive: ${zipPath}`);
