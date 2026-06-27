# Pembangkitan Kurva Konik Parametrik

**Tugas Mata Kuliah Grafika Komputer — Semester 4**

> Visualisasi interaktif pembangkitan kurva konik parametrik berbasis web.
> Lingkaran, Elips, Parabola, dan Hiperbola dirender secara animatif step-by-step
> menggunakan algoritma representasi parametrik dengan dukungan simetri, preset,
> export data, dan analisis properti kurva.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-blue?logo=vercel)](https://kurva-konik-parametrik.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/ShofaKhafiiy/Tugas-GrafKom-Kurva-Konik-Parametrik)
![JavaScript](https://img.shields.io/badge/JavaScript-89.7%25-f7df1e?logo=javascript)
![CSS](https://img.shields.io/badge/CSS-20.8%25-1572b6?logo=css3)
![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?logo=pwa)

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
- [Testing](#testing)
- [User Stories](#user-stories)
- [Kontributor](#kontributor)
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
| **Hiperbola** | Horizontal & vertikal — menghasilkan 2 cabang dengan label |

### Interaktivitas
- **Pilih kurva** melalui kartu pemilihan (Lingkaran, Elips, Parabola, Hiperbola)
- **Parameter masukan** dinamis sesuai tipe kurva (pusat, jari-jari, sumbu, delta, rentang t)
- **Preset cepat** untuk mencoba berbagai konfigurasi dengan satu klik
- **Animasi render** titik-per-titik dengan delay yang bisa diatur
- **Pause / Resume** animasi kapan saja
- **Undo** ke kurva sebelumnya (stack hingga 20 entri)
- **Bandingkan 2 kurva** — simpan kurva saat ini sebagai referensi, lalu render yang baru
- **Reset parameter** ke nilai default

### Visualisasi
- **Grid koordinat** dengan sumbu X dan Y
- **Titik fokus** — menampilkan pusat/fokus pada setiap jenis kurva
- **Garis asimtot** — untuk hiperbola (garis putus-putus merah)
- **Garis directrix** — untuk parabola (garis putus-putus kuning)
- **Tooltip koordinat** — hover pada canvas menampilkan X, Y real-time
- **Info bar** — menampilkan koordinat X, Y, parameter t, status, dan progres
- **Panel analisis** — menampilkan formula parametrik dan properti kurva (eksentrisitas, luas, dll)
- **Riwayat parameter** — daftar kurva yang pernah diproses; klik untuk memuat ulang

### Export & Data
| Fitur | Format |
|-------|--------|
| Export canvas sebagai gambar | PNG |
| Download koordinat kurva | CSV |
| Download data kurva (struktur JSON) | JSON |
| Save ke server | POST `/api/save-curve` |

### Tampilan & Pengalaman
- **Dark mode & Light mode** — toggle tema
- **Layar penuh** — mode fullscreen canvas
- **Responsive** — mendukung desktop, tablet, dan smartphone
- **Shortcut keyboard** — Enter, R, Z, Spasi, F, D, T
- **PWA support** — dapat diinstal sebagai aplikasi desktop/mobile dan berjalan offline

---

## Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| **HTML5 + CSS3** | Struktur dan styling halaman |
| **Vanilla JavaScript (ES5)** | Logika aplikasi — tanpa framework/library eksternal |
| **Canvas API** | Rendering kurva, grid, dan elemen visual |
| **Node.js + Express** | Server backend — menyimpan riwayat kurva |
| **Vercel** | Deployment production (static output di folder `public/`) |
| **PWA (Manifest + Service Worker)** | Installability dan offline caching |
| **GitHub CLI (`gh`)** | Manajemen repository dan kolaborasi tim |

---

## Struktur Proyek

```
/
├── public/                      # Root direktori untuk deployment
│   ├── index.html               # Halaman utama aplikasi
│   ├── manifest.json            # Manifest PWA
│   ├── sw.js                    # Service Worker untuk cache offline
│   ├── css/
│   │   └── style.css            # Styling lengkap (dark/light, responsive)
│   ├── js/
│   │   ├── geometryCalc.js      # Kalkulasi parametrik 4 kurva konik
│   │   ├── canvasAnimator.js    # Render canvas, animasi, grid, ekspor
│   │   ├── ui.js                # Interaksi UI, form, validasi, analisis
│   │   └── test.js              # Validasi 5 feedback dosen (browser console)
│   └── CATATAN_PERUBAHAN.md     # Dokumentasi fitur responsive mobile
├── server.js                    # Express server (POST /api/save-curve)
├── vercel.json                  # Konfigurasi deployment Vercel
├── .vercelignore                # File yang diabaikan Vercel
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

```bash
./deploy.sh
```

Atau hubungkan repository GitHub ke Vercel secara otomatis.
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
Klik kartu kurva di panel kiri: **Lingkaran**, **Elips**, **Parabola**, atau **Hiperbola**.
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

Gunakan **Preset Cepat** untuk mencoba konfigurasi populer.

### 3. Proses & Animasi
Klik tombol **Proses** (atau tekan `Enter`) untuk memulai animasi rendering.
Gunakan **Pause/Resume** (atau tekan `Spasi`) untuk mengontrol animasi.
Progress bar dan koordinat live akan diperbarui setiap titik.

### 4. Fitur Lanjutan
- **Bandingkan**: centang "Bandingkan" untuk menyimpan kurva saat ini sebagai referensi
- **Undo**: klik tombol ↩ atau tekan `Z` untuk kembali ke kurva sebelumnya
- **Export PNG**: klik tombol kamera atau tekan `D`
- **Export CSV**: klik tombol dokumen
- **Fullscreen**: klik tombol ⛶ atau tekan `F`
- **Toggle tema**: klik tombol ⌖ atau tekan `T`
- **Toggle visual**: centang/centang checkbox untuk titik fokus, asimtot, directrix

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

---

## Testing

Tersedia file `public/js/test.js` untuk memvalidasi **5 feedback dosen**:

1. **DDA Line Drawing** — memastikan fungsi `drawLineBresenham` tersedia
2. **8-Way Symmetry** — lingkaran menggunakan mirror 8 oktan, titik (r,0), (0,r), (-r,0), (0,-r) ada
3. **Radian** — fungsi `degToRad()` bekerja, label parameter menyertakan "(rad)"
4. **Parabola Density** — power-law aktif, step t di ujung > step di tengah
5. **Hiperbola Dua Cabang** — titik memiliki properti branch, cabang kanan & kiri (atau atas & bawah) ada

### Cara menjalankan test

```bash
# Jalankan server
node server.js

# Buka http://localhost:3000 di browser
# Buka console (F12) — test otomatis dijalankan oleh test.js
```

Atau buka console di halaman deploy: [https://kurva-konik-parametrik.vercel.app](https://kurva-konik-parametrik.vercel.app)

---

## User Stories

Project ini dikerjakan oleh 4 anggota tim dengan pembagian tugas sebagai berikut:

| US | Branch | Tugas | PIC |
|----|--------|-------|-----|
| **US 1.1** | `US-1.1-milih-bentuk` | Milih Bentuk Geometri — UI pemilihan kurva, form parameter dinamis | Anggota 1 |
| **US 1.2** | `US-1.2-manipulasi-param` | Manipulasi Parameter & Kalkulasi — 4 fungsi kalkulasi parametrik, validasi | Anggota 2 |
| **US 2.1** | `US-2.1-visualisasi-proses` | Visualisasi Proses Render — canvas, grid, animasi titik-per-titik | Anggota 3 |
| **US 2.2** | `US-2.2-bentuk-akhir` | Visualisasi Bentuk Akhir & Live Tracking — info bar, analysis panel, server | Anggota 4 |

Branch tambahan yang telah di-merge:
- `feature-responsive-mobile` — 18 fitur upgrade termasuk PWA, dark/light mode, export, dll
- `fix-perbaikan-matematis-Budi` — perbaikan kalkulasi matematika

Urutan merge wajib: `main → US-1.1 → US-1.2 → US-2.1 → US-2.2 → main`

---

## Kontributor

| Avatar | Nama | GitHub | Kontribusi |
|--------|------|--------|------------|
| <img src="https://avatars.githubusercontent.com/u/118283737?v=4&s=48" width="48" height="48" style="border-radius:50%"> | **MBOEDIK** | [@MBOEDIK](https://github.com/MBOEDIK) | 9 commits |
| <img src="https://avatars.githubusercontent.com/u/142008212?v=4&s=48" width="48" height="48" style="border-radius:50%"> | **ShofaKhafiiy** | [@ShofaKhafiiy](https://github.com/ShofaKhafiiy) | 7 commits |
| <img src="https://avatars.githubusercontent.com/u/140729456?v=4&s=48" width="48" height="48" style="border-radius:50%"> | **Irwand13** | [@Irwand13](https://github.com/Irwand13) | 4 commits |

*Data kontributor diambil langsung dari GitHub API melalui `gh CLI`.*

---

## Lisensi

Project ini dibuat untuk keperluan tugas mata kuliah **Grafika Komputer — Semester 4**.
Tidak ada lisensi khusus yang diterapkan.
