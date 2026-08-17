# Nota Keselamatan & Keputusan Dasar

Dokumen ni rekod keputusan yang dibuat semasa audit keselamatan (rujuk
perbualan asal untuk butiran penuh). Tujuan: elak keputusan yang sama
ditanya/dibincang semula, dan jejak apa yang **sengaja** ditinggalkan
berbanding **belum sempat** dibaiki.

Tarikh audit asal: rujuk git log fail ni.

---

## ✅ TELAH DIBAIKI

### Audit Reka Bentuk Menyeluruh (4 Fasa) - konsistensi, wording, dialog

Audit menyeluruh reka bentuk web (borang, mobile/responsive, simetri,
wording) mendapati beberapa isu, semua dibaiki dalam 4 fasa:

**Fasa 1 - Login/Signup baharu:** Komponen `AksesPrompt.jsx` (2 mod
kontras - tab mobile, panel warna jenama desktop) menggantikan corak
"satu butang Log Masuk" lama di 6 tempat (Keberadaan, Guru Bertugas,
HEM, KOKU, KURI, Profil). Turut ambil kira suis pendaftaran
dibuka/ditutup (sembunyi mod "Daftar" bila admin tutup pendaftaran).

**Fasa 2 - 5 pembetulan simetri/konsistensi kecil:** RPI Bahagian C
(`h-10` → `h-11`, padan Bahagian A/B), butang Batal RPI diselaraskan
dengan 8 modal lain, saiz ikon Guru Bertugas (15→16, padan skala
14/16/18 sistem), 2 warna hex terus jadi token rasmi
(`tint-hujungMinggu`, `tint-amaran` dalam `tailwind.config.js`), tajuk
sekolah di drawer mobile tak lagi terpotong.

**Fasa 3 - Tanda medan wajib (`*`):** 45+ medan wajib merentasi 18
fail kini bertanda `*` merah - termasuk medan yang wajib secara logik
JS (pemilih murid, gambar profile) walaupun tiada atribut HTML
`required`.

**Fasa 4 - Ganti 45 dialog asli pelayar:** `DialogContext.jsx` (sistem
konfirmasi/amaran/input sendiri, guna Promise - API serupa
`window.confirm`/`alert`/`prompt` supaya tukar minimum kod) menggantikan
**semua** 45 panggilan `window.confirm`/`window.alert`/`window.prompt`
merentasi 29 fail (termasuk `AuthContext.jsx`). Disahkan 0 tinggal
melalui carian penuh + semakan setiap fungsi yang guna `await
konfirm/amaran/soal` memang `async`.

**Pengesahan:** Setiap fasa dibina build bersih + pratonton visual
(mock statik guna token reka bentuk sebenar, sebab log masuk sebenar
tak boleh diuji dalam sandbox) sebelum sambung ke fasa seterusnya.

---

### Pisah "Log Masuk" vs "Daftar" + suis buka/tutup pendaftaran

