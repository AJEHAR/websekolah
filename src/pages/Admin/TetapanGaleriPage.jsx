import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload, Trash2, ChevronLeft, Plus, Image as IkonImej } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useGaleriSekolah, tambahGambarGaleri, padamGambarGaleri, gambarIkutAlbum, padamSemuaGambarAlbum } from '../../hooks/useGaleriSekolah.js'
import { useGaleriAlbum, tambahAlbumGaleri, padamAlbumGaleri } from '../../hooks/useGaleriAlbum.js'
import { useGaleriKategori, tambahKategoriGaleri, padamKategoriGaleri } from '../../hooks/useGaleriKategori.js'
import { pastikanAlbumUmum } from '../../lib/migrasiGaleriAlbum.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { useDialog } from '../../context/DialogContext.jsx'

export default function TetapanGaleriPage() {
  const { user } = useOutletContext()
  const { isSuperAdmin } = useIsAdmin(user)

  if (!isSuperAdmin) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
        <p className="text-xs text-inkmuted">Bahagian ini khas untuk Admin Penuh.</p>
      </div>
    )
  }

  return <Isi user={user} />
}

// Kad ringkas (dipakai utk Kategori & Album) - gambar kulit/ikon + tajuk +
// sari kata kecil (bilangan album/gambar) + butang padam kecil di penjuru.
function Kad({ gambar, tajuk, sari, onKlik, onPadam }) {
  return (
    <div className="relative group">
      <button
        onClick={onKlik}
        className="w-full text-left rounded-card border border-border bg-surface overflow-hidden hover:shadow-soft transition-shadow"
      >
        <div className="aspect-video bg-base flex items-center justify-center overflow-hidden">
          {gambar ? <img src={gambar} alt={tajuk} className="w-full h-full object-cover" /> : <IkonImej size={28} className="text-inkmuted" />}
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-ink truncate">{tajuk}</p>
          {sari && <p className="text-[11px] text-inkmuted mt-0.5">{sari}</p>}
        </div>
      </button>
      <button
        onClick={onPadam}
        title="Padam"
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 border border-border text-inkmuted hover:bg-white hover:text-brand-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function Isi({ user }) {
  const { senarai: kategoriSenarai, loading: loadingKategori, muatSemula: muatSemulaKategori } = useGaleriKategori()
  const { senarai: albumSenarai, loading: loadingAlbum, muatSemula: muatSemulaAlbum } = useGaleriAlbum()
  const { senarai: gambarSenarai, loading: loadingGambar, muatSemula: muatSemulaGambar } = useGaleriSekolah()
  const { amaran, konfirm } = useDialog()

  const [paparan, setPaparan] = useState('kategori') // 'kategori' | 'album' | 'gambar'
  const [kategoriAktifId, setKategoriAktifId] = useState(null)
  const [albumAktifId, setAlbumAktifId] = useState(null)
  const [migrasiSiap, setMigrasiSiap] = useState(false)

  const loading = loadingKategori || loadingAlbum || loadingGambar

  // Migrasi sekali sahaja bila data pertama sekali selesai dimuatkan -
  // agihkan gambar lama (tiada albumId) ke album "Umum" (lihat
  // lib/migrasiGaleriAlbum.js). Idempotent - selamat jika dah pernah jalan.
  useEffect(() => {
    if (loading || migrasiSiap) return
    setMigrasiSiap(true)
    pastikanAlbumUmum({ kategoriSenarai, albumSenarai, gambarSenarai, uid: user.uid }).then((albumUmumId) => {
      if (albumUmumId) {
        muatSemulaKategori()
        muatSemulaAlbum()
        muatSemulaGambar()
      }
    })
  }, [loading, migrasiSiap, kategoriSenarai, albumSenarai, gambarSenarai, user.uid, muatSemulaKategori, muatSemulaAlbum, muatSemulaGambar])

  const kategoriAktif = kategoriSenarai.find((k) => k.id === kategoriAktifId)
  const albumAktif = albumSenarai.find((a) => a.id === albumAktifId)
  const albumDalamKategori = albumSenarai.filter((a) => a.kategoriId === kategoriAktifId)

  function bukaKategori(id) {
    setKategoriAktifId(id)
    setPaparan('album')
  }
  function bukaAlbum(id) {
    setAlbumAktifId(id)
    setPaparan('gambar')
  }

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  return (
    <div>
      <p className="text-xs text-inkmuted mb-5">
        Album di sini dipaparkan pada halaman awam <strong>Utama</strong> (pratonton) dan <strong>Galeri</strong> penuh (boleh dilihat sesiapa sahaja, tanpa log masuk), disusun ikut Kategori → Album → Gambar.
      </p>

      {paparan !== 'kategori' && (
        <button
          onClick={() => (paparan === 'gambar' ? setPaparan('album') : setPaparan('kategori'))}
          className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4"
        >
          <ChevronLeft size={14} /> {paparan === 'gambar' ? `Kembali ke Album (${kategoriAktif?.nama ?? ''})` : 'Kembali ke Kategori'}
        </button>
      )}

      {paparan === 'kategori' && (
        <PaparanKategori
          senarai={kategoriSenarai}
          albumSenarai={albumSenarai}
          onBuka={bukaKategori}
          onTambah={async (nama) => {
            await tambahKategoriGaleri(nama, user.uid)
            muatSemulaKategori()
          }}
          onPadam={async (kategori) => {
            const bilanganAlbum = albumSenarai.filter((a) => a.kategoriId === kategori.id).length
            if (bilanganAlbum > 0) {
              await amaran(`Kategori "${kategori.nama}" masih ada ${bilanganAlbum} album. Padam/pindah album tu dahulu sebelum padam kategori ini.`)
              return
            }
            if (!(await konfirm(`Padam kategori "${kategori.nama}"?`, { bahaya: true }))) return
            await padamKategoriGaleri(kategori.id)
            muatSemulaKategori()
          }}
        />
      )}

      {paparan === 'album' && kategoriAktif && (
        <PaparanAlbum
          kategori={kategoriAktif}
          senarai={albumDalamKategori}
          gambarSenarai={gambarSenarai}
          user={user}
          onBuka={bukaAlbum}
          onTambah={async () => { muatSemulaAlbum() }}
          onPadam={async (album) => {
            const bilanganGambar = gambarIkutAlbum(gambarSenarai, album.id).length
            const mesej = bilanganGambar > 0
              ? `Padam album "${album.tajuk}"? ${bilanganGambar} gambar di dalamnya akan turut dipadam.`
              : `Padam album "${album.tajuk}"?`
            if (!(await konfirm(mesej, { bahaya: true }))) return
            await padamSemuaGambarAlbum(gambarSenarai, album.id)
            await padamAlbumGaleri(album.id)
            muatSemulaAlbum()
            muatSemulaGambar()
          }}
        />
      )}

      {paparan === 'gambar' && albumAktif && (
        <PaparanGambar
          album={albumAktif}
          senarai={gambarIkutAlbum(gambarSenarai, albumAktif.id)}
          user={user}
          onUbah={muatSemulaGambar}
        />
      )}
    </div>
  )
}

function PaparanKategori({ senarai, albumSenarai, onBuka, onTambah, onPadam }) {
  const [namaBaru, setNamaBaru] = useState('')
  const [menambah, setMenambah] = useState(false)

  async function hantar(e) {
    e.preventDefault()
    if (!namaBaru.trim()) return
    setMenambah(true)
    try {
      await onTambah(namaBaru)
      setNamaBaru('')
    } finally {
      setMenambah(false)
    }
  }

  return (
    <div>
      <form onSubmit={hantar} className="flex gap-2 mb-5">
        <input
          className="flex-1 min-w-0 rounded-card border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          placeholder="Nama kategori baharu (cth. Sukan, Lawatan)"
          value={namaBaru}
          onChange={(e) => setNamaBaru(e.target.value)}
        />
        <button type="submit" disabled={menambah} className="shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60">
          <Plus size={14} /> Tambah Kategori
        </button>
      </form>

      {senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Belum ada kategori. Tambah kategori dahulu (cth. "Sekolah", "Aktiviti") sebelum boleh cipta album.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {senarai.map((k) => {
            const bilanganAlbum = albumSenarai.filter((a) => a.kategoriId === k.id).length
            return (
              <Kad
                key={k.id}
                tajuk={k.nama}
                sari={`${bilanganAlbum} album`}
                onKlik={() => onBuka(k.id)}
                onPadam={() => onPadam(k)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function PaparanAlbum({ kategori, senarai, gambarSenarai, user, onBuka, onTambah, onPadam }) {
  const { amaran } = useDialog()
  const [tajukBaru, setTajukBaru] = useState('')
  const [memuat, setMemuat] = useState(false)

  async function pilihKulit(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    if (!tajukBaru.trim()) {
      await amaran('Isi tajuk album dahulu sebelum muat naik gambar kulit.')
      e.target.value = ''
      return
    }
    setMemuat(true)
    try {
      const hasil = await muatNaikKeDrive(fail, 'galeriAlbum')
      await tambahAlbumGaleri({ tajuk: tajukBaru, kategoriId: kategori.id, gambarKulitUrl: hasil.url }, user.uid)
      setTajukBaru('')
      await onTambah()
    } catch (err) {
      await amaran(err.message || 'Gagal muat naik.')
    } finally {
      setMemuat(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <h2 className="text-sm font-bold text-ink mb-4">Kategori: {kategori.nama}</h2>

      <div className="bg-surface border border-border rounded-card p-4 mb-5">
        <p className="text-xs font-semibold text-ink mb-2">Tambah Album Baharu</p>
        <input
          className="w-full rounded-card border border-border px-3 py-2 text-sm bg-surface mb-2"
          placeholder="Tajuk album (cth. Sambutan Hari Guru 2025)"
          value={tajukBaru}
          onChange={(e) => setTajukBaru(e.target.value)}
        />
        <label className="flex items-center justify-center gap-1.5 h-10 w-fit px-4 rounded-card bg-brand-red text-white text-xs font-semibold cursor-pointer">
          {memuat ? 'Memuat naik…' : (<><Upload size={14} /> Muat Naik Gambar Kulit &amp; Cipta Album</>)}
          <input type="file" accept="image/*" onChange={pilihKulit} className="hidden" disabled={memuat} />
        </label>
      </div>

      {senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Belum ada album dalam kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {senarai.map((a) => (
            <Kad
              key={a.id}
              gambar={a.gambarKulitUrl}
              tajuk={a.tajuk}
              sari={`${gambarIkutAlbum(gambarSenarai, a.id).length} gambar`}
              onKlik={() => onBuka(a.id)}
              onPadam={() => onPadam(a)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PaparanGambar({ album, senarai, user, onUbah }) {
  const { amaran, konfirm } = useDialog()
  const [tajukBaru, setTajukBaru] = useState('')
  const [memuat, setMemuat] = useState(false)

  async function pilihFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setMemuat(true)
    try {
      const hasil = await muatNaikKeDrive(fail, 'galeriSekolah')
      await tambahGambarGaleri({ imageUrl: hasil.url, tajuk: tajukBaru, albumId: album.id }, user.uid)
      setTajukBaru('')
      onUbah()
    } catch (err) {
      await amaran(err.message || 'Gagal muat naik.')
    } finally {
      setMemuat(false)
      e.target.value = ''
    }
  }

  async function padam(g) {
    if (!(await konfirm(`Padam gambar "${g.tajuk || 'ini'}" dari album "${album.tajuk}"?`, { bahaya: true }))) return
    await padamGambarGaleri(g.id)
    onUbah()
  }

  return (
    <div>
      <h2 className="text-sm font-bold text-ink mb-4">Album: {album.tajuk}</h2>

      <div className="bg-surface border border-border rounded-card p-4 mb-5">
        <p className="text-xs font-semibold text-ink mb-2">Tambah Gambar Baharu</p>
        <input
          className="w-full rounded-card border border-border px-3 py-2 text-sm bg-surface mb-2"
          placeholder="Tajuk gambar (pilihan)"
          value={tajukBaru}
          onChange={(e) => setTajukBaru(e.target.value)}
        />
        <label className="flex items-center justify-center gap-1.5 h-10 w-fit px-4 rounded-card bg-brand-red text-white text-xs font-semibold cursor-pointer">
          {memuat ? 'Memuat naik…' : (<><Upload size={14} /> Muat Naik Gambar</>)}
          <input type="file" accept="image/*" onChange={pilihFail} className="hidden" disabled={memuat} />
        </label>
      </div>

      {senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Belum ada gambar dalam album ini.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {senarai.map((g) => (
            <div key={g.id} className="rounded-card border border-border overflow-hidden bg-surface">
              <div className="aspect-square bg-base">
                <img src={g.imageUrl} alt={g.tajuk || ''} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-ink truncate">{g.tajuk || '(tiada tajuk)'}</p>
                <button onClick={() => padam(g)} className="shrink-0 h-7 w-7 rounded-card border border-border text-inkmuted hover:bg-base flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
