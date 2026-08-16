import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useTetapanPendaftaran, tetapkanPendaftaran } from '../../hooks/useTetapanPendaftaran.js'
import MenungguKelulusan from './MenungguKelulusan.jsx'

export default function MenungguPage() {
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
            : 'Ditutup — butang "Daftar" disembunyikan. Admin masih boleh pra-daftar staff terus di Staff.'}
        </p>
      </div>
      <button
        onClick={togol}
        disabled={loading || menukar}
        role="switch"
        aria-checked={dibuka}
        className={`shrink-0 relative h-7 w-12 rounded-full transition-colors disabled:opacity-60 ${dibuka ? 'bg-green-600' : 'bg-border'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${dibuka ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function Isi({ user }) {
  const { profiles, loading, muatSemula } = useProfilesList()
  const bilangan = profiles.filter((p) => p.status === 'menunggu').length

  return (
    <div>
      <SuisPendaftaran user={user} />
      <p className="text-xs text-inkmuted mb-4">
        {bilangan} permohonan menunggu · staff yang daftar sendiri, belum diluluskan
      </p>
      <MenungguKelulusan profiles={profiles} loading={loading} onSelesai={muatSemula} admin={user} />
    </div>
  )
}
