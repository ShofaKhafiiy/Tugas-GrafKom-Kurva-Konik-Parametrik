// US 2.1 — ANIMASI RENDER DI CANVAS

// US 2.2 — LIVE TRACKING + POST /api/save-curve
// ============================================================
// Rendering & animasi step-by-step ke HTML Canvas
// Depends on: DOM element #mainCanvas
// ============================================================

var AnimatorState = {
  canvas: null,
  ctx: null,
  W: 0,
  H: 0,
  animId: null,
  showLines: true
};

// ------------------------------------------------------------
// Init – panggil sekali setelah DOM siap
// ------------------------------------------------------------
function initCanvas() {
  AnimatorState.canvas = document.getElementById('mainCanvas');
  AnimatorState.ctx    = AnimatorState.canvas.getContext('2d');
  AnimatorState.W      = AnimatorState.canvas.width;
  AnimatorState.H      = AnimatorState.canvas.height;
}

// ------------------------------------------------------------
// mapCoordinate
// Konversi koordinat matematis (x, y) → piksel layar (px, py)
// Pusat kanvas = origin (0,0)
// Sumbu Y dibalik: matematis naik = layar naik (bukan turun)
// ------------------------------------------------------------
function mapCoordinate(x, y) {
  var cx = AnimatorState.W / 2;
  var cy = AnimatorState.H / 2;
  return {
    px: cx + x,
    py: cy - y    // balik Y
  };
}

// ------------------------------------------------------------
// drawGrid
// Background gelap + grid spasi 40px + sumbu X/Y tebal
// Tick marks setiap 80px dengan label angka
// ------------------------------------------------------------
function drawGrid() {
  var ctx = AnimatorState.ctx;
  var W   = AnimatorState.W;
  var H   = AnimatorState.H;
  var cx  = W / 2;
  var cy  = H / 2;

  // Background
  ctx.fillStyle = '#030508';
  ctx.fillRect(0, 0, W, H);

  var gridStep = 40;

  // Grid minor
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (var gx = cx % gridStep; gx < W; gx += gridStep) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }
  for (var gy = cy % gridStep; gy < H; gy += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }

  // Sumbu X
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  // Sumbu Y
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.stroke();

  // Tick marks + angka
  var tickStep = 80;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(122,132,154,0.75)';

  // Tick X positif
  ctx.textAlign = 'center';
  for (var tx = cx + tickStep; tx < W - 10; tx += tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx, cy - 4);
    ctx.lineTo(tx, cy + 4);
    ctx.stroke();
    ctx.fillText(Math.round(tx - cx), tx, cy + 14);
  }

  // Tick X negatif
  for (var tx2 = cx - tickStep; tx2 > 10; tx2 -= tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx2, cy - 4);
    ctx.lineTo(tx2, cy + 4);
    ctx.stroke();
    ctx.fillText(Math.round(tx2 - cx), tx2, cy + 14);
  }

  // Tick Y positif (atas)
  ctx.textAlign = 'right';
  for (var ty = cy - tickStep; ty > 10; ty -= tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 4, ty);
    ctx.lineTo(cx + 4, ty);
    ctx.stroke();
    ctx.fillText(Math.round(cy - ty), cx - 7, ty + 4);
  }

  // Tick Y negatif (bawah)
  for (var ty2 = cy + tickStep; ty2 < H - 10; ty2 += tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 4, ty2);
    ctx.lineTo(cx + 4, ty2);
    ctx.stroke();
    ctx.fillText(Math.round(cy - ty2), cx - 7, ty2 + 4);
  }

  // Label sumbu
  ctx.fillStyle = 'rgba(91,143,255,0.65)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('X', W - 14, cy - 8);
  ctx.fillText('Y', cx + 8,  14);
  ctx.fillText('0', cx + 5,  cy + 14);
}

