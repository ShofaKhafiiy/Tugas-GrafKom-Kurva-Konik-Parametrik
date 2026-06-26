// ============================================================
// server.js
// Express static server — Kurva Konik Parametrik
// ============================================================

var express = require('express');
var path    = require('path');

var app  = express();
var PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, function() {
  console.log('======================================');
  console.log(' Kurva Konik Parametrik — Server');
  console.log(' http://localhost:' + PORT);
  console.log('======================================');
});