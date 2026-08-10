import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKeberadaanSaya, kemaskiniKeberadaan, padamKeberadaan } from '../../hooks/useKeberadaan.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import AksesGate from '../../components/AksesGate.jsx'
import KeberadaanCard from '../Keberadaan/KeberadaanCard.jsx'
import KeberadaanForm from '../Keberadaan/KeberadaanForm.jsx'
import KalendarBulanan from './KalendarBulanan.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

export default function SenaraiKeberadaanSaya() {
  const { user } = useAuth()
  return (
    <AksesGate user={user}>
      <Isi user={user} />
    </AksesGate>
  )
}

function Isi({ user }) {
  const { isAdmin } = useIsAdmin(user)
  const { profiles } = useProfilesList()
  const { senarai, loading, muatSemula } = useKeberadaanSaya(user?.email)
  const [rekodEdit, setRekodEdit] = useState(null)
  const [tab, setTab] = useState('senarai')
  const [tahunTapis, setTahunTapis] = useState(TAHUN_SEMASA)

  const senaraiDitapis = senarai.filter((r) => Number(r.tarikhMula.slice(0, 4)) === tahunTapis)

  async function simpanEdit(data) {
    await kemaskiniKeberadaan(rekodEdit.id, data)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!window.confirm('Padam rekod keberadaan ini?')) return
    await padamKeberadaan(id)
    muatSemula()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-16">
      <Link to="/profil" className="text-xs font-medium text-brand-red">&larr; Kembali ke Profile</Link>

      <div className="bg-surface border border-border rounded-card shadow-soft p-6 sm:p-8 mt-4">
        <h1 className="text-lg font-bold text-ink mb-1">Senarai Keberadaan Saya</h1>
        <p className="text-xs text-inkmuted mb-5">Semua rekod keberadaan yang anda hantar.</p>

        {rekodEdit ? (
          <KeberadaanForm
            profiles={profiles}
            rekod={rekodEdit}
            emelSendiri={user.email}
            onSimpan={simpanEdit}
            onBatal={() => setRekodEdit(null)}
          />
        ) : (
          <>
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setTab('senarai')}
                className="px-4 py-2 rounded-full text-xs font-medium border border-border"
                style={tab === 'senarai' ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' } : { color: '#5C5C5C' }}
              >
                Senarai
              </button>
              <button
                onClick={() => setTab('kalendar')}
                className="px-4 py-2 rounded-full text-xs font-medium border border-border"
                style={tab === 'kalendar' ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' } : { color: '#5C5C5C' }}
              >
                Kalendar Bulanan
              </button>
            </div>

            {tab === 'senarai' ? (
              <>
                <div className="mb-4">
                  <label htmlFor="tahunTapis" className="block text-xs font-medium text-ink mb-1">Tahun</label>
                  <select
                    id="tahunTapis"
                    value={tahunTapis}
                    onChange={(e) => setTahunTapis(Number(e.target.value))}
                    className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
                  >
                    {PILIHAN_TAHUN.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {loading ? (
                  <p className="text-sm text-inkmuted">Memuatkan…</p>
                ) : senaraiDitapis.length === 0 ? (
                  <p className="text-sm text-inkmuted">Tiada rekod keberadaan untuk tahun {tahunTapis}.</p>
                ) : (
                  <div className="space-y-2">
                    {senaraiDitapis.map((r) => (
                      <KeberadaanCard
                        key={r.id}
                        rekod={r}
                        bolehUrus={isAdmin || r.profilEmel === user.email}
                        onEdit={setRekodEdit}
                        onPadam={padam}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <KalendarBulanan senarai={senarai} />
            )}
          </>
        )}
      </div>
    </main>
  )
}
