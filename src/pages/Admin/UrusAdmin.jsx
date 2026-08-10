import { useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'
import { useAdminsList, tambahAdmin, buangAdmin } from '../../hooks/useAdmins.js'

export default function UrusAdmin({ profiles, currentUser }) {
  const { admins, loading, muatSemula } = useAdminsList()
  const [emelDipilih, setEmelDipilih] = useState('')
  const [ralat, setRalat] = useState(null)
  const [memproses, setMemproses] = useState(false)

  function namaUntukEmel(emel) {
    return profiles.find((p) => p.emel === emel)?.nama ?? null
  }

  async function tambah(e) {
    e.preventDefault()
    if (!emelDipilih) return
    if (admins.some((a) => a.emel === emelDipilih)) {
      setRalat('Emel ni dah jadi admin.')
      return
    }
    setMemproses(true)
    setRalat(null)
    try {
      await tambahAdmin(emelDipilih, currentUser.uid)
      setEmelDipilih('')
      muatSemula()
    } catch (err) {
      setRalat('Gagal tambah admin. Cuba lagi.')
      console.error(err)
    } finally {
      setMemproses(false)
    }
  }

  async function buang(emel) {
    if (emel === currentUser.email) {
      window.alert('Anda tak boleh buang diri sendiri sebagai admin.')
      return
    }
    if (admins.length <= 1) {
      window.alert('Mesti ada sekurang-kurangnya 1 admin dalam sistem.')
      return
    }
    if (!window.confirm(`Buang "${emel}" daripada senarai admin?`)) return
    try {
      await buangAdmin(emel)
      muatSemula()
    } catch (err) {
      window.alert('Gagal buang admin. Cuba lagi.')
      console.error(err)
    }
  }

  return (
    <section>
      <h2 className="text-base font-bold text-ink mb-1">Urus Admin</h2>
      <p className="text-xs text-inkmuted mb-4">Admin boleh urus semua profile staff dan rekod keberadaan.</p>

      <form onSubmit={tambah} className="flex flex-wrap gap-3 mb-4">
        <select
          value={emelDipilih}
          onChange={(e) => setEmelDipilih(e.target.value)}
          className="flex-1 min-w-[200px] h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          <option value="">-- Pilih staff untuk jadi admin --</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.emel}>{p.nama} ({p.emel})</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!emelDipilih || memproses}
          className="h-11 px-5 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
        >
          Tambah Admin
        </button>
      </form>
      {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a.emel} className="flex items-center gap-3 p-3 rounded-card border border-border bg-surface">
              <ShieldCheck size={18} className="text-brand-red shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">
                  {namaUntukEmel(a.emel) ?? '(Tiada profile lagi)'}
                  {a.emel === currentUser.email && <span className="text-xs font-normal text-inkmuted"> (anda)</span>}
                </p>
                <p className="text-xs text-inkmuted truncate">{a.emel}</p>
              </div>
              <button
                onClick={() => buang(a.emel)}
                aria-label={`Buang ${a.emel} daripada admin`}
                className="p-2 rounded-card hover:bg-base text-inkmuted"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
