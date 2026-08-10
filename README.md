# Laman Web SK Pendidikan Khas Kuantan

Projek asas (skeleton) laman web sekolah — React + Vite + Tailwind CSS, dihoskan di GitHub Pages.

## Tema Reka Bentuk
- **Palet warna:** diambil dari logo sekolah — hitam (`#1A1A1A`), merah (`#C8102E`), kuning emas (`#F2C230`), atas latar putih/kelabu cair (`#FAFAFA`)
- **Fon:** Poppins
- **Gaya:** Minimalis moden, mesra accessibility (kontras tinggi, saiz teks lebih besar, fokus kibod jelas)
- **Pendekatan:** Mobile-first — reka untuk telefon dahulu, "upscale" untuk desktop
  - Mobile (< 1024px): header ringkas (logo + butang log masuk sahaja) + **bottom tab bar** (Utama/Berita/Galeri/Hubungi) gaya app
  - Desktop (≥ 1024px): header penuh dengan nav links + butang log masuk teks, bottom tab bar disembunyikan
  - Semua sasaran tekan (butang, tab) minimum 44px tinggi untuk mesra ibu jari

## Struktur Fail
```
skpk-website/
├── public/
│   └── logo.png          # logo sekolah
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # header - digunakan pada semua page
│   │   ├── Footer.jsx       # digunakan pada semua page
│   │   └── BottomTabBar.jsx # navigasi mobile (app-like), disembunyi di desktop
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

### 2. PENTING — Tetapkan base path
Buka `vite.config.js` dan tukar:
```js
base: '/nama-repo-github-anda/',
```
kepada nama repo GitHub sebenar. Contoh, jika repo anda `https://github.com/username/skpk-website`, maka:
```js
base: '/skpk-website/',
```

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

**Setkan admin:** Selepas Firestore aktif, cipta dokumen secara manual di koleksi `admins` dengan ID = emel admin (contoh: `admins/pengetua@moe-dl.edu.my`). Boleh buat terus dalam Firebase Console.

**Deploy security rules:** Salin kandungan `firestore.rules` ke Firebase Console > Firestore Database > Rules, atau guna Firebase CLI (`firebase deploy --only firestore:rules`).

## Page Keberadaan

Empat seksyen: Isi Borang, Keberadaan Hari Ini (Guru/AKP), Keberadaan Esok (Guru/AKP), Log Keberadaan (julat tarikh). Rekod sendiri juga terpapar di Profile page (`/profil/kehadiran`).

**Struktur data (Firestore, koleksi utama `kehadiran`):**
```
kehadiran/{id auto}
  ├── profilEmel, nama, kategori, jawatan   ← disalin dari profile semasa borang diisi
  ├── urusan        ('Rasmi' | 'Cuti' | 'Keluar Waktu Bekerja (KWB)')
  ├── jenis, jenisLain
  ├── tarikhMula, tarikhTamat   ← sama nilai jika 1 hari sahaja
  ├── masaKeluar, masaKembali  ← KWB sahaja
  ├── tempat
  ├── dokumenURL, dokumenNama  ← Firebase Storage
  └── createdAt, createdBy, updatedAt
```

**Pengumpulan Hari Ini/Esok:** 3 seksyen terus sepadan dengan Kategori — **Guru**, **PPM**, **AKP**. Nota: Laporan Harian (akan datang) hanya kira Guru + PPM, AKP dikecualikan. Tukar logik ni di `src/pages/Keberadaan/constants.js`.

**Kebenaran:** semua staff log masuk boleh baca semua rekod. Admin boleh edit/padam rekod sesiapa; staff biasa hanya boleh edit/padam rekod sendiri.

**Deploy storage rules:** Salin kandungan `storage.rules` ke Firebase Console > Storage > Rules.

## Panel Admin

Route `/admin` — sekatan akses automatik (perlu log masuk + wujud dalam koleksi `admins`). Link "Panel Admin" hanya terpapar dalam Navbar untuk admin.

**Fungsi:**
- Senarai semua staff (carian ikut nama/emel/jawatan)
- Tambah staff baru (pra-daftar guna emel — sebelum staff tu log masuk kali pertama)
- Edit profile staff sedia ada (emel dikunci selepas dicipta — ia ID dokumen)
- Padam profile staff
- Label "Belum log masuk" terpapar untuk profile yang admin cipta tapi staff belum log masuk lagi (tiada `uid` dalam rekod)

## Cara Tambah Page Baru

**Page biasa (tiada sub-page):**
1. Cipta fail di `src/pages/NamaPage.jsx`
2. Daftar dalam `src/App.jsx`: `<Route path="/nama-page" element={<NamaPage />} />`
3. Tambah link di `src/components/Navbar.jsx` dan/atau `src/components/BottomTabBar.jsx`

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

**Nota:** Nav (Navbar & BottomTabBar) guna React Router — navigasi berlaku tanpa reload penuh browser (SPA). Link ke page yang belum didaftar dalam `App.jsx` akan jadi blank.

## Langkah Seterusnya (page demi page)
- [x] Asas: Navbar, Footer, BottomTabBar (mobile-first), Home (kosong)
- [x] Struktur routing + contoh nested route: Berita (senarai + sub-page artikel), Galeri, Hubungi (semua kosong buat masa ini)
- [x] Firebase Authentication (Google Sign-In) - kod sedia, perlu isi `.env` bila projek Firebase siap
- [x] Page Profile (pusat data staff: Nama, IC, Jawatan, Kategori, Gambar) + Firestore security rules
- [x] Page Keberadaan (isi borang, hari ini/esok ikut Guru/PPM/AKP, log julat tarikh) + Storage rules
- [x] Panel Admin (senarai staff, tambah/edit/padam profile, pra-daftar sebelum staff log masuk)
- [ ] Isi kandungan sebenar: Home, Berita (integrasi Google Sheet/Firestore), Galeri, Hubungi
- [ ] Page: Tentang Kami / Sejarah Sekolah (contoh seksyen dengan sub-page)
- [ ] Laporan Harian (kira kehadiran Guru + PPM sahaja, AKP dikecualikan)

Kita akan bina setiap item di atas satu per satu.
