import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { gayaKotak, SenaraiPeluru, Kotak, KepalaStandard, BarisChip, GambarSlot, BlokTandatangan } from './oprCetakBersama.jsx'

// Gaya 4 - "Foto Utama". Gambar PERTAMA jadi hero besar (hampir separuh
// muka surat) terus lepas kepala - fokus utama pada gambar. Gambar 2-4
// jadi jalur kecil bawah kandungan. TETAP 1 muka A4 SENTIASA.
export default function CetakOPR_Gaya4({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
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

        {/* Gambar hero - gambar PERTAMA sahaja, besar. */}
        <GambarSlot src={gambar[0]?.url ?? gambar[0]} posisi={gambar[0]?.posisi} opacity={opacity} className="mb-2.5 shrink-0" gayaLuar={{ height: '72mm' }} />

        <div className="rounded-xl shadow-md p-2.5 text-center mb-2.5 shrink-0 overflow-hidden" style={gayaKotak(opacity)}>
          <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
        </div>

        <div className="flex gap-2 mb-2.5 shrink-0">
          <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
          <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
        </div>

        <BarisChip rekod={rekod} opacity={opacity} />

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

          {/* Gambar 2, 3, 4 - jalur kecil bawah kandungan. */}
          <div className="flex gap-2 mb-3" style={{ flex: 1.6 }}>
            <GambarSlot src={gambar[1]?.url ?? gambar[1]} posisi={gambar[1]?.posisi} opacity={opacity} className="flex-1" />
            <GambarSlot src={gambar[2]?.url ?? gambar[2]} posisi={gambar[2]?.posisi} opacity={opacity} className="flex-1" />
            <GambarSlot src={gambar[3]?.url ?? gambar[3]} posisi={gambar[3]?.posisi} opacity={opacity} className="flex-1" />
          </div>

          <BlokTandatangan rekod={rekod} opacity={opacity} />
        </div>
      </div>
    </PrintArea>
  )
}
