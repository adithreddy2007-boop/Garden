// Garden — keepsake card designs
const CARD_CATALOG = [
  { id: 'collage', label: 'Floral Collage', accent: '#c98a93' },
  { id: 'wreath', label: 'Heart Wreath', accent: '#b8924a' },
  { id: 'petals', label: 'Falling Petals', accent: '#e3b8bc' },
  { id: 'celebration', label: 'Celebration', accent: '#caa15c' }
];

// Returns inner HTML for a card thumbnail / full preview given a card id.
// Uses small flower bloom images already loaded via FLOWER_CATALOG for organic texture.
function renderCardArt(cardId, opts = {}) {
  const size = opts.size || 'thumb'; // 'thumb' | 'full'
  const sample = (n) => {
    const list = FLOWER_CATALOG;
    const out = [];
    for (let i = 0; i < n; i++) out.push(list[(i * 7 + 3) % list.length]);
    return out;
  };

  if (cardId === 'collage') {
    const fl = sample(6);
    return `<div class="card-art card-art-collage">
      ${fl.map((f, i) => `<img src="${f.bloom}" style="--i:${i}" class="collage-bloom">`).join('')}
    </div>`;
  }
  if (cardId === 'wreath') {
    const fl = sample(10);
    return `<div class="card-art card-art-wreath">
      <div class="wreath-ring">
        ${fl.map((f, i) => `<img src="${f.bloom}" style="--a:${(360 / fl.length) * i}deg" class="wreath-bloom">`).join('')}
      </div>
    </div>`;
  }
  if (cardId === 'petals') {
    let petals = '';
    for (let i = 0; i < 14; i++) {
      petals += `<span class="petal" style="--l:${(i * 37) % 100}%; --d:${(i % 5) * 1.1}s; --s:${0.5 + (i % 4) * 0.15}"></span>`;
    }
    return `<div class="card-art card-art-petals">${petals}</div>`;
  }
  // celebration
  let confetti = '';
  for (let i = 0; i < 20; i++) {
    confetti += `<span class="confetto" style="--l:${(i * 23) % 100}%; --d:${(i % 6) * 0.3}s; --c:${i % 3}"></span>`;
  }
  return `<div class="card-art card-art-celebration">${confetti}</div>`;
}
