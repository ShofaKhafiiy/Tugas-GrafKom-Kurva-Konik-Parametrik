// US 2.2 — EXPRESS SERVER + POST /api/save-curve
// ============================================================
// server.js
// Express backend — Kurva Konik Parametrik
// Endpoint: POST /api/save-curve
// ============================================================

var express = require('express');
var fs      = require('fs');
var path    = require('path');

var app  = express();
var PORT = 3000;

// ── Middleware ──
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── POST /api/save-curve ──
// Terima data kurva dari frontend, simpan ke data/curves.json
app.post('/api/save-curve', function(req, res) {
  var dataDir  = path.join(__dirname, 'data');
  var filePath = path.join(dataDir, 'curves.json');

  // Buat folder data/ jika belum ada
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Baca data yang sudah ada
  var existing = [];
  if (fs.existsSync(filePath)) {
    try {
      var raw = fs.readFileSync(filePath, 'utf-8');
      existing = JSON.parse(raw);
    } catch (e) {
      existing = [];
    }
  }

  // Tambahkan entri baru dengan timestamp
  var entry = {
    timestamp:   new Date().toISOString(),
    totalPoints: req.body.totalPoints || 0,
    points:      req.body.points      || []
  };

  existing.push(entry);

  // Simpan kembali ke file
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');

  console.log('[SAVE] Kurva disimpan: ' + entry.totalPoints + ' titik @ ' + entry.timestamp);
  res.json({ status: 'ok', totalPoints: entry.totalPoints, timestamp: entry.timestamp });
});

// ── Start server ──
app.listen(PORT, function() {
  console.log('======================================');
  console.log(' Kurva Konik Parametrik — Server');
  console.log(' http://localhost:' + PORT);
  console.log('======================================');
});