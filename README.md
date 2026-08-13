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

**Nota penting - guna signInWithPopup, bukan signInWithRedirect:** projek ni host di GitHub Pages (bukan Firebase Hosting), dengan custom domain (`sekolah.syazr.com`) berbeza daripada `authDomain` Firebase (`*.firebaseapp.com`). Ini punca isu diketahui: `signInWithRedirect` **gagal senyap di SEMUA browser iOS** (Safari & Chrome iOS sekali - kedua-duanya guna enjin WebKit yang sama, kena sekatan storan pihak ketiga Safari terhadap domain auth Firebase yang berbeza). Penyelesaian rasmi Firebase (letak custom domain sebagai `authDomain`) perlukan Firebase Hosting untuk auto-handle laluan `__/auth` - tak boleh pakai terus dengan GitHub Pages. Jadi kod (`AuthContext.jsx`) sengaja guna `signInWithPopup` dengan sekatan elak tekan-dua-kali (`sedangLogMasuk`), bukan redirect.

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

## Bug Kritikal Dibetulkan: Tarikh UTC vs Tempatan

`todayISO()` dan `tambahHariISO()` (dalam `dateUtils.js`) dulu guna `.toISOString()` yang tukar ke **UTC**. Untuk Malaysia (UTC+8), ni sebabkan "esok" dikira semula jadi "hari ini" (dan sebelum jam 8 pagi waktu Malaysia, "hari ini" pun boleh silap jadi semalam). Dibetulkan guna komponen tarikh tempatan (`getFullYear()`/`getMonth()`/`getDate()`) - lihat komen dalam `dateUtils.js`. **Elak guna `.toISOString()` untuk sebarang pengiraan tarikh akan datang dalam projek ni.**

## Page Keberadaan

**Nota:** "Rekod Saya" (dulu `/profil/kehadiran`) dipindah ke bawah kumpulan Keberadaan (`/keberadaan/saya`) - lebih logik dikumpul sekali dengan Hari Ini/Esok/Log berbanding di bawah Profil. Tile "Senarai Keberadaan" dalam Profile page masih ada, cuma pautan dia dikemas kini.

Dipecah jadi sub-page (nested route) dengan tab pills — bukan satu page panjang:
```
/keberadaan            -> redirect ke /keberadaan/daftar
/keberadaan/daftar     -> Daftar Keberadaan (borang terus - paling atas, senang dijumpai)
/keberadaan/hari-ini   -> Hari Ini (kad Guru/PPM/AKP berasingan)
/keberadaan/esok       -> Esok (struktur sama)
/keberadaan/log        -> Log (julat tarikh)
/keberadaan/saya       -> Rekod Saya (dipindah dari /profil/kehadiran - lihat nota bawah)
```
Borang diisi melalui **butang terapung (+)** di kanan bawah — bukan seksyen tetap dalam page. Setiap rekod papar **badge berwarna** ikut jenis urusan (Rasmi=hijau, Cuti=kuning, KWB=merah) — lihat `badgeUtils.js`. Rekod sendiri juga terpapar di tab "Rekod Saya" (`/keberadaan/saya`).

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


### Kebolehpercayaan Upload (mampatan, had masa, ralat jelas)

`driveUpload.js` (dipakai oleh SEMUA upload gambar - Profile, Unit UBKS, dll) ada 3 lapisan perlindungan:

1. **Mampatan automatik** - gambar dimampat/disaiz-semula (Canvas API, maksimum 1600px lebar, kualiti JPEG 82%) SEBELUM dimuat naik. Ni penting sebab gambar kamera telefon (4-8MB+) boleh sebabkan muat naik tersangkut/timeout, terutama sambungan perlahan.
2. **Had masa 45 saat** (`AbortController`) - elak permintaan tersangkut SELAMA-LAMANYA (punca asal "tiada respons" di desktop) - kalau lebih 45 saat, terus keluar ralat jelas.
3. **Mesej ralat spesifik** - "Muat naik ambil masa terlalu lama", "Gagal sambung ke pelayan", dll - bukan generik "gagal, cuba lagi" - senang diagnos kalau ada isu lagi.

