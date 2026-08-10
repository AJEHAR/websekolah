# Laman Web SK Pendidikan Khas Kuantan

Projek asas (skeleton) laman web sekolah — React + Vite + Tailwind CSS, dihoskan di GitHub Pages.

## Tema Reka Bentuk
- **Palet warna:** diambil dari logo sekolah — hitam (`#1A1A1A`), merah (`#C8102E`), kuning emas (`#F2C230`), atas latar putih/kelabu cair (`#FAFAFA`)
- **Fon:** Poppins
- **Gaya:** Minimalis moden, mesra accessibility (kontras tinggi, saiz teks lebih besar, fokus kibod jelas)
- **Pendekatan:** Mobile-first — reka untuk telefon dahulu, "upscale" untuk desktop
  - Mobile (< 1024px): header ringkas (logo + hamburger + log masuk) + **SideDrawer** (slide dari kiri) untuk semua navigasi
  - Desktop (≥ 1024px): header penuh dengan nav links + butang log masuk teks
  - Semua sasaran tekan (butang, tab) minimum 44px tinggi untuk mesra ibu jari

## Struktur Fail

**Nota nav:** Berita/Galeri/Hubungi dibuang dari Navbar/SideDrawer (route/page tetap wujud, boleh diakses terus via URL kalau perlu). Navbar mobile sekarang cuma logo+kod sekolah (kiri) dan hamburger — semua akses lain (login, Keberadaan, Profil, dll) melalui SideDrawer.

**Nota navigasi sub-page:** Keberadaan, Panel Admin, Guru Bertugas, dan Profil semua ada sub-page, tapi navigasi antara sub-page tu BUKAN tab pills dalam page — sebaliknya guna **accordion dalam SideDrawer** (`src/lib/navConfig.js` + `SideDrawer.jsx`). Tekan nama seksyen (contoh "Keberadaan") dalam drawer untuk expand/collapse senarai sub-page dia. Auto-expand kalau sedang berada dalam salah satu sub-page tu. Setiap Layout page (KeberadaanLayout, AdminLayout, GuruBertugasLayout) papar label ringkas sub-page semasa, bukan tab.

**Nota reka bentuk:** Projek ni sengaja reka macam app native (Android/iOS), bukan website tradisional — sebab tu **tiada Footer** (app tak ulang jenama/hak cipta di hujung setiap screen). Maklumat hak cipta & tagline sekolah ada dalam **SideDrawer** (bahagian bawah menu) sahaja.

**Nota routing:** Projek ni guna `BrowserRouter` (URL bersih, contoh `sekolah.syazr.com/profil` - tiada `#`) dengan teknik "spa-github-pages" untuk elak 404 bila refresh/buka terus URL dalam. Cara ia berfungsi: `public/404.html` redirect balik ke `index.html` dengan path di-encode dalam query string; skrip dalam `index.html` "baca balik" dan betulkan URL sebelum React Router jalan. Kedua-dua fail ni MESTI kekal dalam projek - jangan padam.

```
skpk-website/
├── public/
│   └── logo.png          # logo sekolah
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # header - digunakan pada semua page
│   │   └── SideDrawer.jsx   # navigasi mobile (slide dari kiri), semua page
│   ├── pages/
│   │   └── Home.jsx       # page pertama (kosong/asas)
│   ├── App.jsx            # routing - tambah <Route> baru di sini
│   ├── main.jsx
│   └── index.css
└── .github/workflows/deploy.yml   # auto-deploy ke GitHub Pages
```

## Langkah Setup

### 1. Jalankan secara tempatan
```bash
npm install
npm run dev
```

### 2. Custom domain sudah disetkan
`vite.config.js` sudah ditetapkan `base: '/'` dan fail `public/CNAME` sudah ada dengan `sekolah.syazr.com` — sesuai untuk custom domain. (Kalau nanti custom domain ditanggalkan dan balik guna default GitHub Pages URL, base perlu ditukar semula kepada `/websekolah/`.)

**Setup DNS (buat di penyedia domain syazr.com anda):**
Tambah rekod DNS jenis **CNAME**:
| Jenis | Host/Nama | Nilai/Sasaran |
|-------|-----------|---------------|
| CNAME | `sekolah` | `ajehar.github.io` |

