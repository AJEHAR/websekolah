import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload, Trash2 } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useGaleriSekolah, tambahGambarGaleri, padamGambarGaleri } from '../../hooks/useGaleriSekolah.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { useDialog } from '../../context/DialogContext.jsx'

export default function TetapanGaleriPage() {
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
  const { senarai, loading, muatSemula } = useGaleriSekolah()
  const { amaran, konfirm } = useDialog()
  const [tajukBaru, setTajukBaru] = useState('')
  const [memuat, setMemuat] = useState(false)

  async function pilihFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setMemuat(true)
    try {
      const hasil = await muatNaikKeDrive(fail, 'galeriSekolah')
      await tambahGambarGaleri({ imageUrl: hasil.url, tajuk: tajukBaru }, user.uid)
      setTajukBaru('')
      muatSemula()
    } catch (err) {
      await amaran(err.message || 'Gagal muat naik.')
    } finally {
      setMemuat(false)
      e.target.value = ''
    }
  }

  async function padam(g) {
    if (!(await konfirm(`Padam gambar "${g.tajuk || 'ini'}" dari Galeri Sekolah?`, { bahaya: true }))) return
    await padamGambarGaleri(g.id)
    muatSemula()
  }

  return (
    // TIADA max-w pada div LUAR (dulu max-w-3xl hadkan SELURUH halaman
    // termasuk grid gambar di bawah - punca ruang kosong besar di kanan
    // pada skrin desktop). Cuma kotak borang "Tambah Gambar" dihadkan
    // (max-w-xl) sbb ia sekadar SATU input+butang, grid gambar di bawah
    // guna ruang penuh supaya lebih banyak thumbnail setiap baris.
    <div>
      <p className="text-xs text-inkmuted mb-5">
        Gambar di sini dipaparkan pada halaman awam <strong>Utama</strong> (pratonton) dan <strong>Galeri</strong> penuh (boleh dilihat sesiapa sahaja, tanpa log masuk).
      </p>

      <div className="bg-surface border border-border rounded-card p-4 mb-5 max-w-xl">
        <p className="text-xs font-semibold text-ink mb-2">Tambah Gambar Baharu</p>
        <input
          className="w-full rounded-card border border-border px-3 py-2 text-sm bg-surface mb-2"
          placeholder="Tajuk gambar (pilihan)"
          value={tajukBaru}
          onChange={(e) => setTajukBaru(e.target.value)}
        />
        <label className="flex items-center justify-center gap-1.5 h-10 w-fit px-4 rounded-card bg-brand-red text-white text-xs font-semibold cursor-pointer">
          {memuat ? 'Memuat naik…' : (<><Upload size={14} /> Muat Naik Gambar</>)}
          <input type="file" accept="image/*" onChange={pilihFail} className="hidden" disabled={memuat} />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Belum ada gambar dalam Galeri Sekolah.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {senarai.map((g) => (
            <div key={g.id} className="rounded-card border border-border overflow-hidden bg-surface">
              <div className="aspect-square bg-base">
                <img src={g.imageUrl} alt={g.tajuk || ''} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-ink truncate">{g.tajuk || '(tiada tajuk)'}</p>
                <button onClick={() => padam(g)} className="shrink-0 h-7 w-7 rounded-card border border-border text-inkmuted hover:bg-base flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