Had saiz fail asal: 20MB (sebelum mampatan).


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

## Catatan Wajib (Rasmi/Cuti) & Paparan Ringkas

Borang Keberadaan sekarang ada medan **Catatan** (wajib) untuk Rasmi (nama urusan rasmi, contoh "Mesyuarat JPN") dan Cuti (sebab cuti, contoh "Demam") - tak terpakai untuk KWB.

**Peraturan paparan ringkas** (Kalendar Bulanan & Senarai Keberadaan Saya) - lihat `labelSenarai()` dalam `badgeUtils.js`:
- **Rasmi** -> papar Catatan (nama urusan)
- **Cuti** -> papar Jenis SAHAJA (bukan catatan/sebab - demi privasi, sebab sebab cuti mungkin sensitif)
- **KWB** -> sama macam biasa (jenis + masa)

Detail penuh (termasuk catatan sebenar untuk Cuti, tempat, dokumen) cuma terpapar bila tekan ikon **mata** (`DetailModal.jsx`).

## Maklumat Murid & eBanci (asas sahaja, akan dibincang lagi)

Dua page baru, struktur sahaja (sub-page semua *placeholder* "akan dibina kemudian") - ikut corak sama macam Guru Bertugas (Layout + accordion drawer, tiada tab):

```
/maklumat-murid                  -> redirect ke analisis
/maklumat-murid/analisis         -> Analisis (statistik murid)
/maklumat-murid/semakan          -> Semakan Murid (jadual penuh + import)
/maklumat-murid/daftar-masuk     -> Daftar Masuk Murid
/maklumat-murid/daftar-keluar    -> Daftar Keluar Murid

/ebanci                          -> redirect ke kehadiran-murid
/ebanci/kehadiran-murid          -> Kehadiran Murid (SIAP - lihat bahagian bawah)
/ebanci/papan-rmt                -> Papan Kehadiran RMT (SIAP - lihat bahagian bawah)
```

**Nota:** Kehadiran Murid & Papan Kehadiran RMT dah siap sepenuhnya (lihat seksyen masing-masing di bawah). Daftar Masuk/Keluar Murid masih *placeholder*.

## Import Data Murid (XLSX) - struktur data & mekanik import

Sub-page `/maklumat-murid/semakan` (butang Import di situ) dah berfungsi penuh:

**Import:** Admin muat naik fail Excel "Senarai Keseluruhan Murid" (eksport TERUS dari MOEIS, tak perlu ubah apa-apa). Sistem **auto-kesan baris header** (cari baris yang ada "BIL." dan "ID MURID") - penting sebab fail rasmi ada beberapa baris tajuk sebelum header sebenar. Pratonton dulu (10 baris pertama + perbandingan) sebelum sahkan.

**Mod GANTI SEPENUHNYA (bukan update/merge):** setiap import dianggap snapshot TERKINI sekolah - murid dalam fail ditambah/ditulis ganti, murid yang TIADA dalam fail (contoh: dah pindah/tamat) akan **DIPADAM**. Pratonton papar jelas: berapa baru, berapa dikemas kini, berapa akan dipadam - dengan amaran jelas sebelum sahkan.

**Status RMT (medan terbitan, bukan dari Excel):** dikira automatik semasa import - kalau `STATUS ASRAMA` bukan "YA" (kosong/tiada data), murid tu automatik ditanda `statusRMT = 'YA'`. Ini akan jadi asas untuk eBanci > Papan Kehadiran RMT nanti.

**Struktur data:**
```
murid/{idMurid}          <- ID dokumen = ID Murid (dari sistem MOEIS)
  ├── 60 medan (lihat src/pages/MaklumatMurid/muridFields.js untuk pemetaan penuh)
  └── updatedAt, updatedBy
```

Medan dikumpul 6 kategori untuk paparan (`KUMPULAN_MEDAN`): Identiti & Akademik, OKU & Ketidakupayaan, Kewangan, Penjaga 1, Penjaga 2, Alamat.

