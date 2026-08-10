import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { simpanProfileAdmin, padamProfileAdmin } from '../../hooks/useAdminProfiles.js'
import SenaraiStaff from './SenaraiStaff.jsx'
import AdminFormModal from './AdminFormModal.jsx'
import FloatingTambahButton from '../Keberadaan/FloatingTambahButton.jsx'

export default function StaffPage() {
  const { user } = useOutletContext()
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
    if (!window.confirm('Padam profile staff ini? Tindakan ini tidak boleh dibatalkan.')) return
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
