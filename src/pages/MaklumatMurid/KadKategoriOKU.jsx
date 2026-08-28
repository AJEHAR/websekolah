import { Puzzle, Ear, Eye, Brain, HeartHandshake, Accessibility, MessageCircleHeart, Sparkles } from 'lucide-react'
import { warnaCeria } from './paletCeria.js'

// Ikon dikitar ikut kategori (bukan pemetaan nama tetap - kategori
// ketidakupayaan sekolah PPKI/Pendidikan Khas berbeza-beza istilah/
// singkatan, jadi ikon generik cukup untuk beri identiti visual tanpa
// perlu senarai tetap yang mungkin tak sepadan istilah sekolah lain).
const IKON_KITAR = [Puzzle, Brain, Ear, Eye, Accessibility, HeartHandshake, MessageCircleHeart, Sparkles]

export function BarisKecil({ tajuk, data, warna }) {
  if (data.length === 0) return null
  const jumlahSemua = data.reduce((j, d) => j + d.jumlah, 0)
  return (
    <div className="mb-3 last:mb-0">
      <h5 className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide mb-1.5">{tajuk}</h5>
      <div className="flex flex-wrap gap-1.5">
        {data.map((d) => {
          const peratus = jumlahSemua > 0 ? Math.round((d.jumlah / jumlahSemua) * 100) : 0
          return (
            <span
              key={d.label}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: warna?.bg ?? '#F1EFE8', color: warna?.fg ?? '#5F5E5A' }}
            >
              {d.label}: <strong>{d.jumlah}</strong> ({peratus}%)
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function KadKategoriOKU({ kategori, jumlah, jantina, kaum, agama, subkategori, indeks = 0 }) {
  const w = warnaCeria(indeks)
  const Ikon = IKON_KITAR[indeks % IKON_KITAR.length]
  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-3 p-4" style={{ backgroundColor: w.bg }}>
        <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: w.fg }}>
          <Ikon size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-ink truncate">{kategori}</h4>
          <p className="text-xs" style={{ color: w.fg }}>{jumlah} murid</p>
        </div>
      </div>
      <div className="p-4">
        <BarisKecil tajuk="Jantina" data={jantina} warna={w} />
        <BarisKecil tajuk="Kaum" data={kaum} warna={w} />
        <BarisKecil tajuk="Agama" data={agama} warna={w} />
        <BarisKecil tajuk="Subkategori" data={subkategori} warna={w} />
      </div>
    </div>
  )
}
