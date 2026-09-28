import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { useStatistikMuridAwam } from '../hooks/useStatistikMuridAwam.js'
import { useGaleriSekolah } from '../hooks/useGaleriSekolah.js'
import { useInView } from '../hooks/useInView.js'
import { useCountUp } from '../hooks/useCountUp.js'
import { WARNA_LELAKI, WARNA_PEREMPUAN } from '../lib/warnaJantina.js'
import { BarisKecil } from './MaklumatMurid/KadKategoriOKU.jsx'
import { warnaCeria } from './MaklumatMurid/paletCeria.js'

// lucide-react (versi projek ni) TIADA ikon Mars/Venus/gender - guna
// simbol ♂/♀ sendiri (bukan pinjam ikon tak relevan macam GraduationCap/
// UserRound versi asal) supaya maksud kad terus jelas tanpa perlu baca label.
function IkonLelaki({ size, className }) {
  return <span style={{ fontSize: size, lineHeight: 1 }} className={className} aria-hidden="true">♂</span>
}
function IkonPerempuan({ size, className }) {
  return <span style={{ fontSize: size, lineHeight: 1 }} className={className} aria-hidden="true">♀</span>
}

// Kad angka besar (hero) untuk carta ringkas Statistik Murid - nombor
// "count-up" bila kad masuk skrin (bukan terus "melompat" muncul), + hover
// lift halus supaya kad terasa hidup, bukan statik macam laporan PDF.
function KadStat({ Ikon, warnaBg, warnaIkon, nilai, label, aktifKira }) {
  const dipapar = useCountUp(nilai, { aktif: aktifKira })
  return (
    <div
      className="rounded-card p-4 sm:p-5 text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-soft"
      style={{ backgroundColor: warnaBg }}
    >
      <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: warnaIkon }}>
        <Ikon size={22} className="text-white" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-ink leading-none tabular-nums">{dipapar}</p>
      <p className="text-xs sm:text-sm text-inkmuted mt-1.5">{label}</p>
    </div>
  )
}

