// Garden — builder.js

let currentUser = null;
requireAuth(user => { currentUser = user; });

const state = {
  flowers: [],          // {instId, flowerId, x, y, scale, rot, view}
  locked: false,
  lockStyle: 'seal',
  pin: '',
  cardId: 'collage',
  fromName: '',
  toName: '',
  note: '',
  photos: [],            // dataURLs
  voiceNote: null,        // dataURL
  spotifyTrackId: null,
  startSec: 0,
  endSec: 30
};

let activeStep = 0;
let instCounter = 0;
let selectedInstId = null;

/* ---------------- Step navigation ---------------- */
const steps = document.querySelectorAll('.step');
const pills = document.querySelectorAll('.step-pill');

function goToStep(n) {
  activeStep = n;
  steps.forEach(s => s.hidden = Number(s.dataset.step) !== n);
  pills.forEach(p => {
    const i = Number(p.dataset.step);
    p.classList.toggle('active', i === n);
    p.classList.toggle('done', i < n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => goToStep(Math.min(activeStep + 1, 5))));
document.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => goToStep(Math.max(activeStep - 1, 0))));
pills.forEach(p => p.addEventListener('click', () => goToStep(Number(p.dataset.step))));

/* ================= STEP 0 — Bouquet ================= */
document.getElementById('wrapImg').src = BOUQUET_WRAP.front;

const shelf = document.getElementById('flowerShelf');
FLOWER_CATALOG.forEach(f => {
  const chip = document.createElement('div');
  chip.className = 'flower-chip';
  chip.innerHTML = `<img src="${f.bloom}" alt="${f.label}"><span>${f.label}</span>`;
  chip.addEventListener('click', () => addFlower(f.id));
  shelf.appendChild(chip);
});

const stage = document.getElementById('bouquetStage');
const placedLayer = document.getElementById('placedLayer');

function addFlower(flowerId) {
  const inst = {
    instId: 'f' + (instCounter++),
    flowerId,
    x: 40 + Math.random() * 20,
    y: 35 + Math.random() * 25,
    scale: 1,
    rot: Math.round((Math.random() * 30) - 15),
    view: 'bloom'
  };
  state.flowers.push(inst);
  renderPlaced();
  selectFlower(inst.instId);
}

function renderPlaced() {
  placedLayer.innerHTML = '';
  state.flowers.forEach(inst => {
    const f = FLOWER_CATALOG.find(x => x.id === inst.flowerId);
    const el = document.createElement('div');
    el.className = 'placed-flower' + (inst.instId === selectedInstId ? ' selected' : '');
    el.style.left = inst.x + '%';
    el.style.top = inst.y + '%';
    el.style.transform = `translate(-50%,-50%) scale(${inst.scale}) rotate(${inst.rot}deg)`;
    el.dataset.inst = inst.instId;
    el.innerHTML = `<img src="${inst.view === 'bloom' ? f.bloom : f.stem}" alt="${f.label}">`;
    attachDrag(el, inst);
    el.addEventListener('click', e => { e.stopPropagation(); selectFlower(inst.instId); });
    el.addEventListener('dblclick', e => { e.stopPropagation(); inst.view = inst.view === 'bloom' ? 'stem' : 'bloom'; renderPlaced(); });
    placedLayer.appendChild(el);
  });
  document.getElementById('stageHint').textContent = state.flowers.length + ' flower' + (state.flowers.length === 1 ? '' : 's') + ' placed';
}

function attachDrag(el, inst) {
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    selectFlower(inst.instId);
    el.setPointerCapture(e.pointerId);
    const move = ev => {
      const rect = stage.getBoundingClientRect();
      let x = ((ev.clientX - rect.left) / rect.width) * 100;
      let y = ((ev.clientY - rect.top) / rect.height) * 100;
      x = Math.max(2, Math.min(98, x));
      y = Math.max(2, Math.min(98, y));
      inst.x = x; inst.y = y;
      el.style.left = x + '%';
      el.style.top = y + '%';
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  });
}

stage.addEventListener('click', () => selectFlower(null));

