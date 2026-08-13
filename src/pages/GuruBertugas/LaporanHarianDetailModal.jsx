import { X } from 'lucide-react'

function Seksyen({ tajuk, children }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1.5">{tajuk}</h3>
      {children}
    </div>
  )
}

function Teks({ tajuk, teks }) {
  return (
    <Seksyen tajuk={tajuk}>
      <p className="text-sm text-ink whitespace-pre-wrap">{teks || <span className="text-inkmuted">Tiada.</span>}</p>
    </Seksyen>
  )
}

export default function LaporanHarianDetailModal({ laporan, onClose }) {
  if (!laporan) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-ink">Minggu {laporan.minggu}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-5">{laporan.hari}, {laporan.tarikh}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-card bg-base text-center">
            <p className="text-base font-bold text-ink">{laporan.jumlahGuruHadir} / {laporan.jumlahGuruKeseluruhan}</p>
            <p className="text-xs text-inkmuted">Kehadiran Guru</p>
          </div>
          <div className="p-3 rounded-card bg-base text-center">
            <p className="text-base font-bold text-ink">{laporan.jumlahMuridHadir} / {laporan.jumlahMuridKeseluruhan}</p>
            <p className="text-xs text-inkmuted">Kehadiran Murid ({laporan.peratusKehadiranMurid}%)</p>
          </div>
        </div>

        <Seksyen tajuk={`Guru Bertugas${laporan.kumpulanBertugasNama ? ` (${laporan.kumpulanBertugasNama})` : ''}`}>
          {(laporan.senaraiGuruBertugas ?? []).length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada.</p>
          ) : (
            <p className="text-sm text-ink">{laporan.senaraiGuruBertugas.map((g) => g.nama).join(', ')}</p>
          )}
        </Seksyen>

        <Seksyen tajuk="PPM Bertugas">
          {(laporan.senaraiPPMBertugas ?? []).length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada.</p>
          ) : (
            <p className="text-sm text-ink">{laporan.senaraiPPMBertugas.map((p) => p.nama).join(', ')}</p>
          )}
        </Seksyen>

        <Seksyen tajuk="Rumusan Guru Mangkir">
          {(laporan.rumusanGuruMangkir ?? []).length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada.</p>
          ) : (
            <div className="space-y-1">
              {laporan.rumusanGuruMangkir.map((r, i) => (
                <p key={i} className="text-sm text-ink">{r.nama} - <span className="text-inkmuted">{r.sebab}</span></p>
              ))}
            </div>
          )}
        </Seksyen>

        <Seksyen tajuk="Rumusan Murid Sakit/Pulang Awal">
          {(laporan.rumusanMuridSakit ?? []).length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada.</p>
          ) : (
            <div className="space-y-1">
              {laporan.rumusanMuridSakit.map((r, i) => (
                <p key={i} className="text-sm text-ink">{r.nama} - <span className="text-inkmuted">{r.sebab} ({r.tindakan})</span></p>
              ))}
            </div>
          )}
        </Seksyen>

        <Teks tajuk="Laporan PDPC" teks={laporan.laporanPDPC} />

        {laporan.kokurikulumAktif && <Teks tajuk="Kokurikulum Minggu Ini" teks={laporan.butiranKokurikulum || 'Ya'} />}

        <Teks tajuk="Laporan Pagi" teks={laporan.laporanPagi} />
        <Teks tajuk="Hal-Hal Lain" teks={laporan.halLain} />

        <div className="pt-3 border-t border-border">
          <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1">Dilaporkan Oleh</h3>
          <p className="text-sm text-ink">{laporan.dilaporkanOleh}</p>
        </div>
      </div>
    </div>
  )
}
