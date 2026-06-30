// ============================================================
// UI logic: parameter forms, presets, validation, analysis
// ============================================================

var twoPi = 2 * Math.PI;
var lastCurvePoints = null;
var lastCurveType = null;

// ------------------------------------------------------------
// getParamDefs — definisi field input per kurva
// ------------------------------------------------------------
function getParamDefs(curveType) {
  if (curveType === 'circle') {
    return [
      { id: 'xc',    label: 'Pusat X  (xc)',    val: 0,    type: 'number', step: 1 },
      { id: 'yc',    label: 'Pusat Y  (yc)',    val: 0,    type: 'number', step: 1 },
      { id: 'r',     label: 'Radius  (r)',       val: 100,  type: 'number', step: 1,   min: 1,   max: 400 },
      { id: 'delta', label: 'Delta  (Δθ rad)',   val: 0.05, type: 'number', step: 0.01, min: 0.001, max: 0.5 },
      { id: 'tMin',  label: 'θ min (rad)',       val: 0,    type: 'number', step: 0.1 },
      { id: 'tMax',  label: 'θ max (rad)',       val: twoPi, type: 'number', step: 0.1 }
    ];
  }

  if (curveType === 'ellipse') {
    return [
      { id: 'xc',    label: 'Pusat X  (xc)',       val: 0,    type: 'number', step: 1 },
      { id: 'yc',    label: 'Pusat Y  (yc)',       val: 0,    type: 'number', step: 1 },
      { id: 'a',     label: 'Semi-a  (horizontal)', val: 150,  type: 'number', step: 1,   min: 1,   max: 400 },
      { id: 'b',     label: 'Semi-b  (vertikal)',   val: 80,   type: 'number', step: 1,   min: 1,   max: 400 },
      { id: 'delta', label: 'Delta  (Δθ rad)',    val: 0.05, type: 'number', step: 0.01, min: 0.001, max: 0.5 },
      { id: 'tMin',  label: 'θ min (rad)',        val: 0,    type: 'number', step: 0.1 },
      { id: 'tMax',  label: 'θ max (rad)',        val: twoPi, type: 'number', step: 0.1 }
    ];
  }

  if (curveType === 'parabola') {
    return [
      { id: 'xc',    label: 'Puncak X  (xp)',    val: 0,    type: 'number', step: 1 },
      { id: 'yc',    label: 'Puncak Y  (yp)',    val: 0,    type: 'number', step: 1 },
      { id: 'a',     label: 'Parameter  (a)',     val: 1,    type: 'number', step: 0.1, min: 0.1, max: 10 },
      { id: 'delta', label: 'Delta  (Δt)',        val: 0.1,  type: 'number', step: 0.01, min: 0.001, max: 0.5 },
      { id: 'tMin',  label: 't min',              val: -10,  type: 'number', step: 1 },
      { id: 'tMax',  label: 't max',              val: 10,   type: 'number', step: 1 },
      {
        id: 'orientation', label: 'Orientasi', val: 'right', type: 'select',
        options: [
          { val: 'right', text: '→  Buka Kanan' },
          { val: 'left',  text: '←  Buka Kiri' },
          { val: 'up',    text: '↑  Buka Atas' },
          { val: 'down',  text: '↓  Buka Bawah' }
        ]
      }
    ];
  }

  if (curveType === 'hyperbola') {
    return [
      { id: 'xc',    label: 'Pusat X  (xc)',         val: 0,    type: 'number', step: 1 },
      { id: 'yc',    label: 'Pusat Y  (yc)',         val: 0,    type: 'number', step: 1 },
      { id: 'a',     label: 'Semi-a  (transversal)', val: 80,   type: 'number', step: 1,   min: 1,   max: 400 },
      { id: 'b',     label: 'Semi-b  (konjugasi)',   val: 60,   type: 'number', step: 1,   min: 1,   max: 400 },
      { id: 'delta', label: 'Delta  (Δθ rad)',     val: 0.05, type: 'number', step: 0.01, min: 0.001, max: 0.5 },
      { id: 'tMin',  label: 'θ min (rad)',         val: -1.4, type: 'number', step: 0.05 },
      { id: 'tMax',  label: 'θ max (rad)',         val: 1.4,  type: 'number', step: 0.05 },
      {
        id: 'orientation', label: 'Orientasi', val: 'horizontal', type: 'select',
        options: [
          { val: 'horizontal',  text: '⇔  Horizontal' },
          { val: 'vertical',    text: '⇕  Vertikal' },
          { val: 'left-branch', text: '←  Cabang Kiri' }
        ]
      }
    ];
  }

  return [];
}

