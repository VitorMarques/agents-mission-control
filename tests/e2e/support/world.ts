import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

let browser: Browser;
let context: BrowserContext;
let page: Page;

// Increase timeout for E2E steps
setDefaultTimeout(30_000);

// Store page globally for steps to access
declare global {
  var e2ePage: Page;
}

BeforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

AfterAll(async () => {
  await browser.close();
});

Before(async () => {
  context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  page = await context.newPage();
  globalThis.e2ePage = page;
});

After(async () => {
  await page.close();
  await context.close();
});

export { page };
