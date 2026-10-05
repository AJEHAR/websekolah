import CetakOPR_Gaya1 from './CetakOPR_Gaya1.jsx'
import CetakOPR_Gaya2 from './CetakOPR_Gaya2.jsx'
import CetakOPR_Gaya3 from './CetakOPR_Gaya3.jsx'
import CetakOPR_Gaya4 from './CetakOPR_Gaya4.jsx'
import CetakOPR_Gaya5 from './CetakOPR_Gaya5.jsx'
import CetakOPR_Gaya6 from './CetakOPR_Gaya6.jsx'
import CetakOPRLama_Gaya1 from './oprLama/CetakOPRLama_Gaya1.jsx'
import CetakOPRLama_Gaya2 from './oprLama/CetakOPRLama_Gaya2.jsx'
import CetakOPRLama_Gaya3 from './oprLama/CetakOPRLama_Gaya3.jsx'
import CetakOPRLama_Gaya4 from './oprLama/CetakOPRLama_Gaya4.jsx'
import CetakOPRLama_Gaya5 from './oprLama/CetakOPRLama_Gaya5.jsx'
import CetakOPRLama_Gaya6 from './oprLama/CetakOPRLama_Gaya6.jsx'
import { adalahRekodOprLama } from './oprCetakBersama.jsx'

// Router antara templat cetakan OPR - rekod.layoutCetak simpan pilihan
// staff (ditetapkan dalam OPRForm.jsx). Rekod tanpa medan ni - lalai ke
// 'gaya1'. NOTA: ID dalaman ('gaya1'..'gaya6') KEKAL SAMA walaupun label
// dipaparkan kepada staff ialah "Templat 1..6".
//
// DUA SET templat:
// - GAYA (format baharu): Laporan Ringkas + 4 gambar + Penutup.
// - GAYA_LAMA (folder oprLama/): Objektif/Aktiviti/Kekuatan/Kelemahan/
//   Penambahbaikan - HANYA untuk rekod lama yang belum diisi Laporan
//   Ringkas (adalahRekodOprLama). Pilihan templat (gaya1..6) sama dipakai
//   untuk kedua-dua set.
const GAYA = {
  gaya1: CetakOPR_Gaya1,
  gaya2: CetakOPR_Gaya2,
  gaya3: CetakOPR_Gaya3,
  gaya4: CetakOPR_Gaya4,
  gaya5: CetakOPR_Gaya5,
  gaya6: CetakOPR_Gaya6,
}

const GAYA_LAMA = {
  gaya1: CetakOPRLama_Gaya1,
  gaya2: CetakOPRLama_Gaya2,
  gaya3: CetakOPRLama_Gaya3,
  gaya4: CetakOPRLama_Gaya4,
  gaya5: CetakOPRLama_Gaya5,
  gaya6: CetakOPRLama_Gaya6,
}

export default function CetakOPR({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const set = adalahRekodOprLama(rekod) ? GAYA_LAMA : GAYA
  const Komponen = set[rekod.layoutCetak] ?? set.gaya1
  return <Komponen rekod={rekod} logo={logo} namaSekolah={namaSekolah} subHeader1={subHeader1} subHeader2={subHeader2} seksyen={seksyen} />
}
