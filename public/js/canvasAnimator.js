// ============================================================
// canvasAnimator.js  [v2 — reduced glow]
// Rendering & animasi step-by-step ke HTML Canvas
// ============================================================

var AnimatorState = {
  canvas: null,
  ctx: null,
  W: 0,
  H: 0,
  animId: null,
  showLines: true
};

function initCanvas() {
  AnimatorState.canvas = document.getElementById('mainCanvas');
  AnimatorState.ctx    = AnimatorState.canvas.getContext('2d');
  AnimatorState.W      = AnimatorState.canvas.width;
  AnimatorState.H      = AnimatorState.canvas.height;
}

function mapCoordinate(x, y) {
  var cx = AnimatorState.W / 2;
  var cy = AnimatorState.H / 2;
  return { px: cx + x, py: cy - y };
}

function drawGrid() {
  var ctx = AnimatorState.ctx;
  var W   = AnimatorState.W;
  var H   = AnimatorState.H;
  var cx  = W / 2;
  var cy  = H / 2;

  ctx.fillStyle = '#060a10';
  ctx.fillRect(0, 0, W, H);

  var gridStep = 40;

  // Grid minor
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (var gx = cx % gridStep; gx < W; gx += gridStep) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (var gy = cy % gridStep; gy < H; gy += gridStep) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // Sumbu
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

  // Tick marks
  var tickStep = 80;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(100,110,130,0.7)';

  ctx.textAlign = 'center';
  for (var tx = cx + tickStep; tx < W - 10; tx += tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx, cy-3); ctx.lineTo(tx, cy+3); ctx.stroke();
    ctx.fillText(Math.round(tx - cx), tx, cy + 13);
  }
  for (var tx2 = cx - tickStep; tx2 > 10; tx2 -= tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx2, cy-3); ctx.lineTo(tx2, cy+3); ctx.stroke();
    ctx.fillText(Math.round(tx2 - cx), tx2, cy + 13);
  }
  ctx.textAlign = 'right';
  for (var ty = cy - tickStep; ty > 10; ty -= tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-3, ty); ctx.lineTo(cx+3, ty); ctx.stroke();
    ctx.fillText(Math.round(cy - ty), cx - 6, ty + 4);
  }
  for (var ty2 = cy + tickStep; ty2 < H - 10; ty2 += tickStep) {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-3, ty2); ctx.lineTo(cx+3, ty2); ctx.stroke();
    ctx.fillText(Math.round(cy - ty2), cx - 6, ty2 + 4);
  }

  // Label sumbu
  ctx.fillStyle = 'rgba(80,120,220,0.55)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('X', W - 14, cy - 7);
  ctx.fillText('Y', cx + 7, 13);
  ctx.fillText('0', cx + 4, cy + 13);
}

// Bresenham line
function drawLineBresenham(ctx, x0, y0, x1, y1, color, radius) {
  var ix = Math.round(x0), iy = Math.round(y0);
  var ex = Math.round(x1), ey = Math.round(y1);
  var dx = Math.abs(ex - ix), dy = -Math.abs(ey - iy);
  var sx = ix < ex ? 1 : -1, sy = iy < ey ? 1 : -1;
  var err = dx + dy;
  ctx.fillStyle = color;
  while (true) {
    ctx.beginPath();
    ctx.arc(ix, iy, radius || 1.2, 0, Math.PI * 2);
    ctx.fill();
    if (ix === ex && iy === ey) break;
    var e2 = 2 * err;
    if (e2 >= dy) { err += dy; ix += sx; }
    if (e2 <= dx) { err += dx; iy += sy; }
  }
}

function animateCurve(pointsArray, speedMs, onDone) {
  if (AnimatorState.animId) cancelAnimationFrame(AnimatorState.animId);

  var ctx   = AnimatorState.ctx;
  var W     = AnimatorState.W;
  var H     = AnimatorState.H;
  var total = pointsArray.length;
  var i     = 0;
  var startTime = Date.now();
  var prevPx = null, prevPy = null;

  // Gradient kurva — lebih kalem, opacity dikurangi
  var grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,    'rgba(96, 165, 250, 0.9)');   // biru
  grad.addColorStop(0.35, 'rgba(167,139,250, 0.9)');   // ungu
  grad.addColorStop(0.70, 'rgba(244,114,182, 0.85)');  // pink
  grad.addColorStop(1,    'rgba(52, 211,153, 0.9)');   // hijau

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

    if (pt.newBranch) { prevPx = null; prevPy = null; }

    // Titik — tanpa shadow/glow, langsung fill
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Garis Bresenham — opacity lebih rendah
    if (prevPx !== null && AnimatorState.showLines) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawLineBresenham(ctx, prevPx, prevPy, px, py, grad, 1.2);
      ctx.restore();
    }

    prevPx = px; prevPy = py;
    i++;

    document.getElementById('valX').textContent = pt.x.toFixed(2);
    document.getElementById('valY').textContent = pt.y.toFixed(2);
    document.getElementById('valT').textContent = pt.t.toFixed(3);
    var branchInfo = pt.branch ? ' | Cabang: ' + pt.branch : '';
    document.getElementById('statusText').textContent =
      'Merender... ' + i + ' dari ' + total + branchInfo;

    if (speedMs > 0) {
      setTimeout(function() { AnimatorState.animId = requestAnimationFrame(step); }, speedMs);
    } else {
      AnimatorState.animId = requestAnimationFrame(step);
    }
  }

  step();
}