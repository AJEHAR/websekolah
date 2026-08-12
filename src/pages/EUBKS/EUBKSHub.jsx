import { Link } from 'react-router-dom'
import { EUBKS_AKSES_PANTAS } from './eubksAksesPantas.js'

export default function EUBKSHub() {
  return (
    <div
      className="rounded-card overflow-hidden text-center px-6 py-10 sm:py-14"
      style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #4A0E16 55%, #C8102E 130%)' }}
    >
      <h1 className="text-xl sm:text-2xl font-bold text-white">eUBKS Ko</h1>
      <p className="text-xs text-white/70 mt-1 mb-6">Unit Beruniform, Kelab dan Sukan</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {EUBKS_AKSES_PANTAS.map(({ label, to, Ikon }) => (
          <Link
            key={to}
            to={to}
            className="bg-white/95 rounded-card p-4 flex flex-col items-center gap-2 hover:bg-white transition-colors"
          >
            <Ikon size={22} className="text-brand-red" />
            <span className="text-xs font-semibold text-ink text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
