const {defineConfig}=require('@playwright/test');
const base=require('./playwright.config');

// The same read-only scenarios run locally in the quality gate first, then
// against the exact approved release. There is no local server in this run.
module.exports=defineConfig({
  testDir:'./tests/e2e',
  testMatch:/(instagram-visibility|read-only-ui-smoke|catalog-article)\.spec\.js/,
  outputDir:'artifacts/playwright/live-results',
  reporter:[['list'],['html',{outputFolder:'artifacts/playwright/live-report',open:'never'}]],
  use:{...base.use,baseURL:'https://maxsite.com.ua'},
  projects:base.projects.map(({testMatch,...project})=>project)
});
