// ============================================================
// geometryCalc.js
// Kalkulasi titik kurva konik parametrik
// ============================================================

// ------------------------------------------------------------
// degToRad — konversi derajat → radian
// Fungsi trigonometri JS (Math.sin/cos/tan) menerima RADIAN
// ------------------------------------------------------------
function degToRad(deg) {
  return deg * Math.PI / 180;
}

// ------------------------------------------------------------
// LINGKARAN — 8-Way Symmetry (Oktant)
// x = xc + r · cos(θ)
// y = yc + r · sin(θ)
// θ ∈ [tMin, tMax]
// Untuk lingkaran penuh (0—2π): hitung hanya θ ∈ [0, π/4],
//   lalu mirror ke 7 oktan lain → simetri sempurna.
// ------------------------------------------------------------
function calculateCircle(xc, yc, r, delta, tMin, tMax) {
  var points = [];
  var range = tMax - tMin;
  var isFullCircle = range >= 2 * Math.PI - 0.001;

  if (isFullCircle) {
    var octSteps = Math.round((Math.PI / 4) / delta);
    if (octSteps < 1) octSteps = 1;
    for (var i = 0; i <= octSteps; i++) {
      var theta = (Math.PI / 4) * i / octSteps;
      var cosT = Math.cos(theta);
      var sinT = Math.sin(theta);
      var rx = r * cosT;
      var ry = r * sinT;
      var pts = [
        { x: xc + rx, y: yc + ry, t: theta },
        { x: xc + ry, y: yc + rx, t: Math.PI / 2 - theta },
        { x: xc - ry, y: yc + rx, t: Math.PI / 2 + theta },
        { x: xc - rx, y: yc + ry, t: Math.PI - theta },
        { x: xc - rx, y: yc - ry, t: Math.PI + theta },
        { x: xc - ry, y: yc - rx, t: 3 * Math.PI / 2 - theta },
        { x: xc + ry, y: yc - rx, t: 3 * Math.PI / 2 + theta },
        { x: xc + rx, y: yc - ry, t: 2 * Math.PI - theta }
      ];
      for (var j = 0; j < pts.length; j++) {
        points.push(pts[j]);
      }
    }
    points.sort(function(a, b) { return a.t - b.t; });
    var deduped = [];
    for (var k = 0; k < points.length; k++) {
      if (k > 0 && Math.abs(points[k].t - points[k - 1].t) < 1e-12) continue;
      deduped.push(points[k]);
    }
    points = deduped;
  } else {
    var steps = Math.round(range / delta);
    if (steps < 1) steps = 1;
    for (var i = 0; i <= steps; i++) {
      var t = tMin + range * i / steps;
      points.push({
        x: xc + r * Math.cos(t),
        y: yc + r * Math.sin(t),
        t: t
      });
    }
  }
  return points;
}

// ------------------------------------------------------------
// ELIPS — 4-Way Symmetry (Kuadran)
// x = xc + a · cos(θ)
// y = yc + b · sin(θ)
// θ ∈ [tMin, tMax]
// Untuk elips penuh (0—2π): hitung hanya θ ∈ [0, π/2]
//   (Kuadran 1), lalu mirror ke Kuadran 2, 3, 4 secara instan.
//   Urutan titik di-sortir berdasarkan sudut agar animasi rapi.
// ------------------------------------------------------------
function calculateEllipse(xc, yc, a, b, delta, tMin, tMax) {
  var points = [];
  var range = tMax - tMin;
  var isFullEllipse = range >= 2 * Math.PI - 0.001;

  if (isFullEllipse) {
    var quadSteps = Math.round((Math.PI / 2) / delta);
    if (quadSteps < 1) quadSteps = 1;
    for (var i = 0; i <= quadSteps; i++) {
      var theta = (Math.PI / 2) * i / quadSteps;
      var rx = a * Math.cos(theta);
      var ry = b * Math.sin(theta);
      points.push({ x: xc + rx, y: yc + ry, t: theta });
      points.push({ x: xc - rx, y: yc + ry, t: Math.PI - theta });
      points.push({ x: xc - rx, y: yc - ry, t: Math.PI + theta });
      points.push({ x: xc + rx, y: yc - ry, t: 2 * Math.PI - theta });
    }
    points.sort(function(a, b) { return a.t - b.t; });
    var deduped = [];
    for (var k = 0; k < points.length; k++) {
      if (k > 0 && Math.abs(points[k].t - points[k - 1].t) < 1e-12) continue;
      deduped.push(points[k]);
    }
    points = deduped;
  } else {
    var steps = Math.round(range / delta);
    if (steps < 1) steps = 1;
    for (var i = 0; i <= steps; i++) {
      var t = tMin + range * i / steps;
      points.push({
        x: xc + a * Math.cos(t),
        y: yc + b * Math.sin(t),
        t: t
      });
    }
  }
  return points;
}

