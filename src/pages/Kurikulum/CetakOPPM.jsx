import PrintArea from '../../components/cetak/PrintArea.jsx'
import { useOprLogo } from '../../hooks/useOprLogo.js'
import { janaJulatBulan } from './oppmConstants.js'

function simbolStatus(status) {
  if (status === 'siap') return '⚫'
  if (status === 'jalan') return '⚪'
  return ''
}

// Rajah "kompas" OPPM - bentuk X klasik (Objektif kiri, Tugasan Utama /
// Aktiviti atas, Tarikh Sasaran kanan, Kos bawah). PENTING: ini hiasan/
// label sahaja (tak bawa data baru - cuma jelaskan makna 4 kumpulan lajur
// dalam grid utama), bukan input berasingan.
function RajahKompas() {
  return (
    <svg width="230" height="170" viewBox="0 0 230 170" className="shrink-0">
      <rect x="1" y="1" width="228" height="168" fill="none" stroke="black" strokeWidth="1" />
      <line x1="1" y1="1" x2="229" y2="169" stroke="black" strokeWidth="1" />
      <line x1="229" y1="1" x2="1" y2="169" stroke="black" strokeWidth="1" />
      <text x="115" y="20" textAnchor="middle" fontSize="9" fontWeight="bold">Tugasan Utama /</text>
      <text x="115" y="31" textAnchor="middle" fontSize="9" fontWeight="bold">Aktiviti</text>
      <text x="185" y="88" textAnchor="middle" fontSize="9" fontWeight="bold">Tarikh</text>
      <text x="185" y="99" textAnchor="middle" fontSize="9" fontWeight="bold">Sasaran</text>
      <text x="115" y="140" textAnchor="middle" fontSize="9" fontWeight="bold">Kos</text>
      <text x="115" y="158" textAnchor="middle" fontSize="8" fontWeight="bold">Ringkasan &amp; Ramalan</text>
      <text x="45" y="88" textAnchor="middle" fontSize="9" fontWeight="bold">Objektif</text>
    </svg>
  )
}

