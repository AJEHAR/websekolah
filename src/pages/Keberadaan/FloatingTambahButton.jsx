import { Plus } from 'lucide-react'

export default function FloatingTambahButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Isi Borang Keberadaan"
      className="fixed bottom-6 right-5 z-30 h-14 w-14 rounded-full bg-brand-red text-white shadow-soft flex items-center justify-center hover:opacity-90 transition-opacity"
    >
      <Plus size={26} />
    </button>
  )
}
