import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { gayaKotak, SenaraiPeluru, Kotak, KepalaStandard, BarisChip, GambarSlot, BlokTandatangan } from './oprCetakBersama.jsx'

// Gaya 3 - "Mozek Gambar". Kolaj gambar (1 besar + 2 kecil) di atas
// sebelum kandungan, kandungan disusun satu lajur penuh (lebih rasmi/
// tenang berbanding Gaya 1/2). TETAP 1 muka A4 SENTIASA.
export default function CetakOPR_Gaya3({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
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

        {/* Kolaj mozek - gambar 1 (besar, kiri) + gambar 2/3/4 (kecil,
            kanan, bertindan menegak) - SEMUA 4 gambar digunakan. Guna
            FLEXBOX (bukan CSS Grid row-span) - teknik terbukti stabil
            sepanjang sistem ni, elak risiko keserasian enjin cetak. */}
        <div className="flex gap-2 mb-2.5 shrink-0" style={{ height: '68mm' }}>
          <GambarSlot src={gambar[0]?.url ?? gambar[0]} posisi={gambar[0]?.posisi} opacity={opacity} className="" gayaLuar={{ flex: 1.6 }} />
          <div className="flex flex-col gap-2" style={{ flex: 1 }}>
            <GambarSlot src={gambar[1]?.url ?? gambar[1]} posisi={gambar[1]?.posisi} opacity={opacity} />
            <GambarSlot src={gambar[2]?.url ?? gambar[2]} posisi={gambar[2]?.posisi} opacity={opacity} />
            <GambarSlot src={gambar[3]?.url ?? gambar[3]} posisi={gambar[3]?.posisi} opacity={opacity} />
          </div>
        </div>

        <BarisChip rekod={rekod} opacity={opacity} />

        <div className="flex-1 flex flex-col min-h-0 gap-1.5">
          <div className="rounded-xl shadow-md px-3 py-1.5 overflow-hidden shrink-0" style={gayaKotak(opacity)}>
            <p className="text-xs font-bold text-black text-center">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="flex-1 rounded-xl shadow-md px-3 py-1.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
            <div className="flex-1 rounded-xl shadow-md px-3 py-1.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
          </div>
          <Kotak label="Objektif Program:" opacity={opacity}><SenaraiPeluru teks={rekod.objektif} /></Kotak>
          <Kotak label="Aktiviti" opacity={opacity}><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
          <Kotak label="Kekuatan" opacity={opacity}><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
          <Kotak label="Kelemahan" opacity={opacity}><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
          <Kotak label="Penambahbaikan" opacity={opacity}><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
        </div>

        <div className="mt-1.5 shrink-0">
          <BlokTandatangan rekod={rekod} opacity={opacity} />
        </div>
      </div>
    </PrintArea>
  )
}