**Fail:** `firestore.rules`, `src/context/AuthContext.jsx`,
`src/hooks/useTetapanPendaftaran.js`, `src/components/Navbar.jsx`,
`src/components/SideDrawer.jsx`, `src/pages/Profile/Profile.jsx`,
`src/pages/Admin/MenungguPage.jsx`, + 7 fail Layout (butang "sila log
masuk" setiap seksyen dikemaskini guna mod eksplisit)

Sebelum ni cuma SATU butang "Log Masuk dengan Google" yang buat
kedua-dua (log masuk akaun sedia ada ATAU daftar baru secara senyap).

**Apa yang dibuat:**
- Dua butang berasingan: **"Log Masuk"** (akaun sedia ada sahaja - kalau
  tiada profile wujud, terus log keluar semula + ralat jelas "Tiada
  akaun berdaftar... guna Daftar") dan **"Daftar"** (untuk staff baru,
  cuma kelihatan bila pendaftaran dibuka).
- Suis **Pendaftaran Staff Baru** (Buka/Tutup) di Panel Admin > Menunggu
  Kelulusan - super admin sahaja. Bila ditutup, butang "Daftar"
  disembunyikan DAN Firestore rules tolak `create` profile baru terus
  (dikuatkuasa di server, bukan sekadar sembunyi UI). Admin tetap boleh
  pra-daftar staff terus (StaffPage) walaupun pendaftaran awam ditutup.
- Koleksi baru `tetapanAwam/pendaftaran` - MESTI boleh dibaca sesiapa
  sahaja (termasuk belum log masuk) sebab perlu tentukan tunjuk/sorok
  butang "Daftar" SEBELUM orang tu log masuk pun.

**Bug ditemui & dibaiki semasa bina:**
1. `onClick={signInWithGoogle}` (tanpa fungsi panah pembalut) di 7 fail
   Layout akan hantar objek *event* klik sebagai parameter `mod` (tabiat
   React), bukan string `'login'` - rosakkan kedua-dua semakan mod.
   Dibetulkan ke `onClick={() => signInWithGoogle('login')}` di semua
   7 tempat.
2. Akaun **admin** (boleh wujud tanpa profile peribadi, ikut reka
   bentuk sedia ada) akan tersalah kena tolak "tiada akaun" bila guna
   "Log Masuk". Dibetulkan - admin disemak & dikecualikan dulu sebelum
   semakan profile.
3. Akaun **disekat kekal** akan tersalah papar ralat generik "tiada
   akaun" (patut papar mesej "Akaun Disekat" yang lebih jelas). Dibetulkan
   - semakan sekatan dibuat dulu, kalau disekat biar Profile.jsx uruskan
   paparan.

**Pengesahan:** Skrip simulasi logik, 5 senario (pendaftaran
terbuka/tertutup, admin override, emel disekat, sistem baru tanpa
tetapan langsung) - **5/5 lulus**.

---

### Senarai sekat kekal (emelDisekat) + notis awam "khas staff sahaja"

**Fail:** `firestore.rules`, `src/hooks/useSekatan.js`,
`src/hooks/useSenaraiSekatan.js`, `src/hooks/useAksesStatus.js`,
`src/pages/Admin/MenungguKelulusan.jsx`,
`src/pages/Admin/SenaraiSekatanPage.jsx`, `src/pages/Profile/Profile.jsx`,
`src/pages/Home.jsx`, `src/components/Navbar.jsx`, `src/components/SideDrawer.jsx`

Susulan daripada perbincangan "orang bukan staff yang log masuk macam
mana" - sebelum ni "Tolak" permohonan cuma padam rekod, orang sama
boleh cuba daftar semula berulang-ulang tanpa had.

**Apa yang dibuat:**
- Koleksi Firestore baru `emelDisekat` - admin (super admin sahaja)
  boleh sekat emel KEKAL daripada mendaftar. Dikuatkuasa di peringkat
  rules (`allow create` pada `profiles` semak `!emelDisekatSendiri()`),
  bukan sekadar UI.
- Panel Admin > Menunggu Kelulusan: 2 butang berasingan - **"Tolak"**
  (macam asal, boleh mohon semula - untuk kesilapan borang dll) dan
  **"Tolak & Sekat Kekal"** (untuk yang jelas bukan staff - minta sebab,
  confirm dua kali sebelum sekat).
- Panel Admin > Emel Disekat (page baru) - lihat senarai + "Buka
  Sekatan" kalau tersilap sekat.
- Akaun yang cuba log masuk semasa disekat nampak mesej jelas di
  `/profil` ("Akaun Disekat" + sebab kalau ada), bukan borang
  pendaftaran.
- Notis besar berwarna (bukan teks kecil senyap) dipaparkan di
  **halaman Utama** ("KHAS untuk staff SK Pendidikan Khas Kuantan
  sahaja - JANGAN log masuk kalau bukan staff"), + nota lebih kecil
  berhampiran butang log masuk (desktop tooltip, mobile teks di bawah
  butang, dan di page Profil semasa belum log masuk).

**Pengesahan:** Sekali lagi emulator sebenar tak dapat dimuat turun
(sekatan rangkaian sandbox) - disahkan dengan skrip simulasi logik CEL,
7 senario (emel disekat cipta profile, emel biasa cipta profile, semak
sekatan sendiri, cuba semak sekatan orang lain, list oleh staff biasa,
list oleh admin, admin override untuk emel disekat) - **7/7 lulus**.

**Had yang diketahui (bukan bug, keputusan reka bentuk):** Sekatan
berdasarkan EMEL sahaja - kalau orang sama guna emel Google LAIN,
sekatan tak terpakai (tiada cara nak sekat "orang" secara umum tanpa
maklumat pengenalan lain, cuma emel yang kita ada). Ni had semula jadi
sistem berasaskan Google Sign-In terbuka (bukan domain-terhad - rujuk
perbincangan DELIMa/PPM/AKP di atas).

---

### "Menunggu kelulusan" cuma kawalan paparan (UI), bukan kawalan data sebenar

**Fail:** `firestore.rules`

**Ditemui semasa:** semakan susulan lepas isu #1 dibaiki (pengguna tanya
"ada lagi nak dibaiki?").

**Isu:** Log masuk Google **tak dihadkan** kepada domain emel sekolah
(`googleProvider.setCustomParameters({hd: ...})` dikomen, tak aktif) -
sesiapa sahaja di dunia dengan akaun Google boleh log masuk laman web
ni. Selepas log masuk, mereka jadi status `menunggu` sehingga admin
luluskan - TAPI hampir semua peraturan Firestore cuma semak
`request.auth != null` ("dah log masuk"), bukan "dah diluluskan
admin". Ini bermakna sesiapa sahaja (termasuk orang yang **belum
pernah** diluluskan, malah tak pernah cuba pun) boleh baca (dan
kebanyakan koleksi, TULIS juga) semua data sensitif: murid (No.IC,
OKU), staff (No.IC), RPI, dll - status "menunggu" cuma alih laluan (UI
redirect ke /profil), tak pernah jadi sekatan data sebenar.

