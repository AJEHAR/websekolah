import { auth } from './firebase.js'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export const isDriveUploadConfigured = Boolean(APPS_SCRIPT_URL)

const SAIZ_MAKS_ASAL = 20 * 1024 * 1024 // 20MB - had fail asal sebelum cuba mampatkan
const LEBAR_MAKS = 1600 // px - lebar maksimum lepas dimampatkan (cukup untuk paparan web)
const KUALITI_JPEG = 0.82
const HAD_MASA_MS = 45000 // 45 saat - elak fetch tersangkut selama-lamanya (punca "no response")

// Mampatkan & saizkan semula gambar guna Canvas SEBELUM muat naik - ni yang
// paling penting: gambar kamera telefon selalunya 4-8MB (kadang lebih), dan
// muat naik fail besar macam ni ke Apps Script boleh tersangkut/timeout
// terutama di sambungan perlahan - nampak macam "tiada respons" di desktop
// atau "upload gagal" di telefon bergantung pada sambungan.
async function mampatkanGambar(fail) {
  if (!fail.type.startsWith('image/')) return fail

  try {
    const bitmap = await createImageBitmap(fail)
    const skala = Math.min(1, LEBAR_MAKS / bitmap.width)
    const lebar = Math.round(bitmap.width * skala)
    const tinggi = Math.round(bitmap.height * skala)

    const canvas = document.createElement('canvas')
    canvas.width = lebar
    canvas.height = tinggi
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, lebar, tinggi)
    bitmap.close?.()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', KUALITI_JPEG))
    if (!blob || blob.size >= fail.size) return fail // mampatan tak berbaloi - guna fail asal

    return new File([blob], fail.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
  } catch (err) {
    console.warn('Gagal mampatkan gambar, guna fail asal:', err)
    return fail
  }
}

function failKeBase64(fail) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(fail)
  })
}

// Muat naik fail ke Google Drive melalui Apps Script Web App.
// subfolder: 'profil'/'kehadiran'/'unitUBKS' dll - untuk susun fail ikut kategori dalam Drive.
// mampatkan: false untuk fail yang MESTI kekal PNG/latar telus (tandatangan
// digital) - mampatan tukar ke JPEG (tiada sokongan alpha), latar telus
// jadi HITAM PEKAT bila ditukar (bukan bug hias, betul-betul rosakkan
// tandatangan). Fail tandatangan pun kecil (garis lukisan sahaja), tiada
// faedah nak mampat pun.
// Pulangkan { url, previewUrl, fileId, fileName }.
//
// KESELAMATAN: Guna Firebase ID Token pengguna semasa (bukan "rahsia" statik)
// supaya Apps Script boleh sahkan permintaan ni betul-betul datang dari staff
// yang log masuk sistem - lihat nota panjang dalam appscript/Code.gs untuk
// sebab perubahan ni (rahsia statik lama terbukti terdedah dalam bundle JS awam).
export async function muatNaikKeDrive(failAsal, subfolder, { mampatkan = true } = {}) {
  if (!isDriveUploadConfigured) {
    throw new Error('Google Drive upload belum disetup (isi VITE_APPS_SCRIPT_URL dalam .env)')
  }
  if (!auth?.currentUser) {
    throw new Error('Sesi log masuk tidak dijumpai. Sila log masuk semula sebelum muat naik fail.')
  }
  if (failAsal.size > SAIZ_MAKS_ASAL) {
    throw new Error('Fail terlalu besar (maksimum 20MB). Sila pilih gambar lain.')
  }

  const idToken = await auth.currentUser.getIdToken()

  const fail = mampatkan ? await mampatkanGambar(failAsal) : failAsal
  const base64Data = await failKeBase64(fail)

  const controller = new AbortController()
  const masaTamat = setTimeout(() => controller.abort(), HAD_MASA_MS)

  let res
  try {
    res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      // Content-Type 'text/plain' sengaja digunakan (bukan application/json) untuk
      // elak isu CORS preflight dengan Apps Script Web App.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        idToken,
        fileName: fail.name,
        mimeType: fail.type,
        base64Data,
        folder: subfolder,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Muat naik ambil masa terlalu lama (>45 saat). Cuba sambungan internet lebih stabil, atau gambar lebih kecil.')
    }
    throw new Error('Gagal sambung ke pelayan muat naik. Semak sambungan internet anda dan cuba lagi.')
  } finally {
    clearTimeout(masaTamat)
  }

  let hasil
  try {
    hasil = await res.json()
  } catch {
    throw new Error('Pelayan muat naik pulangkan jawapan tak sah. Cuba lagi.')
  }

  if (hasil.error) throw new Error(hasil.error)
  return hasil
}

// Jana Kekuatan/Kelemahan/Penambahbaikan (OPR) guna AI - panggil Apps
// Script (bukan terus ke Groq dari browser) supaya API key Groq kekal
// RAHSIA di server, staff tak perlu key sendiri. Sahkan identiti sama
// corak dengan muatNaikKeDrive (Firebase ID Token).
export async function janaAiOpr(dataProgram) {
  if (!isDriveUploadConfigured) {
    throw new Error('Ciri AI belum disetup (isi VITE_APPS_SCRIPT_URL dalam .env)')
  }
  if (!auth?.currentUser) {
    throw new Error('Sesi log masuk tidak dijumpai. Sila log masuk semula.')
  }

  const idToken = await auth.currentUser.getIdToken()

  const controller = new AbortController()
  const masaTamat = setTimeout(() => controller.abort(), HAD_MASA_MS)

  let res
  try {
    res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ idToken, action: 'generateAI', payload: dataProgram }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI ambil masa terlalu lama (>45 saat). Cuba lagi.')
    }
    throw new Error('Gagal sambung ke pelayan AI. Semak sambungan internet anda dan cuba lagi.')
  } finally {
    clearTimeout(masaTamat)
  }

  let hasil
  try {
    hasil = await res.json()
  } catch {
    throw new Error('Pelayan AI pulangkan jawapan tak sah. Cuba lagi.')
  }

  if (hasil.error) throw new Error(hasil.error)
  return hasil
}
