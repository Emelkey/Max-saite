#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const canonicalForLive = (html) => (html.match(/<link\b[^>]*>/gi) || [])
  .filter((tag) => /\brel\s*=\s*["']canonical["']/i.test(tag))
  .map((tag) => tag.match(/\bhref\s*=\s*["']([^"']*)["']/i)?.[1] || "");
const noindexInHtml = (html) => (html.match(/<meta\b[^>]*>/gi) || [])
  .some((tag) => /\bname\s*=\s*["'](?:robots|googlebot)["']/i.test(tag) && /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i.test(tag));

function httpsOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    throw new Error("Live edge verification requires an HTTPS origin without path, query or credentials");
  }
  return url;
}

async function fetchWithRetry(url, { request = fetch, sleep = wait } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await request(url, {
        method: "GET", redirect: "manual", signal: AbortSignal.timeout(12_000),
        headers: { "User-Agent": "MAX-SITE-ReadOnly-Edge-QA/4.0" },
      });
      return { response, attempt };
    } catch (error) {
      lastError = error;
      if (attempt < 4) await sleep(attempt * 1_000);
    }
  }
  throw lastError;
}

function checkSecurityHeaders(headers) {
  const maxAge = (headers["strict-transport-security"] || "").match(/(?:^|;)\s*max-age\s*=\s*(\d+)\s*(?:;|$)/i)?.[1];
  const permissions = headers["permissions-policy"] || "";
  return {
    "strict-transport-security": maxAge !== undefined && Number(maxAge) >= 31536000,
    "x-content-type-options": (headers["x-content-type-options"] || "").trim().toLowerCase() === "nosniff",
    "referrer-policy": (headers["referrer-policy"] || "").trim().toLowerCase() === "strict-origin-when-cross-origin",
    "permissions-policy": ["camera", "microphone", "geolocation"].every((feature) => new RegExp(`(?:^|,)\\s*${feature}\\s*=\\s*\\(\\s*\\)\\s*(?:,|$)`, "i").test(permissions)),
    "x-frame-options": (headers["x-frame-options"] || "").trim().toUpperCase() === "SAMEORIGIN",
    "content-security-policy-report-only": /(?:^|;)\s*default-src\s+'self'\s*(?:;|$)/i.test(headers["content-security-policy-report-only"] || ""),
  };
}

