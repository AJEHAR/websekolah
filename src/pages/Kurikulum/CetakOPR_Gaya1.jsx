import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import {
  KepalaStandard, BarisChip, GambarSlot, BlokTandatangan,
  KotakPerenggan, BarisTempatSasaran, KotakNamaProgram, slotGambar, teksSubTajuk, HalamanA4,
} from './oprCetakBersama.jsx'

// Templat 1 - "Kotak Ringkas" (format baharu). Susunan menegak ikut
// contoh OPR rujukan: Kepala > Nama Program > Hari/Tarikh/Masa >
// Tempat/Sasaran > LAPORAN RINGKAS > 4 gambar (grid 2x2, guna ruang
// lebihan) > PENUTUP > Tandatangan. TETAP 1 muka A4.
export default function CetakOPR_Gaya1({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const opacity = rekod.kotakOpacity

  return (
    <PrintArea>
      <HalamanA4 rekod={rekod}>
        <KepalaStandard logo={logo} namaSekolah={namaSekolah} teksSub1={teksSubTajuk(subHeader1, rekod)} teksSub2={teksSubTajuk(subHeader2, rekod)} seksyen={seksyen} tunjukSeksyenBadge={rekod.tunjukSeksyenBadge} opacity={opacity} namaSekolahLalai={NAMA_SEKOLAH} />
        <KotakNamaProgram rekod={rekod} opacity={opacity} />
        <BarisChip rekod={rekod} opacity={opacity} />
        <BarisTempatSasaran rekod={rekod} opacity={opacity} />

        <KotakPerenggan label="Laporan Ringkas" teks={rekod.laporanRingkas} opacity={opacity} className="shrink-0 mb-2.5" />

        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2 mb-2.5">
          {slotGambar(rekod).map((g, i) => (
            <GambarSlot key={i} src={g ? (g.url ?? g) : null} posisi={g?.posisi} opacity={opacity} className="min-h-0" />
          ))}
        </div>

        <KotakPerenggan label="Penutup" teks={rekod.penutup} opacity={opacity} className="shrink-0 mb-2.5" />
        <BlokTandatangan rekod={rekod} opacity={opacity} />
      </HalamanA4>
    </PrintArea>
  )
}
