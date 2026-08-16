import { X } from 'lucide-react'

function Medan({ label, nilai }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1">{label}</h3>
      <p className="text-sm text-ink">{nilai || <span className="text-inkmuted">-</span>}</p>
    </div>
  )
}

export default function LaporanPLCDetailModal({ laporan, onClose }) {
  if (!laporan) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-ink">{laporan.tajukFokus}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-inkmuted mb-5">{laporan.namaKumpulan} · {laporan.tarikh}{laporan.masa ? `, ${laporan.masa}` : ''}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Medan label="Tempat" nilai={laporan.tempat} />
          <Medan label="Nama Kumpulan" nilai={laporan.namaKumpulan} />
          <Medan label="Mentor" nilai={laporan.mentorNama} />
          <Medan label="Ketua Kumpulan" nilai={laporan.ketuaNama} />
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1">Ahli Kumpulan</h3>
          {laporan.ahli?.length > 0 ? (
            <ul className="text-sm text-ink list-disc list-inside">
              {laporan.ahli.map((a) => <li key={a.emel}>{a.nama}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-inkmuted">-</p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-1">Strategi PLC</h3>
          {laporan.strategi?.length > 0 ? (
            <ul className="text-sm text-ink list-disc list-inside">
              {laporan.strategi.map((s) => <li key={s} className="italic">{s}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-inkmuted">-</p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">Butiran Perbincangan</h3>
          {laporan.butiran?.length > 0 ? (
            <div className="space-y-2">
              {laporan.butiran.map((b, i) => (
                <div key={i} className="p-2.5 rounded-card border border-border bg-base text-sm">
                  <p className="text-ink whitespace-pre-wrap">{b.catatan}</p>
                  {b.tindakan && <p className="text-inkmuted mt-1 whitespace-pre-wrap"><span className="font-semibold">Tindakan:</span> {b.tindakan}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-inkmuted">-</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <Medan label="Disediakan Oleh" nilai={laporan.disediakanOleh} />
          <Medan label="Disahkan Oleh" nilai={laporan.disahkanOleh} />
        </div>
      </div>
    </div>
  )
}