async function inspectRedirect(redirect, baseUrl, options = {}) {
  const sourceUrl = new URL(redirect.source, baseUrl);
  const expectedUrl = new URL(redirect.destination, baseUrl);
  const row = { kind: "redirect", source: sourceUrl.href, expectedStatus: 301, expectedLocation: expectedUrl.href, passed: false };
  try {
    if (sourceUrl.origin !== baseUrl.origin || expectedUrl.origin !== baseUrl.origin) throw new Error("Redirect contract must stay on the audited origin");
    const { response, attempt } = await fetchWithRetry(sourceUrl, options);
    const location = response.headers.get("location");
    await response.body?.cancel();
    Object.assign(row, { actualStatus: response.status, actualLocation: location ? new URL(location, sourceUrl).href : null, attempt });
    // Do not follow an unexpected Location, including an external host.
    if (row.actualStatus !== 301 || row.actualLocation !== expectedUrl.href) return row;
    const { response: target, attempt: targetAttempt } = await fetchWithRetry(expectedUrl, options);
    row.destination = { source: expectedUrl.href, actualStatus: target.status, attempt: targetAttempt, actualLocation: target.headers.get("location") };
    if (target.status !== 200) { await target.body?.cancel(); return row; }
    const html = await target.text();
    const canonicals = canonicalForLive(html);
    const expectedCanonical = new URL(redirect.destination, options.canonicalOrigin || baseUrl).href;
    const destinationChecks = {
      canonical: canonicals.length === 1 && canonicals[0] === expectedCanonical,
      indexable: !/\bnoindex\b/i.test(target.headers.get("x-robots-tag") || "") && !noindexInHtml(html),
      noClientRedirect: !/<meta\b[^>]*http-equiv\s*=\s*["']refresh["']/i.test(html),
    };
    Object.assign(row.destination, { expectedCanonical, canonicals, checks: destinationChecks });
    row.passed = Object.values(destinationChecks).every(Boolean);
  } catch (error) { row.error = error.message; }
  return row;
}

async function verifyLiveContract(redirects, { baseUrl: input, previewOrigin, ...options }) {
  const baseUrl = httpsOrigin(String(input));
  const preview = previewOrigin ? httpsOrigin(previewOrigin) : null;
  if (preview?.origin === baseUrl.origin) throw new Error("Preview origin must differ from the production origin");
  const observations = await Promise.all(redirects.map((redirect) => inspectRedirect(redirect, baseUrl, options)));
  const headerRow = { kind: "security-headers", source: new URL("/", baseUrl).href, passed: false };
  try {
    const { response, attempt } = await fetchWithRetry(new URL("/", baseUrl), options);
    const names = ["strict-transport-security", "x-content-type-options", "referrer-policy", "permissions-policy", "x-frame-options", "content-security-policy-report-only"];
    const actualHeaders = Object.fromEntries(names.map((name) => [name, response.headers.get(name)]));
    const checks = checkSecurityHeaders(actualHeaders);
    await response.body?.cancel();
    Object.assign(headerRow, { actualStatus: response.status, actualHeaders, checks, attempt, passed: response.status === 200 && Object.values(checks).every(Boolean) });
  } catch (error) { headerRow.error = error.message; }
  observations.push(headerRow);
  if (preview) {
    for (const route of ["/", "/kalkulyator-vartosti-saytu/"]) {
      const row = { kind: "preview-noindex", source: new URL(route, preview).href, passed: false };
      try {
        const { response, attempt } = await fetchWithRetry(new URL(route, preview), options);
        const robots = response.headers.get("x-robots-tag") || "";
        await response.body?.cancel();
        Object.assign(row, { actualStatus: response.status, xRobotsTag: robots, attempt, passed: response.status === 200 && /\bnoindex\b/i.test(robots) && /\bnofollow\b/i.test(robots) });
      } catch (error) { row.error = error.message; }
      observations.push(row);
    }
  }
  return {
    generatedAt: new Date().toISOString(), baseUrl: baseUrl.href,
    previewOrigin: preview?.origin || null,
    previewCheck: preview ? "performed" : "not-requested; live preview gate remains unverified",
    method: "Read-only HTTP GET; source 301 then final destination 200, all redirects disabled; no JavaScript or form submission",
    observations, passed: observations.every((row) => row.passed),
  };
}

async function main() {
const args = process.argv.slice(2);
const option = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const configOnly = args.includes("--config-only");
const baseUrlInput = option("--base-url");
const version = option("--version");
const previewOrigin = option("--preview-origin");

if (!configOnly && !baseUrlInput) {
  throw new Error("Use --config-only or --base-url=https://host.example --version=unique-name");
}
if (version && !/^[a-z0-9-]+$/.test(version)) throw new Error("Invalid report version");

function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if (character === "\n" && !quoted) {
      row.push(value.replace(/\r$/, ""));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += character;
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function readRedirectConfig() {
  const file = path.join(root, "edge", "cloudflare-pages", "_redirects");
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [source, destination, status] = line.split(/\s+/);
      return { source, destination, status: Number(status) };
    });
}

const errors = [];
const registry = parseCsv(fs.readFileSync(path.join(root, "seo", "redirects.csv"), "utf8"));
const redirects = readRedirectConfig();
const redirectBySource = new Map(redirects.map((row) => [row.source, row]));
const fileForPath = (pathname) => pathname === "/index.html"
  ? path.join(root, "index.html")
  : pathname.endsWith("/")
    ? path.join(root, pathname.replace(/^\/+/, ""), "index.html")
    : path.join(root, pathname.replace(/^\/+/, ""));
const metaContent = (html, name) => (html.match(/<meta\b[^>]*>/gi) || [])
  .find((tag) => new RegExp(`\\bname=["']${name}["']`, "i").test(tag))
  ?.match(/\bcontent=["']([^"']*)["']/i)?.[1] || "";
const canonicalFor = (html) => (html.match(/<link\b[^>]*>/gi) || [])
  .find((tag) => /\brel=["'][^"']*canonical[^"']*["']/i.test(tag))
  ?.match(/\bhref=["']([^"']*)["']/i)?.[1] || "";

if (redirectBySource.size !== redirects.length) errors.push("Cloudflare _redirects contains duplicate sources");
for (const redirect of redirects) {
  if (!redirect.source.startsWith("/") || redirect.source.includes("*") || redirect.source.includes(":")) {
    errors.push(`Redirect source must be an exact path: ${redirect.source}`);
  }
  if (!redirect.destination.startsWith("/") || redirect.destination.startsWith("//")) errors.push(`Redirect destination must be same-site: ${redirect.destination}`);
  if (redirect.status !== 301) errors.push(`Redirect must use 301: ${redirect.source}`);
}

for (const row of registry) {
  const source = new URL(row.from).pathname;
  const destination = new URL(row.to).pathname;
  const configured = redirectBySource.get(source);
  if (!configured) errors.push(`Registry redirect is missing from Cloudflare config: ${source}`);
  else if (configured.destination !== destination || configured.status !== Number(row.type)) {
    errors.push(`Registry/config mismatch: ${source}`);
  }

  const targetFile = fileForPath(destination);
  if (!fs.existsSync(targetFile)) {
    errors.push(`Redirect target has no local document: ${destination}`);
  } else {
    const targetHtml = fs.readFileSync(targetFile, "utf8");
    if (metaContent(targetHtml, "robots").toLowerCase().includes("noindex")) {
      errors.push(`Redirect target is noindex: ${destination}`);
    }
    if (canonicalFor(targetHtml) !== row.to) errors.push(`Redirect target canonical mismatch: ${destination}`);
  }

  if (source !== "/index.html") {
    const sourceFile = fileForPath(source);
    if (!fs.existsSync(sourceFile)) {
      errors.push(`Redirect source has no safe legacy document: ${source}`);
    } else {
      const sourceHtml = fs.readFileSync(sourceFile, "utf8");
      if (!metaContent(sourceHtml, "robots").toLowerCase().includes("noindex")) {
        errors.push(`Legacy redirect source must remain noindex before cutover: ${source}`);
      }
      if (canonicalFor(sourceHtml) !== row.to) errors.push(`Legacy source canonical mismatch: ${source}`);
    }
  }
}
for (const redirect of redirects) {
  if (!registry.some((row) => new URL(row.from).pathname === redirect.source)) {
    errors.push(`Cloudflare redirect is missing from registry: ${redirect.source}`);
  }
}

const headersFile = fs.readFileSync(path.join(root, "edge", "cloudflare-pages", "_headers"), "utf8");
const requiredHeaderTokens = [
  "/*",
  "Strict-Transport-Security: max-age=31536000",
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "Permissions-Policy: camera=(), microphone=(), geolocation=()",
  "X-Frame-Options: SAMEORIGIN",
  "Content-Security-Policy-Report-Only: default-src 'self'",
  "https://:project.pages.dev/*",
  "https://:version.:project.pages.dev/*",
  "X-Robots-Tag: noindex, nofollow",
];
for (const token of requiredHeaderTokens) {
  if (!headersFile.includes(token)) errors.push(`Cloudflare _headers is missing: ${token}`);
}

if (errors.length) {
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Edge config contract passes: ${redirects.length} exact redirects, security headers and preview noindex rules`);
if (configOnly) return;

const baseUrl = httpsOrigin(baseUrlInput);
if (!version) throw new Error("Live edge verification requires --version=unique-name");
const outputFile = path.join(root, "artifacts", "seo", "edge-live", `${version}.json`);
if (fs.existsSync(outputFile)) throw new Error("Evidence exists; select a new version");

  const report = await verifyLiveContract(redirects, { baseUrl, previewOrigin, canonicalOrigin: "https://maxsite.com.ua" });
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Saved live edge evidence to ${path.relative(root, outputFile)}`);
  if (!report.passed) {
    report.observations.filter((row) => !row.passed).forEach((row) => console.error(`Edge contract failed: ${row.source}${row.error ? ` — ${row.error}` : ""}`));
    process.exitCode = 1;
  }
}

module.exports = { checkSecurityHeaders, fetchWithRetry, inspectRedirect, verifyLiveContract, httpsOrigin };
if (require.main === module) main().catch((error) => {
  console.error(error);
  process.exit(1);
});
