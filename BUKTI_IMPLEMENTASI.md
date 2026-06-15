# Bukti Implementasi — Perbaikan Kurva Konik Parametrik

Dokumen ini menjelaskan secara lengkap alasan dan bukti bahwa 5 point perbaikan
telah diimplementasikan pada branch `feature-tambah-fitur-lain`.

---

## 1. Garis Penghubung Antar Titik

### Masalah
Saat animasi render berjalan, titik-titik kurva tampil sendiri-sendiri tanpa
garis penghubung yang terlihat jelas, sehingga sulit melihat bentuk kurva
sebelum animasi selesai.

### Solusi
Mempertebal dan memperjelas garis penghubung antar titik berurutan.

### File & Baris: `public/js/canvasAnimator.js:209-227`

```js
// Garis penghubung jika titik sebelumnya berdekatan (< 40px)
if (prevPx !== null) {
  var dx   = px - prevPx;
  var dy   = py - prevPy;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 40) {                          // ← batas jarak: 20 → 40
    ctx.save();
    ctx.strokeStyle  = grad;                // gradient ungu-pink-kuning-cyan
    ctx.lineWidth    = 3;                   // ← tebal: 1.6 → 3
    ctx.globalAlpha  = 0.8;                 // ← opacity: 0.6 → 0.8
    ctx.shadowColor  = '#5B8FFF';
    ctx.shadowBlur   = 4;
    ctx.beginPath();
    ctx.moveTo(prevPx, prevPy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();
  }
}
```

### Perubahan
| Properti | Sebelum | Sesudah |
|----------|---------|---------|
| `lineWidth` | 1.6 | 3 |
| `globalAlpha` | 0.6 | 0.8 |
| Batas jarak (`dist <`) | 20px | 40px |
| `shadowBlur` | 0 | 4 |

### Bukti
- Setiap frame animasi, segmen garis dari titik sebelumnya ke titik terbaru
  digambar dengan warna gradient dan glow.
- Garis menumpuk (akumulasi) karena canvas tidak pernah dibersihkan antar frame,
  sehingga seluruh kurva terlihat sebagai satu garis utuh sejak awal animasi.

---

## 2. Simetri Lingkaran

### Masalah
Loop `for (var t = tMin; t <= tMax + 0.00001; t += delta)` menggunakan fudge
factor `0.00001` yang menyebabkan:
- Titik terakhir tidak tepat di `t = 2π` (error floating point)
- Distribusi titik tidak merata (tidak simetris)
- Lingkaran tidak menutup sempurna

### Solusi
Ganti iterasi `t += delta` dengan **step count** (jumlah langkah tetap),
sehingga semua titik terdistribusi sempurna dari `tMin` hingga `tMax`.

### File & Baris: `public/js/geometryCalc.js:12-20`

```js
function calculateCircle(xc, yc, r, delta, tMin, tMax) {
  var points = [];
  var steps = Math.round((tMax - tMin) / delta);  // ← step count tetap
  if (steps < 1) steps = 1;
  for (var i = 0; i <= steps; i++) {
    var t = tMin + (tMax - tMin) * i / steps;      // ← t presisi penuh
    var x = xc + r * Math.cos(t);
    var y = yc + r * Math.sin(t);
    points.push({ x: x, y: y, t: t });
  }
  return points;
}
```

### Perubahan
| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Iterasi | `t += delta` | step count (i/steps) |
| Kondisi loop | `t <= tMax + 0.00001` | `i <= steps` |
| Fudge factor | 0.00001 | Tidak ada |
| Titik pertama & terakhir | Tidak presisi | Tepat di tMin & tMax |

### Bukti (test via terminal)
```
Circle: 127 points, closure error: 0.000000
Simetri: ✓ BAIK
```

Nilai `closure error = 0.000000` membuktikan titik pertama `(0,5)` dan
titik terakhir `(0,5)` identik — lingkaran menutup sempurna.

Hal yang sama diterapkan pada **Elips** (`calculateEllipse`, baris 30-38).

---

## 3. Konversi ke Radian

