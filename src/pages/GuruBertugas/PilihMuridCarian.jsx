import { useEffect, useRef, useState } from 'react'

export default function PilihMuridCarian({ muridSenarai, value, onChange }) {
  const [carian, setCarian] = useState('')
  const [terbuka, setTerbuka] = useState(false)
  const rujukan = useRef(null)

  const namaTerpilih = muridSenarai.find((m) => m.idMurid === value)?.nama ?? ''

  useEffect(() => {
    function tutupBilaKlikLuar(e) {
      if (rujukan.current && !rujukan.current.contains(e.target)) {
        setTerbuka(false)
      }
    }
    document.addEventListener('mousedown', tutupBilaKlikLuar)
    return () => document.removeEventListener('mousedown', tutupBilaKlikLuar)
  }, [])

  const senaraiDitapis = muridSenarai
    .filter((m) => m.nama?.toLowerCase().includes(carian.toLowerCase()))
    .slice(0, 30)

  function pilih(m) {
    onChange(m.idMurid)
    setCarian('')
    setTerbuka(false)
  }

  return (
    <div ref={rujukan} className="relative flex-1 min-w-0">
      <input
        type="text"
        value={terbuka ? carian : namaTerpilih}
        onChange={(e) => {
          setCarian(e.target.value)
          setTerbuka(true)
        }}
        onFocus={() => {
          setCarian('')
          setTerbuka(true)
        }}
        placeholder="Cari nama murid…"
        className="w-full h-10 px-2 rounded-card border border-border bg-surface text-xs"
      />
      {terbuka && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto border border-border rounded-card bg-surface shadow-soft">
          {senaraiDitapis.length === 0 ? (
            <p className="p-2 text-xs text-inkmuted">Tiada murid dijumpai.</p>
          ) : (
            senaraiDitapis.map((m) => (
              <button
                key={m.idMurid}
                type="button"
                onClick={() => pilih(m)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-base"
              >
                {m.nama} <span className="text-inkmuted">· {m.namaKelas}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
