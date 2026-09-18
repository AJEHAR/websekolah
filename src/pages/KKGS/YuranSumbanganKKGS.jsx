import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, X, Settings, Printer, Search, ChevronDown, ChevronRight, Users, CheckSquare, Square, UserMinus } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsYuranTahun, tambahYuranKkgs, padamYuranKkgs } from '../../hooks/useKkgsYuran.js'
import { useKkgsTetapanYuran, simpanTetapanYuran } from '../../hooks/useKkgsTetapanYuran.js'
import {
  useKkgsKeahlianTahunSenarai, simpanKeahlianTahun, buangDariRosterTahun, simpanRosterPukal,
  salinRosterTahunLepas, isiRosterAktifSemasa, isiRosterSemuaAhli,
} from '../../hooks/useKkgsKeahlianTahun.js'
import { useCetak } from '../../hooks/useCetak.js'
import { kiraPeruntukanYuran, NAMA_BULAN, PILIHAN_TAHUN_KKGS, TAHUN_SEMASA, labelStatusKeahlian } from './kkgsConstants.js'
import ResitYuranKKGS from './ResitYuranKKGS.jsx'
import LaporanYuranKKGS from './LaporanYuranKKGS.jsx'

// Pemalar tahun DIKONGSI (kkgsConstants.js) - elak tak konsisten dengan
// Kewangan (bug #5 - dulu dua page guna senarai tahun berlainan).

// Lebar lajur tetap (px) - lajur Bil/Nama "melekat" (sticky) semasa skrol
// mendatar merentasi lajur bulan - SAMA teknik dengan Papan RMT. Jadual
// ni HANYA untuk skrin lebar (sm: ke atas) - telefon guna kad (di bawah).
const LEBAR = { bil: 36, nama: 160, bulan: 64 }
const KIRI = { bil: 0, nama: LEBAR.bil }

function WarnaBulan(status) {
  if (status === 'penuh') return { bg: '#0F6E56', teks: '#fff' }
  if (status === 'separuh') return { bg: '#F5C344', teks: '#5C4400' }
  return { bg: 'transparent', teks: '#C9C9C9' }
}