// ------------------------------------------------------------
// getPresets — 6 preset per kurva
// ------------------------------------------------------------
function getPresets(curveType) {
  if (curveType === 'circle') {
    return [
      { name: 'Standar',    desc: 'r = 100',          params: { xc:0,   yc:0,  r:100, delta:0.05, tMin:0, tMax:twoPi } },
      { name: 'Besar',      desc: 'r = 200',          params: { xc:0,   yc:0,  r:200, delta:0.04, tMin:0, tMax:twoPi } },
      { name: 'Geser Kiri', desc: 'xc = -100',        params: { xc:-100,yc:0,  r:80,  delta:0.05, tMin:0, tMax:twoPi } },
      { name: 'Geser Atas', desc: 'yc = 80',          params: { xc:0,   yc:80, r:70,  delta:0.05, tMin:0, tMax:twoPi } },
      { name: 'Detail',     desc: 'r=40, Δ=0.02',    params: { xc:0,   yc:0,  r:40,  delta:0.02, tMin:0, tMax:twoPi } },
      { name: 'Pojok',      desc: 'r=70, pojok',      params: { xc:120, yc:100,r:70,  delta:0.05, tMin:0, tMax:twoPi } }
    ];
  }

  if (curveType === 'ellipse') {
    return [
      { name: 'Standar',       desc: 'a=150, b=80',  params: { xc:0,  yc:0, a:150, b:80,  delta:0.05, tMin:0, tMax:twoPi } },
      { name: 'Vertikal',      desc: 'a=60, b=140',  params: { xc:0,  yc:0, a:60,  b:140, delta:0.05, tMin:0, tMax:twoPi } },
      { name: 'Lonjong',       desc: 'a=220, b=40',  params: { xc:0,  yc:0, a:220, b:40,  delta:0.04, tMin:0, tMax:twoPi } },
      { name: 'Hampir Bulat',  desc: 'a=110, b=95',  params: { xc:0,  yc:0, a:110, b:95,  delta:0.05, tMin:0, tMax:twoPi } },
      { name: 'Geser Kanan',   desc: 'xc=100',       params: { xc:100,yc:0, a:100, b:60,  delta:0.05, tMin:0, tMax:twoPi } },
      { name: 'Pipih',         desc: 'a=200, b=20',  params: { xc:0,  yc:0, a:200, b:20,  delta:0.04, tMin:0, tMax:twoPi } }
    ];
  }

  if (curveType === 'parabola') {
    return [
      { name: 'Buka Kanan', desc: 'a=1, kanan',     params: { xc:0, yc:0,  a:1,   delta:0.1,  tMin:-12, tMax:12, orientation:'right' } },
      { name: 'Buka Kiri',  desc: 'a=1, kiri',      params: { xc:0, yc:0,  a:1,   delta:0.1,  tMin:-12, tMax:12, orientation:'left'  } },
      { name: 'Buka Atas',  desc: 'a=1, atas',      params: { xc:0, yc:0,  a:1,   delta:0.1,  tMin:-12, tMax:12, orientation:'up'    } },
      { name: 'Buka Bawah', desc: 'a=1, bawah',     params: { xc:0, yc:0,  a:1,   delta:0.1,  tMin:-12, tMax:12, orientation:'down'  } },
      { name: 'Sempit',     desc: 'a=4',             params: { xc:0, yc:0,  a:4,   delta:0.08, tMin:-7,  tMax:7,  orientation:'right' } },
      { name: 'Landai',     desc: 'a=0.5',           params: { xc:0, yc:50, a:0.5, delta:0.15, tMin:-18, tMax:18, orientation:'right' } }
    ];
  }

  if (curveType === 'hyperbola') {
    return [
      { name: 'Horizontal', desc: 'a=80, b=60',   params: { xc:0,  yc:0, a:80,  b:60, delta:0.05, tMin:-1.4, tMax:1.4, orientation:'horizontal'  } },
      { name: 'Vertikal',   desc: 'a=80, b=60',   params: { xc:0,  yc:0, a:80,  b:60, delta:0.05, tMin:-1.4, tMax:1.4, orientation:'vertical'    } },
      { name: 'Cabang Kiri',desc: 'kiri saja',     params: { xc:0,  yc:0, a:80,  b:60, delta:0.05, tMin:-1.4, tMax:1.4, orientation:'left-branch' } },
      { name: 'Sempit',     desc: 'a=50, b=90',   params: { xc:0,  yc:0, a:50,  b:90, delta:0.04, tMin:-1.3, tMax:1.3, orientation:'horizontal'  } },
      { name: 'Lebar',      desc: 'a=140, b=30',  params: { xc:0,  yc:0, a:140, b:30, delta:0.04, tMin:-1.3, tMax:1.3, orientation:'horizontal'  } },
      { name: 'Geser',      desc: 'xc=80',         params: { xc:80, yc:0, a:80,  b:60, delta:0.05, tMin:-1.4, tMax:1.4, orientation:'horizontal'  } }
    ];
  }

  return [];
}

