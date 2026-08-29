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
const titleOwners = new Map();
const descriptionOwners = new Map();
const auditedFiles = new Set();
const articleFaqOwners = new Map();

const sitemapIndex = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const childSitemaps = [...sitemapIndex.matchAll(/<sitemap>[\s\S]*?<loc>[^<]*\/([^/<>]+\.xml)<\/loc>[\s\S]*?<\/sitemap>/g)].map((match) => match[1]);
const sitemapDocuments = childSitemaps.length
  ? childSitemaps.map((name) => fs.readFileSync(path.join(root, name), "utf8"))
  : [sitemapIndex];
const sitemap = sitemapDocuments.join("\n");
const urls = [...sitemap.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g)].map((match) => match[1]);
const sitemapUrlSet = new Set(urls);

if (sitemapUrlSet.size !== urls.length) errors.push("Sitemap contains duplicate URLs");
for (const match of sitemap.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)) {
  const [, url, lastmod] = match;
  if (!url.startsWith(`${publicBase}/`)) errors.push(`Sitemap URL uses an unexpected domain: ${url}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) errors.push(`Invalid sitemap lastmod: ${url} -> ${lastmod}`);
  const todayInKyiv = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Kyiv" });
  if (lastmod > todayInKyiv) errors.push(`Future sitemap lastmod: ${url} -> ${lastmod}`);
}

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
  auditedFiles.add(path.resolve(file));
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  const descriptionTag = html.match(/<meta\s+[^>]*name="description"[^>]*>/i)?.[0];
  const description = descriptionTag?.match(/content="([^"]+)"/)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]?.trim();
  const robotsTag = html.match(/<meta\s+[^>]*name="robots"[^>]*>/i)?.[0];
  const robots = robotsTag?.match(/content="([^"]+)"/)?.[1]?.trim().toLowerCase();
  const openGraphUrl = html.match(/<meta\s+[^>]*property="og:url"[^>]*content="([^"]+)"[^>]*>/i)?.[1]?.trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const googleTagCount = (html.match(/googletagmanager\.com\/gtag\/js\?id=/g) || []).length;

  if (!title) errors.push(`Missing title: ${fileRoute(file)}`);
  if (!description) errors.push(`Missing description: ${fileRoute(file)}`);
  if (!canonical) errors.push(`Missing canonical: ${fileRoute(file)}`);
  if (canonical && canonical !== url) errors.push(`Canonical mismatch: ${fileRoute(file)} -> ${canonical}`);
  if (!robots || !robots.includes("index") || robots.includes("noindex")) errors.push(`Indexed sitemap page must use index robots: ${fileRoute(file)}`);
  if (!openGraphUrl) errors.push(`Missing og:url: ${fileRoute(file)}`);
  if (openGraphUrl && openGraphUrl !== url) errors.push(`og:url mismatch: ${fileRoute(file)} -> ${openGraphUrl}`);
  if (h1Count !== 1) errors.push(`Expected one H1, found ${h1Count}: ${fileRoute(file)}`);
  if (!html.includes('class="mobile-nav-phone"') || !html.includes('href="tel:+380972692322"')) {
    errors.push(`Missing mobile navigation phone link: ${fileRoute(file)}`);
  }
  if (!html.includes('class="floating-contact"')) {
    errors.push(`Missing persistent mobile contact panel: ${fileRoute(file)}`);
  }
  if (googleTagCount !== 1) errors.push(`Expected one Google tag, found ${googleTagCount}: ${fileRoute(file)}`);

  if (title) {
    if (titleOwners.has(title)) errors.push(`Duplicate title: ${fileRoute(file)} and ${titleOwners.get(title)}`);
    else titleOwners.set(title, fileRoute(file));
  }
  if (description) {
    if (descriptionOwners.has(description)) errors.push(`Duplicate description: ${fileRoute(file)} and ${descriptionOwners.get(description)}`);
    else descriptionOwners.set(description, fileRoute(file));
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const schema = JSON.parse(match[1]);
      const graph = schema["@graph"] || [schema];
      const article = graph.find((item) => item["@type"] === "Article");
      if (article) {
        if (!article.datePublished) errors.push(`Article schema missing datePublished: ${fileRoute(file)}`);
        if (!article.dateModified) errors.push(`Article schema missing dateModified: ${fileRoute(file)}`);
        if (!article.author) errors.push(`Article schema missing author: ${fileRoute(file)}`);
        if (!article.image) errors.push(`Article schema missing image: ${fileRoute(file)}`);
        if (!article.mainEntityOfPage) errors.push(`Article schema missing mainEntityOfPage: ${fileRoute(file)}`);

        const articleBody = html.match(/<article\b[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/article>/)?.[1] || "";
        const articleText = articleBody
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&[a-z#0-9]+;/gi, " ")
          .trim();
        const wordCount = articleText.split(/\s+/).filter(Boolean).length;
        if (wordCount < 180) errors.push(`Thin article (${wordCount} words): ${fileRoute(file)}`);

        const faq = graph.find((item) => item["@type"] === "FAQPage");
        if (faq?.mainEntity?.length) {
          const signature = JSON.stringify(faq.mainEntity);
          if (articleFaqOwners.has(signature)) {
            errors.push(`Duplicate article FAQ: ${fileRoute(file)} and ${articleFaqOwners.get(signature)}`);
          } else {
            articleFaqOwners.set(signature, fileRoute(file));
          }
        }
      }
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

const collectHtml = (directory) => {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "artifacts", "release", "node_modules"].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(file));
    else if (entry.name.endsWith(".html")) files.push(file);
  }
  return files;
};

for (const file of collectHtml(root)) {
  const html = fs.readFileSync(file, "utf8");
  const route = fileRoute(file);
  const robotsTag = html.match(/<meta\s+[^>]*name="robots"[^>]*>/i)?.[0] || "";
  const robots = robotsTag.match(/content="([^"]+)"/i)?.[1]?.toLowerCase() || "";
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1]?.trim();
  const googleTagCount = (html.match(/googletagmanager\.com\/gtag\/js\?id=/g) || []).length;
  const routeUrl = `${publicBase}${fileRoute(file)}`;

  if (/https:\/\/emelkey\.github\.io\/Max-saite|https:\/\/maxsite\.ua|\/Max-saite\//.test(html)) {
    errors.push(`Legacy domain or GitHub Pages base found: ${route}`);
  }
  if (googleTagCount !== 1) errors.push(`Expected one Google tag, found ${googleTagCount}: ${route}`);

  if (!auditedFiles.has(path.resolve(file))) {
    if (robots.includes("noindex")) {
      if (sitemapUrlSet.has(routeUrl)) errors.push(`Noindex page must not be in sitemap: ${route}`);
      if (route !== "/404.html" && (!canonical || !canonical.startsWith(publicBase))) {
        errors.push(`Noindex page has no valid production canonical: ${route}`);
      }
    } else if (route !== "/404.html") {
      errors.push(`Indexable HTML page is missing from sitemap: ${route}`);
    }
  }

  if (auditedFiles.has(path.resolve(file))) continue;
  for (const match of html.matchAll(/\shref="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|viber:|javascript:|#)/i.test(href)) continue;

    let target;
    if (href.startsWith("/")) {
      target = routeToFile(href);
    } else {
      const cleanHref = href.replace(/[?#].*$/, "");
      target = path.resolve(path.dirname(file), cleanHref);
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

const siteScript = fs.readFileSync(path.join(root, "script.js"), "utf8");
if (!siteScript.includes('trackEvent("click_phone"')) errors.push("Missing GA4 click_phone event");
if (!siteScript.includes('trackEvent("click_whatsapp"')) errors.push("Missing GA4 click_whatsapp event");
for (const eventName of [
  "phone_click",
  "messenger_click",
  "consultation_click",
  "portfolio_click",
  "price_cta",
  "brief_start",
  "brief_complete",
  "form_submit",
]) {
  if (!siteScript.includes(`trackEvent("${eventName}"`)) {
    errors.push(`Missing required GA4 event: ${eventName}`);
  }
}
if (!siteScript.includes('trackEvent("generate_lead"')) errors.push("Missing GA4 generate_lead event");
if (!siteScript.includes('trackEvent("lead_delivery_error"')) errors.push("Missing lead delivery error event");
if (/phone_number\s*:/.test(siteScript)) errors.push("Do not send phone numbers as GA4 event parameters");

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