### Masalah
Semua preset lingkaran dan elips menggunakan nilai hardcoded `6.28` untuk
`tMax` (yang seharusnya `2π = 6.283185307179586`). Nilai `6.28` adalah
pembulatan yang kurang presisi, menyebabkan lingkaran/elips tidak menutup
sempurna.

### Solusi
Definisi konstanta `TWO_PI = 2 * Math.PI` dan gunakan di semua tempat.

### File & Baris: `public/js/ui.js:9`

```js
var TWO_PI = 2 * Math.PI;   // = 6.283185307179586
```

Kemudian digunakan di:
- **Baris 21**: `{ id: 'tMax', val: TWO_PI, ... }` — def param lingkaran
- **Baris 33**: `{ id: 'tMax', val: TWO_PI, ... }` — def param elips
- **Baris 86-91**: Semua 6 preset lingkaran: `tMax: TWO_PI`
- **Baris 97-102**: Semua 6 preset elips: `tMax: TWO_PI`

### Perubahan
| Lokasi | Sebelum | Sesudah |
|--------|---------|---------|
| Semua `val: 6.28` | 6.28 (2 desimal) | `TWO_PI` (15 desimal) |

### Bukti
```
grep '6.28' public/js/ui.js → (tidak ada output) ✓
```
Tidak ada lagi hardcoded `6.28` di seluruh file.

---

## 4. Parabola — Min/Max Agar Imbang

### Masalah
Parameter tMin/tMax parabola diatur manual oleh user. Jika nilai terlalu besar,
kurva keluar dari canvas (x/y > lebar canvas). Jika terlalu kecil, kurva
terlalu kecil. Tidak ada panduan otomatis agar kurva "imbang" (proporsional
dan pas di canvas).

### Solusi
Fungsi `getBalancedParabolaRange(a, orientation)` menghitung batas t
maksimum agar kurva tidak melebihi `±200px` dari pusat canvas, dengan
mempertimbangkan baik sumbu kuadratik (t²) maupun linear (t).

### File & Baris: `public/js/geometryCalc.js:43-66`

```js
function getBalancedParabolaRange(a, orientation) {
  var m = 200;  // maksimum extent dari pusat (px)
  if (orientation === 'right' || orientation === 'left') {
    // x = a·t², y = 2·a·t
    var tFromX = Math.sqrt(m / a);   // batas dari sumbu X
    var tFromY = m / (2 * a);        // batas dari sumbu Y
    return { tMin: -Math.min(tFromX, tFromY),
             tMax:  Math.min(tFromX, tFromY) };
  } else {
    // x = 2·a·t, y = a·t²
    var tFromX = m / (2 * a);
    var tFromY = Math.sqrt(m / a);
    return { tMin: -Math.min(tFromX, tFromY),
             tMax:  Math.min(tFromX, tFromY) };
  }
}
```

Di dalam `calculateParabola`, tMin/tMax user di-clamp ke range seimbang:
```js
var r = getBalancedParabolaRange(a, orientation);
var adjMin = Math.max(tMin, r.tMin);   // clamp bawah
var adjMax = Math.min(tMax, r.tMax);   // clamp atas
```

### Perhitungan (contoh a=1, orientasi kanan)
| Sumbu | Rumus | Batas t |
|-------|-------|---------|
| X | `a·t² ≤ 200` → `t² ≤ 200` | `t ≤ √200 ≈ 14.14` |
| Y | `2·a·t ≤ 200` → `t ≤ 100` | `t ≤ 100` |
| Hasil | `min(14.14, 100)` | **t ∈ [-14.14, 14.14]** |

### Perubahan
| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| t range | Manual user (bisa overflow) | Auto-clamp ke rentang seimbang |
| m (max extent) | 14 (terlalu kecil) | 200 (pas di canvas 680×480) |

### Bukti (test via terminal)
```
Parabola a=1 balanced range: ±14.14
Parabola a=4 balanced range: ±7.07
```

Dengan a=1 dan t range user [-10, 10] (masuk dalam ±14.14), kurva extends
ke x=100px dan y=±20px — proporsional dan pas di canvas.

---