// ------------------------------------------------------------
// renderParams — render field input ke #paramContainer
// ------------------------------------------------------------
function renderParams(defs) {
  var con = document.getElementById('paramContainer');
  con.innerHTML = '';
  for (var i = 0; i < defs.length; i++) {
    var d    = defs[i];
    var wrap = document.createElement('div');
    wrap.className = 'field';
    if (d.type === 'select') {
      wrap.style.gridColumn = '1 / -1';
    }

    var lbl = document.createElement('label');
    lbl.className = 'field-label';
    lbl.setAttribute('for', 'p_' + d.id);
    lbl.textContent = d.label;
    wrap.appendChild(lbl);

    if (d.type === 'select') {
      var sel = document.createElement('select');
      sel.id  = 'p_' + d.id;
      for (var j = 0; j < d.options.length; j++) {
        var opt = document.createElement('option');
        opt.value     = d.options[j].val;
        opt.textContent = d.options[j].text;
        if (d.options[j].val === d.val) opt.selected = true;
        sel.appendChild(opt);
      }
      wrap.appendChild(sel);
    } else {
      if (d.hasOwnProperty('min') && d.hasOwnProperty('max')) {
        wrap.style.gridColumn = '1 / -1';
        var sliderRow = document.createElement('div');
        sliderRow.className = 'param-slider-row';

        var inp  = document.createElement('input');
        inp.type = 'number';
        inp.id   = 'p_' + d.id;
        inp.value = d.val;
        inp.step  = d.step || 1;
        inp.min   = d.min;
        inp.max   = d.max;
        sliderRow.appendChild(inp);

        var slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'param-slider';
        slider.min = d.min;
        slider.max = d.max;
        slider.step = d.step || ((d.max - d.min) / 100);
        slider.value = d.val;

        slider.addEventListener('input', function(sl, ip) {
          return function() {
            ip.value = sl.value;
            var evt = new Event('input', { bubbles: true });
            ip.dispatchEvent(evt);
          };
        }(slider, inp));

        inp.addEventListener('input', function(sl, ip) {
          return function() {
            sl.value = ip.value;
          };
        }(slider, inp));

        sliderRow.appendChild(slider);
        wrap.appendChild(sliderRow);
      } else {
        var inp  = document.createElement('input');
        inp.type = 'number';
        inp.id   = 'p_' + d.id;
        inp.value = d.val;
        inp.step  = d.step || 1;
        wrap.appendChild(inp);
      }
    }

    con.appendChild(wrap);
  }
}

// ------------------------------------------------------------
// renderPresets — render tombol preset ke #presetGrid
// ------------------------------------------------------------
function renderPresets(presets) {
  var grid = document.getElementById('presetGrid');
  grid.innerHTML = '';
  for (var i = 0; i < presets.length; i++) {
    (function(p) {
      var btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.innerHTML =
        '<span class="pname">' + p.name + '</span>' +
        '<span class="pdesc">' + p.desc + '</span>';
      btn.onclick = function() { applyPreset(p); };
      grid.appendChild(btn);
    })(presets[i]);
  }
}

// ------------------------------------------------------------
// applyPreset — isi form dari nilai preset
// ------------------------------------------------------------
function applyPreset(preset) {
  var params = preset.params;
  for (var key in params) {
    var el = document.getElementById('p_' + key);
    if (el) {
      el.value = params[key];
      var evt = new Event('input', { bubbles: true });
      el.dispatchEvent(evt);
    }
  }
  updateAnalysis();
  addLog('[ PRESET ] ' + preset.name + ' diterapkan.');
}

