import { useState } from 'react'
import { Pencil, Trash2, Eye, Search } from 'lucide-react'
import DetailStaffModal from './DetailStaffModal.jsx'

// Urutan kumpulan tetap (bukan abjad) - padan KATEGORI_OPTIONS dalam
// Profile/constants.js supaya konsisten dengan borang isi profile.
const URUTAN_KATEGORI = ['Guru', 'PPM', 'AKP']

function kumpulkanIkutKategori(senarai) {
  const kumpulan = {}
  for (const k of URUTAN_KATEGORI) kumpulan[k] = []
  const lainLain = []
  for (const p of senarai) {
    if (URUTAN_KATEGORI.includes(p.kategori)) kumpulan[p.kategori].push(p)
    else lainLain.push(p)
  }
  const hasil = URUTAN_KATEGORI.map((k) => [k, kumpulan[k]]).filter(([, ahli]) => ahli.length > 0)
  if (lainLain.length > 0) hasil.push(['Lain-lain', lainLain])
  return hasil
}

export default function SenaraiStaff({ profiles, loading, onEdit, onPadam }) {
  const [carian, setCarian] = useState('')
  const [staffDilihat, setStaffDilihat] = useState(null)

  const disenarai = profiles.filter((p) =>
    `${p.nama ?? ''} ${p.emel ?? ''} ${p.jawatan ?? ''}`.toLowerCase().includes(carian.toLowerCase())
  )
  const kumpulan = kumpulkanIkutKategori(disenarai)

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama, emel atau jawatan…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada staff dijumpai.</p>
      ) : (
        <div className="space-y-6">
          {kumpulan.map(([kategori, ahli]) => (
            <div key={kategori}>
              <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">
                {kategori} <span className="font-normal normal-case">({ahli.length})</span>
              </p>

              {/* Desktop (sm:+) - jadual sebenar column-by-column, senang dibaca */}
              <div className="hidden sm:block rounded-card border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-ink text-white">
                    <tr>
                      <th className="w-11"></th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Nama</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Emel</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Jawatan</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Status</th>
                      <th className="w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-border">
                    {ahli.map((p) => (
                      <tr key={p.id}>
                        <td className="pl-3">
                          <div className="h-8 w-8 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center">
                            {p.gambarURL ? (
                              <img src={p.gambarURL} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[8px] text-inkmuted">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-ink font-medium">{p.nama || '(Belum lengkap)'}</td>
                        <td className="px-3 py-2.5 text-inkmuted">{p.emel}</td>
                        <td className="px-3 py-2.5 text-inkmuted">
                          {p.jawatan}
                          {p.kategori === 'PPM' && (
                            p.jenisPPM ? ` · ${p.jenisPPM}` : ' · ⚠️ Jenis PPM belum diisi'
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {p.uid ? (
                            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-base border border-border text-inkmuted">Aktif</span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-base border border-border text-inkmuted">Belum log masuk</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setStaffDilihat(p)} aria-label="Lihat butiran" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                              <Eye size={15} />
                            </button>
                            <button onClick={() => onEdit(p)} aria-label="Edit staff" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => onPadam(p.emel)} aria-label="Padam staff" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile - senarai ringkas: gambar + nama + 3 butang sahaja */}
              <div className="sm:hidden space-y-2">
                {ahli.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-card border border-border bg-surface">
                    <div className="h-9 w-9 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {p.gambarURL ? (
                        <img src={p.gambarURL} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-inkmuted">-</span>
                      )}
                    </div>
                    <p className="flex-1 min-w-0 text-sm font-medium text-ink truncate">{p.nama || '(Belum lengkap)'}</p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => setStaffDilihat(p)} aria-label="Lihat butiran" className="p-2 rounded-card hover:bg-base text-inkmuted">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onEdit(p)} aria-label="Edit staff" className="p-2 rounded-card hover:bg-base text-inkmuted">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onPadam(p.emel)} aria-label="Padam staff" className="p-2 rounded-card hover:bg-base text-brand-red">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <DetailStaffModal profile={staffDilihat} onClose={() => setStaffDilihat(null)} />
    </div>
  )
}
