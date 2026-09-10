import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { gayaKotak, SenaraiPeluru, Kotak, KepalaStandard, BarisChip, GambarSlot, BlokTandatangan } from './oprCetakBersama.jsx'

// Gaya 2 - "Kepala Bersempadan". TETAP 1 muka A4 SENTIASA.
export default function CetakOPR_Gaya2({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)
  const unit = rekod.unit || 'PROGRAM'
  const teksSub1 = subHeader1 ? subHeader1.replace(/\{Unit\}/gi, unit) : ''
  const teksSub2 = subHeader2 ? subHeader2.replace(/\{Unit\}/gi, unit) : ''
  const opacity = rekod.kotakOpacity

  return (
    <PrintArea>
      <div
        className="text-black flex flex-col"
        style={{
          width: '210mm', height: '297mm', overflow: 'hidden',
          backgroundImage: rekod.latarBelakangUrl ? `url(${rekod.latarBelakangUrl})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="p-5 pb-3 shrink-0">
          <KepalaStandard logo={logo} namaSekolah={namaSekolah} teksSub1={teksSub1} teksSub2={teksSub2} seksyen={seksyen} tunjukSeksyenBadge={rekod.tunjukSeksyenBadge} opacity={opacity} namaSekolahLalai={NAMA_SEKOLAH} />
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl shadow-md p-2.5 text-center" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Hari:</p><p className="text-xs font-semibold text-black mt-0.5">{rekod.hari || ''}</p></div>
            <div className="flex-1 rounded-xl shadow-md p-2.5 text-center" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Tarikh:</p><p className="text-xs font-semibold text-black mt-0.5">{rekod.tarikh || ''}</p></div>
            <div className="flex-1 rounded-xl shadow-md p-2.5 text-center" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Masa:</p><p className="text-xs font-semibold text-black mt-0.5">{rekod.masa || ''}</p></div>
          </div>
        </div>

        <div className="p-5 pt-3 flex-1 flex flex-col min-h-0">
          <div className="rounded-xl shadow-md p-2.5 text-center mb-2.5 shrink-0 overflow-hidden" style={gayaKotak(opacity)}>
            <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
          </div>

          <div className="flex gap-2 mb-3 shrink-0">
            <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
            <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
          </div>

          <div className="flex-1 flex gap-3 min-h-0 mb-3">
            <div className="flex flex-col gap-2 min-h-0" style={{ flex: 2 }}>
              <Kotak label="Objektif Program:" opacity={opacity}><SenaraiPeluru teks={rekod.objektif} /></Kotak>
              <Kotak label="Aktiviti" opacity={opacity}><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
              <Kotak label="Kekuatan" opacity={opacity}><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
              <Kotak label="Kelemahan" opacity={opacity}><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
              <Kotak label="Penambahbaikan" opacity={opacity}><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
            </div>
            <div className="flex flex-col gap-2 min-h-0" style={{ flex: 0.75 }}>
              {(gambarDiisi.length > 0 ? gambarDiisi : [null, null, null, null]).map((g, i) => (
                <GambarSlot key={i} src={g ? (g.url ?? g) : null} posisi={g?.posisi} opacity={opacity} />
              ))}
            </div>
          </div>

          <BlokTandatangan rekod={rekod} opacity={opacity} />
        </div>
      </div>
    </PrintArea>
  )
}