function selectFlower(instId) {
  selectedInstId = instId;
  document.querySelectorAll('.placed-flower').forEach(el => {
    el.classList.toggle('selected', el.dataset.inst === instId);
  });
  const panel = document.getElementById('selectedPanel');
  const inst = state.flowers.find(f => f.instId === instId);
  if (!inst) {
    panel.innerHTML = '<p class="muted">Select a placed flower to edit it.</p>';
    return;
  }
  const f = FLOWER_CATALOG.find(x => x.id === inst.flowerId);
  panel.innerHTML = `
    <h4>${f.label}</h4>
    <label>Size</label>
    <input type="range" min="0.5" max="2" step="0.05" value="${inst.scale}" id="scaleR">
    <label style="margin-top:10px;">Rotate</label>
    <input type="range" min="-45" max="45" step="1" value="${inst.rot}" id="rotR">
    <div class="mini-row">
      <button class="btn btn-sm" id="flipBtn">Flip view</button>
      <button class="btn btn-sm" id="frontBtn">Front</button>
      <button class="btn btn-sm" id="backBtn">Back</button>
      <button class="btn btn-sm btn-danger" id="removeBtn">Remove</button>
    </div>`;
  panel.querySelector('#scaleR').addEventListener('input', e => { inst.scale = Number(e.target.value); renderPlaced(); selectFlower(instId); });
  panel.querySelector('#rotR').addEventListener('input', e => { inst.rot = Number(e.target.value); renderPlaced(); selectFlower(instId); });
  panel.querySelector('#flipBtn').addEventListener('click', () => { inst.view = inst.view === 'bloom' ? 'stem' : 'bloom'; renderPlaced(); selectFlower(instId); });
  panel.querySelector('#frontBtn').addEventListener('click', () => { state.flowers = state.flowers.filter(x => x !== inst).concat(inst); renderPlaced(); selectFlower(instId); });
  panel.querySelector('#backBtn').addEventListener('click', () => { state.flowers = [inst].concat(state.flowers.filter(x => x !== inst)); renderPlaced(); selectFlower(instId); });
  panel.querySelector('#removeBtn').addEventListener('click', () => { state.flowers = state.flowers.filter(x => x !== inst); selectedInstId = null; renderPlaced(); selectFlower(null); });
}

document.getElementById('clearBouquet').addEventListener('click', () => {
  if (state.flowers.length && !confirm('Clear the whole bouquet?')) return;
  state.flowers = [];
  selectedInstId = null;
  renderPlaced();
  selectFlower(null);
});

renderPlaced();

/* ================= STEP 1 — PIN lock ================= */
const LOCK_STYLES = [
  { id: 'seal', label: 'Sealed Envelope', cls: 'lp-seal', icon: '<div class="seal-wax">🌿</div>' },
  { id: 'vine', label: 'Vine Growth', cls: 'lp-vine', icon: vineSvg() },
  { id: 'bloom', label: 'Bloom Reveal', cls: 'lp-bloom', icon: '<div class="bloom-icon">🌸</div>' },
  { id: 'dial', label: 'Simple Dial', cls: 'lp-dial', icon: '<div class="dial-ring">🔒</div>' }
];

function vineSvg() {
  return `<div class="vine-frame"><svg viewBox="0 0 100 100"><path d="M10,90 C10,60 40,60 40,30 C40,10 70,10 70,30 C70,50 90,50 90,20"/></svg></div>`;
}

document.querySelectorAll('[data-lock-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-lock-toggle]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.locked = btn.dataset.lockToggle === 'on';
    document.getElementById('lockOptions').hidden = !state.locked;
  });
});

const lockStylesEl = document.getElementById('lockStyles');
LOCK_STYLES.forEach(ls => {
  const card = document.createElement('div');
  card.className = 'lock-style-card' + (ls.id === state.lockStyle ? ' selected' : '');
  card.innerHTML = `<div class="preview ${ls.cls}">${ls.icon}</div><span>${ls.label}</span>`;
  card.addEventListener('click', () => {
    state.lockStyle = ls.id;
    lockStylesEl.querySelectorAll('.lock-style-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
  lockStylesEl.appendChild(card);
});

document.getElementById('pinInput').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  state.pin = e.target.value;
});

/* ================= STEP 2 — Card picker ================= */
const gallery = document.getElementById('cardGallery');
CARD_CATALOG.forEach(c => {
  const opt = document.createElement('div');
  opt.className = 'card-option' + (c.id === state.cardId ? ' selected' : '');
  opt.innerHTML = `<div class="thumb">${renderCardArt(c.id, { size: 'thumb' })}</div><span>${c.label}</span>`;
  opt.addEventListener('click', () => {
    state.cardId = c.id;
    gallery.querySelectorAll('.card-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
  gallery.appendChild(opt);
});

/* ================= STEP 3 — Details ================= */
document.getElementById('fromName').addEventListener('input', e => state.fromName = e.target.value);
document.getElementById('toName').addEventListener('input', e => state.toName = e.target.value);
document.getElementById('noteText').addEventListener('input', e => state.note = e.target.value);

const photoRow = document.getElementById('photoRow');
const photoAddBtn = document.getElementById('photoAddBtn');
document.getElementById('photoInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  compressImage(file, 800, 0.72).then(dataUrl => {
    state.photos.push(dataUrl);
    renderPhotos();
  });
  e.target.value = '';
});

function renderPhotos() {
  photoRow.querySelectorAll('.photo-thumb').forEach(el => el.remove());
  state.photos.forEach((src, i) => {
    const t = document.createElement('div');
    t.className = 'photo-thumb';
    t.innerHTML = `<img src="${src}"><button class="remove" data-i="${i}">✕</button>`;
    t.querySelector('.remove').addEventListener('click', ev => {
      ev.stopPropagation();
      state.photos.splice(i, 1);
      renderPhotos();
    });
    photoRow.insertBefore(t, photoAddBtn);
  });
  photoAddBtn.style.display = state.photos.length >= 3 ? 'none' : 'flex';
}

function compressImage(file, maxDim, quality) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) { height *= maxDim / width; width = maxDim; }
      else if (height > maxDim) { width *= maxDim / height; height = maxDim; }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      c.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    reader.readAsDataURL(file);
  });
}

