// ============================================================
// canvasAnimator.js  [v4 — theme-aware grid]
// ============================================================

var AnimatorState = {
  canvas: null,
  ctx: null,
  W: 0,
  H: 0,
  animId: null,
  showLines: true,
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
  lastPoints: null,
  lastSpeedMs: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  offsetStartX: 0,
  offsetStartY: 0,
  highlightPoint: null,
  highlightTimer: null,
  hoverPoint: null
};

function initCanvas() {
  AnimatorState.canvas = document.getElementById('mainCanvas');
  AnimatorState.ctx    = AnimatorState.canvas.getContext('2d');
  AnimatorState.W      = AnimatorState.canvas.width;
  AnimatorState.H      = AnimatorState.canvas.height;
  AnimatorState.canvas.style.cursor = 'grab';

  AnimatorState.canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    setZoom(AnimatorState.scale * (e.deltaY > 0 ? 0.9 : 1.1));
  }, { passive: false });

  AnimatorState.canvas.addEventListener('mousedown', function(e) {
    AnimatorState.isDragging = true;
    AnimatorState.dragStartX = e.clientX;
    AnimatorState.dragStartY = e.clientY;
    AnimatorState.offsetStartX = AnimatorState.offsetX;
    AnimatorState.offsetStartY = AnimatorState.offsetY;
    AnimatorState.canvas.style.cursor = 'grabbing';
    if (AnimatorState.animId) {
      cancelAnimationFrame(AnimatorState.animId);
      AnimatorState.animId = null;
      document.getElementById('processBtn').disabled = false;
    }
  });

  document.addEventListener('mousemove', function(e) {
    if (!AnimatorState.isDragging) return;
    var dx = e.clientX - AnimatorState.dragStartX;
    var dy = e.clientY - AnimatorState.dragStartY;
    AnimatorState.offsetX = AnimatorState.offsetStartX + dx;
    AnimatorState.offsetY = AnimatorState.offsetStartY + dy;
    redrawCanvas();
  });

  document.addEventListener('mouseup', function(e) {
    if (!AnimatorState.isDragging) return;
    AnimatorState.isDragging = false;
    AnimatorState.canvas.style.cursor = 'grab';
  });

  AnimatorState.canvas.addEventListener('mousemove', function(e) {
    if (AnimatorState.isDragging) return;
    var rect = AnimatorState.canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (AnimatorState.canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (AnimatorState.canvas.height / rect.height);
    var nearest = findNearestPoint(mx, my, 10);
    if (nearest) {
      AnimatorState.hoverPoint = nearest;
    } else if (AnimatorState.hoverPoint) {
      AnimatorState.hoverPoint = null;
    }
    redrawCanvas();
  });

  AnimatorState.canvas.addEventListener('mouseleave', function() {
    if (AnimatorState.hoverPoint) {
      AnimatorState.hoverPoint = null;
      redrawCanvas();
    }
  });

  AnimatorState.canvas.addEventListener('click', function(e) {
    var rect = AnimatorState.canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (AnimatorState.canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (AnimatorState.canvas.height / rect.height);
    var nearest = findNearestPoint(mx, my, 10);
    if (nearest && typeof highlightTableRow === 'function') {
      highlightTableRow(nearest.index);
    }
  });
}

function mapCoordinate(x, y) {
  var cx = AnimatorState.W / 2;
  var cy = AnimatorState.H / 2;
  var s  = AnimatorState.scale;
  return { px: cx + x * s + AnimatorState.offsetX, py: cy - y * s + AnimatorState.offsetY };
}

function findNearestPoint(cx, cy, threshold) {
  if (!AnimatorState.lastPoints) return null;
  var best = null;
  var bestDist = threshold;
  for (var i = 0; i < AnimatorState.lastPoints.length; i++) {
    var pt = AnimatorState.lastPoints[i];
    var m = mapCoordinate(pt.x, pt.y);
    var dx = m.px - cx;
    var dy = m.py - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = { point: pt, px: m.px, py: m.py, index: i };
    }
  }
  return best;
}

// Check if body has 'light' class
function isLightMode() {
  return document.body.classList.contains('light');
}

