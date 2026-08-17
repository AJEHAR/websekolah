import { X } from 'lucide-react'

function Medan({ label, nilai }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-inkmuted">{label}</span>
      <span className="text-sm font-medium text-ink text-right">{nilai || '-'}</span>
    </div>
  )
}

// Butang mata (Eye) dalam SenaraiStaff.jsx buka modal ni - lihat sahaja,
// aksi Edit/Padam KEKAL pada baris/kad senarai (bukan di sini) ikut
// keputusan reka bentuk (3 butang berasingan: mata/edit/padam).
export default function DetailStaffModal({ profile, onClose }) {
  if (!profile) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-ink">Butiran Staff</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="h-16 w-16 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center mb-2">
            {profile.gambarURL ? (
              <img src={profile.gambarURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-inkmuted">Tiada</span>
            )}
          </div>
          <p className="text-base font-bold text-ink">{profile.nama || '(Belum lengkap)'}</p>
          <p className="text-xs text-inkmuted">{profile.jawatan}</p>
        </div>

        <div>
          <Medan label="Emel" nilai={profile.emel} />
          <Medan label="No. IC" nilai={profile.ic} />
          <Medan label="Kategori" nilai={profile.kategori} />
          {profile.kategori === 'PPM' && <Medan label="Jenis PPM" nilai={profile.jenisPPM || '⚠️ Belum diisi'} />}
          <Medan label="Status Akaun" nilai={profile.uid ? 'Aktif (dah pernah log masuk)' : 'Belum log masuk'} />
        </div>
      </div>
    </div>
  )
}