**Pembaikan yang dibuat:** Tambah fungsi `isStaffDiluluskan()` dalam
`firestore.rules` - semak profile staff SENDIRI berstatus 'diluluskan'
(atau admin). Semua koleksi yang dulu `allow read/write: if
request.auth != null` ditukar kepada `isStaffDiluluskan()`. Kekalkan
jalan keluar (carve-out) supaya staff baru/menunggu masih boleh
baca/isi profile SENDIRI (perlu untuk aliran pendaftaran/menunggu
berfungsi). Juga baiki isu kedua yang ditemui serentak: koleksi
`admins` boleh di-`list()` (senarai penuh emel+peranan admin) oleh
SESIAPA log masuk - dihadkan kepada admin sahaja (`get` per-dokumen
untuk semak "adakah saya admin" kekal terbuka, perlu untuk semua
pengguna).

**Pengesahan:** Emulator Firestore sebenar gagal dimuat turun (sekatan
rangkaian sandbox terhadap `storage.googleapis.com`) - jadi disahkan
dengan (1) penjejakan manual logik peraturan bagi setiap senario
kritikal, dan (2) skrip simulasi JS yang tiru tepat fungsi CEL
peraturan, dijalankan terhadap 9 senario (staff baru, staff menunggu,
staff diluluskan, admin, orang luar, cubaan enumerate admin) - **9/9
lulus**. Disyorkan uji manual ringkas lepas deploy (log masuk akaun
Google baru, sahkan diarah ke borang profile & tak boleh nampak data
murid sebelum admin luluskan).

**Tindakan susulan diperlukan:** `firebase deploy --only
firestore:rules` (atau salin-tampal ke Firebase Console > Firestore >
Rules). Tiada perubahan Apps Script/`.env` diperlukan untuk fix ni.

