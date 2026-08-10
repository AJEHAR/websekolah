import { FileText, X } from 'lucide-react'
import { formatTarikhRingkas } from '../../lib/dateUtils.js'
import { warnaBadge, labelRingkas } from './badgeUtils.js'

export default function DetailModal({ rekod, onClose }) {
  if (!rekod) return null

  const warna = warnaBadge(rekod.urusan)
  const tarikhSama = rekod.tarikhMula === rekod.tarikhTamat

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-ink">Butiran Keberadaan</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm font-semibold text-ink">{rekod.nama}</p>
        <p className="text-xs text-inkmuted mb-3">{rekod.jawatan} · {rekod.kategori}</p>

        <span
          className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-4"
          style={{ backgroundColor: warna.bg, color: warna.teks }}
        >
          {labelRingkas(rekod)}
        </span>

        <dl className="text-sm space-y-2 border-t border-border pt-3">
          <div className="flex justify-between gap-3">
            <dt className="text-inkmuted">Tarikh</dt>
            <dd className="text-ink font-medium text-right">
              {tarikhSama
                ? formatTarikhRingkas(rekod.tarikhMula)
                : `${formatTarikhRingkas(rekod.tarikhMula)} – ${formatTarikhRingkas(rekod.tarikhTamat)}`}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-inkmuted">Tempat</dt>
            <dd className="text-ink font-medium text-right">{rekod.tempat}</dd>
          </div>
        </dl>

        {rekod.dokumenURL ? (
          <a
            href={rekod.dokumenURL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-2 h-11 rounded-card border border-border text-sm font-medium text-brand-red hover:bg-base"
          >
            <FileText size={16} /> {rekod.dokumenNama || 'Lihat Dokumen'}
          </a>
        ) : (
          <p className="mt-4 text-xs text-inkmuted text-center">Tiada dokumen dilampirkan.</p>
        )}
      </div>
    </div>
  )
}