**Setup di GitHub:**
1. Repo `ajehar/websekolah` → **Settings** → **Pages**
2. Bahagian **Custom domain**, masukkan `sekolah.syazr.com` → Save
3. Tunggu GitHub sahkan DNS (boleh ambil beberapa minit hingga beberapa jam)
4. Bila dah sah, hidupkan **Enforce HTTPS**

### 3. Push ke GitHub
```bash
git init
git add .
git commit -m "Setup asas laman web"
git remote add origin https://github.com/username/nama-repo-anda.git
git push -u origin main
```

### 4. Aktifkan GitHub Pages
1. Pergi ke repo GitHub → **Settings** → **Pages**
2. Di bahagian **Source**, pilih **GitHub Actions**
3. Setiap kali anda push ke branch `main`, web akan auto-deploy (workflow sudah disediakan di `.github/workflows/deploy.yml`)

## Testing Tanpa Firebase Disetup Lagi

Kalau `.env` masih kosong, app **tak akan crash**. Home/Berita/Galeri/Hubungi boleh diuji macam biasa. Page yang perlukan log masuk (Profile/Keberadaan/Admin) akan papar butang "Log Masuk dengan Google" seperti biasa, tapi bila ditekan akan papar makluman "Firebase belum disetup" — bukan crash/page putih. Isi `.env` (lihat bahagian Setup Firebase) untuk aktifkan penuh.

## Setup Firebase (untuk langkah seterusnya)

