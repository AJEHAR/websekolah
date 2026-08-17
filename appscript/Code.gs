// ============================================================
// Apps Script Web App - terima upload fail dari laman web
// sekolah dan simpan ke Google Drive (ganti Firebase Storage).
//
// KESELAMATAN: Endpoint ni sahkan Firebase ID Token pengguna terus
// dengan Google (Identity Toolkit REST API) - BUKAN guna "rahsia"
// statik. Rahsia statik yang dulu digunakan (RAHSIA_UPLOAD) terbukti
// terdedah kepada sesiapa sahaja sebab semua VITE_* env var Vite
// dibakar terus ke fail JS awam semasa build (bukan bug, memang reka
// bentuk Vite) - jadi ia bukan perlindungan sebenar. Sahkan ID Token
// pastikan permintaan datang dari staff yang BENAR-BENAR log masuk
// sistem sekolah (token luput ~1 jam, tak boleh dipalsukan).
//
// CARA DEPLOY:
// 1. Pergi ke script.google.com -> New project
// 2. Padam kod default, salin-tampal SEMUA kod dalam fail ni
// 3. Project Settings (ikon gear) -> Script Properties -> Add property:
//      FIREBASE_API_KEY = (sama nilai dengan VITE_FIREBASE_API_KEY dalam .env -
//      ni BUKAN rahsia, API key Firebase memang reka bentuk untuk didedahkan
//      awam, dilindungi oleh Firestore Security Rules bukan kerahsiaan)
// 4. Deploy -> New deployment -> Type: "Web app"
//      Execute as: Me
//      Who has access: Anyone
// 5. Salin "Web app URL" yang diberikan -> letak dalam .env sebagai
//    VITE_APPS_SCRIPT_URL
// 6. Setiap kali kod ni diedit, kena "Deploy" -> "Manage deployments"
//    -> edit -> New version, supaya perubahan berkuatkuasa (URL kekal sama).
//
// NOTA MIGRASI: kalau upgrade dari versi lama (guna RAHSIA_UPLOAD),
// kemaskini Code.gs INI DULU (deploy versi baru), BARU deploy website
// (kod React) yang hantar idToken. Susunan terbalik akan buat upload
// gagal sekejap sehingga kedua-dua bahagian dikemaskini.
// ============================================================

const FIREBASE_API_KEY = PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY')
const NAMA_FOLDER_INDUK = 'Laman Web Sekolah - Upload'

// Had saiz & jenis fail dibenarkan ikut subfolder - disemak di SINI (server),
// bukan setakat di browser, sebab semakan client-side mudah dipintas kalau
// seseorang panggil endpoint ni terus (bukan melalui laman web).
const HAD_SAIZ_BAIT = 20 * 1024 * 1024 // 20MB
const JENIS_FAIL_DIBENARKAN = {
  rpt: ['application/pdf'],
  profil: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  // Keberadaan ("Dokumen Berkaitan") terima PDF (surat rasmi/lampiran)
  // SELAIN gambar - client (KeberadaanForm.jsx) dah izin
  // accept="application/pdf,image/*", jadi senarai server MESTI sepadan.
  kehadiran: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  unitUBKS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  latarHub: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}

// Sesetengah sumber (contoh: pemilih fail Android/cloud storage tertentu)
// laporkan jenis fail (mimeType) PDF dalam bentuk sedikit berbeza daripada
// standard 'application/pdf' - normalize dulu sebelum semak, elak tolak
// fail yang sebenarnya sah cuma label mimeType dia tak standard.
const ALIAS_MIMETYPE = {
  'application/x-pdf': 'application/pdf',
  'application/acrobat': 'application/pdf',
  'application/vnd.pdf': 'application/pdf',
  'text/pdf': 'application/pdf',
  'text/x-pdf': 'application/pdf',
}

// Sambungan fail dibenarkan ikut subfolder - digunakan sebagai SANDARAN kalau
// mimeType yang diterima tak dikenali/kosong (contoh: 'application/octet-stream'
// generik) tapi nama fail jelas ada sambungan yang sah.
const SAMBUNGAN_DIBENARKAN = {
  rpt: ['.pdf'],
  profil: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  kehadiran: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'],
  unitUBKS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  latarHub: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
}

