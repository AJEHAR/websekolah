import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import { gayaKotak, SenaraiPeluru, Kotak, KepalaStandard, BarisChip, GambarSlot, BlokTandatangan } from './oprCetakBersama.jsx'

// Gaya 6 - "Kad Sampul". Gambar PERTAMA jadi LATAR kotak Nama Program
// (bukan kotak putih polos) - lapisan legap sama (kawalan opacity staff)
// letak ATAS gambar supaya teks kekal jelas dibaca. TAK PERLUKAN RUANG
// TAMBAHAN (guna semula ruang kotak Nama Program sedia ada) - jadi risiko
// limpah/hilang tandatangan HAMPIR SIFAR (struktur baki SAMA Gaya 1).
// Gambar 2/3/4 kekal jalur biasa di bawah kandungan.
export default function CetakOPR_Gaya6({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const gambar = rekod.gambar || []
  const gambarLain = gambar.slice(1).filter(Boolean)
  const unit = rekod.unit || 'PROGRAM'
  const teksSub1 = subHeader1 ? subHeader1.replace(/\{Unit\}/gi, unit) : ''
  const teksSub2 = subHeader2 ? subHeader2.replace(/\{Unit\}/gi, unit) : ''
  const opacity = rekod.kotakOpacity
  const gambarSampul = gambar[0]?.url ?? gambar[0]

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

        {/* Kad sampul - gambar[0] jadi latar, lapisan opacity ATAS untuk
            teks kekal terbaca (guna semula ruang sedia ada, bukan ruang
            baharu). */}
        <div className="relative rounded-xl shadow-md text-center mb-2.5 shrink-0 overflow-hidden" style={{ minHeight: '18mm' }}>
          {gambarSampul && <img src={gambarSampul} alt="" className="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-cover" />}
          <div className="absolute top-0 left-0 right-0 bottom-0" style={gayaKotak(opacity)} />
          <p className="relative text-xs font-bold text-black p-3 flex items-center justify-center h-full" style={{ minHeight: '18mm' }}>Nama Program: <span className="font-normal ml-1">{rekod.nama}</span></p>
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

          {/* Gambar 2/3/4 (gambar 1 dah jadi sampul di atas). */}
          <div className="flex gap-2 mb-3" style={{ flex: 4 }}>
            {(gambarLain.length > 0 ? gambarLain : [null, null, null]).map((g, i) => (
              <GambarSlot key={i} src={g ? (g.url ?? g) : null} posisi={g?.posisi} opacity={opacity} className="flex-1" />
            ))}
          </div>

          <BlokTandatangan rekod={rekod} opacity={opacity} />
        </div>
      </div>
    </PrintArea>
  )
}
