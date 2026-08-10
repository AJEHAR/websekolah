const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL
const RAHSIA_UPLOAD = import.meta.env.VITE_DRIVE_UPLOAD_SECRET

export const isDriveUploadConfigured = Boolean(APPS_SCRIPT_URL)

function failKeBase64(fail) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(fail)
  })
}

// Muat naik fail ke Google Drive melalui Apps Script Web App.
// subfolder: 'profil' atau 'kehadiran' - untuk susun fail ikut kategori dalam Drive.
// Pulangkan { url, previewUrl, fileId, fileName }.
export async function muatNaikKeDrive(fail, subfolder) {
  if (!isDriveUploadConfigured) {
    throw new Error('Google Drive upload belum disetup (isi VITE_APPS_SCRIPT_URL dalam .env)')
  }

  const base64Data = await failKeBase64(fail)

  // Content-Type 'text/plain' sengaja digunakan (bukan application/json) untuk
  // elak isu CORS preflight dengan Apps Script Web App - Apps Script tetap
  // boleh JSON.parse(e.postData.contents) walaupun content-type ni.
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      secret: RAHSIA_UPLOAD,
      fileName: fail.name,
      mimeType: fail.type,
      base64Data,
      folder: subfolder,
    }),
  })

  const hasil = await res.json()
  if (hasil.error) throw new Error(hasil.error)
  return hasil
}
