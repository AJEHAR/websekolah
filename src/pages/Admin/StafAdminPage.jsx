import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { simpanProfileAdmin, padamProfileAdmin } from '../../hooks/useAdminProfiles.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useTetapanPendaftaran, tetapkanPendaftaran } from '../../hooks/useTetapanPendaftaran.js'
import { useDialog } from '../../context/DialogContext.jsx'
import SenaraiStaff from './SenaraiStaff.jsx'
import AdminFormModal from './AdminFormModal.jsx'
import FloatingTambahButton from '../Keberadaan/FloatingTambahButton.jsx'
import MenungguKelulusan from './MenungguKelulusan.jsx'
import UrusAdmin from './UrusAdmin.jsx'

// Gabungan 3 page admin lama (Staff, Menunggu Kelulusan, Pentadbir) jadi
// SATU page "Staf/Admin" dengan tab - elak staff/admin kena lompat 3 page
// berasingan untuk kerja yang saling berkaitan (urus staff = kelulusan +
// peranan admin, semua pasal "siapa boleh buat apa" dalam sistem).
export default function StafAdminPage() {
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

function SuisPendaftaran({ user }) {
  const { dibuka, loading } = useTetapanPendaftaran()
  const [menukar, setMenukar] = useState(false)

  async function togol() {
    setMenukar(true)
    try {
      await tetapkanPendaftaran(!dibuka, user.uid)
    } finally {
      setMenukar(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-card border border-border bg-surface mb-5">
      <div>
        <p className="text-sm font-semibold text-ink">Pendaftaran Staff Baru</p>
        <p className="text-xs text-inkmuted mt-0.5">
          {loading ? 'Memuatkan…' : dibuka
            ? 'Dibuka — butang "Daftar" ditunjukkan kepada pengunjung.'
            : 'Ditutup — butang "Daftar" disembunyikan. Admin masih boleh pra-daftar staff terus di tab Senarai Staff.'}
        </p>
      </div>
      <button
        onClick={togol}
        disabled={loading || menukar}
        role="switch"
        aria-checked={dibuka}
        className={`shrink-0 relative h-7 w-12 rounded-full overflow-hidden transition-colors disabled:opacity-60 ${dibuka ? 'bg-green-600' : 'bg-border'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${dibuka ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function Isi({ user }) {
  const { konfirm } = useDialog()
  const { profiles, loading, muatSemula } = useProfilesList()
  const staffAktif = profiles.filter((p) => p.status !== 'menunggu')
  const bilanganMenunggu = profiles.filter((p) => p.status === 'menunggu').length

  const [tab, setTab] = useState('staff') // 'staff' | 'menunggu' | 'pentadbir'
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
      <p className="text-xs text-inkmuted mb-4">Urus staff, kelulusan pendaftaran, dan peranan admin.</p>

      <div className="flex gap-1 bg-base rounded-full p-1 w-fit mb-5 overflow-x-auto max-w-full">
        <button
          onClick={() => setTab('staff')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${tab === 'staff' ? 'bg-brand-red text-white' : 'text-inkmuted hover:text-ink'}`}
        >
          Senarai Staff
        </button>
        <button
          onClick={() => setTab('menunggu')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${tab === 'menunggu' ? 'bg-brand-red text-white' : 'text-inkmuted hover:text-ink'}`}
        >
          Menunggu Kelulusan
          {bilanganMenunggu > 0 && (
            <span className={`text-[10px] font-bold px-1.5 rounded-full ${tab === 'menunggu' ? 'bg-white/25' : 'bg-brand-gold text-ink'}`}>
              {bilanganMenunggu}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('pentadbir')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${tab === 'pentadbir' ? 'bg-brand-red text-white' : 'text-inkmuted hover:text-ink'}`}
        >
          Pentadbir
        </button>
      </div>

      {tab === 'staff' && (
        <>
          <p className="text-xs text-inkmuted mb-4">{staffAktif.length} staff</p>
          <SenaraiStaff profiles={staffAktif} loading={loading} onEdit={edit} onPadam={padam} />
          <FloatingTambahButton onClick={() => { setProfileEdit(null); setTunjukBorang(true) }} />
          <AdminFormModal
            open={tunjukBorang}
            onClose={() => { setTunjukBorang(false); setProfileEdit(null) }}
            profile={profileEdit}
            onSimpan={simpan}
          />
        </>
      )}

      {tab === 'menunggu' && (
        <>
          <SuisPendaftaran user={user} />
          <p className="text-xs text-inkmuted mb-4">
            {bilanganMenunggu} permohonan menunggu · staff yang daftar sendiri, belum diluluskan
          </p>
          <MenungguKelulusan profiles={profiles} loading={loading} onSelesai={muatSemula} admin={user} />
        </>
      )}

      {tab === 'pentadbir' && <UrusAdmin profiles={staffAktif} currentUser={user} />}
    </div>
  )
}
