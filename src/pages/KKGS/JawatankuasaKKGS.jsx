import { Link } from 'react-router-dom'
import { Award, ArrowRight } from 'lucide-react'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { JAWATAN_KKGS, adalahJawatankuasa } from './kkgsConstants.js'

// Jawatankuasa - BUKAN senarai berasingan, cuma TAPISAN & susunan
// hierarki dari Senarai Ahli (satu sumber data sahaja - elak dua tempat
// perlu dikemas kini berasingan bila jawatan seseorang ditukar).
export default function JawatankuasaKKGS() {
  const { senarai, loading } = useKkgsAhliSenarai()
  const jawatankuasa = senarai.filter((a) => adalahJawatankuasa(a.jawatan))

  const ikutJawatan = JAWATAN_KKGS
    .filter((j) => j !== 'Ahli')
    .map((jawatan) => ({ jawatan, ahli: jawatankuasa.filter((a) => a.jawatan === jawatan) }))
    .filter((kump) => kump.ahli.length > 0)

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">Susunan ikut jawatan dilantik - diambil terus dari Senarai Ahli (ahli biasa tak dipaparkan di sini).</p>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : jawatankuasa.length === 0 ? (
        <div className="p-6 rounded-card border border-dashed border-border text-center">
          <Award size={24} className="mx-auto text-inkmuted mb-2" />
          <p className="text-sm text-inkmuted mb-3">Belum ada sesiapa dilantik jawatan lagi.</p>
          <Link to="/kkgs/senarai-ahli" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
            Lantik dari Senarai Ahli <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ikutJawatan.map(({ jawatan, ahli }) => (
            <div key={jawatan}>
              <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">{jawatan}</p>
              <div className="space-y-2">
                {ahli.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3.5 rounded-card border border-border bg-surface">
                    <div className="h-9 w-9 rounded-full bg-base flex items-center justify-center text-inkmuted shrink-0">
                      <Award size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink truncate">{a.nama}</p>
                      <p className="text-xs text-inkmuted truncate">{a.emel || 'Tiada emel didaftar'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/kkgs/senarai-ahli" className="inline-flex items-center gap-1.5 text-xs text-brand-red font-medium mt-5">
        Urus jawatan (Senarai Ahli) <ArrowRight size={13} />
      </Link>
    </div>
  )
}
