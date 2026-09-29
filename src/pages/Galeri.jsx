import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Image as IkonImej } from 'lucide-react'
import { useGaleriKategori } from '../hooks/useGaleriKategori.js'
import { useGaleriAlbum } from '../hooks/useGaleriAlbum.js'
import { useGaleriSekolah, gambarIkutAlbum } from '../hooks/useGaleriSekolah.js'

// Tera air (watermark) nama sekolah lut sinar atas SETIAP gambar dlm
// slideshow - bukan sekatan screenshot (mustahil disekat sepenuhnya di web,
// screenshot ialah fungsi peringkat OS/telefon, bukan browser), tapi
// pampasan realistik: walau ada yg screenshot, gambar bocor kekal bertera
// label sekolah. pointer-events-none supaya tak halang klik/navigasi.
function TeraAir() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
      <p
        className="text-white/25 font-bold whitespace-nowrap"
        style={{ fontSize: 'clamp(1.5rem, 6vw, 4rem)', transform: 'rotate(-28deg)' }}
      >
        SK PENDIDIKAN KHAS KUANTAN
      </p>
    </div>
  )
}

// Slideshow penuh skrin - navigasi satu-satu (prev/next), tera air atas
// setiap gambar, klik-kanan/seret/muat-turun disekat (had teknikal: ini
// menghalang cara "senang" simpan gambar, BUKAN jaminan mutlak - screenshot
// OS tetap tak boleh disekat drpd laman web).
function Slideshow({ album, gambarSenarai, indeksMula, onTutup }) {
  const [indeks, setIndeks] = useState(indeksMula)
  const gambar = gambarSenarai[indeks]

  useEffect(() => {
    function kekunci(e) {
      if (e.key === 'Escape') onTutup()
      if (e.key === 'ArrowRight') setIndeks((i) => Math.min(i + 1, gambarSenarai.length - 1))
      if (e.key === 'ArrowLeft') setIndeks((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', kekunci)
    return () => window.removeEventListener('keydown', kekunci)
  }, [gambarSenarai.length, onTutup])

  if (!gambar) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-white shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{album.tajuk}</p>
          <p className="text-[11px] text-white/60">{indeks + 1} / {gambarSenarai.length}</p>
        </div>
        <button onClick={onTutup} aria-label="Tutup" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center px-2 sm:px-4 min-h-0">
        {indeks > 0 && (
          <button
            onClick={() => setIndeks((i) => i - 1)}
            aria-label="Sebelum"
            className="absolute left-2 sm:left-4 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="relative max-w-full max-h-full">
          <img
            src={gambar.imageUrl}
            alt={gambar.tajuk || album.tajuk}
            className="max-w-full max-h-[75vh] object-contain rounded-card select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <TeraAir />
        </div>

        {indeks < gambarSenarai.length - 1 && (
          <button
            onClick={() => setIndeks((i) => i + 1)}
            aria-label="Seterusnya"
            className="absolute right-2 sm:right-4 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {gambar.tajuk && <p className="text-center text-white/85 text-sm py-3 px-4 shrink-0">{gambar.tajuk}</p>}
    </div>
  )
}

function KadAlbum({ album, gambarSenarai, onKlik }) {
  const gambar = gambarIkutAlbum(gambarSenarai, album.id)
  return (
    <button
      onClick={onKlik}
      className="text-left rounded-card border border-border bg-surface overflow-hidden hover:shadow-soft transition-shadow"
    >
      <div className="aspect-video bg-base flex items-center justify-center overflow-hidden">
        {album.gambarKulitUrl ? (
          <img src={album.gambarKulitUrl} alt={album.tajuk} className="w-full h-full object-cover" />
        ) : (
          <IkonImej size={28} className="text-inkmuted" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-ink truncate">{album.tajuk}</p>
        <p className="text-[11px] text-inkmuted mt-0.5">{gambar.length} gambar</p>
      </div>
    </button>
  )
}

function SkeletonGaleri() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-video bg-base rounded-card" />
      ))}
    </div>
  )
}

export default function Galeri() {
  const { senarai: kategoriSenarai, loading: loadingKategori } = useGaleriKategori()
  const { senarai: albumSenarai, loading: loadingAlbum } = useGaleriAlbum()
  const { senarai: gambarSenarai, loading: loadingGambar } = useGaleriSekolah()
  const [searchParams] = useSearchParams()
  const [albumTerbuka, setAlbumTerbuka] = useState(null)

  const loading = loadingKategori || loadingAlbum || loadingGambar

  // Pautan terus dari pratonton Utama (?album=xxx) - buka terus slideshow
  // album tu tanpa perlu klik lagi.
  useEffect(() => {
    const idDariUrl = searchParams.get('album')
    if (idDariUrl && !loading && albumSenarai.some((a) => a.id === idDariUrl)) {
      setAlbumTerbuka(idDariUrl)
    }
  }, [searchParams, loading, albumSenarai])

  const kategoriDenganAlbum = useMemo(
    () => kategoriSenarai
      .map((k) => ({ ...k, album: albumSenarai.filter((a) => a.kategoriId === k.id) }))
      .filter((k) => k.album.length > 0),
    [kategoriSenarai, albumSenarai]
  )

  const album = albumSenarai.find((a) => a.id === albumTerbuka)
  const gambarAlbumTerbuka = album ? gambarIkutAlbum(gambarSenarai, album.id) : []

  return (
    <main className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-16">
      <h1 className="text-xl sm:text-2xl font-bold text-ink text-center mb-6">Galeri Sekolah</h1>

      {loading ? (
        <SkeletonGaleri />
      ) : kategoriDenganAlbum.length === 0 ? (
        <div className="bg-surface border border-border rounded-card shadow-soft p-8 sm:p-12 text-center">
          <p className="text-inkmuted text-sm">Halaman ini kosong buat masa ini — album akan ditambah kemudian.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {kategoriDenganAlbum.map((k) => (
            <section key={k.id}>
              <h2 className="text-base font-bold text-ink mb-4">{k.nama}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {k.album.map((a) => (
                  <KadAlbum key={a.id} album={a} gambarSenarai={gambarSenarai} onKlik={() => setAlbumTerbuka(a.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {album && gambarAlbumTerbuka.length > 0 && (
        <Slideshow album={album} gambarSenarai={gambarAlbumTerbuka} indeksMula={0} onTutup={() => setAlbumTerbuka(null)} />
      )}
    </main>
  )
}
