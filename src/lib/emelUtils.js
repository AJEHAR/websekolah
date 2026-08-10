// Firestore doc ID tak boleh ada '/'. Fungsi ni dikongsi antara useProfile
// (staff kemas kini profile sendiri) dan Admin (pra-daftar/urus profile staff lain)
// supaya kedua-dua guna ID dokumen yang sama untuk emel yang sama.
export function emelKeDocId(emel) {
  return emel.trim().toLowerCase().replace(/\//g, '_')
}