**Pertimbangan tambahan (DIKEMASKINI - lebih rumit daripada dijangka
asalnya, belum diputuskan):** Cadangan asal (hadkan log masuk kepada
domain emel sekolah) **tak boleh pakai terus macam disangka**. Domain
`moe-dl.edu.my` dalam kod (`firebase.js`, dikomen) ialah domain
**DELIMa (KPM)** - tapi **HANYA Guru** yang ada emel domain ni. Staff
kategori **PPM dan AKP tiada emel DELIMa**, guna Gmail peribadi/emel
lain. Jadi sekat log masuk kepada `@moe-dl.edu.my` sahaja akan
**kunci keluar PPM & AKP sepenuhnya** daripada sistem - tak boleh
pakai.

Pilihan yang perlu dibincang kemudian (belum diputuskan):
- Senarai domain/emel dibenarkan yang lebih fleksibel (bukan satu
  domain sahaja) - cth. domain DELIMa UNTUK guru + senarai emel
  spesifik/domain lain untuk PPM/AKP
- ATAU terima yang sesiapa boleh cuba log masuk (macam sekarang),
  dan bergantung SEPENUHNYA pada peraturan Firestore
  (`isStaffDiluluskan()`, dah dibaiki) + proses kelulusan admin
  manual sebagai satu-satunya penapis - iaitu, terima yang "log masuk
  terbuka" memang keperluan sebenar sekolah ni (bukan boleh dielak),
  fokus pastikan lapisan KELULUSAN & DATA (yang dah dibaiki) kukuh,
  bukan lapisan log masuk

**Status:** Menunggu perbincangan lanjut - JANGAN aktifkan `hd`
parameter dalam `firebase.js` sebelum keputusan ni dibuat.

---

### Apps Script upload guna "rahsia" statik yang sebenarnya terdedah

**Fail:** `appscript/Code.gs`, `src/lib/driveUpload.js`

`VITE_DRIVE_UPLOAD_SECRET` dibakar terus ke dalam fail JS awam semasa
`npm run build` (ciri asas Vite - semua `VITE_*` env var jadi awam).
Disahkan dengan build ujian - rentetan rahsia muncul terus dalam
`dist/assets/*.js`. Ini bermakna sesiapa sahaja (tanpa akaun sistem)
boleh muat naik fail terus ke Google Drive sekolah, tiada had kadar,
tiada semakan jenis/saiz fail di server.

**Pembaikan yang dibuat:**
- `Code.gs` sekarang sahkan **Firebase ID Token** pengguna terus dengan
  Google (Identity Toolkit REST API `accounts:lookup`) - bukan rahsia
  statik. Token luput ~1 jam, tak boleh dipalsukan, sahkan pengguna
  benar-benar log masuk sistem sekolah.
- Semakan jenis fail (mimetype) & saiz (20MB) sekarang dikuatkuasa di
  **server** (`Code.gs`), bukan setakat di browser - allowlist ikut
  subfolder (`rpt` → PDF sahaja, lain-lain → imej sahaja).
- Had kadar asas ditambah (40 muat naik/jam setiap staff, guna
  `CacheService`) - elak spam/automasi.
- `.env.example`, README, dan CI workflow (`deploy.yml`) dikemaskini -
  `VITE_DRIVE_UPLOAD_SECRET` dibuang sepenuhnya, digantikan
  `FIREBASE_API_KEY` (Script Property Apps Script, bukan rahsia -
  Firebase API key memang reka bentuk untuk didedahkan awam).

**Tindakan susulan diperlukan (di luar repo, TAK BOLEH dibuat oleh Claude):**
1. Kemaskini `appscript/Code.gs` di script.google.com dengan versi baru
   dalam repo ni
2. Tambah Script Property `FIREBASE_API_KEY` (nilai sama dengan
   `VITE_FIREBASE_API_KEY` dalam `.env`)