**Kebenaran:** semua staff log masuk boleh **baca** (umum, sama macam Keberadaan) - termasuk data sensitif (IC penjaga, pendapatan, kategori OKU). Cuma admin boleh **import/edit/padam**.

**Nota:** `xlsx` (SheetJS) ditambah sebagai dependency untuk baca fail Excel terus dalam browser (tiada server backend diperlukan) - saiz bundle naik ~350KB sebab ni.

## Analisis Maklumat Murid

Route `/maklumat-murid/analisis`. **3 tab**, setiap analisis dalam kotak berasingan (bukan carta bar - nombor sahaja, lebih jelas dibaca):

1. **Keseluruhan** - kad ringkasan (Jumlah/Prasekolah/Sekolah Rendah) + kad "Prasekolah" (Jantina/Kaum/Agama, PRA SAHAJA) + kad ringkasan Kategori Ketidakupayaan (Sekolah Rendah sahaja)
2. **Kelas** - Jumlah Murid Ikut Kelas + jadual silang Jantina/Kaum/Agama Ikut Kelas
3. **Kategori Pendidikan Khas** - Sekolah Rendah SAHAJA (Prasekolah dikecualikan sepenuhnya). Setiap Kategori Ketidakupayaan (Pembelajaran/Pendengaran/Pelbagai/dll) dapat kad sendiri, dengan Jantina/Kaum/Agama/Subkategori disarangkan SEKALI dalam kad tu

**Prinsip penting - "Prasekolah entiti berasingan":** SETIAP pengiraan dalam page ni (kecuali "Jumlah Keseluruhan" di kad ringkasan) mengecualikan murid Prasekolah secara eksplisit sebelum kira apa-apa pecahan lain. Ni elak nombor tercemar/bercampur antara dua kategori murid yang berbeza sifat sepenuhnya, walaupun sekolah yang sama. Fungsi `kiraIkutKategoriOKU()` dalam `statistikMurid.js` filter `!adalahPra(m)` SEBELUM apa-apa pengiraan lain.

**Medan yang diperbetulkan:** guna `kategoriKetidakupayaan` (KATEGORI KETIDAKUPAYAAN - 5 kategori: Pembelajaran/Pendengaran/Pelbagai/Fizikal/Pertuturan), BUKAN `keteranganBidang` (KETERANGAN BIDANG - cuma 2 nilai, sebenarnya bidang program sekolah bukan kategori OKU sebenar) yang digunakan versi awal.


## Semakan Murid (ganti Maklumat Asas Murid)

Route `/maklumat-murid/semakan` - jadual PENUH (semua lajur nampak, macam buka fail Excel terus) supaya senang nampak data mana yang "TIADA DATA" (disorot merah). Import XLSX pun letak sini sekarang (dulu di Maklumat Asas Murid).

**Kelengkapan Data Ikut Kelas** - analisis dibina TERUS dalam page ni: setiap kelas dikira bilangan medan kosong, disusun kelas paling tak lengkap dulu. Kelas 0 medan kosong papar "Lengkap" (hijau); ada medan kosong papar amaran (merah) + bilangan murid tak lengkap.

**Panel Admin > Lajur Murid** (`/admin/lajur-murid`) - admin boleh nyahtanda lajur yang tak perlu papar dalam jadual Semakan Murid (contoh: sorok lajur kewangan/IC penjaga kalau nak jadual lebih ringkas). Tetapan simpan dalam `tetapan/lajurMurid`, terpakai untuk SEMUA staff (bukan setiap orang tetapan sendiri).

## Kehadiran Murid (eBanci)

Route `/ebanci/kehadiran-murid`. Flow: pilih tarikh -> senarai semua kelas (kad merah berkelip = belum diisi tarikh tu, biru = dah diisi) -> tekan kelas -> popup senarai semua ahli kelas (default semua hadir/hijau) -> tekan nama untuk tanda tak hadir (jadi kelabu) -> Submit.

