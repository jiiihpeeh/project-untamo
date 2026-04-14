const puppeteer = require('puppeteer');

async function login(page) {
  await page.focus('input#email');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.type('jalonenjussipekka@protonmail.com', { delay: 20 });
  await page.focus('input#password');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.type('pevkele', { delay: 20 });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    document.querySelector('form').addEventListener('submit', e => e.preventDefault());
  });
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

  // --- Login ---
  await login(page);
  console.log('URL after login:', page.url());
  if (page.url().includes('/login')) { console.log('FAIL: still on login'); await browser.close(); return; }

  // --- Wait for initAudioDB ---
  await new Promise(r => setTimeout(r, 1500));

  // --- Check IndexedDB for rooster ---
  const idbResult = await page.evaluate(() => {
    return new Promise((resolve) => {
      const req = indexedDB.open('untamo');
      req.onsuccess = function(e) {
        const db = e.target.result;
        const stores = Array.from(db.objectStoreNames);
        if (!stores.includes('audio')) { resolve({ ok: false, stores }); return; }
        const tx = db.transaction('audio', 'readonly');
        const getReq = tx.objectStore('audio').get('rooster');
        getReq.onsuccess = function() {
          const val = getReq.result;
          resolve({ ok: !!val, b64length: val ? val.length : 0 });
        };
      };
      req.onerror = function() { resolve({ ok: false, reason: 'idb open failed' }); };
    });
  });
  console.log('IndexedDB rooster:', JSON.stringify(idbResult));

  if (!idbResult.ok) { console.log('FAIL: rooster not in IndexedDB'); await browser.close(); return; }

  // --- Play rooster from IndexedDB ---
  const playResult = await page.evaluate(() => {
    return new Promise((resolve) => {
      const req = indexedDB.open('untamo');
      req.onsuccess = function(e) {
        const db = e.target.result;
        const tx = db.transaction('audio', 'readonly');
        const getReq = tx.objectStore('audio').get('rooster');
        getReq.onsuccess = function() {
          const b64 = getReq.result;
          try {
            const binary = atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: 'audio/ogg; codecs=opus' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.volume = 0.01;
            audio.play()
              .then(() => {
                setTimeout(() => { audio.pause(); URL.revokeObjectURL(url); }, 800);
                resolve({ ok: true, blobSize: blob.size, note: 'playing' });
              })
              .catch(err => resolve({ ok: false, reason: err.message, blobSize: blob.size }));
          } catch(err) {
            resolve({ ok: false, reason: 'decode: ' + err.message });
          }
        };
      };
    });
  });
  console.log('Direct play result:', JSON.stringify(playResult));

  // --- Trigger app play() via store ---
  // Navigate to alarms page first, then call the store play method
  await page.screenshot({ path: '/tmp/audio_test_alarms.png' });

  // Trigger play through the app store (exposed via zustand devtools on window if available,
  // otherwise call it via a custom script injected into the page context)
  const storePlayResult = await page.evaluate(async () => {
    // Try to find the audio element that was created by audioStore
    const audioEl = document.getElementById('audioPlayer');
    if (!audioEl) return { found: false, note: 'no #audioPlayer element in DOM' };
    return {
      found: true,
      src: audioEl.src ? audioEl.src.substring(0,40) : '(empty)',
      paused: audioEl.paused,
      readyState: audioEl.readyState,
      volume: audioEl.volume
    };
  });
  console.log('App #audioPlayer element:', JSON.stringify(storePlayResult));

  console.log('Page errors:', errors.length ? errors : 'none');

  await page.screenshot({ path: '/tmp/audio_test_final.png' });
  await browser.close();
})().catch(console.error);
// run separately
