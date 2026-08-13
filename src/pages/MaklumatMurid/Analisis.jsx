import { useMemo, useState } from 'react'
import { useMuridList } from '../../hooks/useMurid.js'
import { adalahPra, kiraIkutMedan, kiraIkutKelas, kiraIkutKategoriOKU } from './statistikMurid.js'
import KadAnalisis from './KadAnalisis.jsx'
import KadKategoriOKU, { BarisKecil } from './KadKategoriOKU.jsx'
import JadualIkutKelas from './JadualIkutKelas.jsx'

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
      <div className="flex gap-2 mb-6 p-1 rounded-full bg-base w-fit">
        {[
          { kunci: 'keseluruhan', label: 'Keseluruhan' },
          { kunci: 'kelas', label: 'Kelas' },
          { kunci: 'oku', label: 'Kategori Pendidikan Khas' },
        ].map((t) => (
          <button
            key={t.kunci}
            onClick={() => setTab(t.kunci)}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-colors"
            style={tab === t.kunci ? { backgroundColor: '#1A1A1A', color: '#fff' } : { color: '#5C5C5C' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'keseluruhan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-card text-center" style={{ backgroundColor: '#E6F1FB' }}>
              <p className="text-2xl font-bold" style={{ color: '#0C447C' }}>{stat.jumlah}</p>
              <p className="text-xs mt-1" style={{ color: '#0C447C' }}>Keseluruhan</p>
            </div>
            <div className="p-4 rounded-card text-center" style={{ backgroundColor: '#FBEAF0' }}>
              <p className="text-2xl font-bold" style={{ color: '#72243E' }}>{stat.jumlahPra}</p>
              <p className="text-xs mt-1" style={{ color: '#72243E' }}>Prasekolah</p>
            </div>
            <div className="p-4 rounded-card text-center" style={{ backgroundColor: '#EAF3DE' }}>
              <p className="text-2xl font-bold" style={{ color: '#27500A' }}>{stat.jumlahBukanPra}</p>
              <p className="text-xs mt-1" style={{ color: '#27500A' }}>Sekolah Rendah</p>
            </div>
          </div>

          <div className="border border-border rounded-card p-3 bg-surface">
            <h4 className="text-sm font-bold text-ink mb-3">Prasekolah</h4>
            <BarisKecil tajuk="Jantina" data={stat.praJantina} />
            <BarisKecil tajuk="Kaum" data={stat.praKaum} />
            <BarisKecil tajuk="Agama" data={stat.praAgama} />
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
            <div className="space-y-4">
              {stat.kategoriOKU.map((k) => (
                <KadKategoriOKU
                  key={k.kategori}
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
