import { useEffect, useRef, useState } from 'react'
import { X, Check } from 'lucide-react'

// Alat crop gambar (canvas) - staff boleh laraskan kotak crop (geser +
// besarkan/kecilkan sudut) sebelum sahkan. Pulangkan blob JPEG hasil crop
// melalui onSah(blob).
// nisbah = lebar/tinggi bingkai DESTINASI sebenar (cth. bingkai Laporan
// UBKS 1.6, OPR/lain 1 = segi empat sama) - PENTING kotak crop ikut
// nisbah SAMA PERSIS dengan bingkai output, kalau tidak apa staff nampak
// semasa crop tak akan sepadan hasil akhir (gambar "terpotong" secara
// mengejut bila dipaparkan dalam bingkai lain bentuk).
export default function PemotongGambarModal({ open, gambarSrc, nisbah = 1, onTutup, onSah, onGagal }) {
  const imgRef = useRef(null)
  const kontenaRef = useRef(null)
  const [saizImej, setSaizImej] = useState({ lebar: 0, tinggi: 0 })
  const [kotak, setKotak] = useState({ x: 20, y: 20, lebar: 200, tinggi: 200 })
  const [seret, setSeret] = useState(null) // { jenis: 'gerak'|'besarkan', mulaX, mulaY, kotakMula }

  useEffect(() => {
    if (open) setSeret(null)
  }, [open, gambarSrc])

  // PENTING: semua hooks (useState/useEffect) MESTI dipanggil dulu,
  // "if (!open) return null" kena selepas SEMUA hooks - React kira
  // bilangan hooks ikut turutan setiap render, kalau early-return berada
  // DI TENGAH dua useEffect, bilangan hooks berbeza bila open bertukar
  // true/false -> "Rendered fewer hooks than expected" -> app crash
  // terus (skrin kosong). Effect kedua (drag handler) diletak DI BAWAH
  // baris ni sebelum ni - itu puncanya, dah dipindah ke atas early-return.
  useEffect(() => {
    if (!seret) return
    function gerak(e) {
      const pos = posEvent(e)
      const dx = pos.x - seret.mulaX
      const dy = pos.y - seret.mulaY
      setKotak((k) => {
        if (seret.jenis === 'gerak') {
          const x = Math.max(0, Math.min(saizImej.lebar - seret.kotakMula.lebar, seret.kotakMula.x + dx))
          const y = Math.max(0, Math.min(saizImej.tinggi - seret.kotakMula.tinggi, seret.kotakMula.y + dy))
          return { ...k, x, y }
        }
        // besarkan (sudut kanan-bawah) - nisbah DIKUNCI (bukan bebas
        // lagi) - lebar ikut seretan staff, tinggi dikira drpd nisbah,
        // supaya kotak crop kekal SAMA BENTUK dengan bingkai output akhir.
        const lebarMaksima = saizImej.lebar - seret.kotakMula.x
        const tinggiMaksima = saizImej.tinggi - seret.kotakMula.y
        let lebar = Math.max(40, seret.kotakMula.lebar + dx)
        let tinggi = lebar / nisbah
        // Had oleh sempadan imej (lebar ATAU tinggi, ambil yang lebih ketat)
        if (lebar > lebarMaksima) { lebar = lebarMaksima; tinggi = lebar / nisbah }
        if (tinggi > tinggiMaksima) { tinggi = tinggiMaksima; lebar = tinggi * nisbah }
        return { ...k, lebar, tinggi }
      })
    }
    function lepas() { setSeret(null) }
    window.addEventListener('mousemove', gerak)
    window.addEventListener('mouseup', lepas)
    window.addEventListener('touchmove', gerak, { passive: false })
    window.addEventListener('touchend', lepas)
    return () => {
      window.removeEventListener('mousemove', gerak)
      window.removeEventListener('mouseup', lepas)
      window.removeEventListener('touchmove', gerak)
      window.removeEventListener('touchend', lepas)
    }
  }, [seret, saizImej, nisbah])

  if (!open) return null

  function imejDimuat(e) {
    const img = e.target
    const kW = kontenaRef.current?.clientWidth ?? img.naturalWidth
    const skala = Math.min(1, kW / img.naturalWidth)
    const lebar = img.naturalWidth * skala
    const tinggi = img.naturalHeight * skala
    setSaizImej({ lebar, tinggi })
    // Kotak crop lalai - ikut NISBAH bingkai destinasi (bukan sentiasa
    // segi empat sama lagi), 80% saiz maksimum yang muat dalam gambar.
    let kotakLebar, kotakTinggi
    if (lebar / tinggi > nisbah) {
      kotakTinggi = tinggi * 0.8
      kotakLebar = kotakTinggi * nisbah
    } else {
      kotakLebar = lebar * 0.8
      kotakTinggi = kotakLebar / nisbah
    }
    setKotak({ x: (lebar - kotakLebar) / 2, y: (tinggi - kotakTinggi) / 2, lebar: kotakLebar, tinggi: kotakTinggi })
  }

  function posEvent(e) {
    const p = e.touches ? e.touches[0] : e
    const r = imgRef.current.getBoundingClientRect()
    return { x: p.clientX - r.left, y: p.clientY - r.top }
  }

  function mulaSeret(jenis) {
    return (e) => {
      e.preventDefault()
      const pos = posEvent(e)
      setSeret({ jenis, mulaX: pos.x, mulaY: pos.y, kotakMula: { ...kotak } })
    }
  }

  function sahkanCrop() {
    const img = imgRef.current
    const skalaAsal = img.naturalWidth / saizImej.lebar
    const canvas = document.createElement('canvas')
    canvas.width = kotak.lebar * skalaAsal
    canvas.height = kotak.tinggi * skalaAsal
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
      img,
      kotak.x * skalaAsal, kotak.y * skalaAsal, kotak.lebar * skalaAsal, kotak.tinggi * skalaAsal,
      0, 0, canvas.width, canvas.height
    )
    try {
      canvas.toBlob((blob) => onSah(blob), 'image/jpeg', 0.85)
    } catch {
      // Kanvas "tainted" (gambar sedia ada dari storan luar tak benarkan
      // baca piksel merentasi domain) - berlaku bila cuba laras SEMULA
      // gambar yang dah dimuat naik sebelum ni. Bukan boleh dipulih di
      // sini - staff kena upload fail asal semula dari peranti.
      onGagal?.('Gagal laras gambar sedia ada (sekatan storan). Sila muat naik semula dari fail asal di peranti awak.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface rounded-card w-full max-w-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Laraskan Gambar</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <div ref={kontenaRef} className="relative bg-ink/5 rounded-card overflow-hidden select-none" style={{ touchAction: 'none' }}>
          <img
            ref={imgRef}
            src={gambarSrc}
            crossOrigin="anonymous"
            onLoad={imejDimuat}
            alt=""
            className="block w-full h-auto"
            draggable={false}
          />
          {saizImej.lebar > 0 && (
            <div
              onMouseDown={mulaSeret('gerak')}
              onTouchStart={mulaSeret('gerak')}
              className="absolute border-2 border-brand-gold cursor-move"
              style={{ left: kotak.x, top: kotak.y, width: kotak.lebar, height: kotak.tinggi, boxShadow: '0 0 0 2000px rgba(0,0,0,0.5)' }}
            >
              <div
                onMouseDown={(e) => { e.stopPropagation(); mulaSeret('besarkan')(e) }}
                onTouchStart={(e) => { e.stopPropagation(); mulaSeret('besarkan')(e) }}
                className="absolute -right-2 -bottom-2 h-5 w-5 rounded-full bg-brand-gold border-2 border-white cursor-nwse-resize"
              />
            </div>
          )}
        </div>

        <p className="text-[11px] text-inkmuted mt-2">Seret kotak untuk gerak, seret bulatan sudut untuk besarkan/kecilkan.</p>

        <div className="flex gap-3 mt-4">
          <button onClick={sahkanCrop} className="flex-1 h-11 rounded-card bg-brand-red text-white text-sm font-semibold flex items-center justify-center gap-1.5">
            <Check size={16} /> Sahkan
          </button>
          <button onClick={onTutup} className="h-11 px-5 rounded-card border border-border text-sm font-medium text-ink">
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