**Snapshot RMT (bukan rujukan langsung ke data murid semasa):** status RMT murid boleh berubah dalam bulan yang sama (kadang asrama, kadang RMT). Jadi setiap kali submit, `adalahRMT` untuk setiap murid **disimpan terus dalam rekod kehadiran hari tu** (snapshot pada masa submit), BUKAN dirujuk semula ke `murid.statusRMT` bila Papan Kehadiran RMT dibina nanti. Murid PRA sentiasa `adalahRMT: false` ("PRA lain", tak dikira RMT langsung).

**Struktur data:**
```
kehadiranMurid/{tarikh_namaKelas}
  tarikh, namaKelas
  senaraiMurid: [{ idMurid, nama, hadir: bool, adalahRMT: bool }, ...]
  jumlahMurid, jumlahHadir, jumlahTakHadir, peratusKehadiran   <- dikira & disimpan terus
  updatedAt, updatedBy
```

Senarai kelas & ahli diambil terus dari koleksi `murid` (medan `namaKelas`) - tiada koleksi "kelas" berasingan. Kad kelas papar jumlah/hadir/tak hadir/peratus terus dari rekod tersimpan; ikon mata papar senarai penuh siapa hadir (dengan tag RMT) dan siapa tak hadir.

**Kebenaran:** mana-mana staff log masuk boleh isi/edit/padam kehadiran mana-mana kelas (bukan admin sahaja, dan bukan terhad guru kelas tu sahaja).

## Papan Kehadiran RMT

Route `/ebanci/papan-rmt`. Jadual **buku pajang bulanan** (bukan papan harian) - pilih bulan/tahun, papar jadual penuh: baris = murid RMT (sekurang-kurangnya sehari dalam bulan tu), lajur = **Bil, Nama Murid, Jantina, Kelas** (kesemuanya *sticky* semasa scroll), kemudian satu lajur untuk setiap tarikh (1 hingga akhir bulan).

**Simbol ikut format rasmi:** `/` = hadir (RMT hari tu), `0` = RMT tapi tak hadir, petak kosong = tiada data/bukan RMT hari tu (contoh: bertukar ke Asrama hari tu). Baris "Jumlah Tidak Hadir" dan "Jumlah Hadir" di bahagian bawah (*sticky*) kira jumlah setiap lajur tarikh.

Baca terus daripada snapshot `adalahRMT`/`hadir`/`jantina` yang disimpan dalam `kehadiranMurid` masa Kehadiran Murid disubmit (BUKAN rujuk balik `murid.statusRMT` semasa) - ini yang buat papan ni tepat walaupun status murid berubah dalam bulan yang sama.

## Jana Banci (dalam Guru Bertugas)

Route `/guru-bertugas/banci`. Pilih tarikh -> 3 bahagian:

1. **Senarai Kelas Belum Isi Kehadiran** - senarai ringkas nama kelas (tapis dari `murid.namaKelas` vs rekod `kehadiranMurid` untuk tarikh tu)
2. **Kotak Salin WhatsApp** - mesej siap format "Kelas yang disenaraikan sila isi banci dengan segera: ..." dengan butang salin (`navigator.clipboard`)
3. **Butang Jana Banci** - KELABU & tak boleh tekan kalau masih ada kelas belum isi; merah & boleh tekan bila semua kelas dah lengkap

Bila ditekan, **Papan Banci Kehadiran** keluar - jadual Kategori (MBK Prasekolah/Asrama/Harian) x Bilangan/Hadir/Tidak Hadir/Peratus, + baris Keseluruhan - format ikut papan kehadiran fizikal sekolah. Ada butang salin teks untuk papan ni juga.

**Kategori (`kategoriBanci`)** di-snapshot masa Kehadiran Murid disubmit (sama prinsip macam `adalahRMT`) - PRASEKOLAH/ASRAMA/HARIAN, mutually exclusive. Lihat `KehadiranMuridModal.jsx`.

## eUBKS Ko (Unit Beruniform, Kelab dan Sukan)

Page baru: `/eubks`. 4 sub-page: Murid UBKS, Kehadiran UBKS, Laporan UBKS (placeholder), Perancangan UBKS (placeholder).

### Kategori Unit (Panel Admin > Kategori UBKS)

