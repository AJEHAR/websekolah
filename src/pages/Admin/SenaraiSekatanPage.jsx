import { useOutletContext } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useSenaraiSekatan, bukaSekatan } from '../../hooks/useSenaraiSekatan.js'
import { useDialog } from '../../context/DialogContext.jsx'

// Format terus dari Date (bukan lalu ISO string) - elak isu toISOString()
// tukar ke UTC yang boleh anjak tarikh untuk zon Malaysia (rujuk nota di
// atas formatISOTempatan dalam lib/dateUtils.js).
function formatTarikhMasa(saat) {
  if (!saat) return ''
  return new Date(saat * 1000).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SenaraiSekatanPage() {
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

  return <Isi />
}

function Isi() {
  const { konfirm } = useDialog()
  const { senarai, loading, muatSemula } = useSenaraiSekatan()

  async function buka(emel) {
    if (!(await konfirm(`Buka sekatan untuk "${emel}"? Dia akan boleh mendaftar semula.`, { bahaya: true }))) return
    await bukaSekatan(emel)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">
        Emel yang disekat kekal daripada mendaftar dalam sistem (lihat Panel Admin &gt; Menunggu Kelulusan
        untuk sekat permohonan baru).
      </p>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada emel disekat.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-card border border-border bg-surface">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{s.emel}</p>
                {s.sebab && <p className="text-xs text-inkmuted truncate">Sebab: {s.sebab}</p>}
                <p className="text-xs text-inkmuted truncate">
                  Disekat oleh {s.disekatOlehNama || s.disekatOlehEmel || '-'}
                  {s.disekatPada?.seconds ? ` · ${formatTarikhMasa(s.disekatPada.seconds)}` : ''}
                </p>
              </div>
              <button
                onClick={() => buka(s.emel)}
                className="flex items-center gap-1.5 shrink-0 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink hover:bg-base"
              >
                <ShieldOff size={14} /> Buka Sekatan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
