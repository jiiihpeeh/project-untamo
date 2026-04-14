import { launch } from '../node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const url = process.argv[2] || 'http://localhost:5173/';

(async () => {
  let browser;
  try {
    browser = await launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      protocolTimeout: 60000,
    });
    console.log('Browser launched');
    const page = await browser.newPage();

    const msgs = [];
    const failedRequests = [];

    page.on('console', m => msgs.push(`[${m.type()}] ${m.text()}`));
    page.on('pageerror', e => msgs.push(`[PAGEERROR] ${e.message}\n${e.stack}`));
    page.on('requestfailed', req => failedRequests.push(`${req.failure()?.errorText} ${req.url()}`));

    const navPromise = page.goto(url, { timeout: 0 }).catch(e => console.log('Nav error:', e.message));

    await new Promise(r => setTimeout(r, 15000));

    const appHTML = await page.$eval('#app', el => el.innerHTML).catch(e => 'eval error: ' + e.message);
    console.log('\n#app innerHTML (first 2000):', appHTML.substring(0, 2000));

    console.log('\n--- Messages ---');
    msgs.forEach(m => console.log(m));

    console.log('\n--- Failed requests ---');
    failedRequests.forEach(r => console.log(r));

  } catch (e) {
    console.error('Fatal:', e.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
})();
