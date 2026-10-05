import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'
import {
  KepalaStandard, BarisChip, GambarSlotHeksagon, BlokTandatangan,
  KotakPerenggan, BarisTempatSasaran, KotakNamaProgram, slotGambar, teksSubTajuk, HalamanA4,
} from './oprCetakBersama.jsx'

// Templat 5 - "Bingkai Heksagon" (id 'gaya6', format baharu). Susunan
// sama Templat 1, 4 gambar bingkai heksagon (2 baris x 2, baris kedua
// sedikit ke kanan - kesan sarang lebah). PENTING: clip-path perlu diuji
// di Chrome sebenar. TETAP 1 muka A4.
export default function CetakOPR_Gaya6({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
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

        <div className="flex-1 min-h-0 flex flex-col gap-1 mb-2.5">
          {[[g[0], g[1]], [g[2], g[3]]].map((baris, b) => (
            <div key={b} className="flex-1 min-h-0 flex justify-center gap-4" style={{ paddingLeft: b === 1 ? '18%' : 0, paddingRight: b === 0 ? '18%' : 0 }}>
              {baris.map((x, i) => (
                <GambarSlotHeksagon key={i} src={x ? (x.url ?? x) : null} posisi={x?.posisi} opacity={opacity} className="h-full" />
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
