import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Printer, Upload } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import { useCetak } from '../../hooks/useCetak.js'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import {
  useDaftarMasukMurid,
  tambahDaftarMasuk,
  kemaskiniDaftarMasuk,
  padamDaftarMasuk,
} from '../../hooks/useDaftarMasukMurid.js'
import DaftarMasukModal from './DaftarMasukModal.jsx'
import ImportDaftarMasukModal from './ImportDaftarMasukModal.jsx'
import CetakDaftarMasuk from './CetakDaftarMasuk.jsx'

export default function DaftarMasuk() {
  const { user } = useOutletContext()
  const { isAdmin, adaSeksyen } = useIsAdmin(user)
  // Import CSV pukal - kesan/risiko lebih besar daripada borang satu-satu,
  // jadi hadkan kepada admin seksyen 'murid' sahaja. Borang manual biasa
  // (Tambah satu rekod) kekal terbuka untuk semua staff diluluskan.
  const bolehImportCSV = isAdmin && adaSeksyen('murid')
  const { konfirm } = useDialog()
  const { senarai: senaraiMurid } = useMuridList()
  const { senarai, loading, muatSemula } = useDaftarMasukMurid()
  const [dataCetak, setDataCetak] = useCetak()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [tunjukImport, setTunjukImport] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)

  const muridById = Object.fromEntries(senaraiMurid.map((m) => [m.id, m]))

  function bukaTambah() {
    setRekodEdit(null)
    setTunjukBorang(true)
  }

  function bukaEdit(rekod) {
    setRekodEdit(rekod)
    setTunjukBorang(true)
  }

  async function simpan(data) {
    if (rekodEdit) {
      await kemaskiniDaftarMasuk(rekodEdit.id, data, user.uid)
    } else {
      const bilanganSeterusnya = senarai.length > 0 ? Math.max(...senarai.map((r) => r.bilangan ?? 0)) + 1 : 1
      await tambahDaftarMasuk(data, bilanganSeterusnya, user.uid)
    }
    setTunjukBorang(false)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam rekod daftar masuk ini? Nombor bilangan rekod lain TIDAK akan berubah.', { bahaya: true }))) return
    await padamDaftarMasuk(id)
    muatSemula()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-inkmuted">{senarai.length} rekod</p>
        <div className="flex items-center gap-2 flex-wrap">
          {senarai.length > 0 && (
            <button
              onClick={() => setDataCetak(senarai)}
              className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink"
            >
              <Printer size={14} /> Cetak Semua
            </button>
          )}
          {bolehImportCSV && (
            <button
              onClick={() => setTunjukImport(true)}
              className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink"
            >
              <Upload size={14} /> Import CSV
            </button>
          )}
          <button
            onClick={bukaTambah}
            className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
          >
            <Plus size={14} /> Daftar Masuk
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada rekod daftar masuk lagi.</p>
      ) : (
        <div className="rounded-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink text-white">
              <tr>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide w-14">Bil.</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Nama</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide hidden sm:table-cell">Darjah</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {senarai.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2.5 text-inkmuted">{r.bilangan}</td>
                  <td className="px-3 py-2.5 text-ink font-medium">{r.muridNama}</td>
                  <td className="px-3 py-2.5 text-inkmuted hidden sm:table-cell">
                    {muridById[r.muridId]?.namaKelas || muridById[r.muridId]?.tahunTingkatan || '-'}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => bukaEdit(r)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => padam(r.id)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DaftarMasukModal
        open={tunjukBorang}
        rekod={rekodEdit}
        senaraiMurid={senaraiMurid}
        onClose={() => { setTunjukBorang(false); setRekodEdit(null) }}
        onSimpan={simpan}
      />

      {bolehImportCSV && (
        <ImportDaftarMasukModal
          open={tunjukImport}
          onClose={() => setTunjukImport(false)}
          user={user}
          senaraiMurid={senaraiMurid}
          onSelesai={muatSemula}
        />
      )}

      {dataCetak && <CetakDaftarMasuk senarai={dataCetak} muridById={muridById} />}
    </div>
  )
}
