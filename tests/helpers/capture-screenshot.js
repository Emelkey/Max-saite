// Chromium can transiently reject a capture while the compositor settles.
// Retry only that exact transport error once; preserve all assertion failures.
async function captureScreenshot(page, options = {}) {
  try {
    return await page.screenshot(options);
  } catch (error) {
    if (!/Protocol error \(Page\.captureScreenshot\): Unable to capture screenshot/.test(error.message)) throw error;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return page.screenshot(options);
  }
}
module.exports = {captureScreenshot};
