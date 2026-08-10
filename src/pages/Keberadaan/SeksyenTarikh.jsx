import { KUMPULAN_KEBERADAAN, kumpulanKategori } from './constants.js'
import KeberadaanCard from './KeberadaanCard.jsx'
import { formatTarikhPaparan } from '../../lib/dateUtils.js'

export default function SeksyenTarikh({ tajuk, tarikh, senarai, loading, currentUserEmel, isAdmin, onEdit, onPadam }) {
  function bolehUrus(rekod) {
    return isAdmin || rekod.profilEmel === currentUserEmel
  }

  return (
    <section>
      <h2 className="text-base font-bold text-ink">{tajuk}</h2>
      <p className="text-xs text-inkmuted mt-0.5">{formatTarikhPaparan(tarikh)}</p>

      {loading ? (
        <p className="text-sm text-inkmuted mt-4">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted mt-4">Tiada rekod keberadaan.</p>
      ) : (
        <div className="mt-4 grid sm:grid-cols-3 gap-5">
          {KUMPULAN_KEBERADAAN.map((kumpulan) => {
            const senaraiKumpulan = senarai.filter((r) => kumpulanKategori(r.kategori) === kumpulan)
            return (
              <div key={kumpulan}>
                <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">
                  {kumpulan} ({senaraiKumpulan.length})
                </h3>
                <div className="space-y-2">
                  {senaraiKumpulan.length === 0 && <p className="text-xs text-inkmuted">Tiada rekod.</p>}
                  {senaraiKumpulan.map((r) => (
                    <KeberadaanCard key={r.id} rekod={r} bolehUrus={bolehUrus(r)} onEdit={onEdit} onPadam={onPadam} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
