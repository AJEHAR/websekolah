import { X } from 'lucide-react'
import KeberadaanForm from './KeberadaanForm.jsx'

export default function BorangModal({ open, onClose, profiles, rekod, emelSendiri, onSimpan }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">
            {rekod ? 'Kemas Kini Rekod' : 'Isi Borang Keberadaan'}
          </h2>
          <button onClick={onClose} aria-label="Tutup borang" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>
        <KeberadaanForm
          profiles={profiles}
          rekod={rekod}
          emelSendiri={emelSendiri}
          onSimpan={onSimpan}
          onBatal={onClose}
        />
      </div>
    </div>
  )
}
