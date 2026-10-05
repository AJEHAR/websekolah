import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import {
  KepalaStandard, BarisChip, GambarSlotBulat, BlokTandatangan,
  KotakPerenggan, BarisTempatSasaran, KotakNamaProgram, slotGambar, teksSubTajuk, HalamanA4,
} from './oprCetakBersama.jsx'

// Templat 3 - "Bingkai Bulat" (id 'gaya4', format baharu). Susunan sama
// Templat 1, tapi 4 gambar dalam bingkai BULAT (2 baris x 2), saiz ikut
// tinggi ruang yang ada. TETAP 1 muka A4.
export default function CetakOPR_Gaya4({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const opacity = rekod.kotakOpacity
  const g = slotGambar(rekod)

  return (
    <PrintArea>
      <HalamanA4 rekod={rekod}>
        <KepalaStandard logo={logo} namaSekolah={namaSekolah} teksSub1={teksSubTajuk(subHeader1, rekod)} teksSub2={teksSubTajuk(subHeader2, rekod)} seksyen={seksyen} tunjukSeksyenBadge={rekod.tunjukSeksyenBadge} opacity={opacity} namaSekolahLalai={NAMA_SEKOLAH} />
        <KotakNamaProgram rekod={rekod} opacity={opacity} />
        <BarisChip rekod={rekod} opacity={opacity} />
        <BarisTempatSasaran rekod={rekod} opacity={opacity} />

        <KotakPerenggan label="Laporan Ringkas" teks={rekod.laporanRingkas} opacity={opacity} className="shrink-0 mb-2.5" />

        <div className="flex-1 min-h-0 flex flex-col gap-2 mb-2.5">
          {[[g[0], g[1]], [g[2], g[3]]].map((baris, b) => (
            <div key={b} className="flex-1 min-h-0 flex justify-center gap-10">
              {baris.map((x, i) => (
                <GambarSlotBulat key={i} src={x ? (x.url ?? x) : null} posisi={x?.posisi} opacity={opacity} className="h-full" />
              ))}
            </div>
          ))}
        </div>

        <KotakPerenggan label="Penutup" teks={rekod.penutup} opacity={opacity} className="shrink-0 mb-2.5" />
        <BlokTandatangan rekod={rekod} opacity={opacity} />
      </HalamanA4>
    </PrintArea>
  )
}
