import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useBlokLaporan3K, tambahBlok, kemaskiniBlok, padamBlok } from '../../hooks/useBlokLaporan3K.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import AdminSeksyenGate from './AdminSeksyenGate.jsx'

export default function Blok3KPage() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  return (
    <AdminSeksyenGate adaSeksyen={adaSeksyen} seksyen="guru-bertugas" namaSeksyen="Guru Bertugas">
      <Isi />
    </AdminSeksyenGate>
  )
}

function Isi() {
  const { senarai, loading, muatSemula } = useBlokLaporan3K()
  const [namaBaru, setNamaBaru] = useState('')
  const [adaDisiplinBaru, setAdaDisiplinBaru] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  async function tambah(e) {
    e.preventDefault()
    setRalat(null)
    if (!namaBaru.trim()) {
      setRalat('Sila isi nama blok.')
      return
    }
    setMenyimpan(true)
    try {
      const turutanBaru = senarai.length > 0 ? Math.max(...senarai.map((b) => b.turutan ?? 0)) + 1 : 1
      await tambahBlok(namaBaru.trim(), adaDisiplinBaru, turutanBaru)
      setNamaBaru('')
      setAdaDisiplinBaru(false)
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal tambah blok. Cuba lagi.')
      console.error(err)
    } finally {
      setMenyimpan(false)
    }
  }

  async function togglDisiplin(b) {
    setRalat(null)
    try {
      await kemaskiniBlok(b.id, { adaDisiplin: !b.adaDisiplin })
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal kemas kini blok. Cuba lagi.')
      console.error(err)
    }
  }

  async function padam(id) {
    if (!window.confirm('Padam blok ini? Rekod Laporan 3K sedia ada untuk blok ni akan kekal dalam sistem.')) return
    setRalat(null)
    try {
      await padamBlok(id)
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal padam blok. Cuba lagi.')
      console.error(err)
    }
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">
        Blok ni digunakan dalam Laporan 3K (Guru Bertugas). Suis "Ada Disiplin" tentukan sama ada blok tu perlu isi perkara Disiplin sekali (contoh: Kantin).
      </p>

      <form onSubmit={tambah} className="flex flex-wrap items-center gap-2 mb-2">
        <input
          type="text"
          value={namaBaru}
          onChange={(e) => setNamaBaru(e.target.value)}
          placeholder="Nama blok baru…"
          className="flex-1 min-w-[160px] h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
        <label className="flex items-center gap-2 text-xs text-inkmuted px-1">
          <input
            type="checkbox"
            checked={adaDisiplinBaru}
            onChange={(e) => setAdaDisiplinBaru(e.target.checked)}
            className="h-4 w-4"
          />
          Ada Disiplin
        </label>
        <button
          type="submit"
          disabled={menyimpan}
          className="h-11 px-4 rounded-card bg-brand-red text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60"
        >
          <Plus size={16} /> {menyimpan ? 'Menyimpan…' : 'Tambah'}
        </button>
      </form>

      {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada blok lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-card border border-border bg-surface">
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{b.nama}</p>
                <label className="flex items-center gap-1.5 text-xs text-inkmuted mt-1">
                  <input
                    type="checkbox"
                    checked={b.adaDisiplin ?? false}
                    onChange={() => togglDisiplin(b)}
                    className="h-3.5 w-3.5"
                  />
                  Ada perkara Disiplin
                </label>
              </div>
              <button onClick={() => padam(b.id)} aria-label="Padam blok" className="p-2 rounded-card hover:bg-base text-brand-red">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