function ModalTetapan({ open, tetapan, tahun, onTutup, onSimpan }) {
  const [bilanganBulan, setBilanganBulan] = useState(tetapan.bilanganBulan)
  const [yuranBulanan, setYuranBulanan] = useState(tetapan.yuranBulanan)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    try {
      await onSimpan({ bilanganBulan, yuranBulanan })
      onTutup()
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Tetapan Yuran {tahun}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Bilangan Bulan Dikenakan</label>
            <select value={bilanganBulan} onChange={(e) => setBilanganBulan(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              <option value={10}>10 bulan (Jan - Okt)</option>
              <option value={11}>11 bulan (Jan - Nov)</option>
              <option value={12}>12 bulan (Jan - Dis)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Yuran Setiap Bulan (RM)</label>
            <input type="number" value={yuranBulanan} onChange={(e) => setYuranBulanan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
        </div>
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan Tetapan'}
        </button>
      </div>
    </div>
  )
}

function ModalBayar({ open, ahli, tahun, tarikCadangan, rekodAhli, onTutup, onSimpan, onPadam }) {
  const [tarikh, setTarikh] = useState(`${tahun}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)
  const [jumlah, setJumlah] = useState(tarikCadangan ?? '')
  const [catatan, setCatatan] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  // Amaran (bug #2) - kalau tahun tarikh tak sepadan tahun sedang
  // dilihat, bayaran akan "hilang" senyap dari paparan semasa (disimpan
  // bawah tahun lain) - beri amaran JELAS sebelum simpan, elak kekeliruan.
  const tahunTarikh = tarikh ? Number(tarikh.slice(0, 4)) : null
  const tahunTakSepadan = tahunTarikh && tahunTarikh !== tahun

  async function simpan() {
    if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
    setRalat(null)
    setMenyimpan(true)
    try {
      await onSimpan({ ahliId: ahli.id, ahliNama: ahli.nama, tarikh, jumlah, catatan })
      setJumlah(''); setCatatan('')
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
          <h3 className="text-sm font-bold text-ink">Rekod Bayaran - {ahli.nama}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tarikh</label>
            <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            {tahunTakSepadan && (
              <p className="text-[11px] text-amber-700 bg-amber-50 rounded-card px-2.5 py-1.5 mt-1.5">
                ⚠️ Tarikh ni tahun <strong>{tahunTarikh}</strong>, bukan <strong>{tahun}</strong> (tahun sedang dilihat). Bayaran akan disimpan bawah {tahunTarikh} dan TAK akan kelihatan dalam paparan {tahun} ni.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Jumlah Dibayar (RM)</label>
            <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            <p className="text-[10px] text-inkmuted mt-1">Sistem AGIH automatik ikut bulan (bulan tak cukup genap ditunjuk sebagai baki).</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Catatan (pilihan)</label>
            <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
        </div>
        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan Bayaran'}
        </button>

        {rekodAhli.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-1.5">
            <p className="text-xs font-semibold text-ink">Sejarah bayaran {tahun}</p>
            {rekodAhli.map((y) => (
              <div key={y.id} className="flex items-center justify-between text-xs">
                <span className="text-ink">{y.tarikh} {y.catatan && `· ${y.catatan}`}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-ink">RM {y.jumlah.toFixed(2)}</span>
                  <button onClick={() => onPadam(y.id)} aria-label="Padam" className="text-brand-red"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Atur Tempoh Bayar (SATU ahli, SATU tahun sahaja) - lalai "Penuh Tahun"
// (Jan - bilangan bulan tetapan) bila TIADA override; guna ni untuk
// pengecualian (ahli baharu join lewat / ahli keluar awal TAHUN NI
// SAHAJA - tahun lain tak terjejas).
function ModalTempoh({ open, ahli, tahun, bilanganBulan, override, onTutup, onSimpan, onKeluarkan }) {
  const [bulanMula, setBulanMula] = useState(override?.bulanMula ?? 1)
  const [bulanTamat, setBulanTamat] = useState(override?.bulanTamat ?? bilanganBulan)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function simpan() {
    if (bulanMula > bulanTamat) return setRalat('Bulan Mula mesti sebelum atau sama dengan Bulan Tamat.')
    setRalat(null)
    setMenyimpan(true)
    try {
      await onSimpan({ bulanMula, bulanTamat })
    } finally {
      setMenyimpan(false)
    }
  }

  async function resetPenuhTahun() {
    setMenyimpan(true)
    try {
      await onSimpan({ bulanMula: 1, bulanTamat: null })
    } finally {
      setMenyimpan(false)
    }
  }

  async function keluarkan() {
    setMenyimpan(true)
    try {
      await onKeluarkan()
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Tempoh Bayar {tahun} - {ahli.nama}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <p className="text-xs text-inkmuted mb-3">
          {override?.bulanTamat != null || (override?.bulanMula ?? 1) !== 1 ? 'Ahli ni ada tempoh KHAS untuk tahun ni.' : `Lalai: Penuh tahun (${NAMA_BULAN[0].slice(0, 3)}-${NAMA_BULAN[bilanganBulan - 1].slice(0, 3)}).`} Ubah HANYA untuk tahun {tahun} - tahun lain tak terjejas.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Bulan Mula</label>
            <select value={bulanMula} onChange={(e) => setBulanMula(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Bulan Tamat</label>
            <select value={bulanTamat} onChange={(e) => setBulanTamat(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
            </select>
          </div>
        </div>
        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan Tempoh Khas'}
        </button>
        <button onClick={resetPenuhTahun} disabled={menyimpan} className="w-full h-10 mt-2 rounded-card border border-border text-xs font-semibold text-ink disabled:opacity-60">
          Reset ke Penuh Tahun (Lalai)
        </button>
        <button onClick={keluarkan} disabled={menyimpan} className="w-full h-10 mt-2 rounded-card border border-brand-red text-xs font-semibold text-brand-red disabled:opacity-60 flex items-center justify-center gap-1.5">
          <UserMinus size={13} /> Keluarkan dari Papan {tahun}
        </button>
        <p className="text-[10px] text-inkmuted mt-1.5">Keluarkan = ahli ni tak muncul dalam papan {tahun} ni langsung (sejarah bayaran dia TIDAK dipadam).</p>
      </div>
    </div>
  )
}

// Urus SIAPA disertakan dalam papan tahun ni - pilih dari Senarai Ahli
// (select all / individu / nyahpilih), boleh cari nama. Simpan hantar
// SENARAI PENUH terpilih - komponen induk kira sendiri tambah/buang
// (banding dengan roster sedia ada) supaya tempoh khas ahli yang KEKAL
// terpilih tak disentuh langsung.
function ModalRoster({ open, senaraiAhli, rosterSet, tahun, onTutup, onSimpan }) {
  const [terpilih, setTerpilih] = useState(new Set(rosterSet))
  const [carian, setCarian] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)

  // Modal ni tak unmount bila tutup (guna `open &&` bukan render bersyarat
  // penuh) - jadi kena reset `terpilih` setiap kali DIBUKA supaya pilihan
  // lama yang tak disimpan tak "melekat" bila dibuka semula.
  useEffect(() => {
    if (open) setTerpilih(new Set(rosterSet))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const disenarai = senaraiAhli.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))
  const semuaDipilih = disenarai.length > 0 && disenarai.every((a) => terpilih.has(a.id))

  function togol(id) {
    setTerpilih((s) => {
      const baru = new Set(s)
      if (baru.has(id)) baru.delete(id)
      else baru.add(id)
      return baru
    })
  }

  function togolSemua() {
    setTerpilih((s) => {
      const baru = new Set(s)
      if (semuaDipilih) disenarai.forEach((a) => baru.delete(a.id))
      else disenarai.forEach((a) => baru.add(a.id))
      return baru
    })
  }

  async function simpan() {
    setMenyimpan(true)
    try {
      const tambah = [...terpilih].filter((id) => !rosterSet.has(id))
      const buang = [...rosterSet].filter((id) => !terpilih.has(id))
      await onSimpan({ tambah, buang })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col" style={{ height: '100dvh' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h3 className="text-sm font-bold text-ink">Urus Senarai Ahli - Papan {tahun}</h3>
        <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
      </div>
      <div className="p-3 border-b border-border shrink-0 space-y-2">
        <p className="text-xs text-inkmuted">Cuma ahli TERPILIH sahaja akan muncul dalam papan pembayaran tahun {tahun}. Rekod bayaran ahli yang dinyahpilih TIDAK dipadam.</p>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input type="text" value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama…" className="w-full h-10 pl-9 pr-3 rounded-card border border-border bg-base text-sm" />
        </div>
        <button onClick={togolSemua} className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          {semuaDipilih ? <CheckSquare size={16} className="text-brand-red" /> : <Square size={16} />}
          {semuaDipilih ? 'Nyahpilih Semua' : `Pilih Semua (${disenarai.length})`}
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
        {disenarai.length === 0 ? (
          <p className="text-sm text-inkmuted text-center py-4">Tiada padanan.</p>
        ) : (
          disenarai.map((a) => (
            <button key={a.id} type="button" onClick={() => togol(a.id)} className="w-full flex items-center gap-2.5 p-2.5 rounded-card border border-border text-left">
              {terpilih.has(a.id) ? <CheckSquare size={18} className="text-brand-red shrink-0" /> : <Square size={18} className="text-inkmuted shrink-0" />}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink truncate">{a.nama}</span>
                {a.statusKeahlian !== 'aktif' && <span className="text-[10px] text-inkmuted">{labelStatusKeahlian(a.statusKeahlian)}</span>}
              </span>
            </button>
          ))
        )}
      </div>
      <div className="p-3 border-t border-border shrink-0">
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : `Simpan (${terpilih.size} ahli dalam papan)`}
        </button>
      </div>
    </div>
  )
}

// Kad ahli - PAPARAN TELEFON (bukan jadual mendatar) - nama TAK PERNAH
// hilang dari pandangan (setiap kad ada nama sendiri, bukan bergantung
// skrol sisi + lajur melekat yang didapati masih menyusahkan di telefon
// sebenar). Status bulan dipaparkan sebagai jalur bulatan kecil (boleh
// tatal dalam kad tu sendiri kalau bulan banyak).
function KadAhliYuran({ ahli, peruntukan, bolehUrus, adaOverride, onKlik, onCetakResit, onAturTempoh }) {
  return (
    <button
      type="button"
      onClick={() => bolehUrus && onKlik(ahli)}
      className="w-full text-left p-3.5 rounded-card border border-border"
      style={{ backgroundColor: peruntukan.lengkapPenuh ? '#E1F5EE' : '#fff', cursor: bolehUrus ? 'pointer' : 'default' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-ink">
          {ahli.nama}
          {peruntukan.lengkapPenuh && <span className="ml-1.5 text-[10px] font-bold" style={{ color: '#0F6E56' }}>🎉 Lunas</span>}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <p className="text-xs font-bold text-ink text-right">RM{peruntukan.jumlahDibayar}/{peruntukan.jumlahDiperlukan}{peruntukan.lebihan > 0 && <span className="block text-[9px] font-normal text-[#0F6E56]">+RM{peruntukan.lebihan} lebihan</span>}</p>
          {bolehUrus && (
            <span
              onClick={(e) => { e.stopPropagation(); onAturTempoh(ahli) }}
              aria-label="Atur Tempoh Bayar"
              className={adaOverride ? 'text-brand-red' : 'text-inkmuted'}
            >
              <CalendarRange size={16} />
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {peruntukan.bulanList.map((b) => {
          const w = WarnaBulan(b.status)
          return (
            <div key={b.bulan} title={NAMA_BULAN[b.bulan - 1]} className="shrink-0 flex flex-col items-center gap-0.5">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-bold" style={{ backgroundColor: w.bg === 'transparent' ? '#F2F2F2' : w.bg, color: w.teks }}>
                {b.status === 'separuh' ? b.jumlah : b.status === 'penuh' ? '✓' : ''}
              </span>
              <span className="text-[8px] text-inkmuted">{NAMA_BULAN[b.bulan - 1].slice(0, 3)}</span>
            </div>
          )
        })}
      </div>
      {peruntukan.lengkapPenuh && (
        <span
          onClick={(e) => { e.stopPropagation(); onCetakResit(ahli, peruntukan) }}
          className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-brand-red"
        >
          <Download size={13} /> Muat Turun Resit
        </span>
      )}
    </button>
  )
}

// Satu baris jadual (skrin lebar) - dikongsi antara ahli aktif & tak
// aktif (elak duplikasi JSX).
function BarisYuran({ a, i, peruntukan, bolehUrus, adaOverride, senaraiBulan, onKlik, onCetakResit, onAturTempoh }) {
  const petaBulan = {}
  peruntukan.bulanList.forEach((b) => { petaBulan[b.bulan] = b })
  const gayaLunas = peruntukan.lengkapPenuh ? { backgroundColor: '#E1F5EE' } : undefined
  return (
    <tr className={bolehUrus ? 'cursor-pointer hover:brightness-95' : ''} style={gayaLunas} onClick={() => bolehUrus && onKlik(a)}>
      <td className="sticky z-10 text-center px-1 py-2 border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil, ...(gayaLunas ?? { backgroundColor: '#ffffff' }) }}>{i + 1}</td>
      <td className="sticky z-10 px-2 py-2 border-r border-border whitespace-nowrap font-medium text-ink" style={{ left: KIRI.nama, width: LEBAR.nama, ...(gayaLunas ?? { backgroundColor: '#ffffff' }) }}>
        <span className="inline-flex items-center gap-1">
          {a.nama}
          {bolehUrus && (
            <span onClick={(e) => { e.stopPropagation(); onAturTempoh(a) }} aria-label="Atur Tempoh Bayar" className={adaOverride ? 'text-brand-red' : 'text-inkmuted'}>
              <CalendarRange size={13} />
            </span>
          )}
        </span>
        {peruntukan.lengkapPenuh && <span className="ml-1.5 text-[10px] font-bold" style={{ color: '#0F6E56' }}>🎉 Lunas</span>}
      </td>
      {senaraiBulan.map((b) => {
        const info = petaBulan[b]
        if (!info) return <td key={b} className="text-center px-1 py-2 text-inkmuted" style={{ width: LEBAR.bulan }}>-</td>
        const w = WarnaBulan(info.status)
        return (
          <td key={b} className="text-center px-1 py-2" style={{ width: LEBAR.bulan }}>
            <span className="inline-block h-6 w-6 rounded-full text-[9px] font-bold leading-6" style={{ backgroundColor: w.bg, color: w.teks }}>
              {info.status === 'separuh' ? info.jumlah : info.status === 'penuh' ? '✓' : ''}
            </span>
          </td>
        )
      })}
      <td className="text-center px-2 py-2 border-l border-border font-semibold text-ink whitespace-nowrap">
        RM{peruntukan.jumlahDibayar}/{peruntukan.jumlahDiperlukan}
        {peruntukan.lebihan > 0 && <span className="block text-[9px] font-normal text-[#0F6E56]">+RM{peruntukan.lebihan} lebihan</span>}
        {peruntukan.lengkapPenuh && (
          <button onClick={(e) => { e.stopPropagation(); onCetakResit(a, peruntukan) }} aria-label="Muat turun resit" className="ml-1 text-brand-red align-middle">
            <Download size={12} className="inline" />
          </button>
        )}
      </td>
    </tr>
  )
}

// Papan Pembayaran - JADUAL untuk skrin lebar (sm: ke atas), KAD untuk
// telefon (sm:hidden) - jadual mendatar+lajur melekat didapati masih
// menyusahkan pada sesetengah pelayar mobile sebenar (nama terlepas
// pandangan semasa skrol). Ada carian nama untuk cari cepat, dua-dua
// paparan. SATU papan sama untuk semua (nama terus dari Senarai Ahli).
export default function YuranSumbanganKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { adaSeksyen } = useIsAdmin(user)
  const bolehUrus = adaSeksyen('kkgs')
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [carian, setCarian] = useState('')
  const { senarai: senaraiAhli, loading: loadingAhli } = useKkgsAhliSenarai()
  const { senarai: senaraiYuran, loading: loadingYuran, muatSemula } = useKkgsYuranTahun(tahun)
  const { tetapan, loading: loadingTetapan, muatSemula: muatSemulaTetapan } = useKkgsTetapanYuran(tahun)
  const { peta: petaTempoh, loading: loadingTempoh, muatSemula: muatSemulaTempoh } = useKkgsKeahlianTahunSenarai(tahun)
  const [ahliBayar, setAhliBayar] = useState(null)
  const [ahliTempoh, setAhliTempoh] = useState(null)
  const [tunjukTetapan, setTunjukTetapan] = useState(false)
  const [tunjukRoster, setTunjukRoster] = useState(false)
  const [dataResit, setDataResit] = useCetak((d) => `Resit Yuran KKGS - ${d.ahli.nama} ${d.tahun}`)
  const [dataLaporan, setDataLaporan] = useCetak((d) => `Pembayaran Bulanan Ahli KKGS ${d.tahun}`)
  const [menyediakan, setMenyediakan] = useState(false)
  // Ahli tak aktif (bersara/pindah/berhenti) - collapsed LALAI, papan
  // pembayaran ni untuk urus bayaran SEMASA, ahli dah keluar cuma perlu
  // dirujuk sekali-sekala (sejarah bayaran lama kekal, tak dipadam).
  const [tunjukTakAktif, setTunjukTakAktif] = useState(false)

  // Bulan Mula/Tamat kini PER TAHUN (kkgsKeahlianTahun) - LALAI penuh
  // tahun (1 hingga bilanganBulan tetapan) bila TIADA override untuk
  // (ahli, tahun) ni. Fix bug: dulu medan bulanMula/bulanTamat pada
  // kkgsAhli SATU sahaja untuk SEMUA tahun - ubah untuk tahun semasa
  // turut rosakkan kiraan tahun lepas/depan.
  function peruntukanAhli(ahli) {
    const override = petaTempoh[ahli.id]
    const bulanMula = override?.bulanMula ?? 1
    const bulanTamat = Math.min(override?.bulanTamat ?? tetapan.bilanganBulan, tetapan.bilanganBulan)
    const jumlahDibayar = senaraiYuran.filter((y) => y.ahliId === ahli.id).reduce((j, y) => j + y.jumlah, 0)
    if (bulanMula > bulanTamat) return { bulanList: [], jumlahDiperlukan: 0, jumlahDibayar, lengkapPenuh: false }
    return kiraPeruntukanYuran({ bulanMula, bulanTamat, kadarBulanan: tetapan.yuranBulanan, jumlahDibayar })
  }

  async function simpanTetapan(data) {
    await simpanTetapanYuran(tahun, data, user.uid)
    muatSemulaTetapan()
  }

  async function bayar(data) {
    await tambahYuranKkgs(data, user.uid)
    muatSemula()
  }

  async function padamBayaran(id) {
    if (!(await konfirm('Padam rekod bayaran ni?', { bahaya: true }))) return
    await padamYuranKkgs(id)
    muatSemula()
  }

  function cetakResit(ahli, peruntukan) {
    setDataResit({ ahli, peruntukan, tahun, tetapan })
  }

  // Laporan Pembayaran Bulanan (papan penuh) - guna SENARAI TERTAPIS
  // (disenaraiAktif/disenaraiTakAktif, iaitu roster tahun ni SAHAJA,
  // lepas carian) supaya laporan sepadan dengan apa yang staff nampak
  // di skrin masa cetak ditekan.
  function cetakLaporan() {
    setDataLaporan({
      tahun,
      tetapan,
      senaraiBulan,
      barisAktif: disenaraiAktif.map((a) => ({ ahli: a, peruntukan: peruntukanAhli(a) })),
      barisTakAktif: disenaraiTakAktif.map((a) => ({ ahli: a, peruntukan: peruntukanAhli(a) })),
    })
  }

  async function simpanTempoh(data) {
    await simpanKeahlianTahun(ahliTempoh.id, tahun, data, user.uid)
    setAhliTempoh(null)
    muatSemulaTempoh()
  }

  async function keluarkanAhliTempoh() {
    await buangDariRosterTahun(ahliTempoh.id, tahun)
    setAhliTempoh(null)
    muatSemulaTempoh()
  }

  async function simpanRoster({ tambah, buang }) {
    await simpanRosterPukal({ tambah, buang }, tahun, user.uid)
    setTunjukRoster(false)
    muatSemulaTempoh()
  }

  // Sediakan papan tahun BAHARU (roster kosong) - 3 cara pantas, semua
  // SELAMAT dipanggil berulang (ahli sedia ada dalam papan tak disentuh):
  //  - salin tahun lepas (HANYA ahli masih "aktif" disalin - ni fix utama
  //    keluhan "nama lama masih melekat" tahun baharu)
  //  - guna semua ahli AKTIF semasa (kalau takde roster tahun lepas)
  //  - guna SEMUA ahli tanpa kira status (untuk migrasi tahun yang DAH
  //    ada rekod bayaran sebelum ciri roster ni wujud)
  async function sediakanDenganSalinan() {
    setMenyediakan(true)
    try {
      const { disalin } = await salinRosterTahunLepas(tahun - 1, tahun, senaraiAhli, petaTempoh, user.uid)
      if (disalin === 0) {
        await konfirm(`Tiada roster ahli aktif dijumpai untuk tahun ${tahun - 1}. Cuba pilihan "Guna Semua Ahli Aktif Semasa" atau "Pilih Ahli Sendiri".`)
      }
      muatSemulaTempoh()
    } finally {
      setMenyediakan(false)
    }
  }

  async function sediakanDenganAktifSemasa() {
    setMenyediakan(true)
    try {
      await isiRosterAktifSemasa(tahun, senaraiAhli, petaTempoh, user.uid)
      muatSemulaTempoh()
    } finally {
      setMenyediakan(false)
    }
  }

  async function sediakanDenganSemuaAhli() {
    if (!(await konfirm(`Masukkan SEMUA ${senaraiAhli.length} ahli (termasuk yang dah bersara/pindah/berhenti) ke papan ${tahun}? Guna pilihan ni untuk tahun yang DAH ADA rekod bayaran sebelum ni.`))) return
    setMenyediakan(true)
    try {
      await isiRosterSemuaAhli(tahun, senaraiAhli, petaTempoh, user.uid)
      muatSemulaTempoh()
    } finally {
      setMenyediakan(false)
    }
  }

  const senaraiBulan = Array.from({ length: tetapan.bilanganBulan }, (_, i) => i + 1)
  // HANYA ahli yang DISERTAKAN (ada dalam petaTempoh, iaitu papan tahun
  // ni) yang dipaparkan - fix utama: dulu SEMUA Senarai Ahli terus
  // dipaparkan tanpa kira tahun, jadi ahli dah bersara/pindah tahun
  // lepas masih "melekat" bila tahun baharu dibuka.
  const rosterSet = new Set(Object.keys(petaTempoh))
  const ahliDalamPapan = senaraiAhli.filter((a) => rosterSet.has(a.id))
  const disenarai = ahliDalamPapan.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))
  const disenaraiAktif = disenarai.filter((a) => a.statusKeahlian === 'aktif')
  const disenaraiTakAktif = disenarai.filter((a) => a.statusKeahlian !== 'aktif')

  if (loadingAhli || loadingYuran || loadingTetapan || loadingTempoh) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="h-11 px-3 rounded-card border border-border bg-surface text-sm">
          {PILIHAN_TAHUN_KKGS.map((t) => (
            <option key={t} value={t}>{t}{t === TAHUN_SEMASA ? ' (semasa)' : ''}</option>
          ))}
        </select>
        <button onClick={cetakLaporan} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink ml-auto">
          <Printer size={14} /> Cetak / PDF
        </button>
        {bolehUrus && (
          <>
            <button onClick={() => setTunjukRoster(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
              <Users size={14} /> Urus Senarai ({ahliDalamPapan.length})
            </button>
            <button onClick={() => setTunjukTetapan(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
              <Settings size={14} /> Tetapan
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-inkmuted mb-3">RM{tetapan.yuranBulanan}/bulan × {tetapan.bilanganBulan} bulan{!bolehUrus && ' · Anda boleh LIHAT sahaja.'}</p>

      {bolehUrus && ahliDalamPapan.length === 0 && (
        <div className="rounded-card border border-amber-300 bg-amber-50 p-4 mb-4">
          <p className="text-sm font-semibold text-amber-900 mb-1">Papan Yuran {tahun} belum disediakan</p>
          <p className="text-xs text-amber-800 mb-3">Tiada ahli dalam papan tahun ni lagi. Pilih satu cara untuk mula:</p>
          <div className="flex flex-col gap-2">
            <button onClick={sediakanDenganSalinan} disabled={menyediakan} className="h-10 px-3 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60">
              {menyediakan ? 'Menyediakan…' : `Salin Ahli Aktif dari Tahun ${tahun - 1}`}
            </button>
            <button onClick={sediakanDenganAktifSemasa} disabled={menyediakan} className="h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink disabled:opacity-60">
              Guna Semua Ahli Aktif Semasa (Senarai Ahli)
            </button>
            <button onClick={sediakanDenganSemuaAhli} disabled={menyediakan} className="h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink disabled:opacity-60">
              Guna SEMUA Ahli (termasuk tak aktif - untuk tahun dah ada rekod lama)
            </button>
            <button onClick={() => setTunjukRoster(true)} className="h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
              Pilih Ahli Sendiri
            </button>
          </div>
        </div>
      )}

      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama…"
          className="w-full h-11 pl-9 pr-9 rounded-card border border-border bg-surface text-sm"
        />
        {carian && (
          <button onClick={() => setCarian('')} aria-label="Kosongkan carian" className="absolute right-3 top-1/2 -translate-y-1/2 text-inkmuted"><X size={14} /></button>
        )}
      </div>

      {disenarai.length === 0 ? (
        ahliDalamPapan.length === 0 ? (
          bolehUrus ? null : (
            <p className="text-sm text-inkmuted">Papan yuran tahun {tahun} belum disediakan lagi.</p>
          )
        ) : (
          <p className="text-sm text-inkmuted">Tiada padanan carian.</p>
        )
      ) : (
        <>
          {/* PAPARAN KAD - telefon sahaja (sm:hidden) */}
          <div className="sm:hidden">
            {disenaraiAktif.length === 0 ? (
              <p className="text-sm text-inkmuted mb-3">Tiada ahli aktif padan carian.</p>
            ) : (
              <div className="space-y-2 mb-3">
                {disenaraiAktif.map((a) => (
                  <KadAhliYuran key={a.id} ahli={a} peruntukan={peruntukanAhli(a)} bolehUrus={bolehUrus} adaOverride={Boolean(petaTempoh[a.id])} onKlik={setAhliBayar} onCetakResit={cetakResit} onAturTempoh={setAhliTempoh} />
                ))}
              </div>
            )}
            {disenaraiTakAktif.length > 0 && (
              <div>
                <button onClick={() => setTunjukTakAktif((t) => !t)} className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-2 w-full">
                  {tunjukTakAktif ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  Bersara / Pindah / Berhenti ({disenaraiTakAktif.length})
                </button>
                {tunjukTakAktif && (
                  <div className="space-y-2">
                    {disenaraiTakAktif.map((a) => (
                      <KadAhliYuran key={a.id} ahli={a} peruntukan={peruntukanAhli(a)} bolehUrus={bolehUrus} adaOverride={Boolean(petaTempoh[a.id])} onKlik={setAhliBayar} onCetakResit={cetakResit} onAturTempoh={setAhliTempoh} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PAPARAN JADUAL - skrin lebar sahaja (hidden sm:block) */}
          <div className="hidden sm:block overflow-auto border border-border rounded-card max-h-[70vh]">
            <table className="text-xs border-collapse w-full">
              <thead className="sticky top-0 z-20 bg-base">
                <tr>
                  <th className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>Bil</th>
                  <th className="sticky z-30 bg-base text-left px-2 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.nama, width: LEBAR.nama }}>Nama</th>
                  {senaraiBulan.map((b) => (
                    <th key={b} className="px-1 py-2 font-semibold text-center text-ink border-b border-border" style={{ width: LEBAR.bulan }}>
                      {NAMA_BULAN[b - 1].slice(0, 3)}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-semibold text-center text-ink border-b border-l border-border" style={{ width: 90 }}>Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disenaraiAktif.map((a, i) => (
                  <BarisYuran key={a.id} a={a} i={i} peruntukan={peruntukanAhli(a)} bolehUrus={bolehUrus} adaOverride={Boolean(petaTempoh[a.id])} senaraiBulan={senaraiBulan} onKlik={setAhliBayar} onCetakResit={cetakResit} onAturTempoh={setAhliTempoh} />
                ))}
                {disenaraiTakAktif.length > 0 && (
                  <tr>
                    <td colSpan={senaraiBulan.length + 3} className="p-0 border-t-2 border-border">
                      <button onClick={() => setTunjukTakAktif((t) => !t)} className="flex items-center gap-1.5 text-xs font-semibold text-ink px-2 py-2 w-full">
                        {tunjukTakAktif ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        Bersara / Pindah / Berhenti ({disenaraiTakAktif.length})
                      </button>
                    </td>
                  </tr>
                )}
                {tunjukTakAktif && disenaraiTakAktif.map((a, i) => (
                  <BarisYuran key={a.id} a={a} i={i} peruntukan={peruntukanAhli(a)} bolehUrus={bolehUrus} adaOverride={Boolean(petaTempoh[a.id])} senaraiBulan={senaraiBulan} onKlik={setAhliBayar} onCetakResit={cetakResit} onAturTempoh={setAhliTempoh} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-inkmuted mt-3">
        <span className="inline-block h-3 w-3 rounded-full align-middle mr-1" style={{ backgroundColor: '#0F6E56' }} /> Lunas &nbsp;
        <span className="inline-block h-3 w-3 rounded-full align-middle mr-1" style={{ backgroundColor: '#F5C344' }} /> Sebahagian (RM ditunjuk) &nbsp;
        kosong = belum bayar · "-" = luar tempoh keahlian.{bolehUrus && ' Klik/tekan untuk rekod bayaran.'}
      </p>

      {bolehUrus && (
        <>
          <ModalTetapan open={tunjukTetapan} tetapan={tetapan} tahun={tahun} onTutup={() => setTunjukTetapan(false)} onSimpan={simpanTetapan} />
          {ahliBayar && (
            <ModalBayar
              key={ahliBayar.id}
              open
              ahli={ahliBayar}
              tahun={tahun}
              tarikCadangan={tetapan.yuranBulanan}
              rekodAhli={senaraiYuran.filter((y) => y.ahliId === ahliBayar.id)}
              onTutup={() => setAhliBayar(null)}
              onSimpan={bayar}
              onPadam={padamBayaran}
            />
          )}
          {ahliTempoh && (
            <ModalTempoh
              key={ahliTempoh.id}
              open
              ahli={ahliTempoh}
              tahun={tahun}
              bilanganBulan={tetapan.bilanganBulan}
              override={petaTempoh[ahliTempoh.id]}
              onTutup={() => setAhliTempoh(null)}
              onSimpan={simpanTempoh}
              onKeluarkan={keluarkanAhliTempoh}
            />
          )}
          <ModalRoster
            open={tunjukRoster}
            senaraiAhli={senaraiAhli}
            rosterSet={rosterSet}
            tahun={tahun}
            onTutup={() => setTunjukRoster(false)}
            onSimpan={simpanRoster}
          />
        </>
      )}
      {dataResit && <ResitYuranKKGS {...dataResit} />}
      {dataLaporan && <LaporanYuranKKGS {...dataLaporan} />}
    </div>
  )
}
