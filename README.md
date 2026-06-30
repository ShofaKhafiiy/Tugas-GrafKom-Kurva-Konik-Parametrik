# Pembangkitan Kurva Konik Parametrik

**Tugas Mata Kuliah Grafika Komputer — Semester 4**

> Visualisasi interaktif pembangkitan kurva konik parametrik berbasis web.
> Lingkaran, Elips, Parabola, dan Hiperbola dirender secara animatif step-by-step
> menggunakan algoritma representasi parametrik dengan dukungan simetri, preset,
> dan analisis properti kurva.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-blue?logo=vercel)](https://kurva-konik-parametrik.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/ShofaKhafiiy/Tugas-GrafKom-Kurva-Konik-Parametrik)

---

## Daftar Isi

- [Sekilas Tentang](#sekilas-tentang)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Cara Menjalankan](#cara-menjalankan)
- [Penggunaan](#penggunaan)
- [Algoritma](#algoritma)
  - [Lingkaran — 8-Way Symmetry](#lingkaran--8-way-symmetry)
  - [Elips — 4-Way Symmetry](#elips--4-way-symmetry)
  - [Parabola — Power-Law Distribution](#parabola--power-law-distribution)
  - [Hiperbola — Dua Cabang](#hiperbola--dua-cabang)
- [API Server](#api-server)
- [User Stories](#user-stories)
- [Lisensi](#lisensi)

---

## Sekilas Tentang

Project ini adalah tugas mata kuliah **Grafika Komputer** yang bertujuan untuk
mengimplementasikan pembangkitan kurva konik (lingkaran, elips, parabola, hiperbola)
menggunakan **representasi parametrik**. Setiap kurva digambar secara animatif
titik-per-titik di atas kanvas HTML5, menampilkan proses rendering *step-by-step*
sehingga pengguna dapat memahami bagaimana kurva terbentuk dari kumpulan titik
parametrik.

### Tujuan Pembelajaran

- Memahami konsep **parametric equation** untuk kurva konik
- Mengimplementasikan **8-way symmetry** (lingkaran) dan **4-way symmetry** (elips)
  untuk efisiensi komputasi
- Menerapkan **power-law distribution** pada parabola agar distribusi titik lebih merata
- Membangun **hiperbola dua cabang** dengan pendekatan parametrik
- Mengintegrasikan seluruh komponen menjadi aplikasi web interaktif yang *responsive*
  dan memiliki *user experience* yang baik

---

## Fitur

### Kalkulasi Kurva
| Fitur | Detail |
|-------|--------|
| **Lingkaran** | Parametrik `x = xc + r·cos(t)`, `y = yc + r·sin(t)` — 8-way symmetry |
| **Elips** | Parametrik `x = xc + a·cos(t)`, `y = yc + b·sin(t)` — 4-way symmetry |
| **Parabola** | 4 orientasi (kanan, kiri, atas, bawah) — power-law distribution |
| **Hiperbola** | Horizontal, vertikal, cabang kiri — menghasilkan 2 cabang dengan label |

### Interaktivitas
- **Pilih kurva** melalui dropdown (Lingkaran, Elips, Parabola, Hiperbola)
- **Parameter masukan** dinamis sesuai tipe kurva (pusat, jari-jari, sumbu, delta, rentang t)
- **Slider** untuk parameter terbatas (r, a, b, delta) — nilai dapat diubah via slider atau input number
- **Preset cepat** untuk mencoba berbagai konfigurasi dengan satu klik
- **Animasi render** titik-per-titik dengan delay yang bisa diatur (0–50ms)
- **Toggle garis** — tampilkan/sembunyikan garis penghubung antar titik

### Visualisasi
- **Grid koordinat** adaptif dengan sumbu X dan Y, tick marks, dan label
- **Zoom & Pan** — scroll untuk zoom (sensitifitas adaptif), drag untuk geser canvas
- **Tombol zoom** — perbesar, perkecil, dan atur ulang tampilan
- **Hover tooltip** — menampilkan koordinat (X, Y) real-time saat kursor di atas titik
- **Klik titik** — sorot baris tabel data yang sesuai dan zoom ke titik tersebut
- **Info bar** — menampilkan koordinat X, Y, parameter t, status, dan progres rendering
- **Panel analisis** — menampilkan formula parametrik dan properti kurva (eksentrisitas, luas, dll)
- **Log keluaran** — mencatat setiap langkah proses rendering
- **Tabel data** — daftar koordinat tiap titik; klik baris untuk zoom ke titik tersebut

### Tampilan & Pengalaman
- **Dark mode & Light mode** — toggle tema dengan ikon
- **Responsive** — mendukung desktop dan tablet
- **Modal notifikasi** — menggantikan `alert()` dengan popup kustom (blur background)

---

## Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| **HTML5 + CSS3** | Struktur dan styling halaman |
| **Vanilla JavaScript (ES5)** | Logika aplikasi — tanpa framework/library eksternal |
| **Canvas API** | Rendering kurva, grid, dan elemen visual |
| **Node.js + Express** | Server backend — menyimpan riwayat kurva |
| **Vercel** | Deployment production (static output di folder `public/`) |

---

## Struktur Proyek

```
/
├── public/                      # Root direktori untuk deployment
│   ├── index.html               # Halaman utama aplikasi
│   ├── css/
│   │   └── style.css            # Styling lengkap (dark/light, responsive)
│   ├── js/
│   │   ├── geometryCalc.js      # Kalkulasi parametrik 4 kurva konik
│   │   ├── canvasAnimator.js    # Render canvas, animasi, grid, interaksi
│   │   └── ui.js                # Interaksi UI, form, validasi, analisis
├── server.js                    # Express server (POST /api/save-curve)
├── vercel.json                  # Konfigurasi deployment Vercel
├── AGENTS.md                    # Panduan AI untuk kolaborasi tim
└── README.md                    # Dokumentasi ini
```

---

## Cara Menjalankan

### Prasyarat

- Node.js >= 14.x
- npm atau yarn

### Lokal (dengan server)

```bash
# Clone repository
git clone https://github.com/ShofaKhafiiy/Tugas-GrafKom-Kurva-Konik-Parametrik.git
cd Tugas-GrafKom-Kurva-Konik-Parametrik

# Install dependencies (express)
npm install

# Jalankan server
node server.js

# Buka di browser
# http://localhost:3000
```

### Lokal (static-only, tanpa server)

```bash
# Buka langsung file HTML
# Cukup buka public/index.html di browser
# Catatan: fitur save ke server tidak akan berfungsi
```

### Deployment ke Vercel

Hubungkan repository GitHub ke Vercel secara otomatis.
Konfigurasi deployment sudah ada di `vercel.json`:

```json
{
  "version": 2,
  "outputDirectory": "public"
}
```

Akses: [https://kurva-konik-parametrik.vercel.app](https://kurva-konik-parametrik.vercel.app)

---

## Penggunaan

### 1. Memilih Kurva
Pilih kurva dari dropdown di panel kiri: **Lingkaran**, **Elips**, **Parabola**, atau **Hiperbola**.
Parameter masukan akan berubah sesuai tipe kurva yang dipilih.

### 2. Mengatur Parameter
Isi parameter di form yang tersedia:
- **xc, yc** — koordinat pusat/puncak
- **r** — jari-jari (lingkaran)
- **a, b** — sumbu semi-mayor dan semi-minor (elips/hiperbola)
- **a** — parameter fokus (parabola)
- **Δ (delta)** — interval step parameter t (semakin kecil, semakin halus kurva)
- **t₀, t₁** — rentang parameter t (dalam radian)
- **Orientasi** — arah bukaan (parabola/hiperbola)

Parameter dengan batas nilai (r, a, b, delta) dapat diatur melalui slider atau diketik langsung.

Gunakan **Preset Cepat** untuk mencoba konfigurasi populer.

### 3. Proses & Animasi
Klik tombol **Render Kurva** untuk memulai animasi rendering.
Kecepatan animasi dapat diatur melalui slider **Kecepatan** (0ms = tanpa delay).
Info bar akan menampilkan koordinat live dan progres setiap titik.

### 4. Navigasi Canvas
- **Zoom**: scroll touchpad/mouse atau tombol `+` / `−` di pojok kanan atas canvas
- **Pan**: klik dan drag canvas
- **Reset tampilan**: klik tombol `↺`
- **Hover**: arahkan kursor ke titik untuk melihat koordinat
- **Klik**: klik titik untuk zoom dan sorot baris tabel data

---

## Algoritma

### Lingkaran — 8-Way Symmetry

```
x(θ) = xc + r · cos(θ)
y(θ) = yc + r · sin(θ)
θ ∈ [0, 2π]
```

Lingkaran penuh hanya menghitung **1 oktan** pertama (θ ∈ [0, π/4]),
lalu mencerminkan (mirror) ke 7 oktan lainnya secara instan.
Ini mengurangi jumlah kalkulasi trigonometri hingga **87.5%**
dibanding perhitungan naif 360°.

```
Oktan 0: (x, y)       → Oktan 1: (y, x)
Oktan 2: (-y, x)      → Oktan 3: (-x, y)
Oktan 4: (-x, -y)     → Oktan 5: (-y, -x)
Oktan 6: (y, -x)      → Oktan 7: (x, -y)
```

### Elips — 4-Way Symmetry

```
x(θ) = xc + a · cos(θ)
y(θ) = yc + b · sin(θ)
θ ∈ [0, 2π]
```

Elips penuh menghitung **1 kuadran** pertama (θ ∈ [0, π/2]),
lalu mirror ke 3 kuadran lainnya. Titik diurutkan berdasarkan sudut
agar animasi berjalan rapi dari 0° hingga 360°.

### Parabola — Power-Law Distribution

```
Buka kanan:  x = xc + a·t²,   y = yc + 2·a·t
Buka kiri:   x = xc - a·t²,   y = yc + 2·a·t
Buka atas:   x = xc + 2·a·t,  y = yc + a·t²
Buka bawah:  x = xc + 2·a·t,  y = yc - a·t²
```

Parabola menggunakan **power-law distribution** untuk distribusi parameter t.
Alih-alih t linear, nilai t didistribusikan dengan eksponen 0.55 sehingga
titik lebih terkonsentrasi di dekat puncak (gradien lebih curam di ujung
dikompensasi). Fungsi `getBalancedParabolaRange()` menghitung rentang t
optimal berdasarkan parameter a dan orientasi.

### Hiperbola — Dua Cabang

```
Horizontal:
  Cabang kanan: x = xc + a · sec(t), y = yc + b · tan(t)
  Cabang kiri:  x = xc - a · sec(t), y = yc + b · tan(t)

Vertikal:
  Cabang atas:  x = xc + b · tan(t), y = yc + a · sec(t)
  Cabang bawah: x = xc + b · tan(t), y = yc - a · sec(t)

t ∈ (-π/2, π/2) dengan safety margin 0.03 rad dari asimtot
```

Hiperbola menghasilkan **dua cabang** dari rentang t yang sama.
Setiap titik memiliki properti `branch` ('Kanan'/'Kiri' atau 'Atas'/'Bawah')
dan `newBranch` untuk menandai awal cabang baru dalam animasi.

---

## API Server

**Endpoint**: `POST /api/save-curve`

Menyimpan data kurva ke server (array in-memory).

**Request body**:
```json
{
  "curveType": "circle",
  "params": { "xc": 0, "yc": 0, "r": 5, "delta": 0.05, "tMin": 0, "tMax": 6.283 },
  "totalPoints": 126,
  "points": [{"x": 5.00, "y": 0.00, "t": 0.00}, ...]
}
```

**Response**: `{ status: "ok", total: <jumlah_kurva_tersimpan> }`

## Lisensi

Project ini dibuat untuk keperluan tugas mata kuliah **Grafika Komputer — Semester 4**.
Tidak ada lisensi khusus yang diterapkan.
