import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SENARAI_MEDAN } from '../MaklumatMurid/muridFields.js'
import { useLajurMuridTetapan, simpanLajurTetapan } from '../../hooks/useLajurMuridTetapan.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import AdminSeksyenGate from './AdminSeksyenGate.jsx'

export default function LajurMuridPage() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  return (
    <AdminSeksyenGate adaSeksyen={adaSeksyen} seksyen="murid" namaSeksyen="Murid">
      <Isi />
    </AdminSeksyenGate>
  )
}

function Isi() {
  const { tetapan, loading, muatSemula } = useLajurMuridTetapan()
  const [tempatan, setTempatan] = useState({})
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  useEffect(() => {
    setTempatan(tetapan)
  }, [tetapan])

  function toggl(kunci) {
    setTempatan((t) => ({ ...t, [kunci]: t[kunci] === false ? true : false }))
  }

  async function simpan() {
    setMenyimpan(true)
    setRalat(null)
    try {
      await simpanLajurTetapan(tempatan)
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan tetapan.')
    } finally {
      setMenyimpan(false)
    }
  }

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  const bilanganNampak = SENARAI_MEDAN.filter(([, kunci]) => tempatan[kunci] !== false).length

  return (
    <div>
      <p className="text-xs text-inkmuted mb-1">
        Nyahtanda lajur yang tak perlu dipapar dalam jadual "Semakan Murid".
      </p>
      <p className="text-xs text-inkmuted mb-4">{bilanganNampak} / {SENARAI_MEDAN.length} lajur kelihatan</p>

      <div className="grid sm:grid-cols-2 gap-0.5 mb-5 border border-border rounded-card p-2 max-h-[60vh] overflow-y-auto">
        {SENARAI_MEDAN.map(([label, kunci]) => (
          <label key={kunci} className="flex items-center gap-2 p-2 rounded-card hover:bg-base text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={tempatan[kunci] !== false}
              onChange={() => toggl(kunci)}
              className="h-4 w-4 shrink-0"
            />
            <span className="text-ink">{label}</span>
          </label>
        ))}
      </div>

      {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

      <button
        onClick={simpan}
        disabled={menyimpan}
        className="h-11 px-5 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
      >
        {menyimpan ? 'Menyimpan…' : 'Simpan Tetapan'}
      </button>
    </div>
  )
}
