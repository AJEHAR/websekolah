import { useMemo, useState } from 'react'
import { Users, Baby, GraduationCap } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import { adalahPra, kiraIkutMedan, kiraIkutKelas, kiraIkutKategoriOKU } from './statistikMurid.js'
import KadAnalisis from './KadAnalisis.jsx'
import KadKategoriOKU, { BarisKecil } from './KadKategoriOKU.jsx'
import JadualIkutKelas from './JadualIkutKelas.jsx'
import { warnaCeria } from './paletCeria.js'

// Kad statistik besar (hero) - ikon dalam bulatan berwarna + angka besar,
// gaya infografik "sekolah ceria" konsisten dengan Analisis Keberadaan &
// Profil UBKS.
function KadHero({ Ikon, warnaBg, warnaIkon, nilai, label }) {
  return (
    <div className="rounded-card p-4 text-center" style={{ backgroundColor: warnaBg }}>
      <div className="h-11 w-11 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: warnaIkon }}>
        <Ikon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-ink leading-none">{nilai}</p>
      <p className="text-xs text-inkmuted mt-1.5">{label}</p>
    </div>
  )
}

export default function Analisis() {
  const { senarai, loading } = useMuridList()
  const [tab, setTab] = useState('keseluruhan')

  const stat = useMemo(() => {
    const pra = senarai.filter(adalahPra)
    const bukanPra = senarai.filter((m) => !adalahPra(m))
    return {
      jumlah: senarai.length,
      jumlahPra: pra.length,
      jumlahBukanPra: bukanPra.length,
      praJantina: kiraIkutMedan(pra, 'jantina'),
      praKaum: kiraIkutMedan(pra, 'kaum'),
      praAgama: kiraIkutMedan(pra, 'agama'),
      kategoriRingkas: kiraIkutMedan(bukanPra, 'kategoriKetidakupayaan'),
      ikutKelas: kiraIkutMedan(senarai, 'namaKelas'),
      jantinaIkutKelas: kiraIkutKelas(senarai, 'jantina'),
      kaumIkutKelas: kiraIkutKelas(senarai, 'kaum'),
      agamaIkutKelas: kiraIkutKelas(senarai, 'agama'),
      kategoriOKU: kiraIkutKategoriOKU(senarai),
    }
  }, [senarai])

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  return (
    <div>
      <div className="flex gap-2 mb-6 p-1 rounded-full bg-base w-fit overflow-x-auto max-w-full">
        {[
          { kunci: 'keseluruhan', label: 'Keseluruhan' },
          { kunci: 'kelas', label: 'Kelas' },
          { kunci: 'oku', label: 'Kategori Pendidikan Khas' },
        ].map((t) => (
          <button
            key={t.kunci}
            onClick={() => setTab(t.kunci)}
            className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
            style={tab === t.kunci ? { backgroundColor: '#1A1A1A', color: '#fff' } : { color: '#5C5C5C' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'keseluruhan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <KadHero Ikon={Users} warnaBg="#E6F1FB" warnaIkon="#0C6FC9" nilai={stat.jumlah} label="Keseluruhan" />
            <KadHero Ikon={Baby} warnaBg="#FBEAF0" warnaIkon="#C2255C" nilai={stat.jumlahPra} label="Prasekolah" />
            <KadHero Ikon={GraduationCap} warnaBg="#EAF3DE" warnaIkon="#0F6E56" nilai={stat.jumlahBukanPra} label="Sekolah Rendah" />
          </div>

          <div className="border border-border rounded-card p-4 bg-surface">
            <h4 className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-3">Prasekolah</h4>
            <BarisKecil tajuk="Jantina" data={stat.praJantina} warna={warnaCeria(3)} />
            <BarisKecil tajuk="Kaum" data={stat.praKaum} warna={warnaCeria(4)} />
            <BarisKecil tajuk="Agama" data={stat.praAgama} warna={warnaCeria(5)} />
          </div>

          <KadAnalisis
            tajuk="Kategori Ketidakupayaan (Sekolah Rendah)"
            data={stat.kategoriRingkas}
            nota='Lihat tab "Kategori Pendidikan Khas" untuk pecahan Jantina/Kaum/Agama setiap kategori.'
          />
        </div>
      )}

      {tab === 'kelas' && (
        <div className="space-y-4">
          <KadAnalisis tajuk="Jumlah Murid Ikut Kelas" data={stat.ikutKelas} />

          <div>
            <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">Jantina Ikut Kelas</h3>
            <JadualIkutKelas data={stat.jantinaIkutKelas} />
          </div>

          <div>
            <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">Kaum Ikut Kelas</h3>
            <JadualIkutKelas data={stat.kaumIkutKelas} />
          </div>

          <div>
            <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">Agama Ikut Kelas</h3>
            <JadualIkutKelas data={stat.agamaIkutKelas} />
          </div>
        </div>
      )}

      {tab === 'oku' && (
        <div>
          <p className="text-xs text-inkmuted mb-4">Sekolah Rendah sahaja - Prasekolah tidak termasuk di sini.</p>
          {stat.kategoriOKU.length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada data kategori ketidakupayaan.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {stat.kategoriOKU.map((k, i) => (
                <KadKategoriOKU
                  key={k.kategori}
                  indeks={i}
                  kategori={k.kategori}
                  jumlah={k.jumlah}
                  jantina={k.jantina}
                  kaum={k.kaum}
                  agama={k.agama}
                  subkategori={k.subkategori}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
