# AGENTS.md — Panduan AI untuk Tim Kurva Konik Parametrik

Dokumen ini memastikan semua anggota tim mendapatkan output yang konsisten
dari AI apapun (ChatGPT, Claude, Gemini, DeepSeek, Copilot, dll) sehingga
kode tidak bentrok saat di-merge.

---

## 1. Aturan Global

| Aturan | Nilai |
|--------|-------|
| Bahasa kode | Inggris (variable, function, comment) |
| Bahasa UI/teks | Indonesia (label, alert, innerText) |
| Indentasi | 2 spasi (bukan tab) |
| Encoding | UTF-8 tanpa BOM |
| Line ending | LF (Unix) |

## 2. Branch Convention

Setiap anggota mengerjakan 1 US di branch terpisah:

| US | Branch | PIC |
|----|--------|-----|
| US 1.1 | `US-1.1-milih-bentuk` | Anggota 1 |
| US 1.2 | `US-1.2-manipulasi-param` | Anggota 2 |
| US 2.1 | `US-2.1-visualisasi-proses` | Anggota 3 |
| US 2.2 | `US-2.2-bentuk-akhir` | Anggota 4 |

Buat branch dari `main`:
```
git checkout main
git pull origin main
git checkout -b US-1.1-milih-bentuk
```

## 3. Urutan Merge (WAJIB)

```
main → US-1.1 → US-1.2 → US-2.1 → US-2.2 → main
```

Alasan: Setiap US membutuhkan fungsi/file dari US sebelumnya.
Jangan merge sebelum US sebelumnya sudah masuk ke main.

## 4. File Mapping per US

### US 1.1 — Milih Bentuk Geometri
| File | Tindakan |
|------|----------|
| `public/index.html` | BUAT: struktur HTML, `<select>`, `<div id="parameter-inputs">` |
| `public/js/ui.js` | BUAT: event listener dropdown, `renderParams()`, `getParamDefs()` |
| `public/css/style.css` | BUAT: styling form, select, input, grid layout |

### US 1.2 — Manipulasi Parameter & Kalkulasi
| File | Tindakan |
|------|----------|
| `public/js/geometryCalc.js` | BUAT: 4 fungsi kalkulasi parametrik |
| `public/js/ui.js` | EDIT: tambah `validate()`, `processCurve()`, koneksi tombol |
| `public/css/style.css` | EDIT: styling tambahan jika perlu |

### US 2.1 — Visualisasi Proses Render
| File | Tindakan |
|------|----------|
| `public/index.html` | EDIT: tambah `<canvas id="renderCanvas">` |
| `public/js/canvasAnimator.js` | BUAT: `mapCoordinate()`, `drawGrid()`, `animateCurve()` |
| `public/css/style.css` | EDIT: styling canvas, grid, overlay |

### US 2.2 — Visualisasi Bentuk Akhir & Live Tracking
| File | Tindakan |
|------|----------|
| `public/index.html` | EDIT: tambah live-coordinates, render-status, analysis-panel |
| `public/js/canvasAnimator.js` | EDIT: update DOM setiap frame, fetch POST |
| `public/js/ui.js` | EDIT: tambah `showAnalysis()` |
| `public/css/style.css` | EDIT: styling info-panel, analysis-panel |
| `server.js` | BUAT: Express server, POST `/api/save-curve` |
| `package.json` | BUAT: dependency express |

## 5. Code Style

### JavaScript
- Variable & function: `camelCase` (contoh: `getParamDefs`, `processCurve`)
- Konstanta: `UPPER_SNAKE_CASE` jika perlu
- String: petik tunggal `'...'` (kecuali template literal)
- Titik koma: WAJIB `;` di akhir statement
- Komentar: DILARANG menambahkan komentar penjelasan
- console.log: HANYA untuk debugging, hapus sebelum commit
- Indentasi: 2 spasi

### HTML
- Tag: lowercase
- Attribute: double quotes `="..."`
- Indentasi: 2 spasi
- ID unik, class semantic

### CSS
- Selector: lowercase dengan `-` (contoh: `.param-grid`, `.btn-primary`)
- Indentasi: 2 spasi
- Warna: format `#hex` atau `rgba()`

## 6. Aturan Fungsi (Method Contract)

Jangan mengubah nama, parameter, atau return type fungsi dari US lain.

| Fungsi | Parameter | Return |
|--------|-----------|--------|
| `calculateCircle` | `(xc, yc, r, delta, tMin, tMax)` | `[{x, y, t}, ...]` |
| `calculateEllipse` | `(xc, yc, a, b, delta, tMin, tMax)` | `[{x, y, t}, ...]` |
| `calculateParabola` | `(xc, yc, a, delta, tMin, tMax, orientation, maxExtent?)` | `[{x, y, t}, ...]` |
| `calculateHyperbola` | `(xc, yc, a, b, delta, tMin, tMax, orientation)` | `[{x, y, t}, ...]` |
| `mapCoordinate` | `(x, y)` | `{px: number, py: number}` |
| `drawGrid` | `()` | `void` |
| `animateCurve` | `(pointsArray, speedMs, onDone?)` | `void` |
| `renderParams` | `(defs)` | `void` |
| `validate` | `(vals, curveType)` | `boolean` |
| `processCurve` | `()` | `void` |
| `showAnalysis` | `(curveType, vals)` | `void` |
| `getParamDefs` | `(curveType)` | `[{id, label, val, type, ...}, ...]` |
| `getBalancedParabolaRange` | `(a, orientation, maxExtent?)` | `{tMin, tMax}` |
| `getPresets` | `(curveType)` | `[{name, desc, params}, ...]` |
| `renderPresets` | `(presets)` | `void` |
| `applyPreset` | `(preset)` | `void` |
| `getFormValues` | `(defs)` | `{...}` |
| `updateAnalysis` | `()` | `void` |
| `renderParamsAndPresets` | `(curveType)` | `void` |
| `addLog` | `(msg)` | `void` |
| `initCanvas` | `()` | `void` |
| `saveCurveToServer` | `(pointsArray)` | `void` |

## 7. Commit Message Format

```
[US-1.1] feat: <pesan dalam Bahasa Indonesia>
[US-1.2] feat: <pesan>
[US-2.1] feat: <pesan>
[US-2.2] feat: <pesan>
```

Contoh:
```
[US-1.1] feat: tambah dropdown pilih kurva dan form dinamis
```

## 8. Checklist Sebelum Push

- [ ] Semua file yang dimodifikasi sudah di `git status`
- [ ] Tidak ada file dari US lain yang ikut terubah
- [ ] `console.log` sudah dihapus
- [ ] Fungsi tidak berubah signature-nya
- [ ] Cek bentrok: `git diff main --name-only`
- [ ] Test lokal: `node server.js` lalu buka `http://localhost:3000`

## 9. Larangan

- ❌ Jangan mengubah file yang bukan tanggung jawab US Anda
- ❌ Jangan menghapus kode dari US lain
- ❌ Jangan menambah komentar penjelasan
- ❌ Jangan mengubah nama/parameter/return type fungsi yang sudah ada
- ❌ Jangan push ke `main` langsung (selalu lewat merge)
