var currentFrame = null;

function mapCoordinate(x, y, w, h) {
  return {
    x: w / 2 + x,
    y: h / 2 - y
  };
}

function drawGrid(ctx, w, h) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  var cx = w / 2;
  var cy = h / 2;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 0.5;
  for (var i = 0; i <= w; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
  }
  for (var i = 0; i <= h; i += 30) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, h);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (var i = 60; i < w / 2; i += 60) {
    ctx.beginPath();
    ctx.moveTo(cx + i, cy - 3);
    ctx.lineTo(cx + i, cy + 3);
    ctx.stroke();
    ctx.fillText(i, cx + i, cy + 5);
    ctx.beginPath();
    ctx.moveTo(cx - i, cy - 3);
    ctx.lineTo(cx - i, cy + 3);
    ctx.stroke();
    ctx.fillText(-i, cx - i, cy + 5);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (var i = 60; i < h / 2; i += 60) {
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - i);
    ctx.lineTo(cx + 3, cy - i);
    ctx.stroke();
    ctx.fillText(i, cx - 5, cy - i);
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy + i);
    ctx.lineTo(cx + 3, cy + i);
    ctx.stroke();
    ctx.fillText(-i, cx - 5, cy + i);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('0', cx + 4, cy - 4);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('X', w - 6, cy - 4);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Y', cx + 4, 4);
}

function animateCurve(pointsArray) {
  if (currentFrame) {
    cancelAnimationFrame(currentFrame);
  }

  var canvas = document.getElementById('renderCanvas');
  var ctx = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;
  var total = pointsArray.length;
  var index = 0;

  var statusDiv = document.getElementById('render-status');
  var coordDiv = document.getElementById('live-coordinates');

  drawGrid(ctx, w, h);

  var gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#8B5CF6');
  gradient.addColorStop(0.5, '#EF4444');
  gradient.addColorStop(1, '#FBBF24');

  function drawNext() {
    if (index >= total) {
      if (statusDiv) {
        statusDiv.textContent = 'Status: Selesai!';
      }
      return;
    }

    var p = pointsArray[index];
    var mapped = mapCoordinate(p.x, p.y, w, h);

    if (coordDiv) {
      coordDiv.textContent = 'Koordinat saat ini: X=' + p.x.toFixed(2) + ', Y=' + p.y.toFixed(2);
    }

    if (statusDiv) {
      statusDiv.textContent = 'Status: Merender... ' + (index + 1) + ' dari ' + total;
    }

    ctx.shadowColor = gradient;
    ctx.shadowBlur = 10;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mapped.x, mapped.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (index > 0) {
      var prev = pointsArray[index - 1];
      var prevMapped = mapCoordinate(prev.x, prev.y, w, h);
      var dx = p.x - prev.x;
      var dy = p.y - prev.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(prevMapped.x, prevMapped.y);
        ctx.lineTo(mapped.x, mapped.y);
        ctx.stroke();
      }
    }

    index++;
    currentFrame = requestAnimationFrame(drawNext);
  }

  drawNext();
}

document.addEventListener('DOMContentLoaded', function () {
  var btnCircle = document.getElementById('sample-circle');
  var btnEllipse = document.getElementById('sample-ellipse');
  var btnClear = document.getElementById('sample-clear');

  function generateCirclePoints() {
    var points = [];
    for (var t = 0; t <= 2 * Math.PI; t += 0.05) {
      points.push({ x: 100 * Math.cos(t), y: 100 * Math.sin(t) });
    }
    return points;
  }

  function generateEllipsePoints() {
    var points = [];
    for (var t = 0; t <= 2 * Math.PI; t += 0.05) {
      points.push({ x: 150 * Math.cos(t), y: 80 * Math.sin(t) });
    }
    return points;
  }

  if (btnCircle) {
    btnCircle.addEventListener('click', function () {
      animateCurve(generateCirclePoints());
    });
  }

  if (btnEllipse) {
    btnEllipse.addEventListener('click', function () {
      animateCurve(generateEllipsePoints());
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', function () {
      if (currentFrame) {
        cancelAnimationFrame(currentFrame);
        currentFrame = null;
      }
      var canvas = document.getElementById('renderCanvas');
      var ctx = canvas.getContext('2d');
      drawGrid(ctx, canvas.width, canvas.height);
      var coordDiv = document.getElementById('live-coordinates');
      var statusDiv = document.getElementById('render-status');
      if (coordDiv) {
        coordDiv.textContent = 'Koordinat saat ini: X=--, Y=--';
      }
      if (statusDiv) {
        statusDiv.textContent = 'Status: Kanvas dibersihkan';
      }
    });
  }
});