// ------------------------------------------------------------
// getFormValues — baca semua field berdasarkan defs
// ------------------------------------------------------------
function getFormValues(defs) {
  var vals = {};
  for (var i = 0; i < defs.length; i++) {
    var el = document.getElementById('p_' + defs[i].id);
    if (!el) continue;
    vals[defs[i].id] = (defs[i].type === 'select')
      ? el.value
      : parseFloat(el.value.replace(',', '.'));
  }
  return vals;
}

// ------------------------------------------------------------
// showModal — tampilkan popup notifikasi
// ------------------------------------------------------------
var modalKeyHandler = null;
function showModal(msg) {
  var overlay = document.getElementById('modalOverlay');
  var msgEl   = document.getElementById('modalMsg');
  var btn     = document.getElementById('modalBtn');
  if (!overlay) return;
  msgEl.textContent = msg;
  overlay.classList.add('open');
  btn.focus();
  var close = function() { overlay.classList.remove('open'); };
  btn.onclick = close;
  overlay.onclick = function(e) { if (e.target === overlay) close(); };
  if (modalKeyHandler) document.removeEventListener('keydown', modalKeyHandler);
  modalKeyHandler = function(e) {
    if (e.key === 'Escape' || e.key === 'Enter') {
      close();
      document.removeEventListener('keydown', modalKeyHandler);
      modalKeyHandler = null;
    }
  };
  document.addEventListener('keydown', modalKeyHandler);
}

// ------------------------------------------------------------
// validate — cek input sebelum proses
// ------------------------------------------------------------
function validate(vals, curveType) {
  if (isNaN(vals.delta) || vals.delta <= 0) {
    showModal('Delta harus lebih besar dari 0!'); return false;
  }
  if (vals.tMin >= vals.tMax) {
    showModal('t min harus lebih kecil dari t max!'); return false;
  }
  if (curveType === 'circle' && (isNaN(vals.r) || vals.r <= 0)) {
    showModal('Radius harus > 0!'); return false;
  }
  if ((curveType === 'ellipse' || curveType === 'hyperbola') &&
      (isNaN(vals.a) || vals.a <= 0 || isNaN(vals.b) || vals.b <= 0)) {
    showModal('Semi-a dan semi-b harus > 0!'); return false;
  }
  return true;
}

