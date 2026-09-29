import { cariKategoriIkutNama, tambahKategoriGaleri } from '../hooks/useGaleriKategori.js'
import { tambahAlbumGaleri } from '../hooks/useGaleriAlbum.js'
import { tetapkanAlbumGambar } from '../hooks/useGaleriSekolah.js'

// Migrasi SEKALI SAHAJA (auto-jalan bila admin buka Panel Admin > Galeri) -
// struktur "album" ni baharu, gambar yg diupload SEBELUM ni (rata, tiada
// albumId) perlu diagihkan ke satu album lalai "Umum" (kategori "Sekolah")
// supaya TIADA gambar lama hilang/tercicir drpd paparan awam selepas
// kemaskini ni. Selamat dipanggil berulang kali - jika semua gambar dah ada
// albumId, fungsi ni tak buat apa-apa (idempotent).
export async function pastikanAlbumUmum({ kategoriSenarai, albumSenarai, gambarSenarai, uid }) {
  const gambarTanpaAlbum = gambarSenarai.filter((g) => !g.albumId)
  if (gambarTanpaAlbum.length === 0) return null

  let kategoriSekolah = cariKategoriIkutNama(kategoriSenarai, 'Sekolah')
  if (!kategoriSekolah) {
    const id = await tambahKategoriGaleri('Sekolah', uid)
    kategoriSekolah = { id, nama: 'Sekolah' }
  }

  let albumUmum = albumSenarai.find((a) => a.kategoriId === kategoriSekolah.id && a.tajuk.trim().toLowerCase() === 'umum')
  if (!albumUmum) {
    const gambarKulitUrl = gambarTanpaAlbum[0]?.imageUrl ?? ''
    const id = await tambahAlbumGaleri({ tajuk: 'Umum', kategoriId: kategoriSekolah.id, gambarKulitUrl }, uid)
    albumUmum = { id, tajuk: 'Umum', kategoriId: kategoriSekolah.id }
  }

  await Promise.all(gambarTanpaAlbum.map((g) => tetapkanAlbumGambar(g.id, albumUmum.id)))
  return albumUmum.id
}