1. Pergi ke [Firebase Console](https://console.firebase.google.com/) → **Add Project**
2. Namakan projek (contoh: `skpk-kuantan`)
3. **Authentication** → Sign-in method → aktifkan **Google**
4. **Firestore Database** → Create database (mode production, pilih lokasi berdekatan Malaysia, cth `asia-southeast1`)
5. Dapatkan **Firebase config** dari Project Settings → General → Your apps → Web app (`</>`)
6. Simpan config tu dalam fail `.env` (JANGAN commit fail ni ke GitHub — kita akan setup `.gitignore` bila sampai langkah integrasi Firebase)

## Page Profile (Pusat Data Staff)

Profile adalah "pusat data" — sub-koleksi fungsi lain (Senarai Keberadaan, dan akan datang) disambung kepadanya.

**Struktur data (Firestore):**
```
profiles/{emel-sebagai-id}
  ├── nama, ic, jawatan, kategori, gambarURL
  ├── emel   ← kunci padanan dengan akaun Google semasa log masuk
  └── uid, createdAt, createdBy, updatedAt

profiles/{emel}/...                  ← fungsi akan datang (contoh: cuti, penilaian)
```
Nota: Senarai Keberadaan kini guna koleksi utama `kehadiran` (bukan sub-koleksi) — lihat bahagian "Page Keberadaan" di bawah.

**Cara ia berfungsi:**
- Admin boleh pra-daftar profile staff (guna emel rasmi) sebelum staff log masuk kali pertama
- Bila staff log masuk dengan Google, sistem padankan emel akaun dia dengan dokumen profile sedia ada
- Kalau tiada profile lagi untuk emel tu, staff akan diminta lengkapkan profile sendiri
- Semua staff yang log masuk boleh lihat profile (termasuk No. IC) staff lain
- Hanya admin atau pemilik profile sendiri boleh edit

**Analisis Keberadaan (Profile):** carta bar interaktif — tukar tahun, papar jumlah hari Rasmi, setiap jenis Cuti, dan Jumlah Semua Cuti. KWB sengaja dikecualikan (bukan "ketiadaan", cuma keluar sekejap). Lihat `StatistikKeberadaan.jsx` dan fungsi `hariDalamTahun()` dalam `dateUtils.js`.

**Setkan admin:** Selepas Firestore aktif, cipta dokumen secara manual di koleksi `admins` dengan ID = emel admin (contoh: `admins/pengetua@moe-dl.edu.my`). Boleh buat terus dalam Firebase Console.

**Deploy security rules:** Salin kandungan `firestore.rules` ke Firebase Console > Firestore Database > Rules, atau guna Firebase CLI (`firebase deploy --only firestore:rules`).

## Page Keberadaan

Dipecah jadi sub-page (nested route) dengan tab pills — bukan satu page panjang:
```
/keberadaan            -> redirect ke /keberadaan/hari-ini
/keberadaan/hari-ini   -> Hari Ini (kad Guru/PPM/AKP berasingan)
/keberadaan/esok       -> Esok (struktur sama)
/keberadaan/log        -> Log (julat tarikh)
```
Borang diisi melalui **butang terapung (+)** di kanan bawah — bukan seksyen tetap dalam page. Setiap rekod papar **badge berwarna** ikut jenis urusan (Rasmi=hijau, Cuti=kuning, KWB=merah) — lihat `badgeUtils.js`. Rekod sendiri juga terpapar di Profile page (`/profil/kehadiran`).

**Struktur data (Firestore, koleksi utama `kehadiran`):**
```
kehadiran/{id auto}
  ├── profilEmel, nama, kategori, jawatan   ← disalin dari profile semasa borang diisi
  ├── urusan        ('Rasmi' | 'Cuti' | 'Keluar Waktu Bekerja (KWB)')
  ├── jenis, jenisLain
  ├── tarikhMula, tarikhTamat   ← sama nilai jika 1 hari sahaja
  ├── masaKeluar, masaKembali  ← KWB sahaja
  ├── tempat
  ├── dokumenURL, dokumenNama  ← Google Drive (via Apps Script)
  └── createdAt, createdBy, updatedAt
```

**Pengumpulan Hari Ini/Esok:** 3 seksyen terus sepadan dengan Kategori — **Guru**, **PPM**, **AKP**. Nota: Laporan Harian (akan datang) hanya kira Guru + PPM, AKP dikecualikan. Tukar logik ni di `src/pages/Keberadaan/constants.js`.

**Kebenaran:** semua staff log masuk boleh baca semua rekod. Admin boleh edit/padam rekod sesiapa; staff biasa hanya boleh edit/padam rekod sendiri.

**Storan gambar/dokumen:** guna Google Drive (bukan Firebase Storage) - lihat bahagian "Setup Google Drive Upload (Apps Script)" di bawah.

## Setup Google Drive Upload (Apps Script)

Gambar profile & dokumen keberadaan disimpan di **Google Drive**, bukan Firebase Storage. Ini bermakna projek Firebase kekal pada **Spark plan (percuma, tiada kad kredit)** sepenuhnya - Storage adalah satu-satunya sebab biasa projek Firebase perlu naik ke Blaze plan, dan kita dah elak keperluan tu terus.

**Cara setup:**
1. Pergi ke [script.google.com](https://script.google.com) → New project
2. Padam kod default, salin-tampal **semua** kandungan `appscript/Code.gs` daripada projek ni
3. Project Settings (ikon gear) → Script Properties → Add property:
   - `RAHSIA_UPLOAD` = satu rentetan rahsia rawak (contoh: `skpk-2026-x9k2m`) - anda cipta sendiri
4. Deploy → New deployment → Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin **Web app URL** yang diberikan
6. Dalam `.env` projek React, isi:
   ```
   VITE_APPS_SCRIPT_URL=<web app URL dari langkah 5>
   VITE_DRIVE_UPLOAD_SECRET=<sama dengan RAHSIA_UPLOAD di langkah 3>
   ```

Fail akan disimpan dalam Google Drive akaun yang deploy Apps Script ni, di bawah folder "Laman Web Sekolah - Upload" (folder dicipta automatik, dengan sub-folder `profil` dan `kehadiran`).

**Nota keselamatan:** kaedah "rahsia dikongsi" (`RAHSIA_UPLOAD`) ni mudah tapi bukan sempurna - sesiapa yang tahu URL + rahsia boleh upload fail. Memandangkan Web App URL & rahsia tak terdedah dalam kod client (cuma dalam `.env`, tak commit ke git), risiko rendah untuk kegunaan dalaman sekolah. Kalau nak lebih selamat kemudian, boleh tambah pengesahan token Firebase Auth dalam `doPost()`.

**Kalau `.env` kosong:** upload gambar/dokumen akan gagal dengan mesej "Google Drive upload belum disetup" (bukan crash) - selaras dengan cara app ni "downgrade" bila Firebase pun belum disetup.

## Panel Admin

Dipecah jadi sub-page (nested route) dengan tab pills — sama corak macam Keberadaan:
```
/admin              -> redirect ke /admin/staff
/admin/staff        -> Senarai staff aktif + butang terapung (+) tambah staff baru
/admin/menunggu     -> Menunggu Kelulusan
/admin/pentadbir    -> Urus Admin (tambah/buang admin)
```
Sekatan akses automatik (perlu log masuk + wujud dalam koleksi `admins`). Link "Panel Admin" hanya terpapar dalam Navbar/SideDrawer untuk admin.

**Fungsi:**
- Senarai semua staff (carian ikut nama/emel/jawatan)
- Tambah staff baru (pra-daftar guna emel — sebelum staff tu log masuk kali pertama)
- Edit profile staff sedia ada (emel dikunci selepas dicipta — ia ID dokumen)
- Padam profile staff
- Label "Belum log masuk" terpapar untuk profile yang admin cipta tapi staff belum log masuk lagi (tiada `uid` dalam rekod)

**Urus Admin:** admin sedia ada boleh naikkan staff lain jadi admin, atau buang admin — terus dalam Panel Admin, tak perlu masuk Firebase Console lagi (kecuali admin **pertama**, yang mesti disetup manual — lihat "Tetapkan admin pertama" dalam bahagian Setup Firebase). Sekatan keselamatan: admin **tak boleh buang diri sendiri** (disekat di client DAN di Firestore Rules), dan **mesti ada sekurang-kurangnya 1 admin** dalam sistem pada bila-bila masa (disekat di client).

## Tapisan Kelulusan Profile

Staff yang **daftar sendiri** (isi profile kali pertama tanpa admin pra-daftar) automatik dapat status `menunggu` — *stuck* (disekat oleh `AksesGate`) daripada akses Keberadaan sampai admin lulus di Panel Admin (seksyen "Menunggu Kelulusan"). Profile yang **admin cipta/edit** automatik `diluluskan` terus.

- **Lulus** → status jadi `diluluskan`, staff terus boleh akses
- **Tolak** → profile dipadam, staff perlu daftar semula
- Profile lama (sebelum ciri ni wujud, tiada field `status`) dianggap `diluluskan` secara automatik (elak kunci staff sedia ada)
- **Akaun admin** (contoh: akaun rasmi/generik sekolah, bukan akaun peribadi) **tak dipaksa** isi profile - ia pilihan sahaja. `AksesGate` terus benarkan akses admin walaupun tiada profile.
- **Keselamatan:** Firestore Rules kuatkuasakan supaya staff **tak boleh** ubah `status` diri sendiri (elak *self-approve*) — hanya admin boleh tukar field tu

## Page Guru Bertugas

4 sub-page (tab pills, sama corak macam Keberadaan/Panel Admin):
```
/guru-bertugas            -> redirect ke /guru-bertugas/kumpulan
/guru-bertugas/kumpulan   -> Kumpulan & Tugas Guru Bertugas (siap)
/guru-bertugas/3k         -> Laporan 3K (akan dibina)
/guru-bertugas/banci      -> Laporan Banci (akan dibina)
/guru-bertugas/harian     -> Laporan Harian (akan dibina)
```

**Struktur data:**
```
kumpulanBertugas/{id auto}
  ├── nama, warnaBg, warnaTeks
  ├── ahli   [{ emel, nama, jawatan }, ...]  ← dari koleksi profiles
  └── createdAt, updatedAt

tugasBertugas/{id auto}   ← senarai kongsi (SAMA untuk semua kumpulan)
  ├── perkara, turutan
  └── createdAt, updatedAt
```

Kumpulan ni akan jadi **rujukan bersama** untuk Laporan Harian & Laporan 3K nanti — reka bentuk data sengaja dibuat berasingan (koleksi sendiri) supaya senang "sambung" dari laporan-laporan tu. Jadual pusingan (kumpulan mana bertugas bila) **belum** dibina — akan dibincang semula bila sampai Laporan Harian.

**Kebenaran:** semua staff log masuk boleh baca (nampak kumpulan & tugas). Hanya admin boleh tambah/edit/padam kumpulan dan tugas.

## Laporan 3K (dalam Guru Bertugas)

Diisi setiap hari persekolahan. Flow: pilih tarikh -> pilih blok (kad) -> modal keluar dengan **catatan** (teks) untuk Keselamatan & Kebersihan (semua blok), dan Disiplin (kalau blok tu ada suis "Ada Disiplin") -> lepas isi catatan, pilih **satu** nama guru (mewakili keseluruhan rekod blok tu, bukan satu guru per catatan).

**Struktur data:**
```
blokLaporan3K/{id auto}       <- admin urus (Panel Admin > Blok 3K)
  nama, adaDisiplin, turutan

laporan3K/{tarikh_blokId}     <- ID deterministik = upsert automatik
  tarikh, blokId, blokNama
  catatanKeselamatan (teks)
  catatanKebersihan  (teks)
  catatanDisiplin     (teks)   <- hanya jika blok.adaDisiplin
  guru { emel, nama }          <- SATU guru mewakili keseluruhan rekod
```

Sebab ID dokumen `tarikh_blokId`, isi borang kali kedua untuk tarikh+blok yang sama akan **kemas kini** rekod sedia ada (bukan cipta rekod baru) - selaras dengan keputusan "1 rekod sahaja setiap blok setiap hari".

**Kebenaran:** blok (`blokLaporan3K`) admin sahaja boleh urus; rekod laporan (`laporan3K`) mana-mana staff log masuk boleh isi/kemas kini (bukan admin sahaja).

## Cara Tambah Page Baru

**Page biasa (tiada sub-page):**
1. Cipta fail di `src/pages/NamaPage.jsx`
2. Daftar dalam `src/App.jsx`: `<Route path="/nama-page" element={<NamaPage />} />`
3. Tambah dalam senarai `navLinks` di `src/components/Navbar.jsx` (dipakai sekali untuk nav desktop DAN SideDrawer mobile)

**Seksyen dengan sub-page (contoh: Berita, atau nanti "Tentang Kami"):**
1. Cipta folder `src/pages/NamaSeksyen/`
2. Cipta `NamaSeksyenLayout.jsx` — ada `<Outlet />` untuk render sub-page
3. Cipta page induk (contoh `List.jsx`) dan sub-page (contoh `Detail.jsx`)
4. Daftar sebagai nested route dalam `App.jsx`:
   ```jsx
   <Route path="/nama-seksyen" element={<NamaSeksyenLayout />}>
     <Route index element={<List />} />
     <Route path=":slug" element={<Detail />} />
   </Route>
   ```
   Lihat `src/pages/Berita/` sebagai contoh sebenar (BeritaLayout, BeritaList, BeritaDetail).

**Nota:** Nav (Navbar & SideDrawer) guna React Router — navigasi berlaku tanpa reload penuh browser (SPA). Link ke page yang belum didaftar dalam `App.jsx` akan jadi blank.

## Langkah Seterusnya (page demi page)
- [x] Asas: Navbar, SideDrawer (mobile-first, navigasi penuh) - reka bentuk gaya app, tiada Footer
- [x] Struktur routing + contoh nested route: Berita (senarai + sub-page artikel), Galeri, Hubungi (semua kosong buat masa ini)
- [x] Firebase Authentication (Google Sign-In) - kod sedia, perlu isi `.env` bila projek Firebase siap
- [x] Page Profile (pusat data staff: Nama, IC, Jawatan, Kategori, Gambar) + Firestore security rules
- [x] Page Keberadaan (isi borang, hari ini/esok ikut Guru/PPM/AKP, log julat tarikh) + Google Drive upload (Apps Script)
- [x] Panel Admin (senarai staff, tambah/edit/padam profile, pra-daftar sebelum staff log masuk)
- [ ] Isi kandungan sebenar: Home, Berita (integrasi Google Sheet/Firestore), Galeri, Hubungi
- [ ] Page: Tentang Kami / Sejarah Sekolah (contoh seksyen dengan sub-page)
- [ ] Laporan Harian (kira kehadiran Guru + PPM sahaja, AKP dikecualikan)

Kita akan bina setiap item di atas satu per satu.