// ------------------------------------------------------------
// PARABOLA
// Buka Kanan  : x = xp + a·t²,   y = yp + 2·a·t
// Buka Kiri   : x = xp - a·t²,   y = yp + 2·a·t
// Buka Atas   : x = xp + 2·a·t,  y = yp + a·t²
// Buka Bawah  : x = xp + 2·a·t,  y = yp - a·t²
// (xp, yp) = titik puncak (vertex), a = parameter fokus
// t ∈ [tMin, tMax], step akurat (step count) agar imbang
// ------------------------------------------------------------
function getBalancedParabolaRange(a, orientation, maxExtent = 1000) {
  var m = 1000; // batas maksimum untuk t² agar tidak terlalu besar
  if (orientation === 'right' || orientation === 'left') {
    var tFromX = Math.sqrt(m / a);
    var tFromY = m / (2 * a);
    return { tMin: -Math.min(tFromX, tFromY), tMax: Math.min(tFromX, tFromY) };
  } else {
    var tFromX = m / (2 * a);
    var tFromY = Math.sqrt(m / a);
    return { tMin: -Math.min(tFromX, tFromY), tMax: Math.min(tFromX, tFromY) };
  }
}

function calculateParabola(xc, yc, a, delta, tMin, tMax, orientation, maxExtent) {
  var points = [];
  var r = getBalancedParabolaRange(a, orientation, maxExtent);
  var adjMin = Math.max(tMin, r.tMin);
  var adjMax = Math.min(tMax, r.tMax);
  var steps = Math.round((adjMax - adjMin) / delta);
  if (steps < 1) steps = 1;
  for (var i = 0; i <= steps; i++) {
    var t = adjMin + (adjMax - adjMin) * i / steps;
    var x, y;
    if (orientation === 'right') {
      x = xc + a * t * t;
      y = yc + 2 * a * t;
    } else if (orientation === 'left') {
      x = xc - a * t * t;
      y = yc + 2 * a * t;
    } else if (orientation === 'up') {
      x = xc + 2 * a * t;
      y = yc + a * t * t;
    } else if (orientation === 'down') {
      x = xc + 2 * a * t;
      y = yc - a * t * t;
    }
    points.push({ x: x, y: y, t: t });
  }
  return points;
}

// ------------------------------------------------------------
// HIPERBOLA
// x = xc + a · sec(θ)     sec(θ) = 1/cos(θ)
// y = yc + b · tan(θ)
// θ ∈ (-π/2, π/2) → cabang kanan
// θ ∈ (π/2, 3π/2) → cabang kiri
//
// IMPLEMENTASI:
//   Kedua cabang di-generate dari t range yang SAMA
//   Cabang kanan : (xc + a·sec(t), yc + b·tan(t))
//   Cabang kiri  : (xc - a·sec(t), yc + b·tan(t))  [t + π offset]
//
// Orientasi:
//   horizontal  : dua cabang kiri–kanan, sumbu transversal X
//   vertical    : dua cabang atas–bawah, sumbu transversal Y
//   left-branch : hanya cabang kiri
// ------------------------------------------------------------
function calculateHyperbola(xc, yc, a, b, delta, tMin, tMax, orientation) {
  var points = [];
  var safeMin = Math.max(tMin, -Math.PI / 2 + 0.03);
  var safeMax = Math.min(tMax, Math.PI / 2 - 0.03);
  if (safeMin >= safeMax) return points;
  var steps = Math.round((safeMax - safeMin) / delta);
  if (steps < 1) steps = 1;

  if (orientation === 'horizontal') {
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc + a * secT, y: yc + b * tanT, t: t, branch: 'Kanan' });
    }
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      var p = { x: xc - a * secT, y: yc + b * tanT, t: t + Math.PI, branch: 'Kiri' };
      if (i === 0) p.newBranch = true;
      points.push(p);
    }
  } else if (orientation === 'vertical') {
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc + b * tanT, y: yc + a * secT, t: t, branch: 'Atas' });
    }
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      var p = { x: xc + b * tanT, y: yc - a * secT, t: t + Math.PI, branch: 'Bawah' };
      if (i === 0) p.newBranch = true;
      points.push(p);
    }
  } else if (orientation === 'left-branch') {
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc - a * secT, y: yc + b * tanT, t: t + Math.PI, branch: 'Kiri' });
    }
  }
  return points;
}