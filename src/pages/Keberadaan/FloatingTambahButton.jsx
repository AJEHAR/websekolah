import { Plus } from 'lucide-react'

export default function FloatingTambahButton({ onClick }) {
  return (
    <div className="sticky bottom-6 z-30 flex justify-end pointer-events-none">
      <button
        onClick={onClick}
        aria-label="Isi Borang Keberadaan"
        className="pointer-events-auto h-14 w-14 rounded-full bg-brand-red text-white shadow-soft flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Plus size={26} />
      </button>
    </div>
  )
}