Sebelum cipta unit, admin (seksyen `ubks`) kena setkan senarai kategori (contoh: Unit Beruniform/UB, Kelab/K, Sukan/S) - boleh tambah kategori baru bila-bila. Ni yang buat data boleh "merentasi" (contoh: Papan Kehadiran UBKS kumpul ikut kategori).

### Murid UBKS (`/eubks/murid-ubks`)

1. Pilih Tahun sesi (default tahun semasa)
2. Admin "Tambah Unit" - taip nama unit + **wajib pilih kategori**
3. Tekan kad unit -> modal urus unit
4. Pilih Tahun (darjah) -> senarai murid tahun tu -> tandakan -> "Tambah ke Unit"
5. Ulang untuk darjah lain
6. **Tag LF (Kefungsian Rendah)** - dalam senarai ahli, admin boleh tandakan murid sebagai LF (ikon bintang). Murid LF dijangka SENTIASA hadir perjumpaan.
7. Boleh muat naik gambar unit (pilihan)
8. Carian nama unit disediakan pada senarai utama

### Kehadiran UBKS (`/eubks/kehadiran-ubks`)

Dua tab: **Isi Kehadiran** dan **Papan Kehadiran**.

**Isi Kehadiran** - kehadiran ikut **perjumpaan** (1-12), bukan tarikh sahaja:
1. Pilih Tahun sesi, Perjumpaan (1-12), Tarikh (default hari ini)
2. Cari & pilih Unit (carian nama unit disediakan)
3. Senarai ahli unit keluar - semua hadir (hijau) secara default, tekan nama untuk tanda tak hadir
4. **Amaran LF** - murid bertag LF (ikon bintang kuning) bila ditekan untuk tanda TAK HADIR, keluar `window.confirm()` minta kepastian dulu sebelum benar-benar tanda tak hadir
5. Submit - upsert ikut ID `{tahunSesi}_{unitId}_{perjumpaan}` (isi semula perjumpaan yang sama = kemas kini, bukan rekod berganda)

**Papan Kehadiran** - macam Papan Kehadiran RMT (gaya pajang), tapi lajur = **perjumpaan (1-12) x setiap kategori unit** (bukan tarikh). Contoh struktur (kategori dinamik ikut apa yang admin dah setkan):
```
Bil | Nama Murid | Kelas | UB (1-12) + Jumlah | K (1-12) + Jumlah | S (1-12) + Jumlah
```
Murid boleh ada unit berlainan kategori serentak (contoh: 1 Unit Beruniform + 1 Kelab + 1 Sukan) - papan ni tunjuk kehadiran SEMUA track sekali dalam satu baris. Carian nama murid disediakan.

**Struktur data:**
```
kategoriUBKS/{id auto}
  nama, kod (contoh 'UB'), turutan

unitUBKS/{id auto}
  tahunSesi, namaUnit, kategoriUnit (kod)
  gambarUnit (url | null)
  ahli: [{ idMurid, nama, tahunTingkatan, adalahLF }, ...]

kehadiranUBKS/{tahunSesi_unitId_perjumpaan}
  tahunSesi, unitId, namaUnit, kategoriUnit, perjumpaan (1-12), tarikh
  senaraiKehadiran: [{ idMurid, nama, hadir, adalahLF }, ...]
  jumlahAhli, jumlahHadir, jumlahTakHadir
```

**Kebenaran:** `unitUBKS` & `kategoriUBKS` - baca umum, tulis seksyen `ubks` sahaja. `kehadiranUBKS` - mana-mana staff log masuk boleh isi (macam Kehadiran Murid).


## Admin Berperanan (Admin Penuh vs Admin Seksyen)

Admin tak lagi ya/tidak sahaja - ada medan `peranan` (array) pada setiap dokumen `admins/{emel}`:
- `['super']` -> Admin Penuh - boleh urus SEMUA (termasuk lantik admin lain, kelulusan staff, override Keberadaan staff lain)
- `['ubks']` / `['murid']` / `['guru-bertugas']` -> Admin Seksyen - HANYA boleh urus bahagian tu sahaja
- Boleh gabung lebih dari satu, contoh `['murid', 'ubks']`
- Rekod admin lama (sebelum ciri ni wujud, tiada medan `peranan`) dianggap `['super']` automatik (elak admin sedia ada "turun pangkat" tanpa sengaja)

