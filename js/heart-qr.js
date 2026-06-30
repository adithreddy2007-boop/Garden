// Garden — heart-shaped QR code
// Uses the qrcode-generator UMD global `qrcode`.
// Finder pattern corners are always drawn (scan anchors); everything else
// is masked to a heart silhouette using the classic implicit heart curve
// (x^2+y^2-1)^3 - x^2*y^3 <= 0.

function isFinderZone(row, col, count) {
  const tl = row < 8 && col < 8;
  const tr = row < 8 && col >= count - 8;
  const bl = row >= count - 8 && col < 8;
  return tl || tr || bl;
}

function inHeart(xf, yf) {
  const f = Math.pow(xf * xf + yf * yf - 1, 3) - xf * xf * Math.pow(yf, 3);
  return f <= 0;
}

function drawHeartQR(canvas, text, opts = {}) {
  const qr = qrcode(0, 'H');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();

  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // card background
  const bg = opts.bg || '#f6f0e2';
  const dot = opts.dot || '#1d3326';
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.fillStyle = bg;
  ctx.fill();

  const cell = Math.min(W, H) / count;
  const offX = (W - cell * count) / 2;
  const offY = (H - cell * count) / 2;
  const r = cell * 0.42;

  ctx.fillStyle = dot;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.isDark(row, col)) continue;
      const forced = isFinderZone(row, col, count);
      if (!forced) {
        const xf = -1.2 + 2.4 * (col / count);
        const yf = 1.15 - 2.3 * (row / count);
        if (!inHeart(xf, yf)) continue;
      }
      const cx = offX + col * cell + cell / 2;
      const cy = offY + row * cell + cell / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function roundRect(ctx, x, y, w, h, rad) {
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}
