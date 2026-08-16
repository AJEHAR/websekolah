import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, Printer, FileText } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import { useCetak } from '../../hooks/useCetak.js'
import { useRPIList, tambahRPI, kemaskiniRPI, padamRPI } from '../../hooks/useRPI.js'
import { useRPIPrasidangList, tambahPrasidang, kemaskiniPrasidang, padamPrasidang } from '../../hooks/useRPIPrasidang.js'
import RPIBorang from './RPIBorang.jsx'
import PrasidangModal from './PrasidangModal.jsx'
import CetakRPI from './CetakRPI.jsx'
import CetakPrasidang from './CetakPrasidang.jsx'

export default function RPI() {
  const { user } = useOutletContext()
  const { senarai: senaraiMurid } = useMuridList()
  const { senarai, loading, muatSemula } = useRPIList()
  const { senarai: senaraiPrasidang, loading: loadingPrasidang, muatSemula: muatSemulaPrasidang } = useRPIPrasidangList()
  const [dataCetak, setDataCetak] = useCetak()
  const [dataCetakPrasidang, setDataCetakPrasidang] = useCetak()

  const [tab, setTab] = useState('rpi') // 'rpi' | 'prasidang'
  const [mod, setMod] = useState('senarai') // 'senarai' | 'borang'
  const [rpiEdit, setRpiEdit] = useState(null)

  const [tunjukPrasidang, setTunjukPrasidang] = useState(false)
  const [prasidangEdit, setPrasidangEdit] = useState(null)

  function bukaTambahRPI() {
    setRpiEdit(null)
    setMod('borang')
  }

  function bukaEditRPI(r) {
    setRpiEdit(r)
    setMod('borang')
  }

  async function simpanRPI(data) {
    if (rpiEdit) await kemaskiniRPI(rpiEdit.id, data, user.uid)
    else await tambahRPI(data, user.uid)
    setMod('senarai')
    setRpiEdit(null)
    muatSemula()
  }

  async function padamSatu(id) {
    if (!window.confirm('Padam RPI ini beserta semua rekod intervensi/pencapaian di dalamnya?')) return
    await padamRPI(id)
    muatSemula()
  }

  async function simpanPrasidang(data) {
    if (prasidangEdit) await kemaskiniPrasidang(prasidangEdit.id, data, user.uid)
    else await tambahPrasidang(data, user.uid)
    setTunjukPrasidang(false)
    setPrasidangEdit(null)
    muatSemulaPrasidang()
  }

  async function padamPrasidangSatu(id) {
    if (!window.confirm('Padam rumusan prasidang ini?')) return
    await padamPrasidang(id)
    muatSemulaPrasidang()
  }

  if (mod === 'borang') {
    return (
      <RPIBorang
        rpi={rpiEdit}
        senaraiMurid={senaraiMurid}
        onSimpan={simpanRPI}
        onBatal={() => { setMod('senarai'); setRpiEdit(null) }}
      />
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-5 border-b border-border">
        <button
          onClick={() => setTab('rpi')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === 'rpi' ? 'border-brand-red text-ink' : 'border-transparent text-inkmuted'}`}
        >
          RPI
        </button>
        <button
          onClick={() => setTab('prasidang')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === 'prasidang' ? 'border-brand-red text-ink' : 'border-transparent text-inkmuted'}`}
        >
          Rumusan Prasidang
        </button>
      </div>

      {tab === 'rpi' ? (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-xs text-inkmuted">{senarai.length} RPI</p>
            <button onClick={bukaTambahRPI} className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold">
              <Plus size={14} /> RPI Baru
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-inkmuted">Memuatkan…</p>
          ) : senarai.length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada RPI lagi.</p>
          ) : (
            <div className="space-y-2">
              {senarai.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-card border border-border bg-surface">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{r.muridNama}</p>
                    <p className="text-xs text-inkmuted truncate">{r.kelas} · Sesi {r.tahunSesi} · {(r.intervensi ?? []).length} intervensi</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setDataCetak([r])} aria-label="Cetak" className="p-2 rounded-card hover:bg-base text-inkmuted">
                      <Printer size={16} />
                    </button>
                    <button onClick={() => bukaEditRPI(r)} aria-label="Edit" className="p-2 rounded-card hover:bg-base text-inkmuted">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => padamSatu(r.id)} aria-label="Padam" className="p-2 rounded-card hover:bg-base text-brand-red">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-xs text-inkmuted">{senaraiPrasidang.length} rumusan prasidang</p>
            <button
              onClick={() => { setPrasidangEdit(null); setTunjukPrasidang(true) }}
              className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
            >
              <FileText size={14} /> Rumusan Prasidang Baru
            </button>
          </div>

          {loadingPrasidang ? (
            <p className="text-sm text-inkmuted">Memuatkan…</p>
          ) : senaraiPrasidang.length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada rumusan prasidang lagi.</p>
          ) : (
            <div className="space-y-2">
              {senaraiPrasidang.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-card border border-border bg-surface">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{p.muridNama}</p>
                    <p className="text-xs text-inkmuted truncate">{p.kelas}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setDataCetakPrasidang([p])} aria-label="Cetak" className="p-2 rounded-card hover:bg-base text-inkmuted">
                      <Printer size={16} />
                    </button>
                    <button onClick={() => { setPrasidangEdit(p); setTunjukPrasidang(true) }} aria-label="Edit" className="p-2 rounded-card hover:bg-base text-inkmuted">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => padamPrasidangSatu(p.id)} aria-label="Padam" className="p-2 rounded-card hover:bg-base text-brand-red">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <PrasidangModal
        open={tunjukPrasidang}
        prasidang={prasidangEdit}
        senaraiMurid={senaraiMurid}
        onClose={() => { setTunjukPrasidang(false); setPrasidangEdit(null) }}
        onSimpan={simpanPrasidang}
      />

      {dataCetak && <CetakRPI senarai={dataCetak} />}
      {dataCetakPrasidang && <CetakPrasidang senarai={dataCetakPrasidang} />}
    </div>
  )
}
