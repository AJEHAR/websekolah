import { BookOpen, MapPin, Map, Award, Music, Target, Compass, CheckSquare } from 'lucide-react'
import { useProfilSekolahAwam } from '../../hooks/useProfilSekolahAwam.js'
import { useInView } from '../../hooks/useInView.js'
import { warnaCeria } from '../MaklumatMurid/paletCeria.js'

// Tukar pautan YouTube biasa (watch?v=, youtu.be/, shorts/) kepada URL embed
// - iframe embed WAJIB guna format /embed/{id}, bukan pautan "watch" biasa.
function keYoutubeEmbed(url) {
  if (!url) return null
  const padanan = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return padanan ? `https://www.youtube.com/embed/${padanan[1]}` : null
}

// Setiap seksyen dapat IKON + WARNA sendiri (bukan pill hijau berulang utk
// semua 12 seksyen macam versi asal) - guna palet "Sekolah Ceria" sedia
// ada supaya konsisten dgn Analisis/KKGS, tapi setiap tajuk kini jelas
// berbeza secara visual, bukan hanya teks.
function Tajuk({ Ikon, warna, children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: warna.fg }}>
        <Ikon size={17} className="text-white" />
      </div>
      <h2 className="font-bold text-base text-ink">{children}</h2>
    </div>
  )
}

