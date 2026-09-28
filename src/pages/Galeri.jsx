import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useGaleriSekolah } from '../hooks/useGaleriSekolah.js'

// Lightbox fade/scale masuk halus (bukan terus "pop" muncul) - toggle
// class sejurus lepas mount via requestAnimationFrame, CSS transition
// buat selebihnya.
function Lightbox({ gambar, onTutup }) {
  const [nampak, setNampak] = useState(false)
  useEffect(() => {
    const bingkai = requestAnimationFrame(() => setNampak(true))
    return () => cancelAnimationFrame(bingkai)
  }, [])

  function tutup() {
    setNampak(false)
    setTimeout(onTutup, 150)
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 transition-opacity duration-150 ${nampak ? 'opacity-100' : 'opacity-0'}`}
      onClick={tutup}
    >
      <button
        onClick={tutup}
        aria-label="Tutup"
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
      >
        <X size={20} />
      </button>
      <div
        className={`max-w-3xl max-h-[85vh] w-full transition-transform duration-150 ${nampak ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={gambar.imageUrl} alt={gambar.tajuk || ''} className="w-full h-full object-contain rounded-card" />
        {gambar.tajuk && <p className="text-white text-center text-sm mt-3">{gambar.tajuk}</p>}
      </div>
    </div>
  )
}

function SkeletonGaleri() {
  const tinggi = ['h-40', 'h-56', 'h-32', 'h-48', 'h-36', 'h-52', 'h-40', 'h-44']
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 animate-pulse">
      {tinggi.map((h, i) => (
        <div key={i} className={`${h} bg-base rounded-card mb-3 sm:mb-4 break-inside-avoid`} />
      ))}
    </div>
  )
}

export default function Galeri() {
  const { senarai, loading } = useGaleriSekolah()
  const [dibesarkan, setDibesarkan] = useState(null)

  return (
    <main className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-16">
      <h1 className="text-xl sm:text-2xl font-bold text-ink text-center mb-6">Galeri Sekolah</h1>

      {loading ? (
        <SkeletonGaleri />
      ) : senarai.length === 0 ? (
        <div className="bg-surface border border-border rounded-card shadow-soft p-8 sm:p-12 text-center">
          <p className="text-inkmuted text-sm">Halaman ini kosong buat masa ini — gambar/video akan ditambah kemudian.</p>
        </div>
      ) : (
        // Masonry ringan (CSS columns) - gambar kekal nisbah asal, tinggi
        // tak seragam, jauh lebih hidup drpd grid petak sama saiz.
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
          {senarai.map((g) => (
            <button
              key={g.id}
              onClick={() => setDibesarkan(g)}
              className="group relative block w-full rounded-card overflow-hidden bg-surface border border-border text-left mb-3 sm:mb-4 break-inside-avoid"
            >
              <img
                src={g.imageUrl}
                alt={g.tajuk || 'Galeri Sekolah'}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {g.tajuk && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-xs font-medium text-white truncate">{g.tajuk}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {dibesarkan && <Lightbox gambar={dibesarkan} onTutup={() => setDibesarkan(null)} />}
    </main>
  )
}