**Seksyen yang boleh didelegasi:** `guru-bertugas` (Kumpulan, Blok 3K), `murid` (import/lajur Semakan Murid), `ubks` (Unit UBKS).

**SENGAJA kekal Admin Penuh sahaja** (tak boleh didelegasi) - sebab keselamatan (elak admin seksyen naikkan diri sendiri jadi admin penuh):
- Urus admin/peranan (`admins` collection)
- Kelulusan/urus profile staff (`profiles` collection - Staff & Menunggu Kelulusan dalam Panel Admin)
- Override rekod Keberadaan staff lain (edit/padam kehadiran orang lain)

**Client:** `useIsAdmin(user)` pulangkan `{ isAdmin, isSuperAdmin, peranan, adaSeksyen(seksyen), loading }`. `isAdmin` = ada SEBARANG peranan (untuk gate am macam masuk `/admin`); `adaSeksyen('ubks')` = admin penuh ATAU ada seksyen tu. Panel Admin > Pentadbir (`UrusAdmin.jsx`) admin penuh boleh checkbox seksyen untuk admin baru/sedia ada.

**Server (Firestore Rules):** `isSuperAdmin()` dan `isAdminSeksyen(seksyen)` - kuatkuasa di server, bukan setakat UI. Setiap koleksi rujuk fungsi yang sepadan (contoh `unitUBKS` guna `isAdminSeksyen('ubks')`).

## Perancangan UBKS

Route `/eubks/perancangan-ubks`. Reka bentuk sengaja **dipermudahkan** - satu unit = satu jadual perancangan sahaja (TIADA mod "asing/sama ikut tahun" lagi - kalau perlu asingkan ikut tahun/darjah, tulis terus dalam ruangan Perancangan, contoh "Tahun 6: ... / Tahun 5: ...").

1. Pilih Tahun sesi, cari & tekan unit (kad 1:1 dengan gambar/logo unit sebagai latar)
2. Kad tunjuk status terus: "Belum Ada" (merah) atau "X/12 Selesai" (biru/hijau kalau semua siap)
3. Tekan kad -> jadual 12 baris terus keluar (tiada langkah tambahan)
4. Setiap baris ada 3 ikon: **Mata** (lihat + tanda Done), **Pensel** (edit kandungan/tarikh dirancang), **Padam** (kosongkan semula petak tu)
5. Tekan Mata -> lihat kandungan penuh -> kalau belum selesai, butang "Tandakan Selesai (Done)" -> **wajib isi tarikh selesai** sebelum sah
6. Baris selesai jadi **hijau**; lajur "Tarikh Selesai" dalam jadual papar tarikh Done tu (bukan tarikh dirancang)
7. Carian (kandungan) + tapis status (Semua/Selesai/Belum) disediakan

**Struktur data (dipermudahkan):**
```
perancanganUBKS/{unitId}          <- SATU dokumen sahaja setiap unit
  unitId, namaUnit, tahunSesi
  senaraiPerjumpaan: [{ perjumpaan, perancangan, tarikh, selesai, tarikhSelesai }, ...] (12 entri)
```

**Nota untuk pembinaan akan datang:** Laporan UBKS (belum dibina) akan guna `tarikhSelesai` dan `selesai` dari perancangan ni sebagai asas laporan.


## eUBKS Ko - Hub / Page Utama

`/eubks` (index) sekarang page HUB tersendiri (`EUBKSHub.jsx`) - bukan redirect terus ke Murid UBKS macam sub-page lain. Tajuk "eUBKS Ko" di atas, 4 kad akses pantas di bawah (2x2 di telefon, 4 sebaris di desktop). Latar sekarang gradient sementara (hitam ke merah maroon) - boleh tukar ke gambar sebenar bila-bila.

