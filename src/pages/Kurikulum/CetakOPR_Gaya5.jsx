import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import {
  KepalaStandard, BarisChip, GambarSlot, BlokTandatangan,
  KotakPerenggan, BarisTempatSasaran, KotakNamaProgram, slotGambar, teksSubTajuk, HalamanA4,
} from './oprCetakBersama.jsx'

// Templat 4 - "Filem Menegak" (id 'gaya5', format baharu). 4 gambar tersusun
// MENEGAK di lajur kiri, kandungan (Nama Program, Tempat/Sasaran,
// Laporan Ringkas, Penutup, Tandatangan) di lajur kanan. TETAP 1 muka A4.
export default function CetakOPR_Gaya5({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const opacity = rekod.kotakOpacity

  return (
    <PrintArea>
      <HalamanA4 rekod={rekod}>
        <KepalaStandard logo={logo} namaSekolah={namaSekolah} teksSub1={teksSubTajuk(subHeader1, rekod)} teksSub2={teksSubTajuk(subHeader2, rekod)} seksyen={seksyen} tunjukSeksyenBadge={rekod.tunjukSeksyenBadge} opacity={opacity} namaSekolahLalai={NAMA_SEKOLAH} />
        <BarisChip rekod={rekod} opacity={opacity} />

        <div className="flex-1 flex gap-2.5 min-h-0">
          <div className="flex flex-col gap-2 min-h-0" style={{ flex: 1.1 }}>
            {slotGambar(rekod).map((g, i) => (
              <GambarSlot key={i} src={g ? (g.url ?? g) : null} posisi={g?.posisi} opacity={opacity} />
            ))}
          </div>

          <div className="flex flex-col min-h-0" style={{ flex: 2 }}>
            <KotakNamaProgram rekod={rekod} opacity={opacity} className="mb-2" />
            <BarisTempatSasaran rekod={rekod} opacity={opacity} labelSasaran="Sasaran" className="mb-3" />
            <KotakPerenggan label="Laporan Ringkas" teks={rekod.laporanRingkas} opacity={opacity} className="flex-1 min-h-0 mb-3" saizTeks="text-[13.5px] leading-[1.85]" tengahMenegak />
            <KotakPerenggan label="Penutup" teks={rekod.penutup} opacity={opacity} className="shrink-0" saizTeks="text-[12px] leading-relaxed" />
            <div className="mt-2.5 shrink-0">
              <BlokTandatangan rekod={rekod} opacity={opacity} />
            </div>
          </div>
        </div>
      </HalamanA4>
    </PrintArea>
  )
}
