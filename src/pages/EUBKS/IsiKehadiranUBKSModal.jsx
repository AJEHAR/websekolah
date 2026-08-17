import { useMemo, useState } from 'react'
import { X, Check, XCircle, Star } from 'lucide-react'
import { simpanKehadiranUBKS } from '../../hooks/useKehadiranUBKS.js'
import { useDialog } from '../../context/DialogContext.jsx'

export default function IsiKehadiranUBKSModal({ unit, rekod, tahunSesi, perjumpaan, tarikh, user, onClose, onSelesai }) {
  const { konfirm } = useDialog()
  const [kehadiran, setKehadiran] = useState(() => {
    const peta = {}
    if (rekod) {
      rekod.senaraiKehadiran.forEach((m) => { peta[m.idMurid] = m.hadir })
    } else if (unit) {
      unit.ahli.forEach((m) => { peta[m.idMurid] = true })
    }
    return peta
  })
  const [menyimpan, setMenyimpan] = useState(false)

  const ahliIkutTahun = useMemo(() => {
    if (!unit) return {}
    const kumpulan = {}
    unit.ahli.forEach((m) => {
      const t = m.tahunTingkatan || 'Tiada Tahun'
      if (!kumpulan[t]) kumpulan[t] = []
      kumpulan[t].push(m)
    })
    return kumpulan
  }, [unit])

  if (!unit) return null

  async function toggl(m) {
    const sedangHadir = kehadiran[m.idMurid] ?? true
    if (m.adalahLF && sedangHadir) {
      const ok = await konfirm(
        `${m.nama} murid Kefungsian Rendah (LF) - biasanya SENTIASA hadir.\n\nAnda pasti nak tanda TAK HADIR?`,
        { bahaya: true }
      )
      if (!ok) return
    }
    setKehadiran((k) => ({ ...k, [m.idMurid]: !sedangHadir }))
  }

  async function hantar() {
    setMenyimpan(true)
    try {
      const senaraiKehadiran = unit.ahli.map((m) => ({
        idMurid: m.idMurid,
        nama: m.nama,
        hadir: Boolean(kehadiran[m.idMurid]),
        adalahLF: Boolean(m.adalahLF),
      }))
      await simpanKehadiranUBKS(tahunSesi, unit, perjumpaan, tarikh, senaraiKehadiran, user.uid)
      onSelesai()
    } finally {
      setMenyimpan(false)
    }
  }

  const jumlahHadir = unit.ahli.filter((m) => kehadiran[m.idMurid]).length

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h2 className="text-base font-bold text-ink">{unit.namaUnit}</h2>
            <p className="text-xs text-inkmuted">Perjumpaan {perjumpaan} · {tarikh}</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="px-5">
          <p className="text-xs text-inkmuted mb-4">
            {jumlahHadir} / {unit.ahli.length} hadir — tekan nama untuk tanda tak hadir
          </p>

          <div className="space-y-4 mb-5">
            {Object.entries(ahliIkutTahun)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([tahun, senaraiAhli]) => (
                <div key={tahun}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full" style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}>
                      {tahun}
                    </span>
                    <span className="text-xs text-inkmuted">{senaraiAhli.length} ahli</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {senaraiAhli.map((m) => {
                      const hadir = kehadiran[m.idMurid] ?? true
                      return (
                        <button
                          key={m.idMurid}
                          onClick={() => toggl(m)}
                          className="flex items-center gap-1.5 p-2.5 rounded-card text-left text-xs font-medium transition-all border"
                          style={{
                            backgroundColor: hadir ? '#EAF3DE' : '#F8F8F6',
                            color: hadir ? '#27500A' : '#888780',
                            borderColor: hadir ? '#C8DDB0' : '#E5E5E5',
                          }}
                        >
                          {hadir ? <Check size={14} className="shrink-0" /> : <XCircle size={14} className="shrink-0" />}
                          <span className="truncate flex-1">{m.nama}</span>
                          {m.adalahLF && <Star size={12} className="shrink-0 fill-current" style={{ color: '#F2C230' }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={hantar}
            disabled={menyimpan}
            className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
          >
            {menyimpan ? 'Menyimpan…' : 'Submit Kehadiran'}
          </button>
          <button onClick={onClose} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
