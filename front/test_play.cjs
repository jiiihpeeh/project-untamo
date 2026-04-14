const puppeteer = require('puppeteer');

async function login(page) {
  await page.focus('input#email');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.type('jalonenjussipekka@protonmail.com', { delay: 20 });
  await page.focus('input#password');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.type('pevkele', { delay: 20 });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => document.querySelector('form').addEventListener('submit', e => e.preventDefault()));
  await page.click('#submit');
  await new Promise(r => setTimeout(r, 3000));
}

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });
    if (msg.type() === 'error' || text.includes('[audio]')) {
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    }
  });
  page.on('pageerror', e => console.log('UNCAUGHT:', e.message));

  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
  await login(page);
  console.log('URL:', page.url());
  await new Promise(r => setTimeout(r, 2000)); // wait for initAudioDB

  // Confirm store is on window
  const storeState = await page.evaluate(() => {
    if (!window.__store) return { err: 'store not on window' };
    const s = window.__store.getState();
    return {
      track: s.track,
      tracks: s.tracks,
      loop: s.loop,
      plays: s.plays,
      volume: s.volume,
      hasPlay: typeof s.play === 'function',
    };
  });
  console.log('Store state:', JSON.stringify(storeState));

  // Call play() via the store
  console.log('--- Triggering play() ---');
  await page.evaluate(async () => {
    const store = window.__store.getState();
    store.setLoop(false); // non-loop so volume isn't 0
    await store.play();
  });

  await new Promise(r => setTimeout(r, 1500));

  // Check audio element state after play
  const audioState = await page.evaluate(() => {
    const s = window.__store.getState();
    const el = s.audioElement;
    return {
      plays: s.plays,
      src: el ? (el.src ? el.src.substring(0,50) : '(empty)') : 'no element',
      paused: el ? el.paused : null,
      readyState: el ? el.readyState : null,
      error: el && el.error ? el.error.message : null,
      volume: el ? el.volume : null,
      duration: el ? el.duration : null,
    };
  });
  console.log('Audio element state after play():', JSON.stringify(audioState));

  // Print all [audio] logs
  console.log('\n--- All [audio] debug logs ---');
  logs.filter(l => l.text.includes('[audio]')).forEach(l => console.log(l.text));

  // Print all errors
  const errs = logs.filter(l => l.type === 'error');
  if (errs.length) {
    console.log('\n--- Page errors ---');
    errs.forEach(l => console.log(l.text));
  }

  await browser.close();
})().catch(console.error);
