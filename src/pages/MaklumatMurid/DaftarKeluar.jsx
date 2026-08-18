import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Printer, Upload } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import { useDaftarMasukMurid } from '../../hooks/useDaftarMasukMurid.js'
import { useCetak } from '../../hooks/useCetak.js'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useSijilTamat, tambahSijilTamat, kemaskiniSijilTamat, padamSijilTamat } from '../../hooks/useSijilTamat.js'
import SijilTamatModal from './SijilTamatModal.jsx'
import ImportSijilTamatModal from './ImportSijilTamatModal.jsx'
import CetakSijilTamat from './CetakSijilTamat.jsx'

// "Daftar Keluar Murid" - rekod murid yang tamat/berhenti persekolahan.
// Setiap rekod = satu Sijil Tamat (dokumen formal boleh dicetak terus) -
// dua konsep ni sebenarnya SATU perkara sama (murid keluar sekolah =
// keluarkan sijil), jadi digabung satu page (bukan 2 page berasingan).
export default function DaftarKeluar() {
  const { user } = useOutletContext()
  const { isAdmin, adaSeksyen } = useIsAdmin(user)
  const bolehImportCSV = isAdmin && adaSeksyen('murid')
  const { konfirm } = useDialog()
  const { senarai: senaraiMurid } = useMuridList()
  const { senarai: senaraiDaftarMasuk } = useDaftarMasukMurid()
  const { senarai, loading, muatSemula } = useSijilTamat()
  const [dataCetak, setDataCetak] = useCetak()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [tunjukImport, setTunjukImport] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)

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
      await kemaskiniSijilTamat(rekodEdit.id, data, user.uid)
    } else {
      const bilanganSeterusnya = senarai.length > 0 ? Math.max(...senarai.map((r) => r.bilangan ?? 0)) + 1 : 1
      await tambahSijilTamat(data, bilanganSeterusnya, user.uid)
    }
    setTunjukBorang(false)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam rekod daftar keluar ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamSijilTamat(id)
    muatSemula()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-inkmuted">{senarai.length} rekod</p>
        <div className="flex items-center gap-2 flex-wrap">
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
            <Plus size={14} /> Daftar Keluar / Jana Sijil
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada rekod daftar keluar lagi.</p>
      ) : (
        <div className="rounded-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink text-white">
              <tr>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide w-14">Bil.</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Nama</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wide hidden sm:table-cell">Tahun Tamat</th>
                <th className="w-28"></th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {senarai.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2.5 text-inkmuted">{r.bilangan}</td>
                  <td className="px-3 py-2.5 text-ink font-medium">{r.nama}</td>
                  <td className="px-3 py-2.5 text-inkmuted hidden sm:table-cell">{r.tahunTamat}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setDataCetak([r])} aria-label="Cetak Sijil" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                        <Printer size={15} />
                      </button>
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

      <SijilTamatModal
        open={tunjukBorang}
        rekod={rekodEdit}
        senaraiMurid={senaraiMurid}
        senaraiDaftarMasuk={senaraiDaftarMasuk}
        onClose={() => { setTunjukBorang(false); setRekodEdit(null) }}
        onSimpan={simpan}
      />

      {bolehImportCSV && (
        <ImportSijilTamatModal
          open={tunjukImport}
          onClose={() => setTunjukImport(false)}
          user={user}
          senaraiMurid={senaraiMurid}
          onSelesai={muatSemula}
        />
      )}

      {dataCetak && <CetakSijilTamat senarai={dataCetak} />}
    </div>
  )
}
