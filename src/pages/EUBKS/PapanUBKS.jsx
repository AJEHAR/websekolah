import { Fragment, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKehadiranUBKSTahun } from '../../hooks/useKehadiranUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]
const PERJUMPAAN_SENARAI = Array.from({ length: 12 }, (_, i) => i + 1)

const LEBAR = { bil: 32, nama: 150, kelas: 90, sel: 26, jumlah: 44 }
const KIRI = { bil: 0, nama: LEBAR.bil, kelas: LEBAR.bil + LEBAR.nama }

export default function PapanUBKS() {
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading: loadingUnit } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kehadiranSenarai, loading: loadingKehadiran } = useKehadiranUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()
  const [carian, setCarian] = useState('')

  const pelajar = useMemo(() => {
    const petaPelajar = {}
    unitSenarai.forEach((u) => {
      ;(u.ahli ?? []).forEach((m) => {
        if (!petaPelajar[m.idMurid]) {
          petaPelajar[m.idMurid] = { idMurid: m.idMurid, nama: m.nama, tahunTingkatan: m.tahunTingkatan, unit: {} }
        }
        petaPelajar[m.idMurid].unit[u.kategoriUnit] = u.id
      })
    })

    const petaRekod = {}
    kehadiranSenarai.forEach((r) => {
      petaRekod[`${r.unitId}_${r.perjumpaan}`] = r
    })

    function hadirStatus(idMurid, unitId, perjumpaan) {
      const rekod = petaRekod[`${unitId}_${perjumpaan}`]
      if (!rekod) return undefined
      const entri = rekod.senaraiKehadiran.find((m) => m.idMurid === idMurid)
      return entri ? entri.hadir : undefined
    }

    const senaraiPelajar = Object.values(petaPelajar).map((p) => {
      const ikutKategori = {}
      kategoriSenarai.forEach((k) => {
        const unitId = p.unit[k.kod]
        const perjumpaanStatus = {}
        let jumlahHadir = 0
        if (unitId) {
          PERJUMPAAN_SENARAI.forEach((pj) => {
            const status = hadirStatus(p.idMurid, unitId, pj)
            perjumpaanStatus[pj] = status
            if (status === true) jumlahHadir += 1
          })
        }
        ikutKategori[k.kod] = { unitId, perjumpaanStatus, jumlahHadir }
      })
      return { ...p, ikutKategori }
    })

    senaraiPelajar.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''))
    return senaraiPelajar
  }, [unitSenarai, kehadiranSenarai, kategoriSenarai])

  const pelajarDitapis = pelajar.filter((p) => p.nama?.toLowerCase().includes(carian.toLowerCase()))
  const loading = loadingUnit || loadingKehadiran

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div>
          <label htmlFor="tahunPapan" className="block text-xs font-medium text-ink mb-1">Tahun</label>
          <select
            id="tahunPapan"
            value={tahunSesi}
            onChange={(e) => setTahunSesi(Number(e.target.value))}
            className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
          >
            {PILIHAN_TAHUN.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            type="text"
            value={carian}
            onChange={(e) => setCarian(e.target.value)}
            placeholder="Cari nama murid…"
            className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : kategoriSenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada kategori unit lagi - admin perlu tetapkan dalam Panel Admin &gt; Kategori UBKS.</p>
      ) : pelajarDitapis.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada murid dalam unit UBKS untuk tahun {tahunSesi} lagi.</p>
      ) : (
        <div className="overflow-auto border border-border rounded-card max-h-[75vh]">
          <table className="text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-base">
              <tr>
                <th rowSpan={2} className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>Bil</th>
                <th rowSpan={2} className="sticky z-30 bg-base text-left px-2 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.nama, width: LEBAR.nama }}>Nama Murid</th>
                <th rowSpan={2} className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.kelas, width: LEBAR.kelas }}>Kelas</th>
                {kategoriSenarai.map((k) => (
                  <th key={k.kod} colSpan={13} className="px-1 py-1.5 font-semibold text-ink border-b border-l border-border text-center">
                    {k.nama} ({k.kod})
                  </th>
                ))}
              </tr>
              <tr>
                {kategoriSenarai.map((k) => (
                  <Fragment key={k.kod}>
                    {PERJUMPAAN_SENARAI.map((pj) => (
                      <th key={`${k.kod}-${pj}`} className="px-1 py-1.5 font-medium text-inkmuted border-b border-border text-center" style={{ width: LEBAR.sel }}>{pj}</th>
                    ))}
                    <th className="px-1 py-1.5 font-semibold text-ink border-b border-l border-border text-center" style={{ width: LEBAR.jumlah }}>Jum.</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pelajarDitapis.map((p, i) => (
                <tr key={p.idMurid}>
                  <td className="sticky z-10 bg-surface text-center px-1 py-2 border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>{i + 1}</td>
                  <td className="sticky z-10 bg-surface px-2 py-2 border-r border-border whitespace-nowrap font-medium text-ink" style={{ left: KIRI.nama, width: LEBAR.nama }}>{p.nama}</td>
                  <td className="sticky z-10 bg-surface px-1 py-2 border-r border-border whitespace-nowrap text-inkmuted text-center" style={{ left: KIRI.kelas, width: LEBAR.kelas }}>{p.tahunTingkatan}</td>
                  {kategoriSenarai.map((k) => {
                    const data = p.ikutKategori[k.kod]
                    return (
                      <Fragment key={k.kod}>
                        {PERJUMPAAN_SENARAI.map((pj) => {
                          const status = data.unitId ? data.perjumpaanStatus[pj] : null
                          return (
                            <td key={`${k.kod}-${pj}`} className="text-center px-1 py-2">
                              {status === true && <span style={{ color: '#27500A' }} className="font-bold">/</span>}
                              {status === false && <span className="text-brand-red font-bold">0</span>}
                            </td>
                          )
                        })}
                        <td className="text-center px-1 py-2 font-semibold text-ink border-l border-border">
                          {data.unitId ? data.jumlahHadir : '-'}
                        </td>
                      </Fragment>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-inkmuted mt-3">
        / = hadir · 0 = tak hadir · petak kosong = murid tiada unit dalam kategori tu
      </p>
    </div>
  )
}