3. Deploy → Manage deployments → edit → **New version** (URL kekal sama)
4. Buang `VITE_DRIVE_UPLOAD_SECRET` dari GitHub Actions Secrets
   (Settings → Secrets and variables → Actions) - dah tak digunakan
5. **Susunan penting:** kemaskini Apps Script DULU (langkah 1-3), BARU
   push/deploy website - kalau website deploy dulu, upload akan gagal
   sekejap sehingga Apps Script pun dikemaskini.

---

## ✅ Keputusan Dasar (SENGAJA, bukan oversight)

### 1. Akses data murid & staff — "semua staff nampak semua"

Keputusan sekolah: SEMUA staff yang log masuk (profil diluluskan) boleh
BACA semua rekod murid (termasuk No.IC, kategori OKU) dan semua rekod
staff (termasuk No.IC). Tiada had "perlu tahu" (need-to-know) ikut
kelas/jawatan.

**Sebab:** Pasukan kecil, kerjasama merentas kelas/seksyen perlu.

**Firestore rules berkaitan:** `match /profiles/{docId}`, `match /murid/{docId}` -
`allow read: if request.auth != null`.

### 2. "Password untuk lihat" data sensitif — DITOLAK (sebab teknikal, bukan dasar)

Dicadang oleh pengguna, tapi ditolak selepas penjelasan: password di
peringkat UI/client TIDAK memberi perlindungan sebenar - data dah
sampai ke browser staff sebaik sahaja Firestore benarkan baca (rules
di atas), sebelum apa-apa "password" pun muncul di skrin. Boleh
dipintas terus guna DevTools/Network tab.

Kalau nak sekatan sebenar, kena disemak di `firestore.rules` (server) -
tapi itu bermakna balik ke model "hadkan siapa boleh baca", yang
sekolah dah putuskan tak mahu (lihat #1).

### 3. Eksport pukal (muat turun Excel/CSV semua murid/staff) — SEMUA STAFF, TIADA HAD

Keputusan sekolah: sama macam #1, semua staff boleh eksport pukal,
tiada sekatan peranan. Tujuan eksport pun belum pasti/berbeza-beza
ikut keperluan.

**Cadangan yang DITANGGUHKAN (bukan ditolak, sekadar belum jadi
keutamaan buat masa ni):**
- Ciri eksport pukal (Excel/CSV) untuk murid & staff **belum wujud**
  dalam sistem pada tarikh audit ni.
- Bila dibina nanti, disyorkan tambah **audit log** (koleksi berasingan:
  siapa/bila/apa/berapa rekod dieksport) - bukan sekatan akses, sekadar
  jejak akauntabiliti kalau data leak/hilang kemudian.
- Disyorkan juga papar peringatan ringkas (bukan sekatan) semasa
  eksport: fail mengandungi data peribadi, jaga kerahsiaan ikut PDPA.

**Status:** Belum dibina. Bina bila diminta.

---

## ⚠️ Lain-lain dari audit (belum ditindak, prioriti rendah)

- Tiada audit log untuk PADAM rekod (murid, RPI, dll hilang senyap,
  tiada jejak siapa/bila padam).
- `npm audit`: 13 vulnerability (11 moderate, 2 high) - terutama
  pakej `xlsx` (SheetJS) guna untuk import Excel murid, tiada fix
  tersedia dari pembekal. Risiko terhad sebab import admin-only, tapi
  masih pakej tak dipatch.
- Tiada had panjang/format pada input borang di peringkat Firestore
  rules (cth. tiada had aksara pada medan teks) - validation server-side
  minimum buat masa ni.
- Edit serentak (dua staff edit rekod sama serentak) guna last-write-wins,
  bukan optimistic locking - perubahan boleh hilang senyap dalam kes jarang.

---

*Kemaskini dokumen ni bila keputusan dasar baru dibuat, supaya sentiasa
jadi rujukan tunggal yang tepat.*
