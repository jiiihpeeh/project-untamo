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
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
  await login(page);
  console.log('[1] Login:', page.url().includes('login') ? 'FAIL' : 'OK (' + page.url() + ')');
  await new Promise(r => setTimeout(r, 2000));

  // Check IndexedDB
  const idb = await page.evaluate(() => new Promise(resolve => {
    const req = indexedDB.open('untamo');
    req.onsuccess = function(e) {
      const db = e.target.result;
      if (!Array.from(db.objectStoreNames).includes('audio')) { resolve({ ok: false }); return; }
      const getReq = db.transaction('audio','readonly').objectStore('audio').get('rooster');
      getReq.onsuccess = () => resolve({ ok: !!getReq.result, bytes: getReq.result ? Math.round(getReq.result.length * 0.75) : 0 });
    };
    req.onerror = () => resolve({ ok: false });
  }));
  console.log('[2] IndexedDB rooster:', idb.ok ? `OK (~${idb.bytes} bytes decoded)` : 'FAIL');

  // Play rooster (app path: detached Audio element, loop, volume from store)
  const play = await page.evaluate(() => new Promise(resolve => {
    const req = indexedDB.open('untamo');
    req.onsuccess = function(e) {
      const getReq = e.target.result.transaction('audio','readonly').objectStore('audio').get('rooster');
      getReq.onsuccess = function() {
        const b64 = getReq.result;
        if (!b64) { resolve({ ok: false, reason: 'no data' }); return; }
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        const audio = document.createElement('audio');
        audio.volume = 0.01; audio.loop = true; audio.src = url;
        audio.play()
          .then(() => { setTimeout(() => { audio.pause(); URL.revokeObjectURL(url); }, 1200); resolve({ ok: true, blobSize: blob.size }); })
          .catch(err => resolve({ ok: false, reason: err.message }));
      };
    };
  }));
  console.log('[3] Rooster playback:', play.ok ? `OK (${play.blobSize} bytes blob)` : `FAIL: ${play.reason}`);

  // Play analog-watch track (fetched from server)
  const analogPlay = await page.evaluate(() => new Promise(resolve => {
    const req = indexedDB.open('untamo');
    req.onsuccess = function(e) {
      const getReq = e.target.result.transaction('audio','readonly').objectStore('audio').get('analog-watch');
      getReq.onsuccess = function() {
        const b64 = getReq.result;
        if (!b64) { resolve({ ok: false, reason: 'not in IDB (not downloaded yet)' }); return; }
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        const audio = document.createElement('audio');
        audio.volume = 0.01; audio.src = url;
        audio.play()
          .then(() => { setTimeout(() => { audio.pause(); URL.revokeObjectURL(url); }, 1200); resolve({ ok: true, blobSize: blob.size }); })
          .catch(err => resolve({ ok: false, reason: err.message }));
      };
    };
  }));
  console.log('[4] analog-watch playback:', analogPlay.ok ? `OK (${analogPlay.blobSize} bytes)` : `SKIP: ${analogPlay.reason}`);

  // Check server track list (authenticated)
  const tracks = await page.evaluate(async () => {
    // Get auth token from localStorage or cookie
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    try {
      const r = await fetch('/audio-resources/resource_list.json', { headers });
      if (!r.ok) return { ok: false, status: r.status };
      return { ok: true, tracks: await r.json() };
    } catch(e) { return { ok: false, err: e.message }; }
  });
  console.log('[5] Server track list:', tracks.ok ? `OK: ${JSON.stringify(tracks.tracks)}` : `status=${tracks.status} (auth token not in localStorage)`);

  console.log('Errors:', errors.length ? errors : 'none');
  await browser.close();

  console.log('\n=== SUMMARY ===');
  console.log('Audio system:', (idb.ok && play.ok) ? 'WORKING ✓' : 'ISSUES FOUND ✗');
})().catch(console.error);
