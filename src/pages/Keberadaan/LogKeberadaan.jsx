import { useState } from 'react'
import { useLogKeberadaan } from '../../hooks/useKeberadaan.js'
import KeberadaanCard from './KeberadaanCard.jsx'
import { todayISO } from '../../lib/dateUtils.js'

export default function LogKeberadaan({ currentUserEmel, isAdmin, onEdit, onPadam }) {
  const [dari, setDari] = useState(todayISO())
  const [hingga, setHingga] = useState(todayISO())
  const [aktif, setAktif] = useState(false)
  const { senarai, loading, muatSemula } = useLogKeberadaan(dari, hingga, aktif)

  function papar(e) {
    e.preventDefault()
    setAktif(true)
    muatSemula()
  }

  function bolehUrus(rekod) {
    return isAdmin || rekod.profilEmel === currentUserEmel
  }

  return (
    <section>
      <h2 className="text-base font-bold text-ink">Log Keberadaan</h2>
      <p className="text-xs text-inkmuted mt-0.5">Pilih julat tarikh untuk lihat rekod keberadaan.</p>

      <form onSubmit={papar} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="dari" className="block text-xs font-medium text-ink mb-1">Dari</label>
          <input
            id="dari"
            type="date"
            value={dari}
            onChange={(e) => setDari(e.target.value)}
            className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <div>
          <label htmlFor="hingga" className="block text-xs font-medium text-ink mb-1">Hingga</label>
          <input
            id="hingga"
            type="date"
            min={dari}
            value={hingga}
            onChange={(e) => setHingga(e.target.value)}
            className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <button type="submit" className="h-10 px-5 rounded-card bg-ink text-white text-sm font-semibold">
          Papar
        </button>
      </form>

      <div className="mt-5 space-y-2">
        {!aktif ? (
          <p className="text-sm text-inkmuted">Pilih julat tarikh dan tekan "Papar".</p>
        ) : loading ? (
          <p className="text-sm text-inkmuted">Memuatkan…</p>
        ) : senarai.length === 0 ? (
          <p className="text-sm text-inkmuted">Tiada rekod dalam julat tarikh ini.</p>
        ) : (
          senarai.map((r) => (
            <KeberadaanCard key={r.id} rekod={r} bolehUrus={bolehUrus(r)} onEdit={onEdit} onPadam={onPadam} />
          ))
        )}
      </div>
    </section>
  )
}
