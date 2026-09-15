import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Upload, Search, X } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { uraiCSVBaris } from '../../lib/csvUtils.js'
import {
  useKkgsAhliSenarai, tambahAhliKkgs, kemaskiniAhliKkgs, padamAhliKkgs, importNamaPukalKkgs,
} from '../../hooks/useKkgsAhli.js'
import { JAWATAN_KKGS, STATUS_KEAHLIAN, labelStatusKeahlian, NAMA_BULAN } from './kkgsConstants.js'

const MEDAN_KOSONG = { nama: '', emel: '', jawatan: 'Ahli', statusKeahlian: 'aktif', bulanMula: 1, bulanTamat: 12 }

function WarnaStatus(status) {
  return status === 'aktif' ? { bg: '#E1F5EE', teks: '#0F6E56' } : { bg: '#FCEFC7', teks: '#8A6D00' }
}

function ModalAhli({ open, dataAwal, onTutup, onSimpan }) {
  const [data, setData] = useState(dataAwal ?? MEDAN_KOSONG)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  function u(k, v) {
    setData((d) => ({ ...d, [k]: v }))
  }

  async function simpan() {
    if (!data.nama.trim()) return setRalat('Sila isi nama.')
    setRalat(null)
    setMenyimpan(true)
    try {
      await onSimpan(data)
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
          <h3 className="text-sm font-bold text-ink">{dataAwal ? 'Edit Ahli' : 'Tambah Ahli'}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Nama</label>
            <input type="text" value={data.nama} onChange={(e) => u('nama', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Emel <span className="text-inkmuted font-normal">(perlu untuk kelayakan Jawatankuasa)</span></label>
            <input type="email" value={data.emel} onChange={(e) => u('emel', e.target.value)} placeholder="nama@moe-dl.edu.my" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Jawatan</label>
            <select value={data.jawatan} onChange={(e) => u('jawatan', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {JAWATAN_KKGS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Status Keahlian</label>
            <select value={data.statusKeahlian} onChange={(e) => u('statusKeahlian', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {STATUS_KEAHLIAN.map((s) => <option key={s.nilai} value={s.nilai}>{s.label}</option>)}
            </select>
            <p className="text-[10px] text-inkmuted mt-1">Bukan "Aktif" = tak diminta bayar yuran lagi, tapi baki/sejarah bayaran lama kekal.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Bulan Mula Bayar</label>
              <select value={data.bulanMula ?? 1} onChange={(e) => u('bulanMula', Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
                {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Bulan Tamat Bayar</label>
              <select value={data.bulanTamat ?? 12} onChange={(e) => u('bulanTamat', Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
                {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
              </select>
            </div>
          </div>
          <p className="text-[10px] text-inkmuted -mt-2">Lalai Januari-Disember (ikut tetapan tahun). Ubah kalau ahli baru sertai lewat (cth. join Jun = Bulan Mula: Jun) atau ahli keluar awal.</p>
        </div>
        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

function ModalImport({ open, senaraiSediaAda, onTutup, onSelesai, user }) {
  const [teks, setTeks] = useState('')
  const [memproses, setMemproses] = useState(false)
  const [hasil, setHasil] = useState(null)
  const [ralat, setRalat] = useState(null)
  const inputFailRef = useRef(null)

  if (!open) return null

  async function bacaFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    const kandungan = await fail.text()
    setTeks(kandungan)
  }

  function uraiNamaDariTeks(kandungan) {
    // Sokong CSV sebenar (lajur pertama) ATAU senarai nama, satu setiap baris.
    const baris = uraiCSVBaris(kandungan)
    return baris.map((b) => b[0]).filter(Boolean)
  }

  async function proses() {
    setRalat(null)
    const senaraiNama = uraiNamaDariTeks(teks)
    if (senaraiNama.length === 0) return setRalat('Tiada nama dikesan. Tampal senarai nama (satu setiap baris) atau muat naik CSV.')
    setMemproses(true)
    try {
      const r = await importNamaPukalKkgs(senaraiNama, senaraiSediaAda, user.uid)
      setHasil(r)
      onSelesai()
    } catch (err) {
      setRalat(err.message || 'Gagal import.')
    } finally {
      setMemproses(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Import Nama Pukal</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>

        {hasil ? (
          <div>
            <p className="text-sm text-ink mb-1">✅ {hasil.ditambah} ahli baharu ditambah.</p>
            {hasil.dilangkau > 0 && <p className="text-xs text-inkmuted mb-3">{hasil.dilangkau} nama dilangkau (dah wujud dalam senarai).</p>}
            <button onClick={onTutup} className="w-full h-11 rounded-card bg-brand-red text-white text-sm font-semibold">Selesai</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-inkmuted mb-3">Tampal senarai nama (satu setiap baris) atau muat naik fail CSV/teks. Ahli baharu lalai jawatan "Ahli" &amp; status "Aktif" - emel/jawatan boleh diisi satu-satu lepas ni.</p>
            <button onClick={() => inputFailRef.current?.click()} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink mb-3">
              <Upload size={14} /> Pilih Fail CSV/Teks
            </button>
            <input ref={inputFailRef} type="file" accept=".csv,.txt" onChange={bacaFail} className="hidden" />
            <textarea
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              rows={8}
              placeholder={'Ahmad bin Ali\nSiti binti Hassan\n...'}
              className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm"
            />
            {ralat && <p className="text-xs text-brand-red mt-2">{ralat}</p>}
            <button onClick={proses} disabled={memproses} className="w-full h-11 mt-3 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {memproses ? 'Memproses…' : 'Import'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function SenaraiAhliKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { senarai, loading, muatSemula } = useKkgsAhliSenarai()
  const [carian, setCarian] = useState('')
  const [tunjukForm, setTunjukForm] = useState(false)
  const [tunjukImport, setTunjukImport] = useState(false)
  const [ahliEdit, setAhliEdit] = useState(null)

  const disenarai = senarai.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))

  async function simpan(data) {
    if (ahliEdit) {
      await kemaskiniAhliKkgs(ahliEdit.id, data, user.uid)
    } else {
      await tambahAhliKkgs(data, user.uid)
    }
    setTunjukForm(false)
    setAhliEdit(null)
    muatSemula()
  }

  async function padam(a) {
    if (!(await konfirm(`Padam ${a.nama} dari senarai ahli? Rekod yuran lama dia TIDAK dipadam (kekal untuk sejarah kewangan).`, { bahaya: true }))) return
    await padamAhliKkgs(a.id)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">Senarai induk semua ahli KKGS - jawatan &amp; status keahlian diurus di sini (page Jawatankuasa cuma paparan tapisan dari senarai ni).</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          type="text" value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama…"
          className="flex-1 min-w-[160px] h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
        <button onClick={() => setTunjukImport(true)} className="flex items-center gap-1.5 h-11 px-3 rounded-card border border-border text-xs font-semibold text-ink">
          <Upload size={14} /> Import
        </button>
        <button onClick={() => { setAhliEdit(null); setTunjukForm(true) }} className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold">
          <Plus size={14} /> Tambah Ahli
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada ahli lagi.</p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((a) => {
            const warna = WarnaStatus(a.statusKeahlian)
            return (
              <div key={a.id} className="flex items-center gap-3 p-3.5 rounded-card border border-border bg-surface">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{a.nama}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    {a.jawatan && a.jawatan !== 'Ahli' && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FDEAEA] text-brand-red">{a.jawatan}</span>}
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: warna.bg, color: warna.teks }}>{labelStatusKeahlian(a.statusKeahlian)}</span>
                    {!a.emel && <span className="text-[10px] text-inkmuted">Tiada emel</span>}
                  </div>
                </div>
                <button onClick={() => { setAhliEdit(a); setTunjukForm(true) }} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><Pencil size={15} /></button>
                <button onClick={() => padam(a)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red"><Trash2 size={15} /></button>
              </div>
            )
          })}
        </div>
      )}

      <ModalAhli key={ahliEdit?.id ?? 'baru'} open={tunjukForm} dataAwal={ahliEdit} onTutup={() => { setTunjukForm(false); setAhliEdit(null) }} onSimpan={simpan} />
      <ModalImport open={tunjukImport} senaraiSediaAda={senarai} onTutup={() => setTunjukImport(false)} onSelesai={muatSemula} user={user} />
    </div>
  )
}
