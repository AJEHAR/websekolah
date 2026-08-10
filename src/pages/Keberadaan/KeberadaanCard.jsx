import { FileText, Pencil, Trash2 } from 'lucide-react'
import { formatTarikhRingkas } from '../../lib/dateUtils.js'

export default function KeberadaanCard({ rekod, bolehUrus, onEdit, onPadam }) {
  const jenisPaparan = rekod.jenis === 'Lain-lain (nyatakan)' ? rekod.jenisLain : rekod.jenis
  const tarikhSama = rekod.tarikhMula === rekod.tarikhTamat

  return (
    <div className="p-4 rounded-card border border-border bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{rekod.nama}</p>
          <p className="text-xs text-inkmuted mt-0.5">{rekod.jawatan}</p>
        </div>
        {bolehUrus && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(rekod)} aria-label="Edit rekod" className="p-2 rounded-card hover:bg-base text-inkmuted">
              <Pencil size={16} />
            </button>
            <button onClick={() => onPadam(rekod.id)} aria-label="Padam rekod" className="p-2 rounded-card hover:bg-base text-brand-red">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-base border border-border text-ink">
          {rekod.urusan}
        </span>
        {jenisPaparan && (
          <span className="text-xs text-inkmuted">{jenisPaparan}</span>
        )}
      </div>

      <div className="mt-2 text-xs text-inkmuted space-y-0.5">
        <p>
          {tarikhSama
            ? formatTarikhRingkas(rekod.tarikhMula)
            : `${formatTarikhRingkas(rekod.tarikhMula)} – ${formatTarikhRingkas(rekod.tarikhTamat)}`}
          {rekod.masaKeluar && ` · ${rekod.masaKeluar}${rekod.masaKembali ? `–${rekod.masaKembali}` : ''}`}
        </p>
        <p>Tempat: {rekod.tempat}</p>
      </div>

      {rekod.dokumenURL && (
        <a
          href={rekod.dokumenURL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-red"
        >
          <FileText size={14} /> {rekod.dokumenNama || 'Lihat dokumen'}
        </a>
      )}
    </div>
  )
}
