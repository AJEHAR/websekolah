import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, Pencil, Trash2, Eye, EyeOff, Copy, KeyRound, Upload } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useMuridList } from '../../hooks/useMurid.js'
import { useKurikulumDelimaSenarai, simpanKurikulumDelima, padamKurikulumDelima } from '../../hooks/useKurikulumDelima.js'
import ImportDelimaModal from './ImportDelimaModal.jsx'

// Modal tambah/edit satu rekod Delima (emel + kata laluan) bagi SATU murid.
function ModalDelima({ open, murid, rekod, onTutup, onSimpan }) {
  const [emel, setEmel] = useState(rekod?.emel ?? '')
  const [kataLaluan, setKataLaluan] = useState(rekod?.kataLaluan ?? '')
  const [catatan, setCatatan] = useState(rekod?.catatan ?? '')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function simpan() {
    if (!emel.trim()) return setRalat('Sila isi emel Delima.')
    if (!kataLaluan.trim()) return setRalat('Sila isi kata laluan.')
    setRalat(null)
    setMenyimpan(true)
    try {
      await onSimpan({ emel, kataLaluan, catatan })
      onTutup()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-ink">Akaun Delima</h3>
          <p className="text-xs text-inkmuted mt-0.5">{murid.nama} · {murid.namaKelas || '-'}</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Emel Delima</label>
            <input type="text" value={emel} onChange={(e) => setEmel(e.target.value)} placeholder="cth. namamurid@moe-dl.edu.my" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Kata Laluan</label>
            <input type="text" value={kataLaluan} onChange={(e) => setKataLaluan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Catatan (pilihan)</label>
            <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="cth. dah tukar kata laluan Mac 2026" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
        </div>
        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onTutup} className="flex-1 h-11 rounded-card border border-border text-sm font-semibold text-ink">Batal</button>
          <button onClick={simpan} disabled={menyimpan} className="flex-1 h-11 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
            {menyimpan ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BarisMurid({ murid, rekod, tunjukKataLaluan, onTogolTunjuk, onEdit, onPadam }) {
  async function salin(teks) {
    try { await navigator.clipboard.writeText(teks) } catch { /* abaikan - pelayar lama tak sokong */ }
  }

  return (
    <div className="p-3.5 rounded-card border border-border bg-surface">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{murid.nama}</p>
          <p className="text-xs text-inkmuted truncate">{murid.namaKelas || '-'}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(murid, rekod)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><Pencil size={14} /></button>
          {rekod && (
            <button onClick={() => onPadam(murid, rekod)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red"><Trash2 size={15} /></button>
          )}
        </div>
      </div>

      {!rekod ? (
        <p className="text-xs text-inkmuted italic mt-2">Belum direkod - tekan <Pencil size={10} className="inline" /> untuk tambah.</p>
      ) : (
        // Rekod boleh datang dari import CSV (emel sahaja, TIADA kata laluan
        // lagi - fail rasmi DELIMa tak ada kata laluan) ATAU diisi manual
        // (emel + kata laluan). Kendali dua-dua keadaan berasingan - elak
        // crash cuba baca .length pada kataLaluan yang belum wujud.
        <div className="mt-2 space-y-1.5">
          {rekod.emel && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-inkmuted w-16 shrink-0">Emel</span>
              <span className="text-ink font-medium truncate flex-1 min-w-0">{rekod.emel}</span>
              <button onClick={() => salin(rekod.emel)} aria-label="Salin emel" className="p-1 rounded-card hover:bg-base text-inkmuted shrink-0"><Copy size={12} /></button>
            </div>
          )}
          {rekod.kataLaluan ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-inkmuted w-16 shrink-0">Kata Laluan</span>
              <span className="text-ink font-medium truncate flex-1 min-w-0 font-mono">
                {tunjukKataLaluan ? rekod.kataLaluan : '•'.repeat(Math.min(rekod.kataLaluan.length, 10))}
              </span>
              <button onClick={() => onTogolTunjuk(murid.id)} aria-label="Tunjuk/sembunyi" className="p-1 rounded-card hover:bg-base text-inkmuted shrink-0">
                {tunjukKataLaluan ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button onClick={() => salin(rekod.kataLaluan)} aria-label="Salin kata laluan" className="p-1 rounded-card hover:bg-base text-inkmuted shrink-0"><Copy size={12} /></button>
            </div>
          ) : (
            <p className="text-xs text-inkmuted italic">Kata laluan belum diisi (emel je dari CSV) - tekan <Pencil size={10} className="inline" /> untuk isi.</p>
          )}
          {rekod.catatan && <p className="text-[11px] text-inkmuted italic mt-1">{rekod.catatan}</p>}
        </div>
      )}
    </div>
  )
}

// Delima - rujukan emel & kata laluan akaun DELIMa (portal pembelajaran
// digital KPM) bagi setiap murid. Murid berkeperluan khas kebanyakannya
// tak urus akaun sendiri, jadi guru kelas simpan rekod ni sbg rujukan
// pantas (cth. bila nak log masuk bagi pihak murid, atau bagi tahu ibu
// bapa). SEMUA staff diluluskan boleh tambah/kemas kini (bukan cuma
// admin) - guru kelas lain-lain yang paling kerap urus data ni.
export default function Delima() {
  const { konfirm } = useDialog()
  const { user } = useOutletContext()
  const { senarai: senaraiMurid, loading: loadingMurid } = useMuridList()
  const { senarai: senaraiRekod, loading: loadingRekod, muatSemula } = useKurikulumDelimaSenarai()

  const [carian, setCarian] = useState('')
  const [tapisStatus, setTapisStatus] = useState('semua') // semua | direkod | belum
  const [muridEdit, setMuridEdit] = useState(null)
  const [rekodEdit, setRekodEdit] = useState(null)
  const [tunjukSet, setTunjukSet] = useState(() => new Set())
  const [tunjukImport, setTunjukImport] = useState(false)

  const rekodMap = Object.fromEntries(senaraiRekod.map((r) => [r.id, r]))

  const disenarai = senaraiMurid
    .filter((m) => `${m.nama ?? ''} ${m.namaKelas ?? ''}`.toLowerCase().includes(carian.toLowerCase()))
    .filter((m) => {
      if (tapisStatus === 'direkod') return Boolean(rekodMap[m.id])
      if (tapisStatus === 'belum') return !rekodMap[m.id]
      return true
    })

  function togolTunjuk(muridId) {
    setTunjukSet((s) => {
      const baru = new Set(s)
      if (baru.has(muridId)) baru.delete(muridId); else baru.add(muridId)
      return baru
    })
  }

  async function simpan(data) {
    await simpanKurikulumDelima(muridEdit.id, data, user.uid)
    muatSemula()
  }

  async function padam(murid) {
    if (!(await konfirm(`Padam rekod Delima ${murid.nama}?`, { bahaya: true }))) return
    await padamKurikulumDelima(murid.id)
    muatSemula()
  }

  const jumlahDirekod = senaraiMurid.filter((m) => rekodMap[m.id]).length

  return (
    <div>
      <div className="flex items-start gap-2 mb-4 p-3 rounded-card border border-border bg-base">
        <KeyRound size={16} className="text-inkmuted shrink-0 mt-0.5" />
        <p className="text-xs text-inkmuted">
          Rujukan emel &amp; kata laluan akaun <strong className="text-ink">DELIMa</strong> setiap murid - berguna bagi murid yang tak urus akaun sendiri. Rekod: <strong className="text-ink">{jumlahDirekod}</strong> / {senaraiMurid.length} murid.
        </p>
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={() => setTunjukImport(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
          <Upload size={14} /> Muat Naik CSV DELIMa
        </button>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input type="text" value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama murid/kelas…" className="w-full h-10 pl-9 pr-3 rounded-card border border-border bg-surface text-sm" />
        </div>
        <select value={tapisStatus} onChange={(e) => setTapisStatus(e.target.value)} className="h-10 px-3 rounded-card border border-border bg-surface text-sm">
          <option value="semua">Semua Murid</option>
          <option value="direkod">Dah Direkod</option>
          <option value="belum">Belum Direkod</option>
        </select>
      </div>

      {(loadingMurid || loadingRekod) ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada murid dijumpai.</p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((m) => (
            <BarisMurid
              key={m.id} murid={m} rekod={rekodMap[m.id]}
              tunjukKataLaluan={tunjukSet.has(m.id)}
              onTogolTunjuk={togolTunjuk}
              onEdit={(murid, rekod) => { setMuridEdit(murid); setRekodEdit(rekod) }}
              onPadam={padam}
            />
          ))}
        </div>
      )}

      <ModalDelima
        key={muridEdit?.id ?? 'kosong'}
        open={Boolean(muridEdit)} murid={muridEdit} rekod={rekodEdit}
        onTutup={() => { setMuridEdit(null); setRekodEdit(null) }}
        onSimpan={simpan}
      />
      <ImportDelimaModal
        open={tunjukImport} user={user} senaraiMurid={senaraiMurid}
        onClose={() => setTunjukImport(false)} onSelesai={muatSemula}
      />
    </div>
  )
}
