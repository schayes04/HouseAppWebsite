// Renders social-card.html to public/assets/house-manager-social-card.png at 1200×630.
// Needs Playwright with Chromium (npx playwright install chromium) and the Inter font for an exact match.
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const source = new URL('./social-card.html', import.meta.url);
const output = fileURLToPath(new URL('../../public/assets/house-manager-social-card.png', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(source.href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: output });
await browser.close();
console.log(`Wrote ${output}`);