// Had kadar ringkas - elak spam - guna CacheService (bertahan ~ beberapa minit,
// cukup untuk elak automasi/bot spam, bukan pengganti had kadar peringkat
// infra sebenar tapi lebih baik daripada tiada apa-apa langsung).
const HAD_MUAT_NAIK_SEJAM = 40
const TEMPOH_CACHE_SAAT = 3600

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)

    if (!data.idToken) {
      return jsonResponse({ error: 'Tidak dibenarkan - sila log masuk semula.' })
    }

    const emel = sahkanIdTokenDapatkanEmel(data.idToken)
    if (!emel) {
      return jsonResponse({ error: 'Tidak dibenarkan - sesi log masuk tidak sah atau tamat tempoh. Sila log masuk semula.' })
    }

    const semakanKadar = semakHadKadar(emel)
    if (!semakanKadar.dibenarkan) {
      return jsonResponse({ error: 'Terlalu banyak muat naik dalam masa singkat. Sila cuba lagi sebentar.' })
    }

    if (!data.base64Data || !data.fileName) {
      return jsonResponse({ error: 'Data fail tidak lengkap' })
    }

    // Anggaran saiz fail asal daripada panjang base64 (~4/3 ganda lebih besar
    // daripada bait sebenar).
    const anggaranBait = Math.floor((data.base64Data.length * 3) / 4)
    if (anggaranBait > HAD_SAIZ_BAIT) {
      return jsonResponse({ error: 'Fail terlalu besar (maksimum 20MB).' })
    }

    const subfolder = data.folder || 'lain-lain'
    const jenisDibenarkan = JENIS_FAIL_DIBENARKAN[subfolder]
    if (jenisDibenarkan) {
      const mimeTypeSebenar = ALIAS_MIMETYPE[data.mimeType] || data.mimeType
      const mimeTypeSah = jenisDibenarkan.indexOf(mimeTypeSebenar) !== -1

      // Sandaran: kalau mimeType tak sepadan (cth. kosong atau generik
      // 'application/octet-stream'), semak sambungan nama fail pula sebelum
      // tolak terus - elak tolak fail sah gara-gara label mimeType pelik.
      const sambunganDibenarkan = SAMBUNGAN_DIBENARKAN[subfolder] || []
      const namaFailKecil = String(data.fileName || '').toLowerCase()
      const sambunganSah = sambunganDibenarkan.some(function (sfx) {
        return namaFailKecil.slice(-sfx.length) === sfx
      })

      if (!mimeTypeSah && !sambunganSah) {
        return jsonResponse({
          error: 'Jenis fail tidak dibenarkan untuk kategori ini. (kategori: ' + subfolder +
            ', jenis fail diterima: "' + data.mimeType + '", nama fail: "' + data.fileName +
            '", dibenarkan: ' + jenisDibenarkan.join(', ') + ')',
        })
      }
    }

    const folderInduk = dapatkanAtauCiptaFolder(NAMA_FOLDER_INDUK)
    const subfolderDrive = dapatkanAtauCiptaFolder(subfolder, folderInduk)

    const bytes = Utilities.base64Decode(data.base64Data)
    const blob = Utilities.newBlob(bytes, data.mimeType || 'application/octet-stream', data.fileName)
    const file = subfolderDrive.createFile(blob)

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)

    return jsonResponse({
      url: 'https://lh3.googleusercontent.com/d/' + file.getId() + '=w1000',
      previewUrl: file.getUrl(),
      fileId: file.getId(),
      fileName: file.getName(),
    })
  } catch (err) {
    return jsonResponse({ error: err.message })
  }
}

// Sahkan Firebase ID Token terus dengan Google guna Identity Toolkit REST API
// (accounts:lookup) - ni cara sahkan token tanpa Firebase Admin SDK (yang
// tak tersedia dalam Apps Script). Pulangkan emel yang disahkan, atau null
// kalau token tak sah/tamat/dipalsukan.
function sahkanIdTokenDapatkanEmel(idToken) {
  if (!FIREBASE_API_KEY) {
    throw new Error('Apps Script belum disetup lengkap - FIREBASE_API_KEY tiada dalam Script Properties.')
  }
  try {
    const res = UrlFetchApp.fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_API_KEY,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ idToken: idToken }),
        muteHttpExceptions: true,
      }
    )
    const hasil = JSON.parse(res.getContentText())
    if (hasil.users && hasil.users.length > 0 && hasil.users[0].email) {
      return hasil.users[0].email
    }
    return null
  } catch (err) {
    return null
  }
}

function semakHadKadar(emel) {
  const cache = CacheService.getScriptCache()
  const kunci = 'muatnaik_' + emel
  const kiraSemasa = Number(cache.get(kunci) || '0')
  if (kiraSemasa >= HAD_MUAT_NAIK_SEJAM) {
    return { dibenarkan: false }
  }
  cache.put(kunci, String(kiraSemasa + 1), TEMPOH_CACHE_SAAT)
  return { dibenarkan: true }
}

function dapatkanAtauCiptaFolder(nama, folderInduk) {
  const induk = folderInduk || DriveApp.getRootFolder()
  const iter = induk.getFoldersByName(nama)
  if (iter.hasNext()) return iter.next()
  return induk.createFolder(nama)
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
