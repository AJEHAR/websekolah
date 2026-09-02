import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Printer, Search, Settings, Upload } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useCetak } from '../../hooks/useCetak.js'
import { useLaporanOPR, tambahLaporanOPR, kemaskiniLaporanOPR, padamLaporanOPR } from '../../hooks/useLaporanOPR.js'
import { useOprUnit } from '../../hooks/useOprUnit.js'
import { useOprLatarBelakang } from '../../hooks/useOprLatarBelakang.js'
import { useOprLogo } from '../../hooks/useOprLogo.js'
import OPRForm from './OPRForm.jsx'
import CetakOPR from './CetakOPR.jsx'
import UrusUnitOPRModal from './UrusUnitOPRModal.jsx'
import UrusLatarBelakangOPRModal from './UrusLatarBelakangOPRModal.jsx'
import UrusLogoOPRModal from './UrusLogoOPRModal.jsx'
import ImportOPRModal from './ImportOPRModal.jsx'

// OPR - komponen DIKONGSI antara sub-page KURI/HEM/KOKU (sama corak
// dengan Surat/SPI, komponents/SuratSpi.jsx) - "seksyen" tentukan koleksi
// data mana dipapar/disimpan. Data (laporan, tag Unit, latar belakang,
// logo) TIDAK dikongsi antara seksyen - setiap bahagian/unit nak OPR
// sendiri sepenuhnya berasingan.
export default function OPR({ seksyen }) {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { senarai, loading, muatSemula } = useLaporanOPR(seksyen)
  const { senarai: senaraiUnit, muatSemula: muatSemulaUnit } = useOprUnit(seksyen)
  const { senarai: senaraiLatarBelakang, muatSemula: muatSemulaLatarBelakang } = useOprLatarBelakang(seksyen)
  const { logo, muatSemula: muatSemulaLogo } = useOprLogo(seksyen)
  const [dataCetak, setDataCetak] = useCetak()

  const [modeForm, setModeForm] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [carian, setCarian] = useState('')
  const [tunjukUnit, setTunjukUnit] = useState(false)
  const [tunjukLatar, setTunjukLatar] = useState(false)
  const [tunjukLogo, setTunjukLogo] = useState(false)
  const [tunjukImport, setTunjukImport] = useState(false)

  const disenarai = senarai.filter((r) =>
    `${r.nama ?? ''} ${r.tempat ?? ''} ${r.tarikh ?? ''} ${r.unit ?? ''}`.toLowerCase().includes(carian.toLowerCase())
  )

  function bukaTambah() {
    setRekodEdit(null)
    setModeForm(true)
  }

  function bukaEdit(rekod) {
    setRekodEdit(rekod)
    setModeForm(true)
  }

  async function simpan(data) {
    setMenyimpan(true)
    try {
      if (rekodEdit) {
        await kemaskiniLaporanOPR(rekodEdit.id, data, user.uid)
      } else {
        await tambahLaporanOPR(seksyen, data, user.uid)
      }
      setModeForm(false)
      setRekodEdit(null)
      muatSemula()
    } finally {
      setMenyimpan(false)
    }
  }

  async function padam(id) {
    if (!(await konfirm('Padam laporan OPR ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamLaporanOPR(id)
    muatSemula()
  }

  if (modeForm) {
    return (
      <div>
        <h2 className="text-base font-bold text-ink mb-4">{rekodEdit ? 'Edit Laporan OPR' : 'Laporan OPR Baharu'}</h2>
        <OPRForm
          dataAwal={rekodEdit}
          senaraiUnit={senaraiUnit}
          senaraiLatarBelakang={senaraiLatarBelakang}
          onSimpan={simpan}
          onBatal={() => { setModeForm(false); setRekodEdit(null) }}
          menyimpan={menyimpan}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="p-3 rounded-card bg-surface border border-border text-center w-fit mb-4">
        <p className="text-lg font-bold text-ink">{senarai.length}</p>
        <p className="text-[10px] text-inkmuted">Jumlah Laporan</p>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            type="text"
            value={carian}
            onChange={(e) => setCarian(e.target.value)}
            placeholder="Cari laporan, tempat, atau tarikh…"
            className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <button onClick={() => setTunjukUnit(true)} className="h-11 px-3 rounded-card border border-border text-xs font-semibold text-ink flex items-center gap-1.5">
          <Settings size={14} /> Unit
        </button>
        <button onClick={() => setTunjukLatar(true)} className="h-11 px-3 rounded-card border border-border text-xs font-semibold text-ink flex items-center gap-1.5">
          <Settings size={14} /> Latar
        </button>
        <button onClick={() => setTunjukLogo(true)} className="h-11 px-3 rounded-card border border-border text-xs font-semibold text-ink flex items-center gap-1.5">
          <Settings size={14} /> Logo
        </button>
        <button onClick={() => setTunjukImport(true)} className="h-11 px-3 rounded-card border border-border text-xs font-semibold text-ink flex items-center gap-1.5">
          <Upload size={14} /> Import CSV
        </button>
        <button onClick={bukaTambah} className="h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold flex items-center gap-1.5">
          <Plus size={14} /> Laporan Baharu
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada laporan OPR dijumpai.</p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-4 rounded-card border border-border bg-surface">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{r.nama}</p>
                <p className="text-xs text-inkmuted mt-0.5">{[r.unit, r.tarikh, r.tempat].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setDataCetak(r)} aria-label="Cetak" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                  <Printer size={15} />
                </button>
                <button onClick={() => bukaEdit(r)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                  <Pencil size={15} />
                </button>
                <button onClick={() => padam(r.id)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UrusUnitOPRModal open={tunjukUnit} senarai={senaraiUnit} seksyen={seksyen} user={user} onClose={() => setTunjukUnit(false)} onSelesai={muatSemulaUnit} />
      <UrusLatarBelakangOPRModal open={tunjukLatar} senarai={senaraiLatarBelakang} seksyen={seksyen} user={user} onClose={() => setTunjukLatar(false)} onSelesai={muatSemulaLatarBelakang} />
      <UrusLogoOPRModal open={tunjukLogo} logo={logo} seksyen={seksyen} user={user} onClose={() => setTunjukLogo(false)} onSelesai={muatSemulaLogo} />
      <ImportOPRModal open={tunjukImport} seksyen={seksyen} onClose={() => setTunjukImport(false)} user={user} onSelesai={muatSemula} />

      {dataCetak && <CetakOPR rekod={dataCetak} logo={logo} />}
    </div>
  )
}
