import { useMemo, useState } from 'react'
import { Utensils } from 'lucide-react'
import { useKehadiranTarikh, useKehadiranJulat } from '../../hooks/useKehadiranMurid.js'
import { todayISO, formatTarikhPaparan } from '../../lib/dateUtils.js'
import SenaraiKiraan from '../MaklumatMurid/SenaraiKiraan.jsx'

function awalBulanISO(tarikh) {
  return `${tarikh.slice(0, 7)}-01`
}

function akhirBulanISO(tarikh) {
  const [tahun, bulan] = tarikh.slice(0, 7).split('-').map(Number)
  const hariTerakhir = new Date(tahun, bulan, 0).getDate()
  return `${tarikh.slice(0, 7)}-${String(hariTerakhir).padStart(2, '0')}`
}

export default function PapanRMT() {
  const [tarikh, setTarikh] = useState(todayISO())
  const { senarai: kehadiranHariIni, loading: loadingHariIni } = useKehadiranTarikh(tarikh)

  const dari = awalBulanISO(tarikh)
  const hingga = akhirBulanISO(tarikh)
  const { senarai: kehadiranBulan, loading: loadingBulan } = useKehadiranJulat(dari, hingga)

  // Papan harian - guna terus snapshot 'adalahRMT' & 'hadir' yang disimpan
  // masa Kehadiran Murid disubmit, BUKAN rujuk balik status semasa di koleksi 'murid'.
  const senaraiRMTHariIni = useMemo(() => {
    const senarai = []
    kehadiranHariIni.forEach((rekod) => {
      rekod.senaraiMurid.forEach((m) => {
        if (m.hadir && m.adalahRMT) senarai.push({ ...m, namaKelas: rekod.namaKelas })
      })
    })
    return senarai.sort((a, b) => a.namaKelas.localeCompare(b.namaKelas) || a.nama.localeCompare(b.nama))
  }, [kehadiranHariIni])

  const ikutKelas = useMemo(() => {
    const map = {}
    senaraiRMTHariIni.forEach((m) => {
      if (!map[m.namaKelas]) map[m.namaKelas] = []
      map[m.namaKelas].push(m)
    })
    return map
  }, [senaraiRMTHariIni])

  // Trend bulanan - buktikan snapshot boleh beza-bezakan RMT/Asrama walaupun
  // status murid berubah dalam bulan yang sama (setiap hari guna snapshot hari tu).
  const statistikBulanan = useMemo(() => {
    const kiraan = {}
    kehadiranBulan.forEach((rekod) => {
      const jumlah = rekod.senaraiMurid.filter((m) => m.hadir && m.adalahRMT).length
      kiraan[rekod.tarikh] = (kiraan[rekod.tarikh] ?? 0) + jumlah
    })
    return Object.entries(kiraan)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([t, jumlah]) => ({ label: `${Number(t.slice(8, 10))} hb`, jumlah }))
  }, [kehadiranBulan])

  return (
    <div>
      <div className="mb-5 max-w-xs">
        <label htmlFor="tarikhRMT" className="block text-xs font-medium text-ink mb-1">Tarikh</label>
        <input
          id="tarikhRMT"
          type="date"
          value={tarikh}
          onChange={(e) => setTarikh(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {loadingHariIni ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : (
        <>
          <div className="p-5 rounded-card mb-6 text-center" style={{ backgroundColor: '#FAEEDA' }}>
            <Utensils size={22} className="mx-auto mb-1.5" style={{ color: '#633806' }} />
            <p className="text-3xl font-bold" style={{ color: '#633806' }}>{senaraiRMTHariIni.length}</p>
            <p className="text-xs mt-1" style={{ color: '#633806' }}>Murid RMT Hadir — {formatTarikhPaparan(tarikh)}</p>
          </div>

          {Object.keys(ikutKelas).length === 0 ? (
            <p className="text-sm text-inkmuted mb-8">
              Tiada murid RMT hadir untuk tarikh ni (atau kehadiran kelas belum diisi).
            </p>
          ) : (
            <div className="space-y-4 mb-8">
              {Object.entries(ikutKelas).map(([kelas, muridSenarai]) => (
                <div key={kelas}>
                  <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">
                    {kelas} ({muridSenarai.length})
                  </h3>
                  <div className="border border-border rounded-card divide-y divide-border">
                    {muridSenarai.map((m) => (
                      <div key={m.idMurid} className="px-3 py-2 text-sm text-ink">{m.nama}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Trend RMT Bulan Ini</h3>
        {loadingBulan ? (
          <p className="text-sm text-inkmuted">Memuatkan…</p>
        ) : statistikBulanan.length === 0 ? (
          <p className="text-sm text-inkmuted">Tiada data kehadiran untuk bulan ni lagi.</p>
        ) : (
          <SenaraiKiraan data={statistikBulanan} />
        )}
      </section>
    </div>
  )
}