function getNiceStep(raw) {
  if (raw <= 0) return 1;
  var mag = Math.pow(10, Math.floor(Math.log10(raw)));
  var residual = raw / mag;
  if (residual <= 1.5) return 1 * mag;
  if (residual <= 3.5) return 2 * mag;
  if (residual <= 7.5) return 5 * mag;
  return 10 * mag;
}

function drawGrid() {
  var ctx   = AnimatorState.ctx;
  var W     = AnimatorState.W;
  var H     = AnimatorState.H;
  var cx    = W / 2;
  var cy    = H / 2;
  var ox    = AnimatorState.offsetX;
  var oy    = AnimatorState.offsetY;
  var s     = AnimatorState.scale;
  var light = isLightMode();

  ctx.fillStyle = light ? '#f8fafc' : '#04060b';
  ctx.fillRect(0, 0, W, H);

  // Adaptive step — world units
  var labelStep = getNiceStep(80 / s);
  var gridStep  = Math.max(labelStep / 5, labelStep / Math.ceil(labelStep * s / 5));

  // World boundaries visible on canvas (with pan offset)
  var minWX = (-cx - ox) / s;
  var maxWX = (W - cx - ox) / s;
  var minWY = (cy + oy - H) / s;
  var maxWY = (cy + oy) / s;

  // Decimal places for labels
  var decimals = 0;
  if (labelStep < 1) {
    decimals = Math.min(Math.ceil(-Math.log10(labelStep)), 6);
  }

  // ── Grid minor ──
  ctx.strokeStyle = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;

  var startGX = Math.ceil(minWX / gridStep) * gridStep;
  for (var wx = startGX; wx <= maxWX; wx += gridStep) {
    var px = cx + wx * s + ox;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
  }
  var startGY = Math.ceil(minWY / gridStep) * gridStep;
  for (var wy = startGY; wy <= maxWY; wy += gridStep) {
    var py = cy - wy * s + oy;
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
  }

  // ── Sumbu X Y ──
  ctx.strokeStyle = light ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  var axisX = cy + oy;
  var axisY = cx + ox;
  ctx.beginPath(); ctx.moveTo(0, axisX); ctx.lineTo(W, axisX); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(axisY, 0); ctx.lineTo(axisY, H); ctx.stroke();

  // ── Tick marks + label ──
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillStyle = light ? 'rgba(71,85,105,0.7)' : 'rgba(100,116,139,0.6)';

  // X-axis
  ctx.textAlign = 'center';
  var startLX = Math.ceil(minWX / labelStep) * labelStep;
  for (var wx = startLX; wx <= maxWX; wx += labelStep) {
    if (Math.abs(wx) < 1e-9) continue;
    var px = cx + wx * s + ox;
    if (px < 0 || px > W) continue;
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, axisX - 3); ctx.lineTo(px, axisX + 3); ctx.stroke();
    ctx.fillText(wx.toFixed(decimals), px, axisX + 13);
  }

  // Y-axis
  ctx.textAlign = 'right';
  var startLY = Math.ceil(minWY / labelStep) * labelStep;
  for (var wy = startLY; wy <= maxWY; wy += labelStep) {
    if (Math.abs(wy) < 1e-9) continue;
    var py = cy - wy * s + oy;
    if (py < 0 || py > H) continue;
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(axisY - 3, py); ctx.lineTo(axisY + 3, py); ctx.stroke();
    ctx.fillText(wy.toFixed(decimals), axisY - 5, py + 3);
  }

  // Label sumbu + origin
  ctx.fillStyle = light ? 'rgba(37,99,235,0.6)' : 'rgba(96,130,200,0.5)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('X', W - 13, axisX - 6);
  ctx.fillText('Y', axisY + 6, 12);
  ctx.fillText('0', axisY + 4, axisX + 12);
}

