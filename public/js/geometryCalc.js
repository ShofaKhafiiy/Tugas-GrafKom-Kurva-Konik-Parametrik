function calculateCircle(xc, yc, r, delta, tMin, tMax) {
  var points = [];
  var steps = Math.round((tMax - tMin) / delta);
  for (var i = 0; i <= steps; i++) {
    var t = tMin + i * delta;
    points.push({
      x: xc + r * Math.cos(t),
      y: yc + r * Math.sin(t)
    });
  }
  return points;
}

function calculateEllipse(xc, yc, a, b, delta, tMin, tMax) {
  var points = [];
  var steps = Math.round((tMax - tMin) / delta);
  for (var i = 0; i <= steps; i++) {
    var t = tMin + i * delta;
    points.push({
      x: xc + a * Math.cos(t),
      y: yc + b * Math.sin(t)
    });
  }
  return points;
}

function calculateParabola(xc, yc, a, delta, tMin, tMax) {
  var points = [];
  var steps = Math.round((tMax - tMin) / delta);
  for (var i = 0; i <= steps; i++) {
    var t = tMin + i * delta;
    points.push({
      x: xc + a * t * t,
      y: yc + 2 * a * t
    });
  }
  return points;
}

function calculateHyperbola(xc, yc, a, b, delta, tMin, tMax) {
  var points = [];
  var steps = Math.round((tMax - tMin) / delta);
  for (var i = 0; i <= steps; i++) {
    var t = tMin + i * delta;
    points.push({
      x: xc + a * Math.cosh(t),
      y: yc + b * Math.sinh(t)
    });
  }
  return points;
}
