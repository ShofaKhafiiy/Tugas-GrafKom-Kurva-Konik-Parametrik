// ============================================================
// canvasAnimator.js  [v4 — theme-aware grid]
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

// Deteksi apakah body punya class 'light'
function isLightMode() {
  return document.body.classList.contains('light');
}

function drawGrid() {
  var ctx   = AnimatorState.ctx;
  var W     = AnimatorState.W;
  var H     = AnimatorState.H;
  var cx    = W / 2;
  var cy    = H / 2;
  var light = isLightMode();

  // Background — dark mode gelap, light mode putih keabuan
  ctx.fillStyle = light ? '#f8fafc' : '#04060b';
  ctx.fillRect(0, 0, W, H);

  var gridStep = 40;

  // Grid minor
  ctx.strokeStyle = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (var gx = cx % gridStep; gx < W; gx += gridStep) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (var gy = cy % gridStep; gy < H; gy += gridStep) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // Sumbu X Y
  ctx.strokeStyle = light ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

  // Tick marks + label
  var tickStep = 80;
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillStyle = light ? 'rgba(71,85,105,0.7)' : 'rgba(100,116,139,0.6)';

  ctx.textAlign = 'center';
  for (var tx = cx + tickStep; tx < W - 10; tx += tickStep) {
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx, cy-3); ctx.lineTo(tx, cy+3); ctx.stroke();
    ctx.fillText(Math.round(tx - cx), tx, cy + 13);
  }
  for (var tx2 = cx - tickStep; tx2 > 10; tx2 -= tickStep) {
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx2, cy-3); ctx.lineTo(tx2, cy+3); ctx.stroke();
    ctx.fillText(Math.round(tx2 - cx), tx2, cy + 13);
  }
  ctx.textAlign = 'right';
  for (var ty = cy - tickStep; ty > 10; ty -= tickStep) {
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-3, ty); ctx.lineTo(cx+3, ty); ctx.stroke();
    ctx.fillText(Math.round(cy - ty), cx - 5, ty + 3);
  }
  for (var ty2 = cy + tickStep; ty2 < H - 10; ty2 += tickStep) {
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-3, ty2); ctx.lineTo(cx+3, ty2); ctx.stroke();
    ctx.fillText(Math.round(cy - ty2), cx - 5, ty2 + 3);
  }

  // Label sumbu
  ctx.fillStyle = light ? 'rgba(37,99,235,0.6)' : 'rgba(96,130,200,0.5)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('X', W - 13, cy - 6);
  ctx.fillText('Y', cx + 6, 12);
  ctx.fillText('0', cx + 4, cy + 12);
}

function drawLineBresenham(ctx, x0, y0, x1, y1, color, radius) {
  var ix = Math.round(x0), iy = Math.round(y0);
  var ex = Math.round(x1), ey = Math.round(y1);
  var dx = Math.abs(ex - ix), dy = -Math.abs(ey - iy);
  var sx = ix < ex ? 1 : -1, sy = iy < ey ? 1 : -1;
  var err = dx + dy;
  ctx.fillStyle = color;
  while (true) {
    ctx.beginPath();
    ctx.arc(ix, iy, radius || 1, 0, Math.PI * 2);
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

  // Warna garis — cyan/teal
  var lineGrad = ctx.createLinearGradient(0, 0, W, H);
  lineGrad.addColorStop(0,    '#00d4ff');
  lineGrad.addColorStop(0.5,  '#acb6b8');
  lineGrad.addColorStop(1,    '#035c8b');

  // Warna titik — putih di dark mode, hitam di light mode
  var dotColor = isLightMode() ? '#1e293b' : '#ffffff';

  drawGrid();

  function step() {
    if (i >= total) {
      var elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      document.getElementById('statusText').textContent =
        '✓ Selesai — ' + elapsed + 's · ' + total + ' titik';
      document.getElementById('processBtn').disabled = false;
      if (onDone) onDone(elapsed, total);
      return;
    }

    var pt     = pointsArray[i];
    var mapped = mapCoordinate(pt.x, pt.y);
    var px     = mapped.px;
    var py     = mapped.py;

    if (pt.newBranch) { prevPx = null; prevPy = null; }

    // Garis dulu
    if (prevPx !== null && AnimatorState.showLines) {
      ctx.globalAlpha = 0.9;
      drawLineBresenham(ctx, prevPx, prevPy, px, py, lineGrad, 1.5);
      ctx.globalAlpha = 1;
    }

    // Titik
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(px, py, 2.8, 0, Math.PI * 2);
    ctx.fill();

    prevPx = px; prevPy = py;
    i++;

    document.getElementById('valX').textContent = pt.x.toFixed(2);
    document.getElementById('valY').textContent = pt.y.toFixed(2);
    document.getElementById('valT').textContent = pt.t.toFixed(3);
    var branchInfo = pt.branch ? ' · Cabang ' + pt.branch : '';
    document.getElementById('statusText').textContent =
      'Rendering ' + i + ' / ' + total + branchInfo;

    if (speedMs > 0) {
      setTimeout(function() { AnimatorState.animId = requestAnimationFrame(step); }, speedMs);
    } else {
      AnimatorState.animId = requestAnimationFrame(step);
    }
  }

  step();
}