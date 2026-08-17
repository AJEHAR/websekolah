import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useLatarHubSemua, simpanLatarHub } from '../../hooks/useLatarHub.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { useDialog } from '../../context/DialogContext.jsx'

const SEKSYEN_SENARAI = [
  { kunci: 'keberadaan', label: 'Keberadaan' },
  { kunci: 'guru-bertugas', label: 'Guru Bertugas' },
  { kunci: 'maklumat-murid', label: 'HEM' },
  { kunci: 'admin', label: 'Panel Admin' },
  { kunci: 'eubks', label: 'KOKU' },
  { kunci: 'kurikulum', label: 'KURI' },
]

export default function LatarHubPage() {
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
  const { semua, loading, muatSemula } = useLatarHubSemua()

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">
        Upload gambar latar untuk page hub setiap seksyen (Telefon & Desktop berasingan, sebab nisbah skrin berbeza). Kalau kosong, gradient warna sedia ada terus terpakai.
      </p>
      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : (
        <div className="space-y-4">
          {SEKSYEN_SENARAI.map((s) => (
            <SeksyenBaris key={s.kunci} seksyen={s} latar={semua[s.kunci]} user={user} onSelesai={muatSemula} />
          ))}
        </div>
      )}
    </div>
  )
}

function SeksyenBaris({ seksyen, latar, user, onSelesai }) {
  const { amaran } = useDialog()
  const [sedangMuatNaik, setSedangMuatNaik] = useState(null) // 'telefon' | 'desktop' | null

  async function pilihFail(e, jenis) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setSedangMuatNaik(jenis)
    try {
      const hasil = await muatNaikKeDrive(fail, 'latarHub')
      const medan = jenis === 'telefon' ? 'gambarTelefon' : 'gambarDesktop'
      await simpanLatarHub(seksyen.kunci, { [medan]: hasil.url }, user.uid)
      onSelesai()
    } catch (err) {
      await amaran(err.message || 'Gagal muat naik.')
    } finally {
      setSedangMuatNaik(null)
      e.target.value = ''
    }
  }

  return (
    <div className="p-4 rounded-card border border-border bg-surface">
      <p className="text-sm font-semibold text-ink mb-3">{seksyen.label}</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { jenis: 'telefon', label: 'Gambar Telefon', url: latar?.gambarTelefon },
          { jenis: 'desktop', label: 'Gambar Desktop', url: latar?.gambarDesktop },
        ].map((g) => (
          <div key={g.jenis}>
            <div className="h-24 rounded-card bg-base border border-border overflow-hidden flex items-center justify-center mb-2">
              {g.url ? (
                <img src={g.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-inkmuted">Tiada gambar</span>
              )}
            </div>
            <label className="flex items-center justify-center gap-1.5 h-9 rounded-card border border-border text-xs font-medium text-ink cursor-pointer hover:bg-base">
              {sedangMuatNaik === g.jenis ? (
                'Memuat naik…'
              ) : (
                <>
                  <Upload size={13} /> {g.label}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => pilihFail(e, g.jenis)}
                className="hidden"
                disabled={sedangMuatNaik !== null}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
