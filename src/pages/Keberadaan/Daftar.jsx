import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { tambahKeberadaan } from '../../hooks/useKeberadaan.js'
import KeberadaanForm from './KeberadaanForm.jsx'

export default function Daftar() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')
  const [selesai, setSelesai] = useState(false)

  async function simpan(data) {
    await tambahKeberadaan(data, user)
    setSelesai(true)
  }

  if (selesai) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-5">Rekod keberadaan berjaya dihantar.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setSelesai(false)}
            className="h-11 px-5 rounded-card bg-brand-red text-white text-sm font-semibold"
          >
            Isi Lagi
          </button>
          <button
            onClick={() => navigate('/keberadaan/hari-ini')}
            className="h-11 px-5 rounded-card border border-border text-sm font-medium text-ink"
          >
            Lihat Hari Ini
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-card p-6 sm:p-8">
      <KeberadaanForm
        profiles={profilesAktif}
        rekod={null}
        emelSendiri={user.email}
        onSimpan={simpan}
        onBatal={() => navigate('/keberadaan/hari-ini')}
      />
    </div>
  )
}
