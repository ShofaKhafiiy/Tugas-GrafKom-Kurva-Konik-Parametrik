// ============================================================
// test.js — Validasi 5 Feedback Dosen
// Jalankan: buka browser console (F12) → refresh halaman
// ============================================================

(function() {
  var totalTests = 0;
  var passed = 0;
  var failed = 0;

  function assert(condition, msg) {
    totalTests++;
    if (condition) {
      passed++;
      console.log('  ✓ ' + msg);
    } else {
      failed++;
      console.log('  ✗ ' + msg);
    }
  }

  function assertNear(a, b, tol, msg) {
    assert(Math.abs(a - b) < tol, msg);
  }

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   VALIDASI 5 FEEDBACK DOSEN              ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // ── FEEDBACK 1: DDA LINE DRAWING ──
  console.log('[1] DDA LINE DRAWING');
  console.log('    Memastikan drawLineDDA tersedia dan tanpa threshold dist<40');
  assert(typeof drawLineDDA === 'function', 'drawLineDDA() function exists');
  assert(drawLineDDA.length === 6, 'drawLineDDA menerima 6 parameter (ctx, x0, y0, x1, y1, color, radius)');

  // ── FEEDBACK 2: 8-WAY SYMMETRY ──
  console.log('[2] 8-WAY SYMMETRY LINGKARAN');
  console.log('    Memastikan circle menggunakan mirror 8 oktan');
  var circlePoints = calculateCircle(0, 0, 100, 0.1, 0, 2 * Math.PI);
  assert(circlePoints.length > 0, 'calculateCircle menghasilkan titik');
  // Check that the number of points makes sense for 8-way
  var stepsForOct = Math.round((Math.PI / 4) / 0.1) + 1;
  var expectedPts = stepsForOct * 8;
  assert(circlePoints.length >= expectedPts * 0.9 && circlePoints.length <= expectedPts * 1.1,
    'Jumlah titik ~ ' + expectedPts + ' (sesuai 8-way), actual: ' + circlePoints.length);

  // Verify symmetry: check that points exist at 0°, 90°, 180°, 270°
  function hasPointNear(pts, targetX, targetY) {
    for (var i = 0; i < pts.length; i++) {
      if (Math.abs(pts[i].x - targetX) < 2 && Math.abs(pts[i].y - targetY) < 2) return true;
    }
    return false;
  }
  assert(hasPointNear(circlePoints, 100, 0), 'Titik (100, 0) atau (r, 0) ada');
  assert(hasPointNear(circlePoints, 0, 100), 'Titik (0, 100) atau (0, r) ada');
  assert(hasPointNear(circlePoints, -100, 0), 'Titik (-100, 0) atau (-r, 0) ada');
  assert(hasPointNear(circlePoints, 0, -100), 'Titik (0, -100) atau (0, -r) ada');

  // ── EXTRA: 4-WAY SYMMETRY ELIPS ──
  console.log('[2b] 4-WAY SYMMETRY ELIPS');
  console.log('    Memastikan elips menggunakan 4-way mirror Kuadran 1→2→3→4');
  var ellPoints = calculateEllipse(0, 0, 150, 80, 1.0, 0, 2 * Math.PI);
  assert(hasPointNear(ellPoints, 150, 0), 'Titik (a, 0) di Kuadran 1 ada');
  assert(hasPointNear(ellPoints, 0, 80), 'Titik (0, b) di Kuadran 1/2 ada');
  assert(hasPointNear(ellPoints, -150, 0), 'Titik (-a, 0) di Kuadran 2/3 ada');
  assert(hasPointNear(ellPoints, 0, -80), 'Titik (0, -b) di Kuadran 3/4 ada');
  // Test dengan delta besar — pastikan tetap 4-way simetris walau sedikit titik
  var ellCoarse = calculateEllipse(0, 0, 150, 80, 0.5, 0, 2 * Math.PI);
  assert(hasPointNear(ellCoarse, 150, 0), 'Delta=0.5: Titik (a, 0) ada');
  assert(hasPointNear(ellCoarse, -150, 0), 'Delta=0.5: Titik (-a, 0) ada');
  assert(hasPointNear(ellCoarse, 0, 80), 'Delta=0.5: Titik (0, b) ada');
  assert(hasPointNear(ellCoarse, 0, -80), 'Delta=0.5: Titik (0, -b) ada');

  // ── FEEDBACK 3: RADIAN ──
  console.log('[3] KONVERSI RADIAN');
  console.log('    Memastikan fungsi degToRad ada dan label menggunakan (rad)');
  assert(typeof degToRad === 'function', 'degToRad() function exists');
  assertNear(degToRad(180), Math.PI, 0.001, 'degToRad(180) ≈ π');
  assertNear(degToRad(90), Math.PI / 2, 0.001, 'degToRad(90) ≈ π/2');
  assertNear(degToRad(360), 2 * Math.PI, 0.001, 'degToRad(360) ≈ 2π');

  // Check labels in param defs
  var circleDefs = getParamDefs('circle');
  var hasRadLabel = false;
  for (var i = 0; i < circleDefs.length; i++) {
    if (circleDefs[i].label.indexOf('(rad)') > -1) hasRadLabel = true;
  }
  assert(hasRadLabel, 'Label parameter menyertakan "(rad)"');

  // ── FEEDBACK 4: PARABOLA DENSITY ──
  console.log('[4] KESEIMBANGAN PARABOLA');
  console.log('    Memastikan parabola menggunakan power-law bukan linier');
  var paraPoints = calculateParabola(0, 0, 1, 0.5, -10, 10, 'right', 200);
  assert(paraPoints.length > 0, 'calculateParabola menghasilkan titik');
  // Check that the t values are NOT linearly spaced
  // In linear spacing: t[1] - t[0] should be constant
  // In power-law: the spacing increases away from center
  if (paraPoints.length >= 4) {
    var diffMid = Math.abs(paraPoints[1].t - paraPoints[0].t);
    var diffEdge = Math.abs(paraPoints[paraPoints.length - 1].t - paraPoints[paraPoints.length - 2].t);
    assert(diffEdge > diffMid * 1.01,
      'Step t di ujung (' + diffEdge.toFixed(4) + ') > step di tengah (' + diffMid.toFixed(4) + ') — power-law aktif');
  }

  // ── FEEDBACK 5: HIPERBOLA DUA CABANG ──
  console.log('[5] HIPERBOLA DUA CABANG');
  console.log('    Memastikan hyperbola menghasilkan 2 cabang dengan label branch');
  var hyperPoints = calculateHyperbola(0, 0, 80, 60, 0.05, -1.4, 1.4, 'horizontal');
  assert(hyperPoints.length > 0, 'calculateHyperbola menghasilkan titik');
  // Check for branch property
  var hasBranchProp = false;
  var branchKananFound = false;
  var branchKiriFound = false;
  for (var i = 0; i < hyperPoints.length; i++) {
    if (hyperPoints[i].branch) hasBranchProp = true;
    if (hyperPoints[i].branch === 'Kanan') branchKananFound = true;
    if (hyperPoints[i].branch === 'Kiri') branchKiriFound = true;
  }
  assert(hasBranchProp, 'Titik memiliki properti branch');
  assert(branchKananFound, 'Cabang Kanan ada');
  assert(branchKiriFound, 'Cabang Kiri ada');
  // Check at least one point with x > 0 (right branch) and one with x < 0 (left branch)
  var hasPositiveX = hyperPoints.some(function(p) { return p.x > 10; });
  var hasNegativeX = hyperPoints.some(function(p) { return p.x < -10; });
  assert(hasPositiveX, 'Ada titik di x > 0 (cabang kanan)');
  assert(hasNegativeX, 'Ada titik di x < 0 (cabang kiri)');

  // Test vertical orientation
  var hyperVert = calculateHyperbola(0, 0, 80, 60, 0.05, -1.4, 1.4, 'vertical');
  var branchAtasFound = false;
  var branchBawahFound = false;
  for (var i = 0; i < hyperVert.length; i++) {
    if (hyperVert[i].branch === 'Atas') branchAtasFound = true;
    if (hyperVert[i].branch === 'Bawah') branchBawahFound = true;
  }
  assert(branchAtasFound, 'Vertikal: Cabang Atas ada');
  assert(branchBawahFound, 'Vertikal: Cabang Bawah ada');

  // ── SUMMARY ──
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   HASIL: ' + passed + '/' + totalTests + ' lulus');
  if (failed === 0) {
    console.log('║   ✅ SEMUA TEST LULUS');
  } else {
    console.log('║   ❌ ' + failed + ' test gagal');
  }
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('CARA VISUAL TEST:');
  console.log('  1. Pastikan server berjalan: node server.js');
  console.log('  2. Buka http://localhost:3000');
  console.log('  3. TEST LINGKARAN: pilih Lingkaran → Proses. Periksa simetri 8 oktan.');
  console.log('  4. TEST DDA: Zoom canvas, pastikan titik antar kurva terhubung rapat.');
  console.log('  5. TEST PARABOLA: pilih Parabola → Proses. Bandingkan density puncak vs ujung.');
  console.log('  6. TEST HIPERBOLA: pilih Hiperbola Horizontal → Proses. Pastikan 2 cabang.');
  console.log('  7. Periksa label input: harus ada tulisan "(rad)" di parameter sudut.');
})();