// Bar mendatar "kelas vs bilangan" (Lelaki/Perempuan bertindan) - gantian
// ringan utk carta bar Looker Studio, tanpa perlu tambah library carta.
// Label angka diletak DALAM/HUJUNG setiap segmen (bukan cuma warna) supaya
// tetap boleh dibaca oleh pengguna buta warna.
function BarKelas({ kelas, lelaki, perempuan, jumlah, maksJumlah }) {
  const peratusLelaki = jumlah > 0 ? (lelaki / maksJumlah) * 100 : 0
  const peratusPerempuan = jumlah > 0 ? (perempuan / maksJumlah) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-1.5">
      <p className="text-[11px] text-inkmuted w-24 sm:w-32 shrink-0 truncate" title={kelas}>{kelas}</p>
      <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-base">
        {lelaki > 0 && (
          <div className="flex items-center justify-end pr-1.5" style={{ width: `${peratusLelaki}%`, backgroundColor: WARNA_LELAKI.fg }}>
            {peratusLelaki > 12 && <span className="text-[9px] font-bold text-white">{lelaki}</span>}
          </div>
        )}
        {perempuan > 0 && (
          <div className="flex items-center justify-end pr-1.5" style={{ width: `${peratusPerempuan}%`, backgroundColor: WARNA_PEREMPUAN.fg }}>
            {peratusPerempuan > 12 && <span className="text-[9px] font-bold text-white">{perempuan}</span>}
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-ink w-8 text-right shrink-0">{jumlah}</p>
    </div>
  )
}

function SeksyenStatistikMurid() {
  const { data, loading } = useStatistikMuridAwam()
  const [ref, kelihatan] = useInView()

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-card shadow-soft p-5 sm:p-8 animate-pulse">
        <div className="h-5 w-40 bg-base rounded mx-auto mb-5" />
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="h-28 bg-base rounded-card" />
          <div className="h-28 bg-base rounded-card" />
          <div className="h-28 bg-base rounded-card" />
        </div>
      </div>
    )
  }
  if (!data.jumlah) return null // belum dikemaskini admin - sorok seksyen (elak papar carta kosong)

  const lelaki = data.jantina.find((j) => j.label === 'Lelaki')?.jumlah ?? 0
  const perempuan = data.jantina.find((j) => j.label === 'Perempuan')?.jumlah ?? 0
  const maksJumlahKelas = Math.max(1, ...data.ikutKelas.map((k) => k.jumlah))

  return (
    <section
      ref={ref}
      className={`bg-surface border border-border rounded-card shadow-soft p-5 sm:p-8 transition-all duration-700 ${kelihatan ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <h2 className="text-lg sm:text-xl font-bold text-ink text-center mb-5">Statistik Murid</h2>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <KadStat Ikon={Users} warnaBg="#FFF4D6" warnaIkon="#B8860B" nilai={data.jumlah} label="Jumlah Murid" aktifKira={kelihatan} />
        <KadStat Ikon={IkonLelaki} warnaBg={WARNA_LELAKI.bg} warnaIkon={WARNA_LELAKI.fg} nilai={lelaki} label="Lelaki" aktifKira={kelihatan} />
        <KadStat Ikon={IkonPerempuan} warnaBg={WARNA_PEREMPUAN.bg} warnaIkon={WARNA_PEREMPUAN.fg} nilai={perempuan} label="Perempuan" aktifKira={kelihatan} />
      </div>

      {data.kategoriOku.length > 0 && (
        <div className="border-t border-border pt-4 mb-4">
          <BarisKecil tajuk="Pendidikan Khas Ikut Kategori" data={data.kategoriOku} warna={warnaCeria(4)} />
        </div>
      )}

      {data.ikutKelas.length > 0 && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide">Ikut Kelas</h3>
            <div className="flex items-center gap-3 text-[10px] text-inkmuted">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: WARNA_LELAKI.fg }} />Lelaki</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: WARNA_PEREMPUAN.fg }} />Perempuan</span>
            </div>
          </div>
          {data.ikutKelas.map((k) => (
            <BarKelas key={k.kelas} {...k} maksJumlah={maksJumlahKelas} />
          ))}
        </div>
      )}
    </section>
  )
}

function SeksyenGaleri() {
  const { senarai, loading } = useGaleriSekolah()
  const [ref, kelihatan] = useInView()

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-card shadow-soft p-5 sm:p-8 animate-pulse">
        <div className="h-5 w-32 bg-base rounded mb-4" />
        <div className="columns-2 sm:columns-3 gap-3 [&>*]:mb-3">
          <div className="h-40 bg-base rounded-card" />
          <div className="h-24 bg-base rounded-card" />
          <div className="h-32 bg-base rounded-card" />
          <div className="h-28 bg-base rounded-card" />
        </div>
      </div>
    )
  }
  if (senarai.length === 0) return null
  const pratonton = senarai.slice(0, 6)

  return (
    <section
      ref={ref}
      className={`bg-surface border border-border rounded-card shadow-soft p-5 sm:p-8 transition-all duration-700 ${kelihatan ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-ink">Galeri Sekolah</h2>
        <Link to="/galeri" className="flex items-center gap-1 text-sm font-semibold text-brand-red hover:gap-1.5 transition-all shrink-0">
          Lihat Semua <ArrowRight size={15} />
        </Link>
      </div>
      {/* Masonry ringan guna CSS columns (bukan grid petak sama saiz) -
          gambar kekal nisbah asal, tinggi tak seragam, rasa lebih hidup. */}
      <div className="columns-2 sm:columns-3 gap-3">
        {pratonton.map((g) => (
          <div key={g.id} className="group relative rounded-card overflow-hidden bg-base border border-border mb-3 break-inside-avoid">
            <img
              src={g.imageUrl}
              alt={g.tajuk || 'Galeri Sekolah'}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {g.tajuk && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pt-4 pb-2">
                <p className="text-[11px] font-medium text-white truncate">{g.tajuk}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-16 space-y-6">
      <div
        className="rounded-card shadow-soft p-8 sm:p-12 lg:p-16 text-center overflow-hidden relative"
        style={{ background: 'linear-gradient(160deg, #C8102E 0%, #A50D26 55%, #7A0A1C 130%)' }}
      >
        <img
          src="/logo.png"
          alt="Logo SK Pendidikan Khas Kuantan"
          className="h-20 w-20 lg:h-24 lg:w-24 object-contain mx-auto mb-5 drop-shadow-lg"
        />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
          Selamat Datang ke Laman Web Rasmi
        </h1>
        <p className="text-white/85 mt-2 text-sm sm:text-base lg:text-lg">
          Sekolah Kebangsaan Pendidikan Khas Kuantan
        </p>
        <p className="text-white/70 mt-3 text-xs sm:text-sm max-w-xl mx-auto">
          Melahirkan insan berdikari, berkemahiran dan berjaya dalam hidup — usaha tetap jaya.
        </p>
        <Link
          to="/maklumat-sekolah"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-card text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: '#F2C230', color: '#1A1A1A' }}
        >
          Lihat Profil Sekolah <ArrowRight size={16} />
        </Link>
      </div>

      <SeksyenStatistikMurid />
      <SeksyenGaleri />
    </main>
  )
}