**Boleh tambah akses pantas dengan mudah** - senarai kad hub datang dari satu fail konfigurasi, `eubksAksesPantas.js`:
```js
export const EUBKS_AKSES_PANTAS = [
  { label: 'Murid UBKS', to: '/eubks/murid-ubks', Ikon: Users },
  ...
]
```
Nak tambah sub-page baru dalam hub - tambah satu entri di sini (lepas daftar route dia macam biasa dalam `App.jsx`), tak perlu ubah `EUBKSHub.jsx` langsung.

**Pautan "Home UBKS":** setiap sub-page (Murid/Kehadiran/Laporan/Perancangan UBKS) papar pautan kecil "← Home UBKS" di atas untuk kembali ke hub (dikendalikan dalam `EUBKSLayout.jsx` - disorok automatik bila di hub sendiri, supaya tak berlingkar).

**Nota:** butang "eUBKS Ko" dalam drawer/nav desktop masih cuma toggle *accordion* (buka/tutup senarai sub-page), BUKAN pautan terus ke hub - hub buat masa ni dicapai melalui URL terus atau pautan "Home UBKS" dari dalam sub-page. Kalau nak label "eUBKS Ko" dalam nav sendiri pun boleh tekan terus ke hub, itu ubah struktur nav kongsi (akan jejas semua seksyen lain sekali) - beritahu kalau nak saya buat.

## Hub Page Setiap Seksyen (gaya sama macam eUBKS Ko)

Semua 6 seksyen berbilang sub-page (Keberadaan, Guru Bertugas, Maklumat Murid, eBanci, Panel Admin, eUBKS Ko) sekarang ada page HUB tersendiri di route index (bukan redirect terus ke sub-page pertama) - hero penuh lebar skrin (`calc(100dvh-4rem)`), tajuk + kad akses pantas, warna gradient berbeza setiap seksyen:

| Seksyen | Warna |
|---|---|
| Keberadaan | Biru |
| Guru Bertugas | Ungu |
| Maklumat Murid | Hijau |
| eBanci | Kuning/Emas |
| Panel Admin | Kelabu gelap |
| eUBKS Ko | Merah maroon |

**Komponen kongsi:** `src/components/HubHero.jsx` - satu komponen dipakai semua 6 hub (title, subtitle, gradient, warna ikon, senarai akses pantas sebagai props). Setiap seksyen ada fail `<seksyen>AksesPantas.js` sendiri (contoh `keberadaanAksesPantas.js`) - senarai `{ label, to, Ikon }`, tambah sub-page baru = tambah satu entri di sini.

**Setiap Layout.jsx** (KeberadaanLayout, GuruBertugasLayout, dll) sekarang detect `adalahHub` (pathname === laluan index seksyen tu) - kalau di hub, Outlet render FULL-BLEED (tiada pembalut `max-w-6xl px-4`); kalau di sub-page, pembalut biasa + pautan "← Home [Seksyen]" untuk kembali ke hub.

**Nota nav:** label seksyen dalam drawer/nav desktop (contoh "Keberadaan") kini **terus navigasi** ke hub bila ditekan (bukan setakat toggle accordion) - lihat `SideDrawer.jsx`/`Navbar.jsx`. Chevron berasingan untuk buka/tutup senarai sub-page.

## Laporan Perhimpunan (dalam Guru Bertugas)

Route `/guru-bertugas/perhimpunan`. Senarai laporan + Tambah/Lihat/Edit/Padam.

**Medan borang:**
- Minggu Ke- (nombor), Tarikh
- **Hari** - dikesan automatik dari Tarikh (Bahasa Melayu, guna `namaHari()` sedia ada dari `dateUtils.js`) - medan baca sahaja, bukan diisi manual
- Laporan Sivik (wajib), Hal-Hal Lain (pilihan), Ucapan Pentadbir (pilihan) - semua *textarea*
- Nama Pentadbir & Dilaporkan Oleh - dropdown dari senarai staff (`useProfilesList`); Dilaporkan Oleh *default* ke pengguna semasa

