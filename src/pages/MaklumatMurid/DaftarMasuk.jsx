import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Printer, Upload, Search } from 'lucide-react'
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

// Semua lajur papan (SNAPSHOT terus dari rekod) - susunan sama dengan
// cetakan/templat CSV, supaya paparan skrin, cetak & CSV konsisten.
const LAJUR = [
  ['Tarikh Masuk', 'tarikhMasuk'], ['Jantina', 'jantina'], ['Bangsa', 'bangsa'], ['Agama', 'agama'],
  ['No. Kad Pengenalan', 'noPengenalan'], ['Tarikh Lahir', 'tarikhLahir'],
  ['Bil. Surat Beranak', 'bilanganSuratBeranak'], ['Tempat Diperanakkan', 'tempatDiperanakkan'],
  ['Darjah', 'darjah'], ['No. Kebenaran', 'noKebenaran'], ['Nama Penjaga', 'namaPenjaga'],
  ['Persaudaraan', 'persaudaraan'], ['Pekerjaan', 'pekerjaan'], ['Alamat', 'alamat'],
  ['Sekolah Dahulu', 'sekolahDahulu'],
]

// Lebar sticky Bil/Nama (px) - lajur lain lain scroll mendatar biasa,
// sama corak dengan Papan RMT/Semakan Murid supaya boleh scan nama sambil
// tatal ke kanan tengok medan lain.
const LEBAR = { bil: 44, nama: 170 }

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
  const [carian, setCarian] = useState('')

  const disenarai = senarai.filter((r) => (r.nama ?? '').toLowerCase().includes(carian.toLowerCase()))

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

      {senarai.length > 0 && (
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            type="text"
            value={carian}
            onChange={(e) => setCarian(e.target.value)}
            placeholder="Cari nama…"
            className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada rekod daftar masuk lagi.</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada rekod sepadan dengan carian.</p>
      ) : (
        <div className="overflow-auto border border-border rounded-card max-h-[75vh]">
          <table className="text-xs border-collapse w-full">
            <thead className="sticky top-0 z-20 bg-ink text-white">
              <tr>
                <th className="sticky z-30 bg-ink text-left px-2.5 py-2.5 font-semibold uppercase tracking-wide border-r border-white/10" style={{ left: 0, width: LEBAR.bil }}>Bil.</th>
                <th className="sticky z-30 bg-ink text-left px-2.5 py-2.5 font-semibold uppercase tracking-wide border-r border-white/10" style={{ left: LEBAR.bil, width: LEBAR.nama }}>Nama</th>
                {LAJUR.map(([label]) => (
                  <th key={label} className="text-left px-2.5 py-2.5 font-semibold uppercase tracking-wide whitespace-nowrap">{label}</th>
                ))}
                <th className="text-right px-2.5 py-2.5 w-24 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {disenarai.map((r) => (
                <tr key={r.id} className="hover:bg-base/60">
                  <td className="sticky z-10 bg-surface px-2.5 py-2 border-r border-border text-inkmuted" style={{ left: 0, width: LEBAR.bil }}>{r.bilangan}</td>
                  <td className="sticky z-10 bg-surface px-2.5 py-2 border-r border-border text-ink font-medium whitespace-nowrap" style={{ left: LEBAR.bil, width: LEBAR.nama }}>{r.nama}</td>
                  {LAJUR.map(([label, kunci]) => (
                    <td key={kunci} className="px-2.5 py-2 text-ink whitespace-nowrap">{r[kunci] || '-'}</td>
                  ))}
                  <td className="px-2.5 py-2">
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

      {dataCetak && <CetakDaftarMasuk senarai={dataCetak} />}
    </div>
  )
}