// Seksyen dgn scroll-reveal fade-in - setiap kad "muncul" halus bila
// pengunjung scroll sampai, bukan terus statik sedia ada macam laporan PDF.
function Seksyen({ id, warna, className = '', children }) {
  const [ref, kelihatan] = useInView()
  return (
    <section
      id={id}
      ref={ref}
      // scroll-mt-32 - elak tajuk seksyen tersorok di bawah navbar+sub-nav
      // melekit bila pengunjung klik pautan anchor.
      className={`scroll-mt-32 bg-surface border border-border rounded-card shadow-soft p-5 sm:p-6 border-t-4 transition-all duration-700 ${kelihatan ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
      style={{ borderTopColor: warna.fg }}
    >
      {children}
    </section>
  )
}

const SUB_NAV = [
  { id: 'sejarah', label: 'Sejarah', Ikon: BookOpen },
  { id: 'lokasi', label: 'Lokasi', Ikon: MapPin },
  { id: 'pelan', label: 'Pelan', Ikon: Map },
  { id: 'lencana', label: 'Lencana', Ikon: Award },
  { id: 'lagu', label: 'Lagu Sekolah', Ikon: Music },
  { id: 'wawasan', label: 'Visi & Misi', Ikon: Target },
  { id: 'falsafah', label: 'Falsafah', Ikon: Compass },
  { id: 'objektif', label: 'Objektif', Ikon: CheckSquare },
]

export default function ProfilSekolah() {
  const { data, loading } = useProfilSekolahAwam()

  if (loading) {
    return (
      <main className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-16">
        <p className="text-sm text-inkmuted text-center">Memuatkan…</p>
      </main>
    )
  }

  const embedVideo = keYoutubeEmbed(data.laguVideoUrl)
  const adaPelan = Boolean(data.pelanKawasanUrl || data.pelanKecemasanUrl)
  const adaLencana = Boolean(data.lencanaUrl || data.peneranganLencana.length > 0)
  const adaLagu = Boolean(data.laguJudul || data.laguLirik || embedVideo)
  const adaWawasan = Boolean(data.misiKPM || data.visiKPM || data.visiKhas || data.misiKhas)
  const adaFalsafah = Boolean(data.falsafahKebangsaan || data.falsafahIslam || data.falsafahKhas)
  const adaObjektif = Boolean(data.objektifKhas.length > 0 || data.objektifSekolah.length > 0)

  // Seksyen yg TIADA kandungan langsung TERUS disorok drpd paparan awam
  // (dulu: papar kotak "Maklumat akan dikemaskini" bertimpa-timpa bila
  // admin belum isi apa-apa - kesan pertama laman rasmi jadi nampak
  // "rosak"/separuh siap). Sub-nav pun ikut sorok pautan yg tiada seksyen.
  const adaLokasi = Boolean(data.lokasiMapEmbedUrl || data.alamatBertulis)
  const navAktif = SUB_NAV.filter((n) => ({
    sejarah: Boolean(data.sejarahPenubuhan),
    lokasi: adaLokasi,
    pelan: adaPelan,
    lencana: adaLencana,
    lagu: adaLagu,
    wawasan: adaWawasan,
    falsafah: adaFalsafah,
    objektif: adaObjektif,
  })[n.id])

  const semuaKosong = navAktif.length === 0

  return (
    <>
      {navAktif.length > 1 && (
        <div className="sticky top-16 z-30 bg-base/95 backdrop-blur border-b border-border">
          <nav className="px-4 sm:px-6 lg:px-10 xl:px-16 py-2.5 flex gap-2 overflow-x-auto">
            {navAktif.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-surface border border-border text-ink hover:bg-white transition-colors shrink-0"
              >
                <n.Ikon size={13} /> {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <main className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-16 space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-ink text-center">Profil Sekolah</h1>

        {semuaKosong && (
          <div className="bg-surface border border-border rounded-card shadow-soft p-8 sm:p-12 text-center">
            <p className="text-inkmuted text-sm">Halaman ini kosong buat masa ini — kandungan akan ditambah kemudian.</p>
          </div>
        )}

        {data.sejarahPenubuhan && (
          <Seksyen id="sejarah" warna={warnaCeria(0)}>
            <Tajuk Ikon={BookOpen} warna={warnaCeria(0)}>Sejarah Penubuhan</Tajuk>
            <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{data.sejarahPenubuhan}</p>
          </Seksyen>
        )}

        {adaLokasi && (
          <Seksyen id="lokasi" warna={warnaCeria(3)}>
            <Tajuk Ikon={MapPin} warna={warnaCeria(3)}>Lokasi Sekolah</Tajuk>
            {data.alamatBertulis && (
              <p className="text-sm text-ink whitespace-pre-line leading-relaxed mb-4">{data.alamatBertulis}</p>
            )}
            {data.lokasiMapEmbedUrl && (
              <div className="rounded-card overflow-hidden border border-border">
                <iframe
                  src={data.lokasiMapEmbedUrl}
                  title="Lokasi Sekolah"
                  className="w-full h-64 sm:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </Seksyen>
        )}

        {adaPelan && (
          <Seksyen id="pelan" warna={warnaCeria(6)}>
            <Tajuk Ikon={Map} warna={warnaCeria(6)}>Pelan Kawasan &amp; Laluan Kecemasan</Tajuk>
            <div className={`grid gap-4 ${data.pelanKawasanUrl && data.pelanKecemasanUrl ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {data.pelanKawasanUrl && (
                <div>
                  <p className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide mb-2">Pelan Kawasan Sekolah</p>
                  <img src={data.pelanKawasanUrl} alt="Pelan Kawasan Sekolah" className="w-full rounded-card border border-border" />
                </div>
              )}
              {data.pelanKecemasanUrl && (
                <div>
                  <p className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide mb-2">Pelan Laluan Kecemasan Sekolah</p>
                  <img src={data.pelanKecemasanUrl} alt="Pelan Laluan Kecemasan Sekolah" className="w-full rounded-card border border-border" />
                </div>
              )}
            </div>
          </Seksyen>
        )}

        {adaLencana && (
          <Seksyen id="lencana" warna={warnaCeria(4)}>
            <Tajuk Ikon={Award} warna={warnaCeria(4)}>Lencana Sekolah</Tajuk>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {data.lencanaUrl && (
                // items-center+justify-center (bukan cuma text-center) - lencana ni
                // SAIZ TETAP (h-40), TAK membesar walau jadual sebelah jadi tinggi
                // bila baris Penerangan Lencana bertambah banyak. Tanpa ni, lencana
                // "tersadai" di atas dgn ruang kosong besar di bawah bila jadual
                // panjang; dgn ni ia kekal ditengah menegak dlm ruang selnya.
                <div className="text-center flex flex-col items-center justify-center h-full">
                  <img src={data.lencanaUrl} alt="Lencana Sekolah" className="h-40 mx-auto object-contain mb-3" />
                  {data.penciptaLencana && (
                    <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: warnaCeria(4).bg, color: warnaCeria(4).fg }}>
                      Pereka / Pencipta: {data.penciptaLencana}
                    </span>
                  )}
                </div>
              )}
              {data.peneranganLencana.length > 0 && (
                <table className="w-full text-xs sm:text-sm h-fit">
                  <tbody>
                    {data.peneranganLencana.map((baris, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="py-1.5 pr-3 font-semibold text-ink align-top whitespace-nowrap">{baris.label}</td>
                        <td className="py-1.5 text-inkmuted">{baris.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Seksyen>
        )}

        {adaLagu && (
          <Seksyen id="lagu" warna={warnaCeria(5)}>
            <Tajuk Ikon={Music} warna={warnaCeria(5)}>Lagu Sekolah{data.laguJudul ? ` — ${data.laguJudul}` : ''}</Tajuk>
            {data.laguLirik && (
              <div className="rounded-card border border-border p-4 mb-4 text-center text-sm text-ink whitespace-pre-line" style={{ backgroundColor: warnaCeria(5).bg }}>
                {data.laguLirik}
              </div>
            )}
            {embedVideo && (
              <div className="rounded-card overflow-hidden border border-border aspect-video">
                <iframe src={embedVideo} title="Lagu Sekolah" className="w-full h-full" allowFullScreen loading="lazy" />
              </div>
            )}
          </Seksyen>
        )}

        {adaWawasan && (
          <Seksyen id="wawasan" warna={warnaCeria(2)}>
            <Tajuk Ikon={Target} warna={warnaCeria(2)}>Visi &amp; Misi</Tajuk>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.visiKPM && (
                <div className="rounded-card p-4" style={{ backgroundColor: warnaCeria(2).bg }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: warnaCeria(2).fg }}>Visi KPM</p>
                  <p className="text-sm text-ink font-semibold">"{data.visiKPM}"</p>
                </div>
              )}
              {data.misiKPM && (
                <div className="rounded-card p-4" style={{ backgroundColor: warnaCeria(2).bg }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: warnaCeria(2).fg }}>Misi KPM</p>
                  <p className="text-sm text-ink italic">"{data.misiKPM}"</p>
                </div>
              )}
              {data.visiKhas && (
                <div className="rounded-card p-4 border border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-inkmuted">Visi Pendidikan Khas</p>
                  <p className="text-sm text-ink">{data.visiKhas}</p>
                </div>
              )}
              {data.misiKhas && (
                <div className="rounded-card p-4 border border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-inkmuted">Misi Pendidikan Khas</p>
                  <p className="text-sm text-ink">{data.misiKhas}</p>
                </div>
              )}
            </div>
          </Seksyen>
        )}

        {adaFalsafah && (
          <Seksyen id="falsafah" warna={warnaCeria(7)}>
            <Tajuk Ikon={Compass} warna={warnaCeria(7)}>Falsafah Pendidikan</Tajuk>
            <div className="space-y-3">
              {data.falsafahKebangsaan && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-inkmuted">Falsafah Pendidikan Kebangsaan</p>
                  <p className="text-sm text-ink leading-relaxed">{data.falsafahKebangsaan}</p>
                </div>
              )}
              {data.falsafahIslam && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-inkmuted">Falsafah Pendidikan Islam</p>
                  <p className="text-sm text-ink leading-relaxed">{data.falsafahIslam}</p>
                </div>
              )}
              {data.falsafahKhas && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-inkmuted">Falsafah Pendidikan Khas</p>
                  <p className="text-sm text-ink leading-relaxed">{data.falsafahKhas}</p>
                </div>
              )}
            </div>
          </Seksyen>
        )}

        {adaObjektif && (
          <Seksyen id="objektif" warna={warnaCeria(1)}>
            <Tajuk Ikon={CheckSquare} warna={warnaCeria(1)}>Objektif</Tajuk>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {data.objektifKhas.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-inkmuted">Objektif Pendidikan Khas</p>
                  <ul className="space-y-2">
                    {data.objektifKhas.map((butir, i) => (
                      <li key={i} className="text-sm text-ink flex gap-2"><span>❖</span><span>{butir}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {data.objektifSekolah.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-inkmuted">Objektif Sekolah</p>
                  <ul className="space-y-2">
                    {data.objektifSekolah.map((butir, i) => (
                      <li key={i} className="text-sm text-ink flex gap-2"><span>☐</span><span>{butir}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Seksyen>
        )}
      </main>
    </>
  )
}
