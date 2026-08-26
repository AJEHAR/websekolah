import { useState } from 'react'
import { X, Plus, Trash2, ChevronDown } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { tambahTakwimUnit, padamTakwimUnit } from '../../hooks/useTakwimUnit.js'
import { susunHierarkiUnit } from './kalendarUtils.js'

// Warna palet cadangan (elak admin perlu fikir kod hex sendiri setiap kali)
const PALET_WARNA = ['#C8102E', '#2563EB', '#16A34A', '#F2C230', '#7C3AED', '#EA580C', '#0891B2', '#DB2777']

// Unit (peringkat atas, cth. "Kokurikulum") vs Sub Unit (dulu dipanggil
// "Panitia" - peringkat bawah, terikat pada SATU Unit induk, cth. "Pengakap"
// di bawah "Kokurikulum"). Struktur 2 peringkat sahaja (bukan tak terhad)
// - cukup untuk keperluan sekolah & elak borang jadi terlalu rumit.
export default function UrusUnitTakwimModal({ open, senarai, user, onClose, onSelesai }) {
  const { konfirm, amaran } = useDialog()
  const [peringkat, setPeringkat] = useState('unit') // 'unit' | 'subUnit'
  const [unitIndukId, setUnitIndukId] = useState('')
  const [namaBaru, setNamaBaru] = useState('')
  const [warnaBaru, setWarnaBaru] = useState(PALET_WARNA[0])
  const [menambah, setMenambah] = useState(false)

  const hierarki = susunHierarkiUnit(senarai)
  const senaraiUnitInduk = hierarki // setiap entri dah ada .subUnit

  if (!open) return null

  async function tambah() {
    if (!namaBaru.trim()) return
    if (peringkat === 'subUnit' && !unitIndukId) return
    setMenambah(true)
    try {
      await tambahTakwimUnit(namaBaru.trim(), warnaBaru, user.uid, peringkat === 'subUnit' ? unitIndukId : null)
      setNamaBaru('')
      onSelesai()
    } finally {
      setMenambah(false)
    }
  }

  async function padam(u) {
    if (!u.unitIndukId && u.subUnit?.length > 0) {
      await amaran(`Padam Sub Unit di bawah "${u.namaUnit}" dahulu sebelum padam unit ni.`)
      return
    }
    const jenis = u.unitIndukId ? 'Sub Unit' : 'Unit'
    if (!(await konfirm(`Padam ${jenis} "${u.namaUnit}"? Acara sedia ada yang guna ${jenis.toLowerCase()} ni akan kekal tapi tanpa label.`, { bahaya: true }))) return
    await padamTakwimUnit(u.id)
    onSelesai()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Urus Unit &amp; Sub Unit</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 p-3 rounded-card bg-base">
          <div className="flex gap-1 bg-surface rounded-full p-1 mb-3 border border-border">
            <button
              type="button"
              onClick={() => { setPeringkat('unit'); setUnitIndukId('') }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors ${peringkat === 'unit' ? 'bg-brand-red text-white' : 'text-inkmuted'}`}
            >
              Unit (induk)
            </button>
            <button
              type="button"
              onClick={() => setPeringkat('subUnit')}
              disabled={senaraiUnitInduk.length === 0}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-40 ${peringkat === 'subUnit' ? 'bg-brand-red text-white' : 'text-inkmuted'}`}
            >
              Sub Unit
            </button>
          </div>

          {peringkat === 'subUnit' && (
            <div className="relative mb-2">
              <select
                value={unitIndukId}
                onChange={(e) => setUnitIndukId(e.target.value)}
                className="w-full h-10 pl-3 pr-8 rounded-card border border-border bg-surface text-sm appearance-none"
              >
                <option value="">Pilih Unit induk…</option>
                {senaraiUnitInduk.map((u) => (
                  <option key={u.id} value={u.id}>{u.namaUnit}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-inkmuted pointer-events-none" />
            </div>
          )}

          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder={peringkat === 'unit' ? 'Nama Unit baharu… (cth. Kokurikulum)' : 'Nama Sub Unit baharu… (cth. Pengakap)'}
            className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm mb-2"
          />
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {PALET_WARNA.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWarnaBaru(w)}
                aria-label={`Warna ${w}`}
                className="h-6 w-6 rounded-full shrink-0"
                style={{ backgroundColor: w, outline: warnaBaru === w ? '2px solid #1A1A1A' : 'none', outlineOffset: '2px' }}
              />
            ))}
          </div>
          <button
            onClick={tambah}
            disabled={menambah || !namaBaru.trim() || (peringkat === 'subUnit' && !unitIndukId)}
            className="w-full h-10 rounded-card bg-brand-red text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus size={14} /> {peringkat === 'unit' ? 'Tambah Unit' : 'Tambah Sub Unit'}
          </button>
        </div>

        <div className="space-y-3">
          {senaraiUnitInduk.length === 0 && (
            <p className="text-xs text-inkmuted text-center py-4">Tiada unit lagi.</p>
          )}
          {senaraiUnitInduk.map((u) => (
            <div key={u.id}>
              <div className="flex items-center gap-2 p-2 rounded-card bg-base">
                <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: u.warna }} />
                <span className="text-sm font-semibold text-ink flex-1 truncate">{u.namaUnit}</span>
                <button onClick={() => padam(u)} aria-label="Padam" className="p-1 text-brand-red shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              {u.subUnit.length > 0 && (
                <div className="mt-1 ml-3 pl-2.5 border-l-2 space-y-1" style={{ borderColor: u.warna }}>
                  {u.subUnit.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-card hover:bg-base">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.warna }} />
                      <span className="text-xs text-ink flex-1 truncate">{s.namaUnit}</span>
                      <button onClick={() => padam(s)} aria-label="Padam" className="p-1 text-brand-red shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