// ------------------------------------------------------------
// showAnalysis — tampilkan rumus + properti di panel analisis
// ------------------------------------------------------------
function showAnalysis(curveType, vals) {
  var panel = document.getElementById('analysisPanel');
  panel.classList.add('visible');

  var formula = '';
  var props   = [];
  var estPts  = Math.round((vals.tMax - vals.tMin) / vals.delta);

  if (curveType === 'circle') {
    formula =
      'x = ' + vals.xc + ' + ' + vals.r + ' · cos(θ)\n' +
      'y = ' + vals.yc + ' + ' + vals.r + ' · sin(θ)\n' +
      'θ ∈ [' + vals.tMin + ', ' + vals.tMax + ']   Δθ = ' + vals.delta;
    props = [
      { label: 'Pusat',       val: '(' + vals.xc + ', ' + vals.yc + ')' },
      { label: 'Radius r',    val: vals.r },
      { label: 'Keliling ≈ 2πr', val: (2 * Math.PI * vals.r).toFixed(2) },
      { label: 'Luas ≈ πr²', val: (Math.PI * vals.r * vals.r).toFixed(2) },
      { label: 'Delta Δ',     val: vals.delta },
      { label: 'Estimasi Titik', val: estPts }
    ];
  }

  if (curveType === 'ellipse') {
    var amax = Math.max(vals.a, vals.b);
    var bmin = Math.min(vals.a, vals.b);
    var e    = Math.sqrt(1 - (bmin * bmin) / (amax * amax)).toFixed(4);
    formula =
      'x = ' + vals.xc + ' + ' + vals.a + ' · cos(θ)\n' +
      'y = ' + vals.yc + ' + ' + vals.b + ' · sin(θ)\n' +
      'θ ∈ [' + vals.tMin + ', ' + vals.tMax + ']   Δθ = ' + vals.delta;
    props = [
      { label: 'Pusat',         val: '(' + vals.xc + ', ' + vals.yc + ')' },
      { label: 'Semi-a',        val: vals.a },
      { label: 'Semi-b',        val: vals.b },
      { label: 'Eksentrisitas', val: e },
      { label: 'Luas ≈ πab',   val: (Math.PI * vals.a * vals.b).toFixed(2) },
      { label: 'Estimasi Titik', val: estPts }
    ];
  }

  if (curveType === 'parabola') {
    var xEq, yEq;
    if (vals.orientation === 'right') {
      xEq = 'x = ' + vals.xc + ' + ' + vals.a + '·t²';
      yEq = 'y = ' + vals.yc + ' + 2·' + vals.a + '·t';
    } else if (vals.orientation === 'left') {
      xEq = 'x = ' + vals.xc + ' − ' + vals.a + '·t²';
      yEq = 'y = ' + vals.yc + ' + 2·' + vals.a + '·t';
    } else if (vals.orientation === 'up') {
      xEq = 'x = ' + vals.xc + ' + 2·' + vals.a + '·t';
      yEq = 'y = ' + vals.yc + ' + ' + vals.a + '·t²';
    } else if (vals.orientation === 'down') {
      xEq = 'x = ' + vals.xc + ' + 2·' + vals.a + '·t';
      yEq = 'y = ' + vals.yc + ' − ' + vals.a + '·t²';
    }
    formula =
      xEq + '\n' + yEq + '\n' +
      't ∈ [' + vals.tMin + ', ' + vals.tMax + ']   Δt = ' + vals.delta;
    props = [
      { label: 'Puncak (vertex)', val: '(' + vals.xc + ', ' + vals.yc + ')' },
      { label: 'Parameter a',     val: vals.a },
      { label: 'Orientasi',       val: vals.orientation },
      { label: 'Rentang t',       val: '[' + vals.tMin + ', ' + vals.tMax + ']' },
      { label: 'Delta Δ',         val: vals.delta },
      { label: 'Estimasi Titik',  val: estPts }
    ];
  }

  if (curveType === 'hyperbola') {
    var eH, asimLabel, asimVal;
    if (vals.orientation === 'vertical') {
      eH = Math.sqrt(1 + (vals.a * vals.a) / (vals.b * vals.b)).toFixed(4);
      asimLabel = 'Asimtot ±a/b';
      asimVal = '±' + (vals.a / vals.b).toFixed(3) + 'x';
    } else {
      eH = Math.sqrt(1 + (vals.b * vals.b) / (vals.a * vals.a)).toFixed(4);
      asimLabel = 'Asimtot ±b/a';
      asimVal = '±' + (vals.b / vals.a).toFixed(3) + 'x';
    }
    var xEqH, yEqH;
    if (vals.orientation === 'vertical') {
      xEqH = 'x = ' + vals.xc + ' + ' + vals.b + '·tan(θ)';
      yEqH = 'y = ' + vals.yc + ' + ' + vals.a + '·sec(θ)';
    } else if (vals.orientation === 'left-branch') {
      xEqH = 'x = ' + vals.xc + ' − ' + vals.a + '·sec(θ)';
      yEqH = 'y = ' + vals.yc + ' + ' + vals.b + '·tan(θ)';
    } else {
      xEqH = 'x = ' + vals.xc + ' + ' + vals.a + '·sec(θ)';
      yEqH = 'y = ' + vals.yc + ' + ' + vals.b + '·tan(θ)';
    }
    formula =
      xEqH + '\n' + yEqH + '\n' +
      'θ ∈ [' + vals.tMin + ', ' + vals.tMax + ']   Δθ = ' + vals.delta;
    props = [
      { label: 'Pusat',            val: '(' + vals.xc + ', ' + vals.yc + ')' },
      { label: 'Semi-a (transv.)', val: vals.a },
      { label: 'Semi-b (konjug.)', val: vals.b },
      { label: 'Eksentrisitas',    val: eH },
      { label: asimLabel,          val: asimVal },
      { label: 'Estimasi Titik',   val: estPts }
    ];
  }

  document.getElementById('formulaBox').textContent = formula;

  var propsGrid = document.getElementById('propsGrid');
  propsGrid.innerHTML = '';
  for (var i = 0; i < props.length; i++) {
    var item = document.createElement('div');
    item.className = 'prop-item';
    item.innerHTML =
      '<div class="prop-label">' + props[i].label + '</div>' +
      '<div class="prop-val">'   + props[i].val   + '</div>';
    propsGrid.appendChild(item);
  }
}

