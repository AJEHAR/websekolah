import { Link } from 'react-router-dom'
import { EUBKS_AKSES_PANTAS } from './eubksAksesPantas.js'

export default function EUBKSHub() {
  return (
    <div
      className="w-full min-h-[65vh] sm:min-h-[75vh] flex flex-col items-center justify-center text-center px-6 py-16"
      style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #4A0E16 55%, #C8102E 130%)' }}
    >
      <h1 className="text-3xl sm:text-5xl font-bold text-white">eUBKS Ko</h1>
      <p className="text-sm sm:text-lg text-white/70 mt-2 mb-10 sm:mb-14">Unit Beruniform, Kelab dan Sukan</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-md sm:max-w-3xl w-full">
        {EUBKS_AKSES_PANTAS.map(({ label, to, Ikon }) => (
          <Link
            key={to}
            to={to}
            className="bg-white/95 rounded-card p-5 sm:p-7 flex flex-col items-center gap-3 hover:bg-white hover:-translate-y-0.5 transition-all"
          >
            <Ikon size={28} className="text-brand-red sm:hidden" />
            <Ikon size={36} className="text-brand-red hidden sm:block" />
            <span className="text-xs sm:text-sm font-semibold text-ink text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
