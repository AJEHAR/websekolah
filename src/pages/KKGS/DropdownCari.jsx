import { useEffect, useRef, useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

// Dropdown BOLEH CARI - <select> asli HTML tak sokong carian dalaman,
// menyusahkan kalau senarai staff panjang. Guna ni di MANA-MANA tempat
// perlu pilih 1 nama dari senarai dalam KKGS (Jawatankuasa, Claim, dll).
//
// PENTING: overlay SKRIN PENUH melekat dari ATAS (bukan "bottom sheet"
// naik dari bawah macam versi lepas) - bila papan kekunci muncul di
// telefon, ia ambil ruang BAWAH skrin; kalau panel melekat bawah, hasil
// carian akan TERSOROK/tertindih papan kekunci (punca bug "senarai di
// belakang keyboard" yang dilaporkan). Melekat atas + carian & senarai
// terus di bawah tajuk bermakna keputusan carian SENTIASA di atas papan
// kekunci, tak kira berapa tinggi papan kekunci ambil ruang.
export default function DropdownCari({ value, onChange, pilihan, placeholder = 'Pilih…', kosongkanLabel = '- Tiada -', bolehKosong = true, tajuk = 'Pilih' }) {
  const [buka, setBuka] = useState(false)
  const [carian, setCarian] = useState('')
  const [tinggiVisual, setTinggiVisual] = useState(null)
  const inputCarianRef = useRef(null)

  const dipilih = pilihan.find((p) => p.id === value)
  const ditapis = pilihan.filter((p) => p.label.toLowerCase().includes(carian.toLowerCase()))

  useEffect(() => {
    if (buka) {
      // Tunggu render overlay dulu (setTimeout 0) sebelum fokus - elak
      // isu fokus terlepas pada sesetengah pelayar mobile.
      const t = setTimeout(() => inputCarianRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    setCarian('')
  }, [buka])

  // window.visualViewport - API KHAS jejak tinggi skrin SEBENAR kelihatan
  // (selepas tolak ruang papan kekunci) - CSS sahaja (100dvh/100vh) TAK
  // BOLEH DIPERCAYAI sepenuhnya pada semua WebView Android/pelayar mobile
  // (sokongan tak konsisten, kadang kira tinggi PENUH termasuk kawasan
  // tertutup papan kekunci - punca bug "senarai hilang di belakang
  // keyboard" yang dilaporkan). Dengar event resize visualViewport dan
  // paksa tinggi overlay ikut nilai TEPAT tu secara aktif.
  useEffect(() => {
    if (!buka || typeof window === 'undefined' || !window.visualViewport) return
    function kemaskiniTinggi() {
      setTinggiVisual(window.visualViewport.height)
    }
    kemaskiniTinggi()
    window.visualViewport.addEventListener('resize', kemaskiniTinggi)
    window.visualViewport.addEventListener('scroll', kemaskiniTinggi)
    return () => {
      window.visualViewport.removeEventListener('resize', kemaskiniTinggi)
      window.visualViewport.removeEventListener('scroll', kemaskiniTinggi)
    }
  }, [buka])

  function pilih(id) {
    onChange(id)
    setBuka(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="w-full min-h-[42px] px-3 py-2 rounded-card border border-border bg-base text-sm flex items-center justify-between gap-2 text-left"
      >
        <span className={`${dipilih ? 'text-ink' : 'text-inkmuted'} whitespace-normal break-words leading-snug`}>{dipilih ? dipilih.label : placeholder}</span>
        <ChevronDown size={14} className="text-inkmuted shrink-0" />
      </button>

      {buka && (
        <div
          className="fixed inset-0 z-50 bg-surface flex flex-col"
          style={{ height: tinggiVisual ? `${tinggiVisual}px` : '100dvh', top: 0 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <h3 className="text-sm font-bold text-ink">{tajuk}</h3>
            <button type="button" onClick={() => setBuka(false)} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border shrink-0">
            <Search size={15} className="text-inkmuted shrink-0" />
            <input
              ref={inputCarianRef}
              type="text"
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              placeholder="Cari nama…"
              className="flex-1 text-sm bg-transparent outline-none"
            />
            {carian && (
              <button type="button" onClick={() => setCarian('')} aria-label="Kosongkan carian" className="text-inkmuted shrink-0"><X size={14} /></button>
            )}
          </div>

          <div className="overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {bolehKosong && (
              <button type="button" onClick={() => pilih('')} className="w-full text-left px-4 py-3 text-sm text-inkmuted hover:bg-base border-b border-border">{kosongkanLabel}</button>
            )}
            {ditapis.length === 0 ? (
              <p className="px-4 py-4 text-xs text-inkmuted text-center">Tiada padanan.</p>
            ) : (
              ditapis.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pilih(p.id)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-base border-b border-border last:border-b-0 ${p.id === value ? 'bg-base font-semibold text-brand-red' : 'text-ink'}`}
                >
                  {p.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