// ------------------------------------------------------------
// updateAnalysis — refresh analisis dari nilai form saat ini
// ------------------------------------------------------------
function updateAnalysis() {
  var curveType = document.getElementById('curveSelect').value;
  var defs      = getParamDefs(curveType);
  var vals      = getFormValues(defs);
  if (!isNaN(vals.delta) && vals.delta > 0 && vals.tMin < vals.tMax) {
    showAnalysis(curveType, vals);
  }
}

// ------------------------------------------------------------
// renderParamsAndPresets — re-render saat kurva berubah
// ------------------------------------------------------------
function renderParamsAndPresets(curveType) {
  var defs    = getParamDefs(curveType);
  var presets = getPresets(curveType);
  renderParams(defs);
  renderPresets(presets);
  updateAnalysis();
}

// ------------------------------------------------------------
// processCurve — ambil form → hitung → animasi
// ------------------------------------------------------------
function processCurve() {
  var curveType = document.getElementById('curveSelect').value;
  var defs      = getParamDefs(curveType);
  var vals      = getFormValues(defs);

  if (!validate(vals, curveType)) return;

  showAnalysis(curveType, vals);

  var log = document.getElementById('stepLog');
  log.innerHTML = '';
  addLog('[ 1. INISIALISASI ] Kurva: ' + curveType.toUpperCase() +
    ' | Pusat/Puncak: (' + vals.xc + ', ' + vals.yc + ')');
  addLog('[ 2. ITERASI ] Looping t dari ' + vals.tMin +
    ' → ' + vals.tMax + ' dengan Δ = ' + vals.delta);
  addLog('[ 3. KALKULASI ] Menghitung (x, y) parametrik setiap langkah...');
  addLog('[ 4. RENDERING ] Menggambar titik + garis ke canvas...');

  // Hitung semua titik
  var points;
  if (curveType === 'circle') {
    points = calculateCircle(vals.xc, vals.yc, vals.r, vals.delta, vals.tMin, vals.tMax);
  } else if (curveType === 'ellipse') {
    points = calculateEllipse(vals.xc, vals.yc, vals.a, vals.b, vals.delta, vals.tMin, vals.tMax);
  } else if (curveType === 'parabola') {
    var cvs = document.getElementById('mainCanvas');
    var maxExt = Math.min(cvs.width, cvs.height) / 2 * 0.85;
    points = calculateParabola(vals.xc, vals.yc, vals.a, vals.delta, vals.tMin, vals.tMax, vals.orientation, maxExt);
  } else if (curveType === 'hyperbola') {
    points = calculateHyperbola(vals.xc, vals.yc, vals.a, vals.b, vals.delta, vals.tMin, vals.tMax, vals.orientation);
    var branchNames = [];
    if (vals.orientation === 'horizontal') branchNames = ['Kanan', 'Kiri'];
    else if (vals.orientation === 'vertical') branchNames = ['Atas', 'Bawah'];
    else if (vals.orientation === 'left-branch') branchNames = ['Kiri'];
    if (branchNames.length > 0) {
      addLog('[ CABANG ] ' + branchNames.join(' + ') + ' — ' + branchNames.length + ' cabang');
    }
  }

  lastCurveType = curveType;
  lastCurvePoints = points;
  renderDataTable(points, curveType);

  addLog('[ TITIK ] ' + points.length + ' titik dihitung. Memulai animasi...');
  document.getElementById('processBtn').disabled = true;

  var speedMs = parseInt(document.getElementById('speedRange').value);
  animateCurve(points, speedMs, function(elapsed, total) {
    addLog('[ SELESAI ] ' + total + ' titik dirender dalam ' + elapsed + ' detik.');
  });
}

