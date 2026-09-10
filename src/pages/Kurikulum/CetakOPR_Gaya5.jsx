import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { gayaKotak, SenaraiPeluru, Kotak, KepalaStandard, BarisChip, GambarSlot, BlokTandatangan } from './oprCetakBersama.jsx'

// Gaya 5 - "Filem Menegak". 4 gambar tersusun MENEGAK di lajur kiri
// (lebih besar/dominan dari Gaya 2), kandungan di lajur kanan. TETAP 1
// muka A4 SENTIASA.
export default function CetakOPR_Gaya5({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const gambar = rekod.gambar || []
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

        <div className="flex-1 flex gap-2.5 min-h-0">
          {/* Lajur kiri - filem menegak 4 gambar, LEBIH BESAR/DOMINAN
              berbanding Gaya 2 (nisbah 1:2.6 berbanding Gaya 2 punya
              1:2.7 - gambar dapat bahagian lebih ketara). */}
          <div className="flex flex-col gap-2" style={{ flex: 1 }}>
            {(gambar.length > 0 ? gambar : [null, null, null, null]).map((g, i) => (
              <GambarSlot key={i} src={g ? (g.url ?? g) : null} posisi={g?.posisi} opacity={opacity} />
            ))}
          </div>

          <div className="flex flex-col min-h-0" style={{ flex: 2.6 }}>
            <div className="rounded-xl shadow-md p-2.5 text-center mb-2 shrink-0 overflow-hidden" style={gayaKotak(opacity)}>
              <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
            </div>
            <div className="flex gap-2 mb-2 shrink-0">
              <div className="flex-1 rounded-xl shadow-md p-2 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
              <div className="flex-1 rounded-xl shadow-md p-2 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
            </div>
            <div className="flex-1 flex flex-col gap-2 min-h-0">
              <Kotak label="Objektif Program:" opacity={opacity}><SenaraiPeluru teks={rekod.objektif} /></Kotak>
              <Kotak label="Aktiviti" opacity={opacity}><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
              <Kotak label="Kekuatan" opacity={opacity}><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
              <Kotak label="Kelemahan" opacity={opacity}><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
              <Kotak label="Penambahbaikan" opacity={opacity}><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
            </div>
            <div className="mt-2 shrink-0">
              <BlokTandatangan rekod={rekod} opacity={opacity} />
            </div>
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
