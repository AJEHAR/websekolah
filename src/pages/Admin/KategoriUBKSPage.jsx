import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useKategoriUBKS, tambahKategori, kemaskiniKategori, padamKategori, JENIS_KATEGORI } from '../../hooks/useKategoriUBKS.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import AdminSeksyenGate from './AdminSeksyenGate.jsx'
import { useDialog } from '../../context/DialogContext.jsx'

export default function KategoriUBKSPage() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  return (
    <AdminSeksyenGate adaSeksyen={adaSeksyen} seksyen="ubks" namaSeksyen="KOKU">
      <Isi />
    </AdminSeksyenGate>
  )
}

function labelJenis(nilai) {
  return JENIS_KATEGORI.find((j) => j.nilai === nilai)?.label
}

function Isi() {
  const { konfirm } = useDialog()
  const { senarai, loading, muatSemula } = useKategoriUBKS()
  const [nama, setNama] = useState('')
  const [kod, setKod] = useState('')
  const [jenis, setJenis] = useState('')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  const bilanganBelumJenis = senarai.filter((k) => !k.jenis).length

  async function tambah(e) {
    e.preventDefault()
    setRalat(null)
    if (!nama.trim() || !kod.trim()) {
      setRalat('Sila isi nama dan kod.')
      return
    }
    if (!jenis) {
      setRalat('Sila pilih Jenis - ini yang tentukan sama ada kategori ni masuk kira Unit Beruniform/Kelab/Sukan di borang Sijil Tamat.')
      return
    }
    setMenyimpan(true)
    try {
      const turutanBaru = senarai.length > 0 ? Math.max(...senarai.map((k) => k.turutan ?? 0)) + 1 : 1
      await tambahKategori(nama.trim(), kod.trim().toUpperCase(), turutanBaru, jenis)
      setNama('')
      setKod('')
      setJenis('')
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal tambah kategori.')
    } finally {
      setMenyimpan(false)
    }
  }

  async function ubahJenis(id, jenisBaru) {
    await kemaskiniKategori(id, { jenis: jenisBaru })
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam kategori ini? Unit sedia ada yang guna kategori ni tak akan terjejas, cuma tak boleh pilih untuk unit baru.', { bahaya: true }))) return
    await padamKategori(id)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-2">
        Setiap unit UBKS kena ditagging kategori bila dicipta - senang merentasi data (contoh: Papan Kehadiran UBKS).
      </p>
      <p className="text-xs text-inkmuted mb-4">
        <strong className="text-ink">Medan "Jenis"</strong> yang tentukan sama ada kategori ni dikira sebagai Unit Beruniform/Kelab/Sukan di borang Sijil Tamat (auto-isi kokurikulum) - <strong className="text-ink">bukan</strong> "Nama Kategori" (nama tu bebas admin taip apa-apa pun, cth. boleh guna Bahasa Melayu/singkatan sendiri, sistem takkan cuba teka daripada nama).
      </p>

      {bilanganBelumJenis > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-card bg-[#FCEBEB] border border-brand-red/30 mb-4">
          <AlertTriangle size={15} className="text-brand-red shrink-0 mt-0.5" />
          <p className="text-xs text-brand-red">
            {bilanganBelumJenis} kategori belum tetapkan Jenis (lihat "-- Pilih Jenis --" merah di bawah) - auto-isi kokurikulum di Sijil Tamat <strong>TAK berfungsi</strong> untuk kategori tu sehingga ditetapkan.
          </p>
        </div>
      )}

      <form onSubmit={tambah} className="flex flex-wrap items-end gap-2 mb-5">
        <div>
          <label htmlFor="namaKategori" className="block text-xs font-medium text-ink mb-1">Nama Kategori <span className="text-brand-red">*</span></label>
          <input
            id="namaKategori"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="contoh: Unit Beruniform"
            className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <div>
          <label htmlFor="kodKategori" className="block text-xs font-medium text-ink mb-1">Kod (ringkas) <span className="text-brand-red">*</span></label>
          <input
            id="kodKategori"
            type="text"
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="contoh: UB"
            maxLength={4}
            className="h-11 w-24 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <div>
          <label htmlFor="jenisKategori" className="block text-xs font-medium text-ink mb-1">Jenis <span className="text-brand-red">*</span></label>
          <select
            id="jenisKategori"
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="h-11 px-3 rounded-card border border-border bg-surface text-sm"
          >
            <option value="">-- Pilih Jenis --</option>
            {JENIS_KATEGORI.map((j) => (
              <option key={j.nilai} value={j.nilai}>{j.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={menyimpan} className="h-11 px-4 rounded-card bg-brand-red text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
          <Plus size={16} /> Tambah
        </button>
      </form>
      {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada kategori lagi. Cadangan: Unit Beruniform (UB), Kelab (K), Sukan (S).</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-3 p-3 rounded-card border border-border bg-surface flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-ink truncate">{k.nama}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base text-inkmuted shrink-0">{k.kod}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={k.jenis ?? ''}
                  onChange={(e) => ubahJenis(k.id, e.target.value)}
                  className="h-9 px-2 rounded-card border text-xs bg-surface"
                  style={!k.jenis ? { borderColor: '#C8102E', color: '#C8102E' } : { borderColor: '#E5E5E5' }}
                >
                  <option value="">-- Pilih Jenis --</option>
                  {JENIS_KATEGORI.map((j) => (
                    <option key={j.nilai} value={j.nilai}>{j.label}</option>
                  ))}
                </select>
                <button onClick={() => padam(k.id)} aria-label="Padam kategori" className="p-2 rounded-card hover:bg-base text-brand-red">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
