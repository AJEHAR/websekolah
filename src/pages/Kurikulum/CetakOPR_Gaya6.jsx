import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { gayaKotak, SenaraiPeluru, Kotak, KepalaStandard, BarisChip, GambarSlotHeksagon, BlokTandatangan } from './oprCetakBersama.jsx'

// Gaya 6 - "Bingkai Heksagon". 4 gambar dalam bingkai heksagon (bukan
// petak) - konsep "kad sampul" (gambar jadi latar Nama Program) versi
// awal DIBUANG atas permintaan pengguna, struktur baki SAMA Gaya 1 yang
// terbukti selamat. PENTING: clip-path (heksagon) CSS lebih baharu -
// perlu diuji terus di Chrome sebenar, alat pembangunan saya tak dapat
// sahkan sepenuhnya.
export default function CetakOPR_Gaya6({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)
  const unit = rekod.unit || 'PROGRAM'
  const teksSub1 = subHeader1 ? subHeader1.replace(/\{Unit\}/gi, unit) : ''
  const teksSub2 = subHeader2 ? subHeader2.replace(/\{Unit\}/gi, unit) : ''
  const opacity = rekod.kotakOpacity

  return (
    <PrintArea>
      <div
        className="p-8 text-black flex flex-col"
        style={{
          width: '210mm', height: '297mm', overflow: 'hidden',
          backgroundImage: rekod.latarBelakangUrl ? `url(${rekod.latarBelakangUrl})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <KepalaStandard logo={logo} namaSekolah={namaSekolah} teksSub1={teksSub1} teksSub2={teksSub2} seksyen={seksyen} tunjukSeksyenBadge={rekod.tunjukSeksyenBadge} opacity={opacity} namaSekolahLalai={NAMA_SEKOLAH} />
        <BarisChip rekod={rekod} opacity={opacity} />

        <div className="rounded-xl shadow-md p-2.5 text-center mb-2.5 shrink-0 overflow-hidden" style={gayaKotak(opacity)}>
          <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
        </div>

        <div className="flex gap-2 mb-2.5 shrink-0">
          <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
          <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-2.5 mb-2.5" style={{ flex: 3 }}>
            <Kotak label="Objektif Program:" opacity={opacity}><SenaraiPeluru teks={rekod.objektif} /></Kotak>
            <Kotak label="Aktiviti" opacity={opacity}><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
          </div>
          <div className="flex gap-2.5 mb-2.5" style={{ flex: 3 }}>
            <Kotak label="Kekuatan" opacity={opacity}><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
            <Kotak label="Kelemahan" opacity={opacity}><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
          </div>
          <div className="mb-2.5" style={{ flex: 2 }}>
            <Kotak label="Penambahbaikan" flex="1 1 100%" opacity={opacity}><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
          </div>

          {/* 4 gambar bingkai heksagon - lebar sama rata (flex-1),
              nisbah 1:1 auto-kira tinggi dari lebar (elak melimpah). */}
          <div className="flex items-center justify-center gap-3 mb-3" style={{ flex: 4 }}>
            {(gambarDiisi.length > 0 ? gambarDiisi : [null, null, null, null]).map((g, i) => (
              <GambarSlotHeksagon key={i} src={g ? (g.url ?? g) : null} posisi={g?.posisi} opacity={opacity} />
            ))}
          </div>

          <BlokTandatangan rekod={rekod} opacity={opacity} />
        </div>
      </div>
    </PrintArea>
  )
}
