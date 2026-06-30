// Garden — gift.js (recipient side)

const params = new URLSearchParams(location.search);
const giftId = params.get('id');

const loadingScreen = document.getElementById('loadingScreen');
const lockScreen = document.getElementById('lockScreen');
const notFound = document.getElementById('notFound');
const reveal = document.getElementById('reveal');

let giftData = null;

if (!giftId) {
  showNotFound();
} else {
  db.collection('gifts').doc(giftId).get()
    .then(doc => {
      if (!doc.exists) { showNotFound(); return; }
      giftData = doc.data();
      // minimum flower-themed loading moment before reveal/lock
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        if (giftData.locked && giftData.pin) {
          buildLockScreen(giftData.lockStyle || 'seal');
        } else {
          showReveal();
        }
      }, 1500);
    })
    .catch(err => { console.error(err); showNotFound(); });
}

function showNotFound() {
  loadingScreen.style.display = 'none';
  notFound.hidden = false;
}

/* ---------------- PIN gate ---------------- */
function buildLockScreen(styleId) {
  const copy = {
    seal: { title: 'Sealed with care', sub: 'Enter the PIN to break the seal.' },
    vine: { title: 'Still growing', sub: 'Enter the PIN to let it bloom.' },
    bloom: { title: 'Almost open', sub: 'Enter the PIN to reveal it.' },
    dial: { title: 'Locked', sub: 'Enter the PIN to continue.' }
  }[styleId] || { title: 'Locked', sub: 'Enter the PIN to continue.' };

  const iconHtml = {
    seal: '<div class="seal-wax">🌿</div>',
    vine: '<div class="vine-frame"><svg viewBox="0 0 100 100"><path d="M10,90 C10,60 40,60 40,30 C40,10 70,10 70,30 C70,50 90,50 90,20"/></svg></div>',
    bloom: '<div class="bloom-icon">🌸</div>',
    dial: '<div class="dial-ring">🔒</div>'
  }[styleId] || '<div class="dial-ring">🔒</div>';

  lockScreen.innerHTML = `
    <div class="lock-screen style-${styleId}">
      ${iconHtml}
      <h3>${copy.title}</h3>
      <p>${copy.sub}</p>
      <div class="pin-dots" id="pinDots">
        ${[0,1,2,3].map(() => '<div class="pin-dot"></div>').join('')}
      </div>
      <div class="pin-keypad" id="pinKeypad"></div>
    </div>`;
  lockScreen.hidden = false;

  let entered = '';
  const dots = lockScreen.querySelectorAll('.pin-dot');
  const keypad = lockScreen.querySelector('#pinKeypad');
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
  keys.forEach(k => {
    const b = document.createElement('button');
    b.className = 'pin-key';
    b.textContent = k;
    b.addEventListener('click', () => handleKey(k));
    keypad.appendChild(b);
  });

  function handleKey(k) {
    if (k === '⌫') { entered = entered.slice(0, -1); updateDots(); return; }
    if (k === '✓') { tryUnlock(); return; }
    if (entered.length < 4) { entered += k; updateDots(); }
    if (entered.length === 4) setTimeout(tryUnlock, 150);
  }

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle('filled', i < entered.length));
  }

  function tryUnlock() {
    if (entered === giftData.pin) {
      lockScreen.hidden = true;
      showReveal();
    } else {
      dots.forEach(d => d.classList.add('shake'));
      setTimeout(() => dots.forEach(d => d.classList.remove('shake')), 400);
      entered = '';
      setTimeout(updateDots, 200);
      toastLite('Incorrect PIN');
    }
  }
}

function toastLite(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

/* ---------------- Reveal ---------------- */
function showReveal() {
  reveal.hidden = false;

  document.getElementById('toNameOut').textContent = giftData.toName || '';
  document.getElementById('fromNameOut').textContent = giftData.fromName || 'Someone who cares';
  document.getElementById('noteOut').textContent = giftData.note || '';
  document.getElementById('cardArtBg').innerHTML = renderCardArt(giftData.cardId || 'collage', { size: 'full' });

  // bouquet
  const bd = document.getElementById('bouquetDisplay');
  bd.innerHTML = `<img class="wrap-bg" src="${BOUQUET_WRAP.front}" alt="">`;
  (giftData.flowers || []).forEach(inst => {
    const f = FLOWER_CATALOG.find(x => x.id === inst.flowerId);
    if (!f) return;
    const el = document.createElement('div');
    el.className = 'pf';
    el.style.left = inst.x + '%';
    el.style.top = inst.y + '%';
    el.style.width = (70 * inst.scale) + 'px';
    el.style.height = (70 * inst.scale) + 'px';
    el.style.transform = `translate(-50%,-50%) rotate(${inst.rot}deg)`;
    el.innerHTML = `<img src="${inst.view === 'bloom' ? f.bloom : f.stem}" alt="">`;
    bd.appendChild(el);
  });

  // photos
  if (giftData.photos && giftData.photos.length) {
    document.getElementById('photosSection').hidden = false;
    const grid = document.getElementById('photosGrid');
    giftData.photos.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      grid.appendChild(img);
    });
  }

  // voice note
  if (giftData.voiceNote) {
    document.getElementById('voiceSection').hidden = false;
    document.getElementById('voiceOut').src = giftData.voiceNote;
  }

  // music
  if (giftData.spotifyTrackId) {
    document.getElementById('musicSection').hidden = false;
    setupSpotify(giftData.spotifyTrackId, giftData.startSec || 0, giftData.endSec || 30);
  }
}

/* ---------------- Spotify clip via embed iFrame API ---------------- */
function setupSpotify(trackId, startSec, endSec) {
  const container = document.getElementById('spotifyEmbed');
  const el = document.createElement('div');
  container.appendChild(el);

  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  document.body.appendChild(script);

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const options = { uri: `spotify:track:${trackId}` };
    IFrameAPI.createController(el, options, controller => {
      let seeked = false;
      controller.addListener('playback_update', e => {
        const posSec = e.data.position / 1000;
        if (e.data.isPaused === false && !seeked) {
          seeked = true;
          controller.seek(startSec);
        }
        if (posSec >= endSec && endSec > startSec) {
          controller.pause();
        }
      });
    });
  };
}
