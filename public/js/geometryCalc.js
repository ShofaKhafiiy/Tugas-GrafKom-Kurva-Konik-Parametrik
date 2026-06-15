// ============================================================
// geometryCalc.js
// Kalkulasi titik kurva konik parametrik
// ============================================================

// ------------------------------------------------------------
// LINGKARAN
// x = xc + r · cos(θ)
// y = yc + r · sin(θ)
// θ ∈ [tMin, tMax], step akurat (step count) agar simetri
// ------------------------------------------------------------
function calculateCircle(xc, yc, r, delta, tMin, tMax) {
  var points = [];
  var steps = Math.round((tMax - tMin) / delta);
  if (steps < 1) steps = 1;
  for (var i = 0; i <= steps; i++) {
    var t = tMin + (tMax - tMin) * i / steps;
    var x = xc + r * Math.cos(t);
    var y = yc + r * Math.sin(t);
    points.push({ x: x, y: y, t: t });
  }
  return points;
}

// ------------------------------------------------------------
// ELIPS
// x = xc + a · cos(θ)
// y = yc + b · sin(θ)
// θ ∈ [tMin, tMax], a = semi-horizontal, b = semi-vertikal
// Jika a = b → menjadi lingkaran
// ------------------------------------------------------------
function calculateEllipse(xc, yc, a, b, delta, tMin, tMax) {
  var points = [];
  var steps = Math.round((tMax - tMin) / delta);
  if (steps < 1) steps = 1;
  for (var i = 0; i <= steps; i++) {
    var t = tMin + (tMax - tMin) * i / steps;
    var x = xc + a * Math.cos(t);
    var y = yc + b * Math.sin(t);
    points.push({ x: x, y: y, t: t });
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
function getBalancedParabolaRange(a, orientation) {
  var m = 200;
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

function calculateParabola(xc, yc, a, delta, tMin, tMax, orientation) {
  var points = [];
  var r = getBalancedParabolaRange(a, orientation);
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
      if (Math.abs(cosT) < 0.015) continue;
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc + a * secT, y: yc + b * tanT, t: t });
    }
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      if (Math.abs(cosT) < 0.015) continue;
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc - a * secT, y: yc + b * tanT, t: t + Math.PI });
    }
  } else if (orientation === 'vertical') {
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      if (Math.abs(cosT) < 0.015) continue;
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc + b * tanT, y: yc + a * secT, t: t });
    }
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      if (Math.abs(cosT) < 0.015) continue;
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc + b * tanT, y: yc - a * secT, t: t + Math.PI });
    }
  } else if (orientation === 'left-branch') {
    for (var i = 0; i <= steps; i++) {
      var t = safeMin + (safeMax - safeMin) * i / steps;
      var cosT = Math.cos(t);
      if (Math.abs(cosT) < 0.015) continue;
      var secT = 1 / cosT;
      var tanT = Math.tan(t);
      points.push({ x: xc - a * secT, y: yc + b * tanT, t: t + Math.PI });
    }
  }
  return points;
}