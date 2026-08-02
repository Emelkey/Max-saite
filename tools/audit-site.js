const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const getOption = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : "";
};

const root = path.resolve(getOption("--root") || path.resolve(__dirname, ".."));
const publicBase = (getOption("--site-url") || "https://maxsite.com.ua").replace(/\/$/, "");
const configuredPublicPath = getOption("--public-path");
const repoBasePath = configuredPublicPath
  ? configuredPublicPath === "/"
    ? ""
    : `/${configuredPublicPath.replace(/^\/+|\/+$/g, "")}`
  : new URL(publicBase).pathname.replace(/\/$/, "");
const errors = [];

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const routeToFile = (route) => {
  let clean = route.replace(/[?#].*$/, "");
  if (clean.startsWith(publicBase)) clean = clean.slice(publicBase.length);
  if (clean.startsWith(repoBasePath)) clean = clean.slice(repoBasePath.length);
  clean = decodeURIComponent(clean).replace(/^\/+/, "");

  if (!clean || clean.endsWith("/")) return path.join(root, clean, "index.html");
  return path.join(root, clean);
};

const fileRoute = (file) => {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
};

const internalLinks = [];

for (const url of urls) {
  const file = routeToFile(url);
  if (!fs.existsSync(file)) {
    errors.push(`Sitemap URL has no file: ${url}`);
    continue;
  }

  const html = fs.readFileSync(file, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  const descriptionTag = html.match(/<meta\s+[^>]*name="description"[^>]*>/i)?.[0];
  const description = descriptionTag?.match(/content="([^"]+)"/)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]?.trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!title) errors.push(`Missing title: ${fileRoute(file)}`);
  if (!description) errors.push(`Missing description: ${fileRoute(file)}`);
  if (!canonical) errors.push(`Missing canonical: ${fileRoute(file)}`);
  if (canonical && canonical !== url) errors.push(`Canonical mismatch: ${fileRoute(file)} -> ${canonical}`);
  if (h1Count !== 1) errors.push(`Expected one H1, found ${h1Count}: ${fileRoute(file)}`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`Invalid JSON-LD: ${fileRoute(file)} (${error.message})`);
    }
  }

  for (const match of html.matchAll(/\shref="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|viber:|javascript:|#)/i.test(href)) continue;

    if (
      href.startsWith("/") &&
      repoBasePath &&
      !href.startsWith(`${repoBasePath}/`) &&
      href !== repoBasePath
    ) {
      errors.push(`Root-absolute link escapes GitHub Pages base: ${fileRoute(file)} -> ${href}`);
      continue;
    }

    let target;
    if (href.startsWith("/")) {
      target = routeToFile(href);
    } else {
      const currentDirectory = path.dirname(file);
      const cleanHref = href.replace(/[?#].*$/, "");
      target = path.resolve(currentDirectory, cleanHref);
      if (!path.extname(target) || cleanHref.endsWith("/")) target = path.join(target, "index.html");
    }

    internalLinks.push([fileRoute(file), href]);
    if (!fs.existsSync(target)) errors.push(`Broken internal link: ${fileRoute(file)} -> ${href}`);
  }
}

const notFound = fs.readFileSync(path.join(root, "404.html"), "utf8");
if (!/<meta name="robots" content="noindex(?:,\s*nofollow)?"/i.test(notFound)) {
  errors.push("404.html must remain noindex");
}

const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
if (!robots.includes(`${publicBase}/sitemap.xml`)) errors.push("robots.txt has an incorrect sitemap URL");

const telegramConfig = fs.readFileSync(path.join(root, "assets/telegram-config.js"), "utf8");
const mainScript = fs.readFileSync(path.join(root, "script.js"), "utf8");
const telegramEndpoint = telegramConfig.match(/endpoint:\s*"([^"]*)"/)?.[1] || "";
if (telegramEndpoint && !/^https:\/\//i.test(telegramEndpoint)) {
  errors.push("Telegram endpoint must use HTTPS");
}
if (!mainScript.includes('telegramConfig.username || "MaxMytt"')) errors.push("Telegram fallback username is missing");

console.log(`Sitemap URLs: ${urls.length}`);
console.log(`Pages with complete basic SEO checks: ${urls.length - errors.filter((error) => /title|description|canonical|H1|JSON-LD/.test(error)).length}/${urls.length}`);
console.log(`Internal links checked: ${internalLinks.length}`);
console.log(`Errors: ${errors.length}`);

if (errors.length) {
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}
