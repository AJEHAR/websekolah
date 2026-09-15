import { useEffect, useRef, useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

// Dropdown BOLEH CARI - <select> asli HTML tak sokong carian dalaman,
// menyusahkan kalau senarai staff panjang. Guna ni di MANA-MANA tempat
// perlu pilih 1 nama dari senarai dalam KKGS (Jawatankuasa, Claim, dll).
export default function DropdownCari({ value, onChange, pilihan, placeholder = 'Pilih…', kosongkanLabel = '- Tiada -', bolehKosong = true }) {
  const [buka, setBuka] = useState(false)
  const [carian, setCarian] = useState('')
  const bekasRef = useRef(null)
  const inputCarianRef = useRef(null)

  const dipilih = pilihan.find((p) => p.id === value)
  const ditapis = pilihan.filter((p) => p.label.toLowerCase().includes(carian.toLowerCase()))

  useEffect(() => {
    function klikLuar(e) {
      if (bekasRef.current && !bekasRef.current.contains(e.target)) {
        setBuka(false)
        setCarian('')
      }
    }
    document.addEventListener('mousedown', klikLuar)
    return () => document.removeEventListener('mousedown', klikLuar)
  }, [])

  useEffect(() => {
    if (buka) inputCarianRef.current?.focus()
  }, [buka])

  function pilih(id) {
    onChange(id)
    setBuka(false)
    setCarian('')
  }

  return (
    <div className="relative" ref={bekasRef}>
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        className="w-full min-h-[42px] px-3 py-2 rounded-card border border-border bg-base text-sm flex items-center justify-between gap-2 text-left"
      >
        <span className={`${dipilih ? 'text-ink' : 'text-inkmuted'} whitespace-normal break-words leading-snug`}>{dipilih ? dipilih.label : placeholder}</span>
        <ChevronDown size={14} className="text-inkmuted shrink-0" />
      </button>

      {buka && (
        <div className="absolute z-40 mt-1 w-full bg-surface border border-border rounded-card shadow-lg overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-border">
            <Search size={14} className="text-inkmuted shrink-0" />
            <input
              ref={inputCarianRef}
              type="text"
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              placeholder="Cari nama…"
              className="flex-1 text-sm bg-transparent outline-none"
            />
            {carian && (
              <button type="button" onClick={() => setCarian('')} aria-label="Kosongkan carian" className="text-inkmuted shrink-0"><X size={13} /></button>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto">
            {bolehKosong && (
              <button type="button" onClick={() => pilih('')} className="w-full text-left px-3 py-2 text-sm text-inkmuted hover:bg-base">{kosongkanLabel}</button>
            )}
            {ditapis.length === 0 ? (
              <p className="px-3 py-2 text-xs text-inkmuted">Tiada padanan.</p>
            ) : (
              ditapis.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pilih(p.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-base ${p.id === value ? 'bg-base font-semibold text-brand-red' : 'text-ink'}`}
                >
                  {p.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
