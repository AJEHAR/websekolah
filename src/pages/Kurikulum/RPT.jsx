import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Download, Eye, Pencil, Trash2, Repeat } from 'lucide-react'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { usePanitiaRPT } from '../../hooks/usePanitiaRPT.js'
import { useKategoriRPT } from '../../hooks/useKategoriRPT.js'
import {
  useLaporanRPT,
  tambahLaporanRPT,
  kemaskiniLaporanRPT,
  padamLaporanRPT,
} from '../../hooks/useLaporanRPT.js'
import RPTModal from './RPTModal.jsx'
import TukarGuruModal from './TukarGuruModal.jsx'
import { useDialog } from '../../context/DialogContext.jsx'

// Pautan muat turun terus (bukan pautan pratonton) - dibina daripada fileId,
// tak perlu ubah Apps Script (yang pulangkan 'url' berformat thumbnail
// googleusercontent, sesuai untuk gambar tapi bukan PDF).
function pautanMuatTurun(fail) {
  if (!fail?.fileId) return fail?.url ?? '#'
  return `https://drive.google.com/uc?export=download&id=${fail.fileId}`
}

export default function RPT() {
  const { konfirm } = useDialog()
  const { user } = useOutletContext()
  const { senarai, loading, muatSemula } = useLaporanRPT()
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')
  const penggunaSendiri = profilesAktif.find((p) => p.emel === user.email) ?? { emel: user.email, nama: user.displayName || user.email }
  const { senarai: panitiaSenarai } = usePanitiaRPT()
  const { senarai: kategoriSenarai } = useKategoriRPT()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [laporanEdit, setLaporanEdit] = useState(null)
  const [laporanTukarGuru, setLaporanTukarGuru] = useState(null)
  const [tapisTahun, setTapisTahun] = useState('')
  const [tapisPanitia, setTapisPanitia] = useState('')

  function bukaTambah() {
    setLaporanEdit(null)
    setTunjukBorang(true)
  }

  function bukaEdit(laporan) {
    setLaporanEdit(laporan)
    setTunjukBorang(true)
  }

  async function simpan(data) {
    if (laporanEdit) {
      await kemaskiniLaporanRPT(laporanEdit.id, data, user.uid)
    } else {
      await tambahLaporanRPT(data, user.uid)
    }
    setTunjukBorang(false)
    setLaporanEdit(null)
    muatSemula()
  }

  async function tukarGuru(guruEmel, guruNama) {
    await kemaskiniLaporanRPT(laporanTukarGuru.id, { guruEmel, guruNama }, user.uid)
    setLaporanTukarGuru(null)
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam laporan RPT ini? Fail dalam Google Drive TIDAK dipadam automatik, cuma rekod dalam sistem.', { bahaya: true }))) return
    await padamLaporanRPT(id)
    muatSemula()
  }

  const tahunSenarai = [...new Set(senarai.map((l) => l.tahunSesi))].sort().reverse()
  const disenarai = senarai.filter((l) => {
    if (tapisTahun && l.tahunSesi !== tapisTahun) return false
    if (tapisPanitia && l.panitia !== tapisPanitia) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-inkmuted">{disenarai.length} / {senarai.length} laporan</p>
        <button
          onClick={bukaTambah}
          className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
        >
          <Plus size={14} /> Muat Naik RPT
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={tapisTahun}
          onChange={(e) => setTapisTahun(e.target.value)}
          className="h-10 px-3 rounded-card border border-border bg-surface text-xs"
        >
          <option value="">Semua Tahun/Sesi</option>
          {tahunSenarai.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={tapisPanitia}
          onChange={(e) => setTapisPanitia(e.target.value)}
          className="h-10 px-3 rounded-card border border-border bg-surface text-xs"
        >
          <option value="">Semua Panitia</option>
          {panitiaSenarai.map((p) => <option key={p.id} value={p.nama}>{p.nama}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada laporan RPT lagi.</p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((l) => (
            <div key={l.id} className="p-3 rounded-card border border-border bg-surface">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{l.mataPelajaran}</p>
                  <p className="text-xs text-inkmuted truncate">{l.tahunDarjah} · {l.panitia} · {l.kategori}</p>
                  <p className="text-xs text-inkmuted truncate mt-0.5">Guru: {l.guruNama} · Sesi {l.tahunSesi}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {l.fail?.previewUrl && (
                    <a href={l.fail.previewUrl} target="_blank" rel="noopener noreferrer" aria-label="Lihat fail" className="p-2 rounded-card hover:bg-base text-inkmuted">
                      <Eye size={16} />
                    </a>
                  )}
                  {l.fail && (
                    <a href={pautanMuatTurun(l.fail)} target="_blank" rel="noopener noreferrer" aria-label="Muat turun fail" className="p-2 rounded-card hover:bg-base text-inkmuted">
                      <Download size={16} />
                    </a>
                  )}
                  <button onClick={() => setLaporanTukarGuru(l)} aria-label="Tukar guru" className="p-2 rounded-card hover:bg-base text-inkmuted">
                    <Repeat size={16} />
                  </button>
                  <button onClick={() => bukaEdit(l)} aria-label="Edit" className="p-2 rounded-card hover:bg-base text-inkmuted">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => padam(l.id)} aria-label="Padam" className="p-2 rounded-card hover:bg-base text-brand-red">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RPTModal
        open={tunjukBorang}
        laporan={laporanEdit}
        profiles={profilesAktif}
        panitiaSenarai={panitiaSenarai}
        kategoriSenarai={kategoriSenarai}
        penggunaSendiri={penggunaSendiri}
        onClose={() => { setTunjukBorang(false); setLaporanEdit(null) }}
        onSimpan={simpan}
      />

      <TukarGuruModal
        open={Boolean(laporanTukarGuru)}
        laporan={laporanTukarGuru}
        profiles={profilesAktif}
        onClose={() => setLaporanTukarGuru(null)}
        onTukar={tukarGuru}
      />
    </div>
  )
}
