import { Link } from 'react-router-dom'

// Komponen hero kongsi - dipakai oleh semua hub seksyen (Keberadaan, Guru
// Bertugas, HEM, Kokurikulum/UBKS, Kurikulum, Panel Admin).
// hantar warna gradient & senarai akses pantas sendiri. gambarTelefon/
// gambarDesktop pilihan - kalau ada, papar gambar (dengan scrim gelap untuk
// pastikan teks putih sentiasa jelas dibaca); kalau tiada, gradient jadi latar.
export default function HubHero({ title, subtitle, gradient, aksesTeks, aksesPantas, gambarTelefon, gambarDesktop }) {
  const adaGambar = Boolean(gambarTelefon || gambarDesktop)

  return (
    <div className="relative w-full min-h-[calc(100dvh-4rem)] overflow-hidden">
      {adaGambar ? (
        <>
          {gambarTelefon ? (
            <img src={gambarTelefon} alt="" className="absolute inset-0 w-full h-full object-cover sm:hidden" />
          ) : (
            <div className="absolute inset-0 sm:hidden" style={{ background: gradient }} />
          )}
          {gambarDesktop ? (
            <img src={gambarDesktop} alt="" className="absolute inset-0 w-full h-full object-cover hidden sm:block" />
          ) : (
            <div className="absolute inset-0 hidden sm:block" style={{ background: gradient }} />
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.55) 100%)' }}
          />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: gradient }} />
      )}

      <div className="relative flex flex-col items-center justify-start text-center px-6 pt-14 sm:pt-20 pb-16 min-h-[calc(100dvh-4rem)]">
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
    </div>
  )
}