// ------------------------------------------------------------
// drawLineBresenham — Algoritma Bresenham
// Menghasilkan titik-titik antara (x0,y0) dan (x1,y1)
// Menggunakan integer arithmetic — tanpa floating point
// ------------------------------------------------------------
function drawLineBresenham(ctx, x0, y0, x1, y1, color, radius) {
  var ix = Math.round(x0);
  var iy = Math.round(y0);
  var ex = Math.round(x1);
  var ey = Math.round(y1);
  var dx = Math.abs(ex - ix);
  var dy = -Math.abs(ey - iy);
  var sx = ix < ex ? 1 : -1;
  var sy = iy < ey ? 1 : -1;
  var err = dx + dy;
  ctx.fillStyle = color;
  while (true) {
    ctx.beginPath();
    ctx.arc(ix, iy, radius || 1.5, 0, Math.PI * 2);
    ctx.fill();
    if (ix === ex && iy === ey) break;
    var e2 = 2 * err;
    if (e2 >= dy) { err += dy; ix += sx; }
    if (e2 <= dx) { err += dx; iy += sy; }
  }
}

// ------------------------------------------------------------
// animateCurve
// Render titik satu per satu dengan animasi requestAnimationFrame
// pointsArray : array { x, y, t } dari geometryCalc
// speedMs     : delay milidetik antar frame (0 = secepat mungkin)
// onDone      : callback setelah selesai (optional)
// ------------------------------------------------------------
function animateCurve(pointsArray, speedMs, onDone) {
  if (AnimatorState.animId) {
    cancelAnimationFrame(AnimatorState.animId);
  }

  var ctx   = AnimatorState.ctx;
  var W     = AnimatorState.W;
  var H     = AnimatorState.H;
  var total = pointsArray.length;
  var i     = 0;
  var startTime = Date.now();
  var prevPx = null;
  var prevPy = null;

  // Gradient warna kurva (ungu → pink → kuning → cyan)
  var grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,    '#5B8FFF');
  grad.addColorStop(0.35, '#FF6B9D');
  grad.addColorStop(0.70, '#ffd166');
  grad.addColorStop(1,    '#00D4AA');

  drawGrid();

  function step() {
    if (i >= total) {
      var elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      document.getElementById('statusText').textContent =
        '✓ Selesai! ' + elapsed + ' dtk, ' + total + ' titik';
      document.getElementById('processBtn').disabled = false;

      if (onDone) onDone(elapsed, total);
      return;
    }

    var pt     = pointsArray[i];
    var mapped = mapCoordinate(pt.x, pt.y);
    var px     = mapped.px;
    var py     = mapped.py;

    // Angkat pulpen jika titik ini memulai cabang baru (hiperbola)
    if (pt.newBranch) {
      prevPx = null;
      prevPy = null;
    }

    // Titik dengan shadow glow
    ctx.save();
    ctx.shadowColor = '#5B8FFF';
    ctx.shadowBlur  = 7;
    ctx.fillStyle   = grad;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Garis penghubung Bresenham — selalu gambar antar titik berurutan
    if (prevPx !== null && AnimatorState.showLines) {
      ctx.save();
      ctx.shadowColor = '#5B8FFF';
      ctx.shadowBlur  = 4;
      ctx.globalAlpha = 0.7;
      drawLineBresenham(ctx, prevPx, prevPy, px, py, grad, 1.5);
      ctx.restore();
    }

    prevPx = px;
    prevPy = py;
    i++;

    // Update DOM live
    document.getElementById('valX').textContent = pt.x.toFixed(2);
    document.getElementById('valY').textContent = pt.y.toFixed(2);
    document.getElementById('valT').textContent = pt.t.toFixed(3);
    var branchInfo = pt.branch ? ' | Cabang: ' + pt.branch : '';
    document.getElementById('statusText').textContent =
      'Merender... ' + i + ' dari ' + total + branchInfo;

    if (speedMs > 0) {
      setTimeout(function() {
        AnimatorState.animId = requestAnimationFrame(step);
      }, speedMs);
    } else {
      AnimatorState.animId = requestAnimationFrame(step);
    }
  }

  step();
}

