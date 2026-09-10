import CetakOPR_Gaya1 from './CetakOPR_Gaya1.jsx'
import CetakOPR_Gaya2 from './CetakOPR_Gaya2.jsx'
import CetakOPR_Gaya3 from './CetakOPR_Gaya3.jsx'
import CetakOPR_Gaya4 from './CetakOPR_Gaya4.jsx'
import CetakOPR_Gaya5 from './CetakOPR_Gaya5.jsx'

// Router antara gaya cetakan OPR - rekod.layoutCetak simpan pilihan
// staff (ditetapkan dalam OPRForm.jsx). Rekod LAMA (sebelum ciri pilih
// gaya ni wujud) tiada medan ni langsung - lalai ke 'gaya1'.
const GAYA = {
  gaya1: CetakOPR_Gaya1,
  gaya2: CetakOPR_Gaya2,
  gaya3: CetakOPR_Gaya3,
  gaya4: CetakOPR_Gaya4,
  gaya5: CetakOPR_Gaya5,
}

export default function CetakOPR({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const Komponen = GAYA[rekod.layoutCetak] ?? CetakOPR_Gaya1
  return <Komponen rekod={rekod} logo={logo} namaSekolah={namaSekolah} subHeader1={subHeader1} subHeader2={subHeader2} seksyen={seksyen} />
}
