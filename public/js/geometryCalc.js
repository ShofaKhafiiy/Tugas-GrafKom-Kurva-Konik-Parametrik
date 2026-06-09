// ============================================================
// geometryCalc.js
// Kalkulasi titik kurva konik parametrik
// ============================================================

// ------------------------------------------------------------
// LINGKARAN
// x = xc + r · cos(θ)
// y = yc + r · sin(θ)
// θ ∈ [tMin, tMax], step = delta
// ------------------------------------------------------------
function calculateCircle(xc, yc, r, delta, tMin, tMax) {
  var points = [];
  for (var t = tMin; t <= tMax + 0.00001; t += delta) {
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
  for (var t = tMin; t <= tMax + 0.00001; t += delta) {
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
// t ∈ [tMin, tMax], step = delta
// ------------------------------------------------------------
function calculateParabola(xc, yc, a, delta, tMin, tMax, orientation) {
  var points = [];
  for (var t = tMin; t <= tMax + 0.00001; t += delta) {
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
// θ ∈ (π/2, 3π/2) → cabang kiri  (diimplementasi via offset)
//
// Orientasi:
//   horizontal  : dua cabang kiri–kanan, sumbu transversal X
//   vertical    : dua cabang atas–bawah, sumbu transversal Y
//   left-branch : hanya cabang kiri
// ------------------------------------------------------------
function calculateHyperbola(xc, yc, a, b, delta, tMin, tMax, orientation) {
  var points = [];
  for (var t = tMin; t <= tMax + 0.00001; t += delta) {
    var cosT = Math.cos(t);
    if (Math.abs(cosT) < 0.012) continue; // hindari singularitas di ±π/2
    var secT = 1 / cosT;
    var tanT = Math.tan(t);
    var x, y;
    if (orientation === 'horizontal') {
      // Dua cabang: sec(θ) > 0 → kanan, sec(θ) < 0 → kiri
      x = xc + a * secT;
      y = yc + b * tanT;
    } else if (orientation === 'vertical') {
      // Swap sumbu transversal ke Y
      x = xc + b * tanT;
      y = yc + a * secT;
    } else if (orientation === 'left-branch') {
      // Paksa hanya cabang kiri: balik tanda sec
      x = xc - a * Math.abs(secT);
      y = yc + b * tanT;
    }
    points.push({ x: x, y: y, t: t });
  }
  return points;
}