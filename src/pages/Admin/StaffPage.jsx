import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { simpanProfileAdmin, padamProfileAdmin } from '../../hooks/useAdminProfiles.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import SenaraiStaff from './SenaraiStaff.jsx'
import AdminFormModal from './AdminFormModal.jsx'
import FloatingTambahButton from '../Keberadaan/FloatingTambahButton.jsx'
import { useDialog } from '../../context/DialogContext.jsx'

export default function StaffPage() {
  const { user } = useOutletContext()
  const { isSuperAdmin } = useIsAdmin(user)

  if (!isSuperAdmin) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
        <p className="text-xs text-inkmuted">Bahagian ini khas untuk Admin Penuh.</p>
      </div>
    )
  }

  return <Isi user={user} />
}

function Isi({ user }) {
  const { konfirm } = useDialog()
  const { profiles, loading, muatSemula } = useProfilesList()
  const staffAktif = profiles.filter((p) => p.status !== 'menunggu')

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [profileEdit, setProfileEdit] = useState(null)

  async function simpan(emel, data) {
    await simpanProfileAdmin(emel, data, user.uid)
    setTunjukBorang(false)
    setProfileEdit(null)
    muatSemula()
  }

  function edit(profile) {
    setProfileEdit(profile)
    setTunjukBorang(true)
  }

  async function padam(emel) {
    if (!(await konfirm('Padam profile staff ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamProfileAdmin(emel)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">{staffAktif.length} staff</p>

      <SenaraiStaff profiles={staffAktif} loading={loading} onEdit={edit} onPadam={padam} />

      <FloatingTambahButton onClick={() => { setProfileEdit(null); setTunjukBorang(true) }} />
      <AdminFormModal
        open={tunjukBorang}
        onClose={() => { setTunjukBorang(false); setProfileEdit(null) }}
        profile={profileEdit}
        onSimpan={simpan}
      />
    </div>
  )
}
