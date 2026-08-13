export default function KepalaSuratCetak({ tajukLaporan }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 pb-3 border-b-2 border-black">
        <img src="/logo.png" alt="Logo Sekolah" className="h-16 w-16 object-contain shrink-0" />
        <div>
          <p className="text-base font-bold uppercase leading-tight">Sekolah Kebangsaan Pendidikan Khas Kuantan</p>
          <p className="text-xs leading-tight mt-0.5">Inderah Mahkota 2, 25200 Kuantan, Pahang</p>
        </div>
      </div>
      {tajukLaporan && (
        <p className="text-sm font-bold uppercase text-center mt-4">{tajukLaporan}</p>
      )}
    </div>
  )
}