// ------------------------------------------------------------
// renderDataTable — tampilkan tabel input-output di bottombar
// ------------------------------------------------------------
function renderDataTable(points, curveType) {
  var con = document.getElementById('dataTableContainer');
  if (!points || points.length === 0) {
    con.innerHTML = '<div style="padding:8px 14px;color:var(--text-2);">Belum ada data. Render kurva terlebih dahulu.</div>';
    return;
  }

  var paramLabel = (curveType === 'parabola') ? 't' : 'θ (rad)';
  var html = '<table><thead><tr>';
  html += '<th>No</th>';
  html += '<th>' + paramLabel + '</th>';
  html += '<th>X</th>';
  html += '<th>Y</th>';
  html += '</tr></thead><tbody>';

  for (var i = 0; i < points.length; i++) {
    var pt = points[i];
    html += '<tr onclick="zoomToTablePoint(' + i + ')" style="cursor:pointer;">';
    html += '<td>' + (i + 1) + '</td>';
    html += '<td>' + pt.t.toFixed(4) + '</td>';
    html += '<td>' + pt.x.toFixed(4) + '</td>';
    html += '<td>' + pt.y.toFixed(4) + '</td>';
    html += '</tr>';
  }

  html += '</tbody></table>';
  con.innerHTML = html;
}

// ------------------------------------------------------------
// zoomToTablePoint — zoom canvas ke titik dari klik baris tabel
// ------------------------------------------------------------
function zoomToTablePoint(index) {
  if (lastCurvePoints && lastCurvePoints[index]) {
    highlightTableRow(index);
    zoomToPoint(lastCurvePoints[index]);
  }
}

// ------------------------------------------------------------
// highlightTableRow — sorot baris tabel + scroll ke baris tsb
// ------------------------------------------------------------
function highlightTableRow(index) {
  var prev = document.querySelector('#dataTableContainer tr.highlighted');
  if (prev) prev.classList.remove('highlighted');
  var rows = document.querySelectorAll('#dataTableContainer tbody tr');
  if (rows && rows[index]) {
    rows[index].classList.add('highlighted');
    rows[index].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

// ------------------------------------------------------------
// addLog — tambah baris ke #stepLog
// ------------------------------------------------------------
function addLog(msg) {
  var log  = document.getElementById('stepLog');
  var line = document.createElement('div');
  line.className   = 'log-line active';
  line.textContent = msg;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

// ------------------------------------------------------------
// DOMContentLoaded — init semua event listener
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  initCanvas();
  drawGrid();

  var curveSelect = document.getElementById('curveSelect');

  // Dropdown kurva berubah
  curveSelect.addEventListener('change', function() {
    renderParamsAndPresets(this.value);
  });

  // Tab switching (bottombar)
  var tabs = document.querySelectorAll('.bb-tab');
  for (var ti = 0; ti < tabs.length; ti++) {
    (function(tab) {
      tab.addEventListener('click', function() {
        var active = document.querySelector('.bb-tab.active');
        if (active) active.classList.remove('active');
        tab.classList.add('active');
        var target = tab.getAttribute('data-tab');
        document.getElementById('stepLog').style.display = (target === 'log') ? '' : 'none';
        document.getElementById('dataTableContainer').style.display = (target === 'data') ? '' : 'none';
        if (target === 'data' && lastCurvePoints) {
          renderDataTable(lastCurvePoints, lastCurveType);
        }
      });
    })(tabs[ti]);
  }

  // Resize bottombar via drag handle
  var bbResizeHandle = document.querySelector('.bb-resize-handle');
  var bottombar = document.querySelector('.bottombar');
  var minBbHeight = 80;
  var isResizing = false;

  bbResizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true;
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    var bbRect = bottombar.parentElement.getBoundingClientRect();
    var newHeight = bbRect.bottom - e.clientY;
    if (newHeight < minBbHeight) newHeight = minBbHeight;
    bottombar.style.height = newHeight + 'px';
    resizeCanvas();
  });

  document.addEventListener('mouseup', function() {
    isResizing = false;
  });

  // Tombol proses
  document.getElementById('processBtn').addEventListener('click', processCurve);

  // Slider kecepatan
  document.getElementById('speedRange').addEventListener('input', function() {
    document.getElementById('speedVal').textContent = this.value + ' ms';
  });

  // Toggle tampilan garis
  document.getElementById('lineToggle').addEventListener('change', function() {
    AnimatorState.showLines = this.checked;
  });

  // Zoom buttons
  document.getElementById('zoomIn').onclick = function() {
    setZoom(AnimatorState.scale * 1.3);
  };
  document.getElementById('zoomOut').onclick = function() {
    setZoom(AnimatorState.scale / 1.3);
  };
  document.getElementById('zoomReset').onclick = function() {
    resetView();
  };

  // Live analisis saat parameter diubah
  document.getElementById('paramContainer').addEventListener('input', function() {
    updateAnalysis();
  });

  // Init dengan lingkaran
  renderParamsAndPresets('circle');
});