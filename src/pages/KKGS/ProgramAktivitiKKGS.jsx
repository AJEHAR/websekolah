import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, Printer, CheckCircle2, PauseCircle, Circle } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useCetak } from '../../hooks/useCetak.js'
import {
  useKkgsProgramTahun, tambahProgramKkgs, kemaskiniProgramKkgs, tukarStatusProgramKkgs, padamProgramKkgs,
} from '../../hooks/useKkgsProgram.js'
import { STATUS_PROGRAM, labelStatusProgram, PILIHAN_TAHUN_KKGS, TAHUN_SEMASA } from './kkgsConstants.js'
import LaporanProgramKKGS from './LaporanProgramKKGS.jsx'

const MEDAN_KOSONG = { nama: '', tarikh: '', catatan: '', status: 'akan-datang' }

function WarnaStatus(status) {
  if (status === 'selesai') return { bg: '#E1F5EE', teks: '#0F6E56' }
  if (status === 'tangguh') return { bg: '#FDEAEA', teks: '#C8102E' }
  return { bg: '#FCEFC7', teks: '#8A6D00' } // akan-datang
}

function formatTarikhPaparan(t) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ModalProgram({ open, dataAwal, onTutup, onSimpan }) {
  const [data, setData] = useState(dataAwal ?? MEDAN_KOSONG)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  function u(k, v) {
    setData((d) => ({ ...d, [k]: v }))
  }

  async function simpan() {
    if (!data.nama.trim()) return setRalat('Sila isi nama program/aktiviti.')
    if (!data.tarikh) return setRalat('Sila isi tarikh.')
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
          <h3 className="text-sm font-bold text-ink">{dataAwal ? 'Edit Program/Aktiviti' : 'Tambah Program/Aktiviti'}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Nama Program/Aktiviti</label>
            <input type="text" value={data.nama} onChange={(e) => u('nama', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tarikh</label>
            <input type="date" value={data.tarikh} onChange={(e) => u('tarikh', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Status</label>
            <select value={data.status} onChange={(e) => u('status', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {STATUS_PROGRAM.map((s) => <option key={s.nilai} value={s.nilai}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Catatan <span className="text-inkmuted font-normal">(pilihan)</span></label>
            <textarea value={data.catatan} onChange={(e) => u('catatan', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm" />
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

// Senarai Program/Aktiviti KKGS - ditapis ikut tahun (ambil dari medan
// "tarikh"), boleh tambah/edit/padam, tanda status pantas (selesai/
// tangguh) tanpa buka borang, dan cetak laporan PDF tahunan. Kebenaran
// urus ikut admin seksyen 'kkgs' sahaja - sama corak macam Senarai Ahli/
// Yuran/Kewangan/Claim (lantik lewat Panel Admin, boleh ramai AJK).
export default function ProgramAktivitiKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { adaSeksyen } = useIsAdmin(user)
  const bolehUrus = adaSeksyen('kkgs')
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const { senarai, loading, muatSemula } = useKkgsProgramTahun(tahun)
  const [tunjukForm, setTunjukForm] = useState(false)
  const [programEdit, setProgramEdit] = useState(null)
  const [dataCetak, setDataCetak] = useCetak(() => `Laporan Program KKGS ${tahun}`)

  async function simpan(data) {
    if (programEdit) {
      await kemaskiniProgramKkgs(programEdit.id, data, user.uid)
    } else {
      await tambahProgramKkgs(data, user.uid)
    }
    setTunjukForm(false)
    setProgramEdit(null)
    muatSemula()
  }

  async function padam(p) {
    if (!(await konfirm(`Padam program "${p.nama}"?`, { bahaya: true }))) return
    await padamProgramKkgs(p.id)
    muatSemula()
  }

  async function tukarStatus(p, status) {
    await tukarStatusProgramKkgs(p.id, status, user.uid)
    muatSemula()
  }

  function cetak() {
    setDataCetak({ senarai, tahun })
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">Senarai program/aktiviti KKGS mengikut tahun.{!bolehUrus && ' Anda boleh LIHAT sahaja - hubungi admin KKGS untuk buat perubahan.'}</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="h-11 px-3 rounded-card border border-border bg-surface text-sm">
          {PILIHAN_TAHUN_KKGS.map((t) => (
            <option key={t} value={t}>{t}{t === TAHUN_SEMASA ? ' (semasa)' : ''}</option>
          ))}
        </select>
        <button onClick={cetak} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
          <Printer size={14} /> Cetak PDF
        </button>
        {bolehUrus && (
          <button onClick={() => { setProgramEdit(null); setTunjukForm(true) }} className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold ml-auto">
            <Plus size={14} /> Tambah Program
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada program direkodkan untuk tahun {tahun} lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((p) => {
            const warna = WarnaStatus(p.status)
            return (
              <div key={p.id} className="p-3.5 rounded-card border border-border bg-surface">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{p.nama}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-[10px] text-inkmuted">{formatTarikhPaparan(p.tarikh)}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: warna.bg, color: warna.teks }}>{labelStatusProgram(p.status)}</span>
                    </div>
                    {p.catatan && <p className="text-xs text-inkmuted mt-1.5 whitespace-pre-wrap">{p.catatan}</p>}
                  </div>
                  {bolehUrus && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setProgramEdit(p); setTunjukForm(true) }} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><Pencil size={15} /></button>
                      <button onClick={() => padam(p)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
                {bolehUrus && (
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                    <button onClick={() => tukarStatus(p, 'akan-datang')} disabled={p.status === 'akan-datang'} className="flex items-center gap-1 h-8 px-2.5 rounded-card border border-border text-[11px] font-semibold text-ink disabled:opacity-40">
                      <Circle size={12} /> Akan Datang
                    </button>
                    <button onClick={() => tukarStatus(p, 'selesai')} disabled={p.status === 'selesai'} className="flex items-center gap-1 h-8 px-2.5 rounded-card border border-border text-[11px] font-semibold text-ink disabled:opacity-40">
                      <CheckCircle2 size={12} /> Selesai
                    </button>
                    <button onClick={() => tukarStatus(p, 'tangguh')} disabled={p.status === 'tangguh'} className="flex items-center gap-1 h-8 px-2.5 rounded-card border border-border text-[11px] font-semibold text-ink disabled:opacity-40">
                      <PauseCircle size={12} /> Tangguh
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ModalProgram key={programEdit?.id ?? 'baru'} open={tunjukForm} dataAwal={programEdit} onTutup={() => { setTunjukForm(false); setProgramEdit(null) }} onSimpan={simpan} />
      {dataCetak && <LaporanProgramKKGS {...dataCetak} />}
    </div>
  )
}
