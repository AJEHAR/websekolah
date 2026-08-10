export default function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo SK Pendidikan Khas Kuantan" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-white font-semibold text-sm">Sekolah Kebangsaan Pendidikan Khas Kuantan</p>
              <p className="text-xs text-white/60">Usaha Tetap Jaya</p>
            </div>
          </div>

          <div className="text-xs text-white/60 text-center sm:text-right">
            <p>&copy; {new Date().getFullYear()} SK Pendidikan Khas Kuantan. Hak cipta terpelihara.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
