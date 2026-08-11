import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKeberadaanSaya, kemaskiniKeberadaan, padamKeberadaan } from '../../hooks/useKeberadaan.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import KeberadaanCardRingkas from '../Keberadaan/KeberadaanCardRingkas.jsx'
import DetailModal from '../Keberadaan/DetailModal.jsx'
import KeberadaanForm from '../Keberadaan/KeberadaanForm.jsx'
import KalendarBulanan from './KalendarBulanan.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

export default function SenaraiKeberadaanSaya() {
  const { user } = useOutletContext()
  const { isAdmin } = useIsAdmin(user)
  const { profiles } = useProfilesList()
  const { senarai, loading, muatSemula } = useKeberadaanSaya(user?.email)
  const [rekodEdit, setRekodEdit] = useState(null)
  const [rekodLihat, setRekodLihat] = useState(null)
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

  if (rekodEdit) {
    return (
      <div className="max-w-lg">
        <KeberadaanForm
          profiles={profiles}
          rekod={rekodEdit}
          emelSendiri={user.email}
          onSimpan={simpanEdit}
          onBatal={() => setRekodEdit(null)}
        />
      </div>
    )
  }

  return (
    <div>
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
                <KeberadaanCardRingkas
                  key={r.id}
                  rekod={r}
                  bolehUrus={isAdmin || r.profilEmel === user.email}
                  onLihat={setRekodLihat}
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

      <DetailModal rekod={rekodLihat} onClose={() => setRekodLihat(null)} />
    </div>
  )
}
