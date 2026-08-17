export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-16">
      <div className="bg-surface border border-border rounded-card shadow-soft p-8 sm:p-12 lg:p-16 text-center">
        <img
          src="/logo.png"
          alt="Logo SK Pendidikan Khas Kuantan"
          className="h-20 w-20 lg:h-24 lg:w-24 object-contain mx-auto mb-5"
        />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink">
          Selamat Datang ke Laman Web Rasmi
        </h1>
        <p className="text-inkmuted mt-2 text-sm sm:text-base">
          Sekolah Kebangsaan Pendidikan Khas Kuantan
        </p>

        <p className="text-inkmuted mt-6 lg:mt-8 text-xs sm:text-sm">
          Halaman ini adalah asas (kosong) — kandungan sebenar akan ditambah page demi page.
        </p>
      </div>
    </main>
  )
}
