import CetakOPR_Gaya1 from './CetakOPR_Gaya1.jsx'
import CetakOPR_Gaya2 from './CetakOPR_Gaya2.jsx'

// Router ringkas antara gaya cetakan OPR - rekod.layoutCetak simpan
// pilihan staff (ditetapkan dalam OPRForm.jsx). Rekod LAMA (sebelum ciri
// pilih gaya ni wujud) tiada medan ni langsung - lalai ke 'gaya1' supaya
// laporan sedia ada tetap cetak macam biasa, tak berubah tiba-tiba.
export default function CetakOPR({ rekod, logo }) {
  if (rekod.layoutCetak === 'gaya2') return <CetakOPR_Gaya2 rekod={rekod} logo={logo} />
  return <CetakOPR_Gaya1 rekod={rekod} logo={logo} />
}
