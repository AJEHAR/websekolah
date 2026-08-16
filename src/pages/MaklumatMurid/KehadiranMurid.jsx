import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMuridList } from '../../hooks/useMurid.js'
import { useKehadiranTarikh, padamKehadiranKelas } from '../../hooks/useKehadiranMurid.js'
import { todayISO } from '../../lib/dateUtils.js'
import KelasKehadiranCard from './KelasKehadiranCard.jsx'
import KehadiranMuridModal from './KehadiranMuridModal.jsx'
import DetailKehadiranModal from './DetailKehadiranModal.jsx'

export default function KehadiranMurid() {
  const { user } = useOutletContext()
  const { senarai: muridSenarai, loading: loadingMurid } = useMuridList()
  const [tarikh, setTarikh] = useState(todayISO())
  const { senarai: kehadiranSenarai, loading: loadingKehadiran, muatSemula } = useKehadiranTarikh(tarikh)

  const [kelasDipilih, setKelasDipilih] = useState(null)
  const [kelasLihat, setKelasLihat] = useState(null)

  const senaraiKelas = useMemo(() => {
    const map = {}
    muridSenarai.forEach((m) => {
      const kelas = m.namaKelas?.trim()
      if (!kelas) return
      if (!map[kelas]) map[kelas] = { namaKelas: kelas, guru: m.namaGuruKelas, ahli: [] }
      map[kelas].ahli.push(m)
    })
    return Object.values(map).sort((a, b) => a.namaKelas.localeCompare(b.namaKelas))
  }, [muridSenarai])

  function rekodUntukKelas(namaKelas) {
    return kehadiranSenarai.find((r) => r.namaKelas === namaKelas)
  }

  async function padam(namaKelas) {
    if (!window.confirm(`Padam rekod kehadiran kelas ${namaKelas} untuk tarikh ni?`)) return
    await padamKehadiranKelas(tarikh, namaKelas)
    muatSemula()
  }

  return (
    <div>
      <div className="mb-5 max-w-xs">
        <label htmlFor="tarikhKehadiran" className="block text-xs font-medium text-ink mb-1">Tarikh</label>
        <input
          id="tarikhKehadiran"
          type="date"
          value={tarikh}
          onChange={(e) => setTarikh(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {(loadingMurid || loadingKehadiran) ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senaraiKelas.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada kelas dijumpai — import data murid dulu (HEM).</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {senaraiKelas.map((k) => (
            <KelasKehadiranCard
              key={k.namaKelas}
              kelas={k}
              rekod={rekodUntukKelas(k.namaKelas)}
              onIsi={() => setKelasDipilih(k)}
              onLihat={() => setKelasLihat({ kelas: k, rekod: rekodUntukKelas(k.namaKelas) })}
              onPadam={() => padam(k.namaKelas)}
            />
          ))}
        </div>
      )}

      <KehadiranMuridModal
        key={kelasDipilih?.namaKelas ?? 'kosong'}
        kelas={kelasDipilih}
        rekod={kelasDipilih ? rekodUntukKelas(kelasDipilih.namaKelas) : null}
        tarikh={tarikh}
        user={user}
        onClose={() => setKelasDipilih(null)}
        onSelesai={() => { setKelasDipilih(null); muatSemula() }}
      />

      <DetailKehadiranModal data={kelasLihat} onClose={() => setKelasLihat(null)} />
    </div>
  )
}