// Carta bar Anggaran vs Belanjaan - satu baris setiap sumber dana, dua bar
// (oren=Anggaran, merah=Belanjaan) berskala kepada nilai TERBESAR dalam
// senarai supaya semua bar setanding.
function CartaBelanjawan({ belanjawan }) {
  if (!belanjawan || belanjawan.length === 0) return null
  const nilaiMaks = Math.max(...belanjawan.flatMap((b) => [Number(b.anggaran) || 0, Number(b.belanja) || 0]), 1)
  const lebarMaks = 160

  return (
    <div className="shrink-0" style={{ width: lebarMaks + 70 }}>
      <div className="flex items-center gap-2 mb-1 text-[9px]">
        <span className="inline-block w-2.5 h-2.5" style={{ backgroundColor: '#F5A623' }} /> ANGGARAN
        <span className="inline-block w-2.5 h-2.5 ml-2" style={{ backgroundColor: '#D0021B' }} /> BELANJAAN
      </div>
      {belanjawan.map((b, i) => {
        const wAnggaran = (Number(b.anggaran) || 0) / nilaiMaks * lebarMaks
        const wBelanja = (Number(b.belanja) || 0) / nilaiMaks * lebarMaks
        return (
          <div key={i} className="flex items-center gap-1 mb-1.5">
            <span className="text-[9px] w-8 shrink-0">{b.sumber}</span>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <div style={{ width: wAnggaran, backgroundColor: '#F5A623', height: 7 }} />
                <span className="text-[8px]">{b.anggaran}</span>
              </div>
              <div className="flex items-center gap-1">
                <div style={{ width: wBelanja, backgroundColor: '#D0021B', height: 7 }} />
                <span className="text-[8px]">{b.belanja}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// PENTING: templat Excel RUJUKAN TIADA warna latar langsung di mana-mana
// (saya sahkan fill.patternType = None pada setiap sel kepala/label/
// Belanjawan) - cuma teks BOLD + garisan hitam, polos sepenuhnya. Jadi
// TIADA warna latar di sini pun - sengaja, bukan tertinggal.

// Cetak OPPM - LANDSKAP A4, replika STRUKTUR TEPAT templat Excel rujukan
// (bukan reka bentuk saya sendiri) - beza PENTING berbanding jadual biasa:
// label lajur (nama bulan/objektif/tanggungjawab) diletak SATU BARIS DI
// BAWAH grid, sejajar terus dengan lajur masing-masing - BUKAN sebagai
// tajuk atas macam jadual biasa. Baris atas cuma label KUMPULAN
// ("Objektif"/"Tugasan Utama / Aktiviti"/"Status / Pencapaian
// Projek"/"Tanggungjawab") merentasi berbilang lajur, sel individu kosong
// (tiada teks) sehingga baris label di bawah. Logo - guna SEMULA tetapan
// logo OPR seksyen "kurikulum" (useOprLogo) - elak bina sistem logo
// berasingan untuk OPPM, kedua-duanya bawah KURI.
export default function CetakOPPM({ data }) {
  const { logo } = useOprLogo('kurikulum')
  const objektifAktif = (data.objektif ?? []).map((teks, i) => ({ teks, i })).filter((o) => o.teks?.trim())
  const senaraiBulan = janaJulatBulan(data.bulanMula, data.bulanAkhir)
  const semuaNama = [...new Set((data.tugasan ?? []).flatMap((t) => (t.tanggungjawab ?? []).map((tj) => tj.nama).filter(Boolean)))]
  const tugasan = data.tugasan ?? []
  const jumlahLajurObjektif = Math.max(objektifAktif.length, 1)

  function tahapUntuk(t, nama) {
    return t.tanggungjawab?.find((tj) => tj.nama === nama)?.tahap ?? ''
  }

  return (
    <PrintArea>
      <div className="cetak-landskap text-black p-6" style={{ width: '297mm', minHeight: '210mm' }}>
        <div className="text-center mb-3">
          <p className="text-lg font-extrabold uppercase">OPPM {data.namaProjek} SESI {data.tahunSesi}</p>
        </div>

        <div className="flex gap-3 mb-3">
          {logo?.[0] && <img src={logo[0]} alt="" className="h-16 w-16 object-contain shrink-0" />}
          <div className="flex-1">
            <div className="flex gap-8 text-xs mb-1">
              <p><strong>Ketua:</strong> {data.ketua || '-'}</p>
              <p><strong>Nama Panitia/Projek:</strong> {data.namaProjek || '-'}</p>
            </div>
            <div className="flex gap-8 text-xs mb-1">
              <p className="flex-1"><strong>Objektif Projek:</strong> {data.objektifProjek || '-'}</p>
              <p><strong>Tahun:</strong> {data.tahunSesi}</p>
            </div>
            <p className="text-xs"><strong>Tempoh:</strong> {senaraiBulan[0]} hingga {senaraiBulan[senaraiBulan.length - 1]}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-[9px] mb-0">
          <thead>
            <tr>
              <th colSpan={jumlahLajurObjektif} className="border border-black p-1">Objektif</th>
              <th className="border border-black p-1 w-6"></th>
              <th className="border border-black p-1 min-w-[130px]">Tugasan Utama / Aktiviti</th>
              <th colSpan={Math.max(senaraiBulan.length, 1)} className="border border-black p-1">Status / Pencapaian Projek</th>
              <th colSpan={Math.max(semuaNama.length, 1)} className="border border-black p-1">Tanggungjawab</th>
            </tr>
          </thead>
          <tbody>
            {tugasan.length === 0 ? (
              <tr><td colSpan={jumlahLajurObjektif + 2 + Math.max(senaraiBulan.length, 1) + Math.max(semuaNama.length, 1)} className="border border-black p-2 text-center text-inkmuted">Tiada tugasan lagi.</td></tr>
            ) : (
              tugasan.map((t, i) => (
                <tr key={i}>
                  {objektifAktif.length === 0 ? <td className="border border-black" /> : objektifAktif.map((o) => (
                    <td key={o.i} className="border border-black text-center">{t.objektifBerkaitan?.[o.i] ? '⚫' : ''}</td>
                  ))}
                  <td className="border border-black text-center">{i + 1}</td>
                  <td className="border border-black px-1.5 py-0.5">{t.nama}</td>
                  {senaraiBulan.length === 0 ? <td className="border border-black" /> : senaraiBulan.map((b) => (
                    <td key={b} className="border border-black text-center">{simbolStatus(t.statusBulan?.[b])}</td>
                  ))}
                  {semuaNama.length === 0 ? <td className="border border-black" /> : semuaNama.map((n) => (
                    <td key={n} className="border border-black text-center font-semibold">{tahapUntuk(t, n)}</td>
                  ))}
                </tr>
              ))
            )}
            {/* Baris label BAWAH - nama bulan & tanggungjawab sejajar
                lajur (Objektif diputar menegak berasingan di bawah, bukan
                di sini - lihat susunan bawah). */}
            <tr>
              {objektifAktif.length === 0 ? <td className="border border-black" /> : objektifAktif.map((o) => <td key={o.i} className="border border-black" />)}
              <td className="border border-black" />
              <td className="border border-black" />
              {senaraiBulan.length === 0 ? <td className="border border-black" /> : senaraiBulan.map((b) => (
                <td key={b} className="border border-black text-center font-semibold whitespace-nowrap">{b}</td>
              ))}
              {semuaNama.length === 0 ? <td className="border border-black" /> : semuaNama.map((n) => (
                <td key={n} className="border border-black text-center font-semibold whitespace-nowrap">{n}</td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Susunan bawah grid: Objektif diputar menegak | Rajah kompas |
            Petunjuk Pencapaian | Carta Belanjawan - sama kedudukan macam
            templat rujukan (bukan susunan saya sendiri). */}
        <div className="flex items-start border border-t-0 border-black">
          <div className="flex self-stretch border-r border-black">
            {objektifAktif.map((o) => (
              <p key={o.i} className="text-[8px] whitespace-nowrap border-r border-black last:border-r-0 px-1.5 py-2 flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{o.teks}</p>
            ))}
          </div>

          <div className="p-3 border-r border-black shrink-0">
            <RajahKompas />
          </div>

          <div className="flex-1 p-3 text-[9px] self-stretch">
            <p className="font-bold mb-1">Petunjuk Pencapaian</p>
            <ul className="space-y-0.5 list-disc list-inside">
              {(data.petunjukPencapaian ?? []).filter(Boolean).length === 0 ? <li className="list-none text-inkmuted">-</li> : data.petunjukPencapaian.filter(Boolean).map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>

          <div className="p-3 shrink-0">
            <CartaBelanjawan belanjawan={data.belanjawan} />
          </div>
        </div>

        <div className="text-[10px] mt-4">
          <p className="font-bold mb-1">Simbol</p>
          <div className="flex gap-8">
            <p>⚪ Belum Siap &nbsp;&nbsp; ⚫ Siap</p>
            <p>A = Orang Pertama dipertanggungjawabkan &nbsp;&nbsp; B = Orang Kedua dipertanggungjawabkan &nbsp;&nbsp; C = Orang Ketiga dipertanggungjawabkan</p>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
