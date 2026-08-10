import { Eye, Pencil, Trash2 } from 'lucide-react'
import { formatTarikhRingkas } from '../../lib/dateUtils.js'
import { warnaBadge, labelSenarai } from './badgeUtils.js'

export default function KeberadaanCardRingkas({ rekod, bolehUrus, onLihat, onEdit, onPadam }) {
  const warna = warnaBadge(rekod.urusan)
  const tarikhSama = rekod.tarikhMula === rekod.tarikhTamat

  const julat =
    rekod.urusan === 'Keluar Waktu Bekerja (KWB)'
      ? `${formatTarikhRingkas(rekod.tarikhMula)} · ${rekod.masaKeluar ?? ''}${rekod.masaKembali ? '–' + rekod.masaKembali : ''}`
      : tarikhSama
        ? formatTarikhRingkas(rekod.tarikhMula)
        : `${formatTarikhRingkas(rekod.tarikhMula)} – ${formatTarikhRingkas(rekod.tarikhTamat)}`

  return (
    <div className="p-4 rounded-card border border-border bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2"
            style={{ backgroundColor: warna.bg, color: warna.teks }}
          >
            {rekod.urusan}
          </span>
          <p className="text-sm font-medium text-ink truncate">{labelSenarai(rekod)}</p>
          <p className="text-xs text-inkmuted mt-1">{julat}</p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => onLihat(rekod)} aria-label="Lihat butiran" className="p-2 rounded-card hover:bg-base text-inkmuted">
            <Eye size={16} />
          </button>
          {bolehUrus && (
            <>
              <button onClick={() => onEdit(rekod)} aria-label="Edit rekod" className="p-2 rounded-card hover:bg-base text-inkmuted">
                <Pencil size={16} />
              </button>
              <button onClick={() => onPadam(rekod.id)} aria-label="Padam rekod" className="p-2 rounded-card hover:bg-base text-brand-red">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