**Kebenaran:** mana-mana staff log masuk boleh isi/edit/padam (sama macam Laporan 3K - bukan admin sahaja, sebab guru bertugas minggu tu yang biasa isi).

## Latar Belakang Hub (Panel Admin > Latar Belakang Hub)

Admin PENUH boleh upload gambar latar untuk page hub setiap seksyen - **Telefon** dan **Desktop** berasingan (nisbah skrin berbeza), guna Google Drive upload biasa. Kalau kosong, gradient warna sedia ada (lihat jadual di seksyen "Hub Page Setiap Seksyen" di atas) terus terpakai sebagai *fallback* - tak perlu isi semua sekali gus.

**Struktur data:**
```
latarHub/{seksyen}          <- ID: keberadaan | guru-bertugas | maklumat-murid | ebanci | admin | eubks
  gambarTelefon (url | undefined)
  gambarDesktop (url | undefined)
```

**Cara ia berfungsi (`HubHero.jsx`):** `<img>` berasingan untuk telefon (`sm:hidden`) dan desktop (`hidden sm:block`), dengan lapisan gelap (*scrim*) di atas gambar supaya tajuk & kad akses pantas (putih) sentiasa jelas dibaca tak kira gambar apa pun diupload. Setiap komponen Hub (`KeberadaanHub.jsx`, dll) panggil `useLatarHub(seksyen)` sendiri dan hantar terus ke `HubHero`.

**Kebenaran:** baca umum (semua staff), tulis **Super Admin sahaja** (jejas paparan semua seksyen sekali, bukan satu domain fungsian).

## Laporan Harian (dalam Guru Bertugas)

Route `/guru-bertugas/harian`. Borang PALING kompleks dalam sistem ni - buka sebagai page penuh (bukan modal) sebab banyak seksyen. Senarai laporan + Tambah/Lihat/Edit/Padam.

**Prasyarat - Profile PPM Kelas/Asrama:** borang Profile (self & admin) sekarang ada medan `jenisPPM` ('PPM Kelas' | 'PPM Asrama'), *required* bila Kategori='PPM'. Cuma PPM Kelas yang layak masuk senarai "PPM Bertugas" dalam Laporan Harian. Staff PPM sedia ada (sebelum ciri ni) akan papar amaran "Jenis PPM belum diisi" dalam Panel Admin > Staff sampai admin kemas kini.

**Auto-kira & auto-isi (bukan taip manual):**
- **Kehadiran Guru** - dikira dari koleksi `kehadiran` (Keberadaan) untuk tarikh dipilih. Guru dengan rekod Rasmi/Cuti AKTIF pada tarikh tu dikira "tak hadir" (KWB dikecualikan sebab bukan tak hadir sepanjang hari).
- **Kehadiran Murid** - dikira dari `kehadiranMurid` (Kehadiran Murid) untuk tarikh yang sama, jumlah semua kelas yang dah submit. Kalau ada kelas belum isi, amaran dipaparkan (macam Jana Banci).
- **Senarai Guru Bertugas** - pilih Kumpulan (dari Kumpulan Guru Bertugas sedia ada) -> sistem auto isi ahli, buang yang tak hadir (Rasmi/Cuti) tarikh tu. Boleh edit lepas tu (buang nama), butang "Segarkan" untuk kira semula.
- **Senarai PPM Bertugas** - auto-tick semua PPM Kelas aktif yang tak ada rekod tak hadir tarikh tu (checklist, boleh untick manual). Auto-isi CUMA sekali untuk laporan BARU (bukan bila edit rekod sedia ada, elak timpa pilihan asal).

**Repeatable list:** Rumusan Guru Mangkir (nama dari dropdown Guru + sebab) dan Rumusan Murid Sakit/Pulang Awal (nama dari dropdown Murid + sebab + tindakan) - butang "+ Tambah" untuk baris baru, boleh padam baris.

**Kokurikulum Minggu Ini** - suis on/off (default OFF), bila ON keluar *textarea* pilihan untuk butiran.

**Kebenaran:** mana-mana staff log masuk boleh isi/edit/padam.

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
