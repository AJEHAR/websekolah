export default function KepalaSuratCetak({ tajukLaporan }) {
  return (
    <div className="mb-6 text-center text-black">
      <img src="/logo-cetak.png" alt="Logo Sekolah" className="h-20 mx-auto object-contain" />
      <p className="text-base font-bold uppercase mt-2">Sekolah Kebangsaan Pendidikan Khas Kuantan</p>
      <p className="text-xs mt-0.5">Indera Mahkota 2, 25200 Kuantan, Pahang.</p>
      {tajukLaporan && (
        <p className="text-2xl font-bold uppercase tracking-wide mt-3">{tajukLaporan}</p>
      )}
    </div>
  )
}
