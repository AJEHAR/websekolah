// ============================================================
// Apps Script Web App - terima upload fail dari laman web
// sekolah dan simpan ke Google Drive (ganti Firebase Storage).
//
// CARA DEPLOY:
// 1. Pergi ke script.google.com -> New project
// 2. Padam kod default, salin-tampal SEMUA kod dalam fail ni
// 3. Project Settings (ikon gear) -> Script Properties -> Add property:
//      RAHSIA_UPLOAD = (satu rentetan rahsia rawak, contoh: skpk-2026-x9k2m)
//    Nilai ni MESTI sama dengan VITE_DRIVE_UPLOAD_SECRET dalam .env
// 4. Deploy -> New deployment -> Type: "Web app"
//      Execute as: Me
//      Who has access: Anyone
// 5. Salin "Web app URL" yang diberikan -> letak dalam .env sebagai
//    VITE_APPS_SCRIPT_URL
// 6. Setiap kali kod ni diedit, kena "Deploy" -> "Manage deployments"
//    -> edit -> New version, supaya perubahan berkuatkuasa.
// ============================================================

const RAHSIA_UPLOAD = PropertiesService.getScriptProperties().getProperty('RAHSIA_UPLOAD')
const NAMA_FOLDER_INDUK = 'Laman Web Sekolah - Upload'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)

    if (!RAHSIA_UPLOAD || data.secret !== RAHSIA_UPLOAD) {
      return jsonResponse({ error: 'Tidak dibenarkan - rahsia tidak sepadan' })
    }
    if (!data.base64Data || !data.fileName) {
      return jsonResponse({ error: 'Data fail tidak lengkap' })
    }

    const folderInduk = dapatkanAtauCiptaFolder(NAMA_FOLDER_INDUK)
    const subfolder = dapatkanAtauCiptaFolder(data.folder || 'lain-lain', folderInduk)

    const bytes = Utilities.base64Decode(data.base64Data)
    const blob = Utilities.newBlob(bytes, data.mimeType || 'application/octet-stream', data.fileName)
    const file = subfolder.createFile(blob)

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

function dapatkanAtauCiptaFolder(nama, folderInduk) {
  const induk = folderInduk || DriveApp.getRootFolder()
  const iter = induk.getFoldersByName(nama)
  if (iter.hasNext()) return iter.next()
  return induk.createFolder(nama)
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
