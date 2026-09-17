import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Upload, X, CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { uraiCSVBaris } from '../../lib/csvUtils.js'
import {
  useKkgsAhliSenarai, tambahAhliKkgs, kemaskiniAhliKkgs, padamAhliKkgs, padamAhliPukalKkgs, importNamaPukalKkgs,
} from '../../hooks/useKkgsAhli.js'
import { JAWATAN_KKGS, STATUS_KEAHLIAN, labelStatusKeahlian, labelJawatan } from './kkgsConstants.js'

const MEDAN_KOSONG = { nama: '', emel: '', jawatan: 'Ahli', statusKeahlian: 'aktif' }

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
            <label className="block text-xs font-medium text-ink mb-1">Emel <span className="text-inkmuted font-normal">(pilihan, rujukan sahaja)</span></label>
            <input type="email" value={data.emel} onChange={(e) => u('emel', e.target.value)} placeholder="nama@moe-dl.edu.my" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Jawatan</label>
            <select value={data.jawatan} onChange={(e) => u('jawatan', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {JAWATAN_KKGS.map((j) => <option key={j} value={j}>{labelJawatan(j)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Status Keahlian</label>
            <select value={data.statusKeahlian} onChange={(e) => u('statusKeahlian', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {STATUS_KEAHLIAN.map((s) => <option key={s.nilai} value={s.nilai}>{s.label}</option>)}
            </select>
            <p className="text-[10px] text-inkmuted mt-1">Bukan "Aktif" = tak diminta bayar yuran lagi, tapi baki/sejarah bayaran lama kekal.</p>
          </div>
          <p className="text-[10px] text-inkmuted bg-base rounded-card p-2.5">Tempoh Bulan Mula/Tamat Bayar kini diurus di page <strong>Yuran Sumbangan</strong> (ikut tahun) - lalai ahli bayar PENUH TAHUN, ubah di sana kalau ahli ni join lewat/keluar awal TAHUN SEMASA sahaja.</p>
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
    setTeks(await fail.text())
  }

  async function proses() {
    setRalat(null)
    const senaraiNama = uraiCSVBaris(teks).map((b) => b[0]).filter(Boolean)
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
            <p className="text-xs text-inkmuted mb-3">Tampal senarai nama (satu setiap baris) atau muat naik fail CSV/teks. Ahli baharu lalai jawatan "Ahli", status "Aktif", Januari-Disember.</p>
            <button onClick={() => inputFailRef.current?.click()} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink mb-3">
              <Upload size={14} /> Pilih Fail CSV/Teks
            </button>
            <input ref={inputFailRef} type="file" accept=".csv,.txt" onChange={bacaFail} className="hidden" />
            <textarea value={teks} onChange={(e) => setTeks(e.target.value)} rows={8} placeholder={'Ahmad bin Ali\nSiti binti Hassan\n...'} className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm" />
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

// Satu baris ahli - dikongsi antara seksyen Aktif & Tak Aktif (elak
// duplikasi JSX).
function BarisAhli({ a, bolehUrus, terpilih, onTogolPilih, onEdit, onPadam }) {
  const warna = WarnaStatus(a.statusKeahlian)
  return (
    <div className="flex items-center gap-2.5 p-3.5 rounded-card border border-border bg-surface">
      {bolehUrus && (
        <button onClick={() => onTogolPilih(a.id)} aria-label="Pilih" className="shrink-0 text-inkmuted">
          {terpilih.has(a.id) ? <CheckSquare size={18} className="text-brand-red" /> : <Square size={18} />}
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink truncate">{a.nama}</p>
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          {a.jawatan && a.jawatan !== 'Ahli' && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FDEAEA] text-brand-red">{a.jawatan}</span>}
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: warna.bg, color: warna.teks }}>{labelStatusKeahlian(a.statusKeahlian)}</span>
        </div>
      </div>
      {bolehUrus && (
        <>
          <button onClick={() => onEdit(a)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><Pencil size={15} /></button>
          <button onClick={() => onPadam(a)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red"><Trash2 size={15} /></button>
        </>
      )}
    </div>
  )
}

export default function SenaraiAhliKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { adaSeksyen } = useIsAdmin(user)
  const bolehUrus = adaSeksyen('kkgs')
  const { senarai, loading, muatSemula } = useKkgsAhliSenarai()
  const [carian, setCarian] = useState('')
  const [tunjukForm, setTunjukForm] = useState(false)
  const [tunjukImport, setTunjukImport] = useState(false)
  const [ahliEdit, setAhliEdit] = useState(null)
  const [terpilih, setTerpilih] = useState(new Set())
  // Ahli tak aktif (bersara/pindah/berhenti) - collapsed LALAI, senarai ni
  // biasanya cuma untuk rujukan sekali-sekala (bukan urusan harian AJK).
  const [tunjukTakAktif, setTunjukTakAktif] = useState(false)

  const disenarai = senarai.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))
  const disenaraiAktif = disenarai.filter((a) => a.statusKeahlian === 'aktif')
  const disenaraiTakAktif = disenarai.filter((a) => a.statusKeahlian !== 'aktif')

  function togolPilih(id) {
    setTerpilih((s) => {
      const baru = new Set(s)
      if (baru.has(id)) baru.delete(id)
      else baru.add(id)
      return baru
    })
  }

  const semuaDipilih = disenarai.length > 0 && disenarai.every((a) => terpilih.has(a.id))
  function togolPilihSemua() {
    setTerpilih((s) => {
      if (semuaDipilih) {
        // Nyahpilih SEMUA yang kelihatan sekarang (carian aktif) -
        // pilihan ahli LAIN (di luar carian semasa) kekal tak berubah.
        const baru = new Set(s)
        disenarai.forEach((a) => baru.delete(a.id))
        return baru
      }
      // Pilih SEMUA yang kelihatan sekarang - GABUNG dengan pilihan
      // sedia ada (bukan ganti terus), staff boleh cari lain & tambah
      // lagi kepada pilihan sama.
      const baru = new Set(s)
      disenarai.forEach((a) => baru.add(a.id))
      return baru
    })
  }

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

  async function padamPukal() {
    if (!(await konfirm(`Padam ${terpilih.size} ahli terpilih? Rekod yuran lama TIDAK dipadam.`, { bahaya: true }))) return
    await padamAhliPukalKkgs([...terpilih])
    setTerpilih(new Set())
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">Senarai induk semua ahli KKGS - jawatan &amp; status keahlian diurus di sini (page Jawatankuasa cuma paparan tapisan dari senarai ni).{!bolehUrus && ' Anda boleh LIHAT sahaja - hubungi admin KKGS untuk buat perubahan.'}</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <input type="text" value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama…" className="w-full h-11 pl-3 pr-9 rounded-card border border-border bg-surface text-sm" />
          {carian && (
            <button onClick={() => setCarian('')} aria-label="Kosongkan carian" className="absolute right-3 top-1/2 -translate-y-1/2 text-inkmuted"><X size={14} /></button>
          )}
        </div>
        {bolehUrus && (
          <>
            <button onClick={() => setTunjukImport(true)} className="flex items-center gap-1.5 h-11 px-3 rounded-card border border-border text-xs font-semibold text-ink">
              <Upload size={14} /> Import
            </button>
            <button onClick={() => { setAhliEdit(null); setTunjukForm(true) }} className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold">
              <Plus size={14} /> Tambah Ahli
            </button>
          </>
        )}
      </div>

      {bolehUrus && disenarai.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <button onClick={togolPilihSemua} className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            {semuaDipilih ? <CheckSquare size={16} className="text-brand-red" /> : <Square size={16} />}
            {semuaDipilih ? 'Nyahpilih Semua' : `Pilih Semua (${disenarai.length})`}
          </button>
        </div>
      )}

      {bolehUrus && terpilih.size > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2.5 rounded-card bg-base">
          <p className="text-xs text-ink flex-1">{terpilih.size} ahli dipilih</p>
          <button onClick={padamPukal} className="h-9 px-3 rounded-card border border-brand-red text-brand-red text-xs font-semibold">Padam Pukal</button>
          <button onClick={() => setTerpilih(new Set())} className="h-9 px-2 text-xs text-inkmuted">Batal</button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada ahli lagi.</p>
      ) : (
        <>
          {disenaraiAktif.length === 0 ? (
            <p className="text-sm text-inkmuted mb-4">Tiada ahli aktif padan carian.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {disenaraiAktif.map((a) => (
                <BarisAhli key={a.id} a={a} bolehUrus={bolehUrus} terpilih={terpilih} onTogolPilih={togolPilih} onEdit={(a) => { setAhliEdit(a); setTunjukForm(true) }} onPadam={padam} />
              ))}
            </div>
          )}

          {disenaraiTakAktif.length > 0 && (
            <div>
              <button
                onClick={() => setTunjukTakAktif((t) => !t)}
                className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-2 w-full"
              >
                {tunjukTakAktif ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                Bersara / Pindah / Berhenti ({disenaraiTakAktif.length})
              </button>
              {tunjukTakAktif && (
                <div className="space-y-2">
                  {disenaraiTakAktif.map((a) => (
                    <BarisAhli key={a.id} a={a} bolehUrus={bolehUrus} terpilih={terpilih} onTogolPilih={togolPilih} onEdit={(a) => { setAhliEdit(a); setTunjukForm(true) }} onPadam={padam} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ModalAhli key={ahliEdit?.id ?? 'baru'} open={tunjukForm} dataAwal={ahliEdit} onTutup={() => { setTunjukForm(false); setAhliEdit(null) }} onSimpan={simpan} />
      <ModalImport open={tunjukImport} senaraiSediaAda={senarai} onTutup={() => setTunjukImport(false)} onSelesai={muatSemula} user={user} />
    </div>
  )
}
