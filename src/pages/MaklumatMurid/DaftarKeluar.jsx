import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Printer, Upload, Search } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import { useDaftarMasukMurid } from '../../hooks/useDaftarMasukMurid.js'
import { useCetak } from '../../hooks/useCetak.js'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useSijilTamat, tambahSijilTamat, kemaskiniSijilTamat, padamSijilTamat } from '../../hooks/useSijilTamat.js'
import SijilTamatModal from './SijilTamatModal.jsx'
import ImportSijilTamatModal from './ImportSijilTamatModal.jsx'
import CetakSijilTamat from './CetakSijilTamat.jsx'

// Semua lajur papan (SNAPSHOT terus dari rekod, sama corak dengan Daftar
// Masuk/Papan RMT/Semakan Murid) - Tahun Tamat diletak awal sebab tu kunci
// carian utama untuk sijil, No. Pendaftaran = No. Bilangan dari Daftar
// Masuk (lihat autoIsiSijil di sijilTamatUtils.js).
const LAJUR = [
  ['Tahun Tamat', 'tahunTamat'], ['No. KP', 'noKP'], ['Kelas', 'kelas'], ['Darjah', 'darjah'],
  ['Tarikh Masuk Sekolah', 'tarikhMasukSekolah'], ['Tarikh Lahir', 'tarikhLahir'],
  ['Nama Penjaga', 'namaPenjaga'], ['No. Pendaftaran', 'noPendaftaran'], ['No. Surat Beranak', 'noSuratBeranak'],
  ['Unit Beruniform', 'unitBeruniform'], ['Kelab', 'kelab'], ['Sukan', 'sukan'],
  ['Tarikh Keluar Sekolah', 'tarikhKeluarSekolah'], ['Sebab Berhenti', 'sebabBerhenti'],
  ['Kelakuan', 'kelakuan'], ['Jumlah Kehadiran', 'jumlahKehadiran'],
]

const LEBAR = { bil: 44, nama: 170 }

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
        <p className="text-sm text-inkmuted">Tiada rekod daftar keluar lagi.</p>
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
                <th className="text-right px-2.5 py-2.5 w-28 whitespace-nowrap">Aksi</th>
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
