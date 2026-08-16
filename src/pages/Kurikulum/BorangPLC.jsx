import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, Printer } from 'lucide-react'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useCetak } from '../../hooks/useCetak.js'
import {
  useLaporanPLC,
  tambahLaporanPLC,
  kemaskiniLaporanPLC,
  padamLaporanPLC,
} from '../../hooks/useLaporanPLC.js'
import LaporanPLCModal from './LaporanPLCModal.jsx'
import LaporanPLCDetailModal from './LaporanPLCDetailModal.jsx'
import CetakLaporanPLC from './CetakLaporanPLC.jsx'

export default function BorangPLC() {
  const { user } = useOutletContext()
  const { senarai, loading, muatSemula } = useLaporanPLC()
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')
  const penggunaSendiri = profilesAktif.find((p) => p.emel === user.email) ?? { emel: user.email, nama: user.displayName || user.email }
  const [dataCetak, setDataCetak] = useCetak()

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [laporanEdit, setLaporanEdit] = useState(null)
  const [laporanLihat, setLaporanLihat] = useState(null)

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
      await kemaskiniLaporanPLC(laporanEdit.id, data, user.uid)
    } else {
      await tambahLaporanPLC(data, user.uid)
    }
    setTunjukBorang(false)
    setLaporanEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!window.confirm('Padam laporan PLC ini?')) return
    await padamLaporanPLC(id)
    muatSemula()
  }

  function cetakSatu(laporan) {
    setDataCetak([laporan])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-inkmuted">{senarai.length} laporan</p>
        <button
          onClick={bukaTambah}
          className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
        >
          <Plus size={14} /> Laporan Baru
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada laporan PLC lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-3 rounded-card border border-border bg-surface">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{l.tajukFokus}</p>
                <p className="text-xs text-inkmuted truncate">{l.namaKumpulan} · {l.tarikh}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setLaporanLihat(l)} aria-label="Lihat" className="p-2 rounded-card hover:bg-base text-inkmuted">
                  <Eye size={16} />
                </button>
                <button onClick={() => cetakSatu(l)} aria-label="Cetak" className="p-2 rounded-card hover:bg-base text-inkmuted">
                  <Printer size={16} />
                </button>
                <button onClick={() => bukaEdit(l)} aria-label="Edit" className="p-2 rounded-card hover:bg-base text-inkmuted">
                  <Pencil size={16} />
                </button>
                <button onClick={() => padam(l.id)} aria-label="Padam" className="p-2 rounded-card hover:bg-base text-brand-red">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LaporanPLCModal
        open={tunjukBorang}
        laporan={laporanEdit}
        profiles={profilesAktif}
        penggunaSendiri={penggunaSendiri}
        onClose={() => { setTunjukBorang(false); setLaporanEdit(null) }}
        onSimpan={simpan}
      />

      <LaporanPLCDetailModal laporan={laporanLihat} onClose={() => setLaporanLihat(null)} />

      {dataCetak && <CetakLaporanPLC senarai={dataCetak} />}
    </div>
  )
}
