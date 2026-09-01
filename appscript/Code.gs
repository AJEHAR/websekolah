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
//
//      GROQ_API_KEY = (untuk ciri AI OPR - dapatkan PERCUMA di
//      console.groq.com -> API Keys -> Create API Key. Key ni RAHSIA
//      SEBENAR - jangan letak dalam .env/kod React, cuma di sini sahaja,
//      supaya staff boleh guna AI tanpa perlu key masing-masing.)
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
// Untuk ciri AI OPR (Jana Kekuatan/Kelemahan/Penambahbaikan) - key GROQ
// PERCUMA (satu sahaja untuk seluruh sekolah, staff TAK perlu key sendiri).
// Dapatkan di console.groq.com -> API Keys, letak dalam Script Properties.
const GROQ_API_KEY = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY')
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
  // Gambar Muka Depan Kertas Kerja (tahunan) - gambar sahaja.
  kertasKerja: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  // OPR - gambar aktiviti + tandatangan digital (kedua-dua imej sahaja).
  opr: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  // Koleksi Pekeliling (Kurikulum) - dokumen boleh PDF, gambar, ATAU Word
  // (.doc/.docx) - pekeliling kadang diedarkan dalam format Word terus.
  pekeliling: [
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
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
  kertasKerja: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  opr: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  pekeliling: ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.doc', '.docx'],
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
      return jsonResponse({ error: 'Terlalu banyak permintaan dalam masa singkat. Sila cuba lagi sebentar.' })
    }

    // Tindakan AI (OPR) - laluan BERASINGAN daripada muat naik fail di
    // bawah. `action` cuma dihantar untuk permintaan AI; permintaan muat
    // naik fail sedia ada tak hantar `action` langsung (elak pecahkan
    // client lama yang belum kemaskini).
    if (data.action === 'generateAI') {
      return kendalikanJanaAI(data)
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

// OPR - jana Kekuatan/Kelemahan/Penambahbaikan guna Groq (openai/gpt-oss-120b).
// NOTA (28 Ogos 2026): model lama 'llama-3.3-70b-versatile' DIBUANG TERUS
// oleh Groq (diumum 17 Jun 2026, dinyahtauliah Ogos 2026) - "model tak
// wujud" ni BUKAN salah key/kod, Groq yang tarik balik model tu. Gantian
// rasmi Groq: openai/gpt-oss-120b (atau qwen/qwen3.6-27b). Rujuk
// https://console.groq.com/docs/deprecations kalau error macam ni
// berulang lagi masa depan (Groq kerap kemas kini/buang model lama).
// Key GROQ_API_KEY disimpan SERVER SAHAJA (Script Properties) - staff
// tak pernah nampak/pegang key ni, cuma perlu log masuk (sahkan idToken
// macam biasa, dah dibuat di doPost sebelum sampai sini).
function kendalikanJanaAI(data) {
  if (!GROQ_API_KEY) {
    return jsonResponse({ error: 'AI belum disetup - GROQ_API_KEY tiada dalam Script Properties. Hubungi admin.' })
  }

  const d = data.payload || {}
  const prompt =
    'Anda adalah pembantu penulisan laporan program sekolah yang berfokus kepada analisis yang realistik dan kontekstual dalam Bahasa Melayu formal.\n\n' +
    'Maklumat program:\n' +
    '- Unit/Kategori   : ' + (d.unit || '(tiada maklumat)') + '\n' +
    '- Nama Program    : ' + (d.nama || '(tiada maklumat)') + '\n' +
    '- Hari            : ' + (d.hari || '(tiada maklumat)') + '\n' +
    '- Tarikh          : ' + (d.tarikh || '(tiada maklumat)') + '\n' +
    '- Masa            : ' + (d.masa || '(tiada maklumat)') + '\n' +
    '- Tempat          : ' + (d.tempat || '(tiada maklumat)') + '\n' +
    '- Kumpulan Sasaran: ' + (d.sasaran || '(tiada maklumat)') + '\n' +
    '- Objektif Program: ' + (d.objektif || '(tiada maklumat)') + '\n' +
    '- Aktiviti        : ' + (d.aktiviti || '(tiada maklumat)') + '\n\n' +
    'ARAHAN PENTING:\n' +
    '1. Analisis mesti berdasarkan kandungan AKTIVITI dan OBJEKTIF, bukan ayat umum.\n' +
    '2. Jika terdapat elemen seperti "ibu bapa", "penjaga", "waris" atau "PIBG" dalam aktiviti, masukkan aspek penglibatan ibu bapa.\n' +
    '3. Jika tiada elemen tersebut, JANGAN sebut tentang ibu bapa atau komuniti.\n' +
    '4. Elakkan ayat klise tanpa sebab khusus.\n\n' +
    'OUTPUT - format JSON SAHAJA:\n' +
    '{"kekuatan":"...","kelemahan":"...","penambahbaikan":"..."}\n\n' +
    'PANDUAN:\n' +
    '- Setiap bahagian TEPAT 2 point: "1. [ayat]\\n2. [ayat]"\n' +
    '- Setiap point satu ayat pendek (kurang 20 patah perkataan).\n' +
    '- Bahasa Melayu formal.'

  try {
    const res = UrlFetchApp.fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + GROQ_API_KEY },
      payload: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'Anda pembantu penulisan laporan sekolah. Balas HANYA JSON sah. Tiada markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.65,
        max_tokens: 900,
        response_format: { type: 'json_object' },
      }),
      muteHttpExceptions: true,
    })

    const json = JSON.parse(res.getContentText())
    if (res.getResponseCode() !== 200) {
      const mesejRalat = (json && json.error && json.error.message) || ('HTTP ' + res.getResponseCode())
      return jsonResponse({ error: 'Ralat Groq API: ' + mesejRalat })
    }

    let kandungan = json.choices[0].message.content.trim()
    kandungan = kandungan.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()

    let hasil
    try {
      hasil = JSON.parse(kandungan)
    } catch (pe) {
      return jsonResponse({ error: 'Ralat format respons AI. Sila cuba lagi.' })
    }

    return jsonResponse({
      kekuatan: hasil.kekuatan || '',
      kelemahan: hasil.kelemahan || '',
      penambahbaikan: hasil.penambahbaikan || '',
    })
  } catch (err) {
    return jsonResponse({ error: 'Ralat sambungan ke Groq API: ' + err.message })
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
