import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, X } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsKewanganSenarai, tambahKewanganKkgs, padamKewanganKkgs } from '../../hooks/useKkgsKewangan.js'
import { adalahJawatankuasaSaya } from './kkgsConstants.js'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function ModalTransaksi({ open, onTutup, onSimpan }) {
  const [tarikh, setTarikh] = useState(todayISO())
  const [perkara, setPerkara] = useState('')
  const [jenis, setJenis] = useState('masuk')
  const [jumlah, setJumlah] = useState('')
  const [catatan, setCatatan] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function simpan() {
    if (!perkara.trim()) return setRalat('Sila isi perkara.')
    if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
    setRalat(null)
    setMenyimpan(true)
    try {
      await onSimpan({ tarikh, perkara, jenis, jumlah, catatan })
      setPerkara(''); setJumlah(''); setCatatan('')
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Rekod Transaksi</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setJenis('masuk')} className={`h-11 rounded-card border-2 text-sm font-semibold ${jenis === 'masuk' ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]' : 'border-border text-inkmuted'}`}>Masuk</button>
            <button type="button" onClick={() => setJenis('keluar')} className={`h-11 rounded-card border-2 text-sm font-semibold ${jenis === 'keluar' ? 'border-brand-red bg-[#FDEAEA] text-brand-red' : 'border-border text-inkmuted'}`}>Keluar</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tarikh</label>
            <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Perkara</label>
            <input type="text" value={perkara} onChange={(e) => setPerkara(e.target.value)} placeholder="cth. Yuran Jun 2026 / Sewa dewan" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Jumlah (RM)</label>
            <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Catatan (pilihan)</label>
            <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
        </div>
        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

export default function KewanganKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { senarai: senaraiAhli } = useKkgsAhliSenarai()
  const { senarai, loading, muatSemula } = useKkgsKewanganSenarai()
  const [tunjukForm, setTunjukForm] = useState(false)

  const sayaJawatankuasa = adalahJawatankuasaSaya(senaraiAhli, user.email)

  const jumlahMasuk = senarai.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const jumlahKeluar = senarai.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  const baki = jumlahMasuk - jumlahKeluar

  async function simpan(data) {
    await tambahKewanganKkgs(data, user.uid)
    setTunjukForm(false)
    muatSemula()
  }

  async function padam(t) {
    if (!(await konfirm('Padam transaksi ni?', { bahaya: true }))) return
    await padamKewanganKkgs(t.id)
    muatSemula()
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-card border border-border bg-surface p-3 text-center">
          <p className="text-[10px] text-inkmuted">Masuk</p>
          <p className="text-sm font-bold text-[#0F6E56]">RM {jumlahMasuk.toFixed(2)}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-3 text-center">
          <p className="text-[10px] text-inkmuted">Keluar</p>
          <p className="text-sm font-bold text-brand-red">RM {jumlahKeluar.toFixed(2)}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-3 text-center">
          <p className="text-[10px] text-inkmuted">Baki</p>
          <p className="text-sm font-bold text-ink">RM {baki.toFixed(2)}</p>
        </div>
      </div>

      {sayaJawatankuasa && (
        <button onClick={() => setTunjukForm(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card bg-brand-red text-white text-xs font-semibold mb-4">
          <Plus size={14} /> Rekod Transaksi
        </button>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada transaksi lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-card border border-border bg-surface">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{t.perkara}</p>
                <p className="text-xs text-inkmuted">{t.tarikh}{t.catatan && ` · ${t.catatan}`}</p>
              </div>
              <p className="text-sm font-bold shrink-0" style={{ color: t.jenis === 'masuk' ? '#0F6E56' : '#C8102E' }}>
                {t.jenis === 'masuk' ? '+' : '-'} RM {t.jumlah.toFixed(2)}
              </p>
              {sayaJawatankuasa && (
                <button onClick={() => padam(t)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red shrink-0"><Trash2 size={15} /></button>
              )}
            </div>
          ))}
        </div>
      )}

      <ModalTransaksi open={tunjukForm} onTutup={() => setTunjukForm(false)} onSimpan={simpan} />
    </div>
  )
}
