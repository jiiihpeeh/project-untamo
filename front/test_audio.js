const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({width:1280, height:900});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3001/', {waitUntil:'networkidle2'});
  await new Promise(r => setTimeout(r, 2000));

  // Step 1: check IndexedDB for rooster
  const idbResult = await page.evaluate(() => {
    return new Promise((resolve) => {
      const req = indexedDB.open('untamo');
      req.onsuccess = function(e) {
        const db = e.target.result;
        const stores = Array.from(db.objectStoreNames);
        if (!stores.includes('audio')) {
          resolve({ ok: false, reason: 'No audio store', stores: stores });
          return;
        }
        const tx = db.transaction('audio', 'readonly');
        const store = tx.objectStore('audio');
        const getReq = store.get('rooster');
        getReq.onsuccess = function() {
          const val = getReq.result;
          resolve({ ok: !!val, hasRooster: !!val, valueType: typeof val, length: val ? val.length : 0 });
        };
        getReq.onerror = function() { resolve({ ok: false, reason: 'get failed' }); };
      };
      req.onerror = function() { resolve({ ok: false, reason: 'open failed' }); };
    });
  });
  console.log('IndexedDB rooster:', JSON.stringify(idbResult));

  // Step 2: if rooster exists, try to play it via Audio element
  if (idbResult.ok) {
    const playResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        const req = indexedDB.open('untamo');
        req.onsuccess = function(e) {
          const db = e.target.result;
          const tx = db.transaction('audio', 'readonly');
          const store = tx.objectStore('audio');
          const getReq = store.get('rooster');
          getReq.onsuccess = function() {
            const b64 = getReq.result;
            if (!b64) { resolve({ ok: false, reason: 'no data' }); return; }
            // decode base64 to blob
            try {
              const binary = atob(b64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const blob = new Blob([bytes], { type: 'audio/ogg; codecs=opus' });
              const url = URL.createObjectURL(blob);
              const audio = new Audio(url);
              audio.volume = 0.01;
              const playPromise = audio.play();
              if (playPromise) {
                playPromise.then(function() {
                  setTimeout(function() { audio.pause(); URL.revokeObjectURL(url); }, 500);
                  resolve({ ok: true, blobSize: blob.size, url: url.substring(0, 30) });
                }).catch(function(err) {
                  resolve({ ok: false, reason: err.message, blobSize: blob.size });
                });
              } else {
                resolve({ ok: true, note: 'play() returned no promise (old API)' });
              }
            } catch(err) {
              resolve({ ok: false, reason: 'decode error: ' + err.message });
            }
          };
        };
      });
    });
    console.log('Play result:', JSON.stringify(playResult));
  }

  console.log('Page errors:', errors);
  await browser.close();
})().catch(console.error);
