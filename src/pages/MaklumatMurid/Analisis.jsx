import { useMemo } from 'react'
import { useMuridList } from '../../hooks/useMurid.js'
import { adalahPra, kiraIkutMedan, kiraIkutKelas } from './statistikMurid.js'
import SenaraiKiraan from './SenaraiKiraan.jsx'
import JadualIkutKelas from './JadualIkutKelas.jsx'

export default function Analisis() {
  const { senarai, loading } = useMuridList()

  const stat = useMemo(() => {
    const pra = senarai.filter(adalahPra)
    const bukanPra = senarai.filter((m) => !adalahPra(m))
    return {
      jumlah: senarai.length,
      jumlahPra: pra.length,
      jumlahBukanPra: bukanPra.length,
      bidangPra: kiraIkutMedan(pra, 'keteranganBidang'),
      bidangBukanPra: kiraIkutMedan(bukanPra, 'keteranganBidang'),
      jantinaPra: kiraIkutMedan(pra, 'jantina'),
      jantinaBukanPra: kiraIkutMedan(bukanPra, 'jantina'),
      kaumPra: kiraIkutMedan(pra, 'kaum'),
      kaumBukanPra: kiraIkutMedan(bukanPra, 'kaum'),
      agamaPra: kiraIkutMedan(pra, 'agama'),
      agamaBukanPra: kiraIkutMedan(bukanPra, 'agama'),
      ikutKelas: kiraIkutMedan(senarai, 'namaKelas'),
      jantinaIkutKelas: kiraIkutKelas(senarai, 'jantina'),
      kaumIkutKelas: kiraIkutKelas(senarai, 'kaum'),
      agamaIkutKelas: kiraIkutKelas(senarai, 'agama'),
    }
  }, [senarai])

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-card border border-border bg-surface text-center">
          <p className="text-2xl font-bold text-ink">{stat.jumlah}</p>
          <p className="text-xs text-inkmuted mt-1">Jumlah Murid</p>
        </div>
        <div className="p-4 rounded-card border border-border bg-surface text-center">
          <p className="text-2xl font-bold text-ink">{stat.jumlahPra}</p>
          <p className="text-xs text-inkmuted mt-1">Prasekolah</p>
        </div>
        <div className="p-4 rounded-card border border-border bg-surface text-center">
          <p className="text-2xl font-bold text-ink">{stat.jumlahBukanPra}</p>
          <p className="text-xs text-inkmuted mt-1">Bukan Prasekolah</p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Keterangan Bidang</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <SenaraiKiraan tajuk="Prasekolah" data={stat.bidangPra} />
          <SenaraiKiraan tajuk="Bukan Prasekolah" data={stat.bidangBukanPra} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Jantina</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <SenaraiKiraan tajuk="Prasekolah" data={stat.jantinaPra} />
          <SenaraiKiraan tajuk="Bukan Prasekolah" data={stat.jantinaBukanPra} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Kaum</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <SenaraiKiraan tajuk="Prasekolah" data={stat.kaumPra} />
          <SenaraiKiraan tajuk="Bukan Prasekolah" data={stat.kaumBukanPra} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Agama</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <SenaraiKiraan tajuk="Prasekolah" data={stat.agamaPra} />
          <SenaraiKiraan tajuk="Bukan Prasekolah" data={stat.agamaBukanPra} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Jumlah Murid Ikut Kelas</h3>
        <SenaraiKiraan data={stat.ikutKelas} />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Jantina Ikut Kelas</h3>
        <JadualIkutKelas data={stat.jantinaIkutKelas} />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Kaum Ikut Kelas</h3>
        <JadualIkutKelas data={stat.kaumIkutKelas} />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Agama Ikut Kelas</h3>
        <JadualIkutKelas data={stat.agamaIkutKelas} />
      </section>
    </div>
  )
}