## 5. Hiperbola — 2 Cabang

### Masalah
Implementasi lama hanya menghasilkan **1 cabang** (yang terlihat) karena:
- t range `[-2.5, 2.5]` melewati singularitas di `±π/2`
- Cabang kiri terbelah dua (t < -π/2 dan t > π/2) dan tidak membentuk
  kurva utuh
- Cabang kanan muncul normal dari t ∈ (-π/2, π/2)
- Hasil: hanya cabang kanan yang terlihat jelas

### Solusi
Generate **2 branch eksplisit** dari t range yang sama:
- **Cabang kanan**: `(xc + a·sec(t), yc + b·tan(t))` untuk t ∈ (-π/2, π/2)
- **Cabang kiri**: `(xc - a·sec(t), yc + b·tan(t))` untuk t + π offset
  (setara dengan `(xc + a·sec(t+π), yc + b·tan(t+π))`)

### File & Baris: `public/js/geometryCalc.js:82-130`

```js
if (orientation === 'horizontal') {
  // ── Cabang Kanan ──
  for (var i = 0; i <= steps; i++) {
    var t = safeMin + (safeMax - safeMin) * i / steps;
    // ... skip singularitas ...
    points.push({ x: xc + a * secT, y: yc + b * tanT, t: t });
  }
  // ── Cabang Kiri (sec dibalik tanda = offset π) ──
  for (var i = 0; i <= steps; i++) {
    var t = safeMin + (safeMax - safeMin) * i / steps;
    // ... skip singularitas ...
    points.push({ x: xc - a * secT, y: yc + b * tanT, t: t + Math.PI });
  }
}
```

Untuk orientasi **vertical**: cabang atas `+a·sec(t)` dan cabang bawah `-a·sec(t)`.

### Perubahan
| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Jumlah branch | 1 (kanan saja) | 2 (kiri + kanan) |
| Cabang kiri | Terbelah, tidak utuh | Utuh (57 titik) |
| Cabang kanan | 63 titik dari range [-2.5,2.5] | 57 titik dari range aman [-1.4,1.4] |
| Total titik horizontal | ~99 | 114 |
| Total titik vertical | ~99 | 114 |
| Singularitas | Skip | Skip + safe range [-1.4, 1.4] |

### Bukti (test via terminal)
```
Hiperbola horizontal: 114 total, left: 57, right: 57
Kedua cabang: ✓ TERGAMBAR

Vertikal - Cabang atas: 57, Cabang bawah: 57
```

---

## Ringkasan File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `public/js/geometryCalc.js` | Step count loop (circle, ellipse), `getBalancedParabolaRange`, 2-branch hyperbola |
| `public/js/canvasAnimator.js` | Line width 3px, threshold 40px, alpha 0.8, shadow glow |
| `public/js/ui.js` | `TWO_PI` constant, replace all `6.28` |
| `BUKTI_IMPLEMENTASI.md` | Dokumen ini |

## Cara Verifikasi (test otomatis)

```bash
node << 'EOF'
var fs = require('fs');
eval(fs.readFileSync('public/js/geometryCalc.js', 'utf-8'));

// 1. Lingkaran simetri
var c = calculateCircle(0,0,5,0.05,0,2*Math.PI);
console.log('1. Lingkaran closure error:', Math.hypot(c[0].x-c[c.length-1].x, c[0].y-c[c.length-1].y));

// 2. Hiperbola 2 cabang
var h = calculateHyperbola(0,0,80,60,0.05,-1.4,1.4,'horizontal');
console.log('2. Hiperbola - kiri:', h.filter(p=>p.x<0).length, 'kanan:', h.filter(p=>p.x>0).length);

// 3. Parabola range
var r = getBalancedParabolaRange(1, 'right');
console.log('3. Parabola a=1 range: ±' + r.tMax.toFixed(2));

// 4. Cek 6.28
var ui = fs.readFileSync('public/js/ui.js', 'utf-8');
console.log('4. Hardcoded 6.28:', ui.indexOf('6.28') >= 0 ? 'MASIH ADA' : 'SUDAH DIGANTI');
EOF
```
