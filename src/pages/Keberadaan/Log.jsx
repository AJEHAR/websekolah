import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useLogKeberadaan, kemaskiniKeberadaan, padamKeberadaan } from '../../hooks/useKeberadaan.js'
import { todayISO } from '../../lib/dateUtils.js'
import KeberadaanCard from './KeberadaanCard.jsx'
import BorangModal from './BorangModal.jsx'
import { useDialog } from '../../context/DialogContext.jsx'

export default function Log() {
  const { konfirm } = useDialog()
  const { user } = useOutletContext()
  const { isSuperAdmin } = useIsAdmin(user)
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')

  const [dari, setDari] = useState(todayISO())
  const [hingga, setHingga] = useState(todayISO())
  const [aktif, setAktif] = useState(false)
  const { senarai, loading, muatSemula } = useLogKeberadaan(dari, hingga, aktif)

  const [rekodEdit, setRekodEdit] = useState(null)

  function papar(e) {
    e.preventDefault()
    setAktif(true)
    muatSemula()
  }

  function bolehUrus(rekod) {
    return isSuperAdmin || rekod.profilEmel === user.email
  }

  async function simpanEdit(data) {
    await kemaskiniKeberadaan(rekodEdit.id, data)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam rekod keberadaan ini?', { bahaya: true }))) return
    await padamKeberadaan(id)
    muatSemula()
  }

  return (
    <div>
      <form onSubmit={papar} className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label htmlFor="dari" className="block text-sm font-semibold text-ink mb-1">Dari</label>
          <input
            id="dari"
            type="date"
            value={dari}
            onChange={(e) => setDari(e.target.value)}
            className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <div>
          <label htmlFor="hingga" className="block text-sm font-semibold text-ink mb-1">Hingga</label>
          <input
            id="hingga"
            type="date"
            min={dari}
            value={hingga}
            onChange={(e) => setHingga(e.target.value)}
            className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <button type="submit" className="h-10 px-5 rounded-card bg-ink text-white text-sm font-semibold">
          Papar
        </button>
      </form>

      <div className="space-y-2">
        {!aktif ? (
          <p className="text-sm text-inkmuted">Pilih julat tarikh dan tekan "Papar".</p>
        ) : loading ? (
          <p className="text-sm text-inkmuted">Memuatkan…</p>
        ) : senarai.length === 0 ? (
          <p className="text-sm text-inkmuted">Tiada rekod dalam julat tarikh ini.</p>
        ) : (
          senarai.map((r) => (
            <KeberadaanCard key={r.id} rekod={r} bolehUrus={bolehUrus(r)} onEdit={setRekodEdit} onPadam={padam} />
          ))
        )}
      </div>

      <BorangModal
        open={Boolean(rekodEdit)}
        onClose={() => setRekodEdit(null)}
        profiles={profilesAktif}
        rekod={rekodEdit}
        emelSendiri={user.email}
        onSimpan={simpanEdit}
      />
    </div>
  )
}
