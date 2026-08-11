import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useKeberadaanTarikh, tambahKeberadaan, kemaskiniKeberadaan, padamKeberadaan } from '../../hooks/useKeberadaan.js'
import { todayISO, formatTarikhPaparan } from '../../lib/dateUtils.js'
import { KUMPULAN_KEBERADAAN, kumpulanKategori } from './constants.js'
import KumpulanCard from './KumpulanCard.jsx'
import FloatingTambahButton from './FloatingTambahButton.jsx'
import BorangModal from './BorangModal.jsx'
import DetailModal from './DetailModal.jsx'

export default function HariIni() {
  const { user } = useOutletContext()
  const { isAdmin } = useIsAdmin(user)
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')

  const tarikh = todayISO()
  const { senarai, loading, muatSemula } = useKeberadaanTarikh(tarikh)

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)
  const [rekodLihat, setRekodLihat] = useState(null)

  async function simpan(data) {
    if (rekodEdit) await kemaskiniKeberadaan(rekodEdit.id, data)
    else await tambahKeberadaan(data, user)
    setTunjukBorang(false)
    setRekodEdit(null)
    muatSemula()
  }

  function edit(rekod) {
    setRekodEdit(rekod)
    setTunjukBorang(true)
  }

  async function padam(id) {
    if (!window.confirm('Padam rekod keberadaan ini?')) return
    await padamKeberadaan(id)
    muatSemula()
  }

  return (
    <div>
      <p className="text-base sm:text-lg font-semibold text-ink mb-4">{formatTarikhPaparan(tarikh)}</p>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : (
        <div className="space-y-3">
          {KUMPULAN_KEBERADAAN.map((kumpulan) => (
            <KumpulanCard
              key={kumpulan}
              tajuk={kumpulan}
              senarai={senarai.filter((r) => kumpulanKategori(r.kategori) === kumpulan)}
              currentUserEmel={user.email}
              isAdmin={isAdmin}
              onLihat={setRekodLihat}
              onEdit={edit}
              onPadam={padam}
            />
          ))}
        </div>
      )}

      <FloatingTambahButton onClick={() => { setRekodEdit(null); setTunjukBorang(true) }} />
      <BorangModal
        open={tunjukBorang}
        onClose={() => { setTunjukBorang(false); setRekodEdit(null) }}
        profiles={profilesAktif}
        rekod={rekodEdit}
        emelSendiri={user.email}
        onSimpan={simpan}
      />
      <DetailModal rekod={rekodLihat} onClose={() => setRekodLihat(null)} />
    </div>
  )
}
