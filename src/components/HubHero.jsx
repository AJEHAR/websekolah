import { Link } from 'react-router-dom'

// Komponen hero kongsi - dipakai oleh semua hub seksyen (Keberadaan, Guru
// Bertugas, Maklumat Murid, eBanci, Panel Admin, eUBKS Ko). Setiap seksyen
// hantar warna gradient & senarai akses pantas sendiri.
export default function HubHero({ title, subtitle, gradient, aksesTeks, aksesPantas }) {
  return (
    <div
      className="w-full min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-start text-center px-6 pt-14 sm:pt-20 pb-16"
      style={{ background: gradient }}
    >
      <h1 className="text-3xl sm:text-5xl font-bold text-white">{title}</h1>
      <p className="text-sm sm:text-lg text-white/70 mt-2 mb-10 sm:mb-14">{subtitle}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-md sm:max-w-3xl w-full">
        {aksesPantas.map(({ label, to, Ikon }) => (
          <Link
            key={to}
            to={to}
            className="bg-white/95 rounded-card p-5 sm:p-7 flex flex-col items-center gap-3 hover:bg-white hover:-translate-y-0.5 transition-all"
          >
            <Ikon size={28} style={{ color: aksesTeks }} className="sm:hidden" />
            <Ikon size={36} style={{ color: aksesTeks }} className="hidden sm:block" />
            <span className="text-xs sm:text-sm font-semibold text-ink text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