// Voice note recording
let mediaRecorder = null, audioChunks = [];
const recordBtn = document.getElementById('recordBtn');
const voiceStatus = document.getElementById('voiceStatus');
const voicePreview = document.getElementById('voicePreview');
const clearVoiceBtn = document.getElementById('clearVoiceBtn');

recordBtn.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        state.voiceNote = reader.result;
        voicePreview.src = state.voiceNote;
        voicePreview.hidden = false;
        clearVoiceBtn.hidden = false;
        voiceStatus.textContent = 'Voice note recorded';
      };
      reader.readAsDataURL(blob);
      recordBtn.textContent = '● Record';
      recordBtn.classList.remove('recording');
    };
    mediaRecorder.start();
    recordBtn.textContent = '■ Stop';
    recordBtn.classList.add('recording');
    voiceStatus.textContent = 'Recording…';
  } catch (err) {
    toast('Microphone access denied.');
  }
});

clearVoiceBtn.addEventListener('click', () => {
  state.voiceNote = null;
  voicePreview.hidden = true;
  clearVoiceBtn.hidden = true;
  voiceStatus.textContent = 'No voice note yet';
});

/* ================= STEP 4 — Music ================= */
document.getElementById('spotifyUrl').addEventListener('input', e => {
  const m = e.target.value.match(/track\/([a-zA-Z0-9]+)/);
  const preview = document.getElementById('spotifyPreview');
  const range = document.getElementById('musicRange');
  if (m) {
    state.spotifyTrackId = m[1];
    preview.innerHTML = `<iframe src="https://open.spotify.com/embed/track/${m[1]}" width="100%" height="152" frameborder="0" allow="encrypted-media"></iframe>`;
    range.hidden = false;
  } else {
    state.spotifyTrackId = null;
    preview.innerHTML = '';
    range.hidden = true;
  }
});
document.getElementById('startSec').addEventListener('input', e => state.startSec = Number(e.target.value));
document.getElementById('endSec').addEventListener('input', e => state.endSec = Number(e.target.value));

/* ================= STEP 5 — Share ================= */
document.getElementById('generateBtn').addEventListener('click', async () => {
  if (!currentUser) { toast('Please sign in.'); return; }
  if (!state.toName.trim()) { toast('Add who this is for, on the Details step.'); goToStep(3); return; }
  if (state.locked && state.pin.length !== 4) { toast('Set a 4-digit PIN, or turn the lock off.'); goToStep(1); return; }

  const btn = document.getElementById('generateBtn');
  setButtonLoading(btn, true, 'Planting');

  const doc = {
    ownerId: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    flowers: state.flowers,
    locked: state.locked,
    lockStyle: state.lockStyle,
    pin: state.locked ? state.pin : null,
    cardId: state.cardId,
    fromName: state.fromName,
    toName: state.toName,
    note: state.note,
    photos: state.photos,
    voiceNote: state.voiceNote,
    spotifyTrackId: state.spotifyTrackId,
    startSec: state.startSec,
    endSec: state.endSec
  };

  try {
    const ref = await db.collection('gifts').add(doc);
    const link = `${location.origin}${location.pathname.replace('builder.html', '')}gift.html?id=${ref.id}`;
    document.getElementById('giftLink').value = link;
    document.getElementById('shareBefore').hidden = true;
    document.getElementById('shareAfter').hidden = false;
    drawHeartQR(document.getElementById('heartQr'), link);
  } catch (err) {
    console.error(err);
    toast('Could not save — check your Firebase setup.');
    setButtonLoading(btn, false, 'Create gift & generate link');
  }
});

document.getElementById('copyLinkBtn').addEventListener('click', copyLink);
document.getElementById('heartQr').addEventListener('click', copyLink);

function copyLink() {
  const input = document.getElementById('giftLink');
  input.select();
  navigator.clipboard.writeText(input.value).then(() => toast('Link copied'));
}
