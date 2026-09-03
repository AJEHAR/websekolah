# Pelan: Akses Nazir KPM ke Fail Unit UBKS

**Status:** 🟡 Ditangguhkan — belum dibina. Simpan untuk sambung kemudian.
**Tarikh dibincang:** 2 September 2026

---

## 1. Latar Belakang

Soalan asal: *"Bagaimana jika Nazir KPM datang nak semak semua berkaitan UBKS?"*

Nazir biasanya nak lihat **fail unit** — Perancangan, Jawatankuasa, Kehadiran, Laporan Aktiviti — semuanya sekali, bukan bertaburan dalam menu berasingan.

### ✅ Sudah dibina (siap digunakan sekarang)

**"Fail Unit"** — page konsolidasi on-screen per unit, di `/eubks/fail-unit/:unitId`.

Papar dalam satu tempat:
- Kad ringkasan (Ahli / Perancangan X-12 / Kehadiran X-12 / Laporan X-12)
- Perancangan penuh (12 perjumpaan + status Selesai)
- Jawatankuasa (nama + jawatan)
- Senarai Ahli
- Kehadiran (ringkasan hadir/keseluruhan setiap perjumpaan)
- Laporan Aktiviti (grid 12 status, boleh cetak terus dari situ)

Akses: butang **"Fail Unit (Nazir)"** di atas halaman edit Unit (Murid UBKS → buka unit).

Page ni **bacaan sahaja** (tiada butang edit) — sengaja, supaya staff tak risau tersalah tekan semasa Nazir tengok.

### 🟡 Belum dibina (fasa akan datang, pilihan)

**"Cetak Fail Unit jadi SATU PDF gabungan"** — supaya boleh disimpan/emel sebagai dokumen kekal, bukan sekadar dilihat on-screen. Ditangguhkan sehingga versi on-screen ni diuji dulu dan nampak perlu/tidak.

---

## 2. Soalan susulan: Macam mana Nazir akses sendiri?

Nazir **suka browse sendiri** guna telefon/tablet dia sendiri (bukan duduk sekali dengan staff tengok skrin staff).

### Cabaran

Sistem guna Firebase — semua data **wajib** disahkan siapa yang minta (tiada "pautan terus tanpa log masuk" yang selamat, atas sebab data murid sensitif). Jadi perlu mekanisme log masuk khas untuk Nazir, bukan sekadar kongsi pautan/QR biasa.

### Keputusan reka bentuk (dipersetujui)

1. **Laluan daftar khas** — `/daftar-nazir` (atau serupa) — borang **ringkas sahaja** (Nama + emel + kata laluan). **TIADA** borang Profile penuh (Jawatan/IC/Kategori) yang staff biasa wajib isi.
2. **Skip semakan Profile wajib** — akaun jenis "Nazir" (ditandakan berasingan daripada "Staff") terus dibawa ke **Portal Nazir** (senarai semua unit merentasi KURI/HEM/KOKU → klik → Fail Unit terus).
3. **Had masa: 7 hari** dari tarikh daftar — disimpan sebagai `tarikhTamat`. Setiap akses disemak dua lapisan:
   - Kod aplikasi (React) — semakan cepat, redirect ke mesej "akses tamat" kalau lepas tempoh.
   - Peraturan Firestore (`request.time` vs `tarikhTamat`) — lapisan keselamatan **tak boleh dipintas**, walau kod app diubah/dilangkau.
4. **Padam automatik sepenuhnya lepas 7 hari** (pilihan **B** — dipersetujui, walaupun lebih rumit daripada sekadar sekat akses):
   - Bukan sekadar padam rekod Firestore (senang) — tapi **padam akaun log masuk sebenar** (Firebase Auth) supaya emel/kata laluan tu betul-betul tak boleh log masuk lagi.
   - Perlukan **Apps Script terjadual** (`time-driven trigger`) jalan setiap hari, cari akaun Nazir tamat tempoh, padam data + akaun.

---

## 3. Pembahagian kerja

### Bahagian Claude (code — boleh mula bila-bila)
1. Borang daftar khas Nazir (`/daftar-nazir`) — ringkas, tiada Profile wajib.
2. Simpan `tarikhTamat` (7 hari), sekat akses lepas tamat (kod app + peraturan Firestore).
3. Portal Nazir — senarai semua unit (KURI/HEM/KOKU), pautan terus ke Fail Unit.
4. Fungsi *cleanup* (Apps Script `kendalikanPadamNazirTamat` atau serupa) — jalan automatik setiap hari via time-driven trigger, cari & padam rekod Firestore + akaun Firebase Auth Nazir yang tamat tempoh.
5. Senarai admin (Panel Admin) — lihat status semua akaun Nazir (Aktif/Tamat), padam manual kalau perlu (sandaran kalau *trigger* automatik gagal/tertunda).

### Bahagian Pengguna (persediaan Google Cloud — **WAJIB buat dulu**, Claude tiada akses)

Padam **akaun log masuk sebenar** (bukan sekadar data) perlukan Service Account berkuasa admin ke sistem log masuk Google — ini **kuasa tinggi**, kena disediakan berhati-hati di Google Cloud Console:

1. **Cipta Service Account baharu** — console.cloud.google.com → projek Firebase sistem ni → IAM & Admin → Service Accounts → Create Service Account. Nama cadangan: `nazir-cleanup-bot`.
2. **Bagi peranan MINIMUM sahaja** — pilih peranan **"Firebase Authentication Admin"** (BUKAN Owner/Editor) — had kuasa dia setakat urus akaun log masuk sahaja, tak boleh sentuh Firestore/storan lain.
3. **Jana kunci JSON** — dalam Service Account tu, tab "Keys" → Add Key → Create new key → JSON → muat turun. **Fail ni sangat sulit** — jangan kongsi/letak dalam repo awam.
4. **Simpan dalam Apps Script** — salin kandungan PENUH fail JSON tu, tampal sebagai Script Property baharu (cadangan nama: `NAZIR_SERVICE_ACCOUNT_JSON`) dalam Apps Script Editor projek ni (Project Settings → Script Properties) — sama tempat `GROQ_API_KEY`/`FIREBASE_API_KEY` disimpan sekarang.

---

## 4. Nota keselamatan (ingat sebelum sambung bina)

- Service Account "Firebase Authentication Admin" **boleh padam MANA-MANA akaun** dalam sistem (bukan Nazir sahaja) kalau kod cleanup silap logik — pastikan fungsi Apps Script **hanya** padam akaun yang betul-betul ada penanda `jenis: 'nazir'` DAN `tarikhTamat` yang dah lepas, jangan padam ikut senarai umum tanpa penapis ketat.
- Elok admin **semak log/senarai** (langkah 5, Panel Admin) selepas setiap *cleanup run* pada mulanya, sehingga yakin logik betul-betul selamat sebelum "percaya buta" pada automasi.
- Simpan fail JSON Service Account **hanya** dalam Script Properties (bukan dalam kod, bukan dalam zip yang dikongsi, bukan dalam mana-mana chat/dokumen awam).

---

## 5. Untuk sambung perbualan ni nanti

Bagitahu Claude: *"Kita nak sambung bina Portal Nazir — rujuk dokumen Pelan_Akses_Nazir_KPM.md"*, dan nyatakan sama ada langkah Google Cloud (Bahagian 3) dah siap disediakan atau belum, supaya kerja boleh diselaraskan dengan betul.
