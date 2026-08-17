import { useState } from 'react'
import { ShieldCheck, X, ChevronDown } from 'lucide-react'
import { useAdminsList, tambahAdmin, kemaskiniPeranan, buangAdmin } from '../../hooks/useAdmins.js'
import { SEKSYEN_ADMIN } from './seksyenAdmin.js'
import { useDialog } from '../../context/DialogContext.jsx'

export default function UrusAdmin({ profiles, currentUser }) {
  const { konfirm, amaran } = useDialog()
  const { admins, loading, muatSemula } = useAdminsList()
  const [emelDipilih, setEmelDipilih] = useState('')
  const [peranBaru, setPeranBaru] = useState([]) // [] = super (penuh) secara default
  const [ralat, setRalat] = useState(null)
  const [memproses, setMemproses] = useState(false)
  const [emelDibuka, setEmelDibuka] = useState(null) // emel yang tab "edit peranan" terbuka

  function namaUntukEmel(emel) {
    return profiles.find((p) => p.emel === emel)?.nama ?? null
  }

  function togglSeksyenBaru(kunci) {
    setPeranBaru((s) => (s.includes(kunci) ? s.filter((k) => k !== kunci) : [...s, kunci]))
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
      const peranan = peranBaru.length > 0 ? peranBaru : ['super']
      await tambahAdmin(emelDipilih, peranan, currentUser.uid)
      setEmelDipilih('')
      setPeranBaru([])
      muatSemula()
    } catch (err) {
      setRalat('Gagal tambah admin. Cuba lagi.')
      console.error(err)
    } finally {
      setMemproses(false)
    }
  }

  async function togglSeksyenSediaAda(admin, kunci) {
    const peranSemasa = admin.peranan ?? ['super']
    // Kalau admin ni 'super', tukar checkbox seksyen akan tukar dia jadi
    // admin seksyen sahaja (buang 'super') - beri amaran dulu.
    if (peranSemasa.includes('super')) {
      if (!(await konfirm(`"${admin.emel}" admin PENUH sekarang. Hadkan kepada seksyen tertentu sahaja?`, { bahaya: true }))) return
      await kemaskiniPeranan(admin.emel, [kunci])
    } else {
      const baru = peranSemasa.includes(kunci) ? peranSemasa.filter((k) => k !== kunci) : [...peranSemasa, kunci]
      await kemaskiniPeranan(admin.emel, baru)
    }
    muatSemula()
  }

  async function jadikanSuper(admin) {
    await kemaskiniPeranan(admin.emel, ['super'])
    muatSemula()
  }

  async function buang(emel) {
    if (emel === currentUser.email) {
      await amaran('Anda tak boleh buang diri sendiri sebagai admin.')
      return
    }
    if (admins.length <= 1) {
      await amaran('Mesti ada sekurang-kurangnya 1 admin dalam sistem.')
      return
    }
    if (!(await konfirm(`Buang "${emel}" daripada senarai admin?`, { bahaya: true }))) return
    try {
      await buangAdmin(emel)
      muatSemula()
    } catch (err) {
      await amaran('Gagal buang admin. Cuba lagi.')
      console.error(err)
    }
  }

  return (
    <section>
      <h2 className="text-base font-bold text-ink mb-1">Urus Admin</h2>
      <p className="text-xs text-inkmuted mb-4">
        Admin <strong>Penuh</strong> boleh urus semua. Admin <strong>Seksyen</strong> cuma boleh urus bahagian yang dilantik sahaja.
      </p>

      <form onSubmit={tambah} className="mb-4 p-3 rounded-card border border-border bg-base">
        <select
          value={emelDipilih}
          onChange={(e) => setEmelDipilih(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm mb-3"
        >
          <option value="">-- Pilih staff untuk jadi admin --</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.emel}>{p.nama} ({p.emel})</option>
          ))}
        </select>

        <p className="text-xs font-medium text-ink mb-1.5">Peranan (kosongkan untuk Admin Penuh)</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {SEKSYEN_ADMIN.map((s) => (
            <label key={s.kunci} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-card border border-border bg-surface cursor-pointer">
              <input type="checkbox" checked={peranBaru.includes(s.kunci)} onChange={() => togglSeksyenBaru(s.kunci)} className="h-3.5 w-3.5" />
              {s.label}
            </label>
          ))}
        </div>

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
          {admins.map((a) => {
            const peranan = a.peranan ?? ['super']
            const adalahSuper = peranan.includes('super')
            const tabTerbuka = emelDibuka === a.emel

            return (
              <div key={a.emel} className="rounded-card border border-border bg-surface overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <ShieldCheck size={18} className="text-brand-red shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">
                      {namaUntukEmel(a.emel) ?? '(Tiada profile lagi)'}
                      {a.emel === currentUser.email && <span className="text-xs font-normal text-inkmuted"> (anda)</span>}
                    </p>
                    <p className="text-xs text-inkmuted truncate">{a.emel}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: adalahSuper ? '#C8102E' : '#0C447C' }}>
                      {adalahSuper ? 'Admin Penuh' : `Admin Seksyen: ${peranan.map((k) => SEKSYEN_ADMIN.find((s) => s.kunci === k)?.label ?? k).join(', ')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setEmelDibuka(tabTerbuka ? null : a.emel)}
                    aria-label="Edit peranan"
                    className="p-2 rounded-card hover:bg-base text-inkmuted"
                  >
                    <ChevronDown size={16} className={`transition-transform ${tabTerbuka ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => buang(a.emel)}
                    aria-label={`Buang ${a.emel} daripada admin`}
                    className="p-2 rounded-card hover:bg-base text-brand-red"
                  >
                    <X size={16} />
                  </button>
                </div>

                {tabTerbuka && (
                  <div className="px-3 pb-3 border-t border-border pt-3">
                    {adalahSuper ? (
                      <p className="text-xs text-inkmuted mb-2">
                        Admin ni Penuh (semua seksyen). Tandakan seksyen di bawah untuk hadkan kepada seksyen tertentu sahaja.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {SEKSYEN_ADMIN.map((s) => (
                        <label key={s.kunci} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-card border border-border bg-base cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!adalahSuper && peranan.includes(s.kunci)}
                            onChange={() => togglSeksyenSediaAda(a, s.kunci)}
                            className="h-3.5 w-3.5"
                          />
                          {s.label}
                        </label>
                      ))}
                    </div>
                    {!adalahSuper && (
                      <button
                        onClick={() => jadikanSuper(a)}
                        className="mt-2 text-xs font-semibold text-brand-red"
                      >
                        Jadikan Admin Penuh semula
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
