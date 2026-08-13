export default function KepalaSuratCetak({ tajukLaporan }) {
  return (
    <div className="mb-6 text-center">
      <img src="/logo-cetak.png" alt="Logo Sekolah" className="h-20 mx-auto object-contain" />
      <p className="text-base font-bold uppercase mt-2">Sekolah Kebangsaan Pendidikan Khas Kuantan</p>
      {tajukLaporan && (
        <p className="text-sm font-bold uppercase mt-4">{tajukLaporan}</p>
      )}
    </div>
  )
}
