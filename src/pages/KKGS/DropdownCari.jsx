import { useEffect, useRef, useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

// Dropdown BOLEH CARI - <select> asli HTML tak sokong carian dalaman,
// menyusahkan kalau senarai staff panjang. Guna ni di MANA-MANA tempat
// perlu pilih 1 nama dari senarai dalam KKGS (Jawatankuasa, Claim, dll).
//
// PENTING: dibuka sebagai OVERLAY SKRIN PENUH (bukan popup kecil melekat
// bawah butang lagi) - popup kecil (position:absolute) boleh MELIMPAH
// KELUAR skrin telefon (terpotong, tak boleh capai) terutama kalau
// butang dah berada bawah separuh skrin - punca bug "nama terpotong"
// yang dilaporkan. Overlay skrin penuh elak isu ni SEPENUHNYA, tak kira
// kedudukan butang di skrin.
export default function DropdownCari({ value, onChange, pilihan, placeholder = 'Pilih…', kosongkanLabel = '- Tiada -', bolehKosong = true, tajuk = 'Pilih' }) {
  const [buka, setBuka] = useState(false)
  const [carian, setCarian] = useState('')
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center" onClick={() => setBuka(false)}>
          <div
            className="bg-surface w-full sm:max-w-sm sm:rounded-card rounded-t-2xl flex flex-col"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
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

            <div className="overflow-y-auto flex-1">
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
        </div>
      )}
    </>
  )
}
