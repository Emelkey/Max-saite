#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const option = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const version = option("--version");
const requestedRuns = Number(option("--runs") || 3);
const requestedRoutes = option("--routes");
const requestedOutputDirectory = option("--output-dir");

if (version && !/^[a-z0-9-]+$/.test(version)) throw new Error("Invalid report version");
if (!Number.isInteger(requestedRuns) || requestedRuns < 1 || requestedRuns > 5) {
  throw new Error("--runs must be an integer from 1 to 5");
}

const defaultRoutes = [
  "/",
  "/stvorennya-saytiv/",
  "/stvorennya-saytu-dlya-biznesu/",
  "/stvorennya-program/",
  "/stvorennya-landing-page/",
  "/stvorennya-internet-mahazynu/",
];
const routes = requestedRoutes
  ? requestedRoutes.split(",").map((route) => route.trim()).filter(Boolean)
  : defaultRoutes;

if (!routes.length || routes.some((route) => !/^\/[a-z0-9\-/]*$/.test(route))) {
  throw new Error("--routes must be a comma-separated list of same-site paths");
}

const outDir = requestedOutputDirectory
  ? path.resolve(requestedOutputDirectory)
  : path.join(root, "artifacts", "lighthouse", version || "");
if (version && fs.existsSync(path.join(outDir, "summary.json"))) {
  throw new Error("Report exists; use a fresh version.");
}
fs.mkdirSync(outDir, { recursive: true });

const thresholds = {
  performance: 0.90,
  accessibility: 0.90,
  "best-practices": 0.90,
  seo: 0.95,
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const median = (values) => {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
};
const slugForRoute = (route) => route === "/"
  ? "home"
  : route.replace(/^\/+|\/+$/g, "").replaceAll("/", "__");

async function waitForServer(url, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_500) });
      if (response.ok) {
        await response.body?.cancel();
        return;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw new Error(`Local production server did not become ready: ${lastError?.message || "timeout"}`);
}

(async () => {
  const server = spawn(
    process.execPath,
    [require.resolve("http-server/bin/http-server"), "release/max-site-production", "-p", "4174", "-c-1", "--silent", "-a", "127.0.0.1"],
    { cwd: root, stdio: "ignore" },
  );

  try {
    await waitForServer("http://127.0.0.1:4174/");
    const [{ default: lighthouse }, { launch }] = await Promise.all([
      import("lighthouse"),
      import("chrome-launcher"),
    ]);
    const chrome = await launch({
      chromePath: chromium.executablePath(),
      chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
    });
    const results = [];
    const failures = [];

    try {
      for (const route of routes) {
        const slug = slugForRoute(route);
        const samples = [];

        for (let run = 1; run <= requestedRuns; run += 1) {
          const result = await lighthouse(`http://127.0.0.1:4174${route}`, {
            port: chrome.port,
            output: "json",
            logLevel: "error",
            onlyCategories: Object.keys(thresholds),
            formFactor: "mobile",
            screenEmulation: {
              mobile: true,
              width: 390,
              height: 844,
              deviceScaleFactor: 2,
              disabled: false,
            },
            throttlingMethod: "simulate",
          });

          fs.writeFileSync(path.join(outDir, `${slug}--run-${run}.json`), result.report);
          const scores = Object.fromEntries(Object.keys(thresholds).map((category) => {
            const score = result.lhr.categories[category]?.score;
            if (typeof score !== "number") throw new Error(`Lighthouse returned no ${category} score for ${route}`);
            return [category, score];
          }));
          samples.push({ run, scores });
          console.log(
            `${route} run ${run}/${requestedRuns}: ${Object.entries(scores)
              .map(([name, value]) => `${name} ${Math.round(value * 100)}`)
              .join(", ")}`,
          );
        }

        const medians = Object.fromEntries(
          Object.keys(thresholds).map((category) => [
            category,
            median(samples.map((sample) => sample.scores[category])),
          ]),
        );
        const routeFailures = Object.entries(thresholds)
          .filter(([category, minimum]) => medians[category] < minimum)
          .map(([category, minimum]) => ({ category, median: medians[category], minimum }));

        results.push({ route, samples, medians, failures: routeFailures });
        for (const failure of routeFailures) {
          failures.push(
            `${route} ${failure.category} median: ${Math.round(failure.median * 100)} < ${Math.round(failure.minimum * 100)}`,
          );
        }
        console.log(
          `${route} median: ${Object.entries(medians)
            .map(([name, value]) => `${name} ${Math.round(value * 100)}`)
            .join(", ")}`,
        );
      }
    } finally {
      await chrome.kill();
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      source: "local production build",
      method: "Lighthouse mobile simulated throttling; median gate across independent lab runs; not field CWV",
      runsPerRoute: requestedRuns,
      routes,
      thresholds,
      results,
      failures,
      passed: failures.length === 0,
    };
    fs.writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

    if (failures.length) {
      failures.forEach((failure) => console.error(`Lighthouse median budget failed: ${failure}`));
      process.exitCode = 1;
    }
  } finally {
    server.kill("SIGTERM");
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