function redrawCanvas() {
  drawGrid();
  if (!AnimatorState.lastPoints || AnimatorState.lastPoints.length === 0) return;
  var pts = AnimatorState.lastPoints;
  var ctx = AnimatorState.ctx;
  var W = AnimatorState.W;
  var H = AnimatorState.H;

  var lineGrad = ctx.createLinearGradient(0, 0, W, H);
  lineGrad.addColorStop(0, '#00d4ff');
  lineGrad.addColorStop(0.5, '#acb6b8');
  lineGrad.addColorStop(1, '#035c8b');

  var dotColor = isLightMode() ? '#1e293b' : '#ffffff';
  var prevPx = null, prevPy = null;

  for (var i = 0; i < pts.length; i++) {
    var mapped = mapCoordinate(pts[i].x, pts[i].y);
    var px = mapped.px, py = mapped.py;

    if (pts[i].newBranch) { prevPx = null; prevPy = null; }

    if (prevPx !== null && AnimatorState.showLines) {
      ctx.globalAlpha = 0.9;
      drawLineBresenham(ctx, prevPx, prevPy, px, py, lineGrad, 1.5);
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(px, py, 2.8, 0, Math.PI * 2);
    ctx.fill();

    prevPx = px; prevPy = py;
  }

  if (AnimatorState.highlightPoint) {
    var hp = AnimatorState.highlightPoint;
    var hm = mapCoordinate(hp.x, hp.y);
    var grad = ctx.createRadialGradient(hm.px, hm.py, 0, hm.px, hm.py, 22);
    grad.addColorStop(0, 'rgba(59,130,246,0.5)');
    grad.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hm.px, hm.py, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hm.px, hm.py, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(hm.px, hm.py, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (AnimatorState.hoverPoint) {
    var hp = AnimatorState.hoverPoint.point;
    var hm = mapCoordinate(hp.x, hp.y);
    var cx = AnimatorState.W / 2;
    var cy = AnimatorState.H / 2;
    var ox = AnimatorState.offsetX;
    var oy = AnimatorState.offsetY;
    var axisX = cy + oy;
    var axisY = cx + ox;
    var light = isLightMode();

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = light ? 'rgba(100,116,139,0.45)' : 'rgba(148,163,184,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hm.px, hm.py);
    ctx.lineTo(hm.px, axisX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hm.px, hm.py);
    ctx.lineTo(axisY, hm.py);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = light ? '#0f172a' : '#e2e8f0';
    ctx.font = '11px JetBrains Mono, monospace';
    var label = '(' + hp.x.toFixed(2) + ', ' + hp.y.toFixed(2) + ')';
    var tw = ctx.measureText(label).width;
    var pad = 5;
    var bx = hm.px + 14;
    var by = hm.py - 14;
    if (bx + tw + pad * 2 > AnimatorState.W) bx = hm.px - tw - pad * 2 - 6;
    if (by - 8 < 0) by = hm.py + 22;
    ctx.fillStyle = light ? '#ffffff' : '#0d1117';
    ctx.strokeStyle = light ? '#c4cfe0' : '#1e2535';
    ctx.lineWidth = 1;
    ctx.fillRect(bx - pad, by - 8 - pad, tw + pad * 2, 16 + pad * 2);
    ctx.strokeRect(bx - pad, by - 8 - pad, tw + pad * 2, 16 + pad * 2);
    ctx.fillStyle = light ? '#0f172a' : '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx, by);
    ctx.restore();
  }
}

function setZoom(newScale) {
  AnimatorState.scale = Math.max(0.1, Math.min(50, newScale));
  var el = document.getElementById('zoomLevel');
  if (el) el.textContent = Math.round(AnimatorState.scale * 100) + '%';
  if (AnimatorState.lastPoints && AnimatorState.lastPoints.length > 0) {
    redrawCanvas();
  } else {
    drawGrid();
  }
}

function resetView() {
  AnimatorState.offsetX = 0;
  AnimatorState.offsetY = 0;
  setZoom(1.0);
}

function zoomToPoint(pt) {
  if (AnimatorState.highlightTimer) {
    clearTimeout(AnimatorState.highlightTimer);
    AnimatorState.highlightTimer = null;
  }
  var s = 4;
  AnimatorState.scale = s;
  AnimatorState.offsetX = -(pt.x * s);
  AnimatorState.offsetY = pt.y * s;
  var el = document.getElementById('zoomLevel');
  if (el) el.textContent = Math.round(AnimatorState.scale * 100) + '%';
  AnimatorState.highlightPoint = { x: pt.x, y: pt.y };
  redrawCanvas();
  AnimatorState.highlightTimer = setTimeout(function() {
    AnimatorState.highlightPoint = null;
    AnimatorState.highlightTimer = null;
    redrawCanvas();
  }, 3000);
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

  AnimatorState.lastPoints = pointsArray;
  AnimatorState.lastSpeedMs = speedMs || 0;

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