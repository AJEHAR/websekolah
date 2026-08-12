import { Plus, Users } from 'lucide-react'

export default function UnitPerancanganCard({ unit, kategoriLabel, adaPerancangan, jumlahSelesai, jumlahKeseluruhan, onBuka }) {
  const gambar = unit.gambarUnit

  return (
    <button
      onClick={onBuka}
      className="relative aspect-square rounded-card overflow-hidden text-left group"
      style={{
        backgroundImage: gambar ? `url(${gambar})` : undefined,
        backgroundColor: gambar ? undefined : '#1A1A1A',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!gambar && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Users size={56} className="text-white" />
        </div>
      )}

      {/* Gradient scrim - pastikan teks sentiasa jelas dibaca atas apa-apa gambar */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.78) 100%)' }} />

      {/* Badge kategori - atas kiri */}
      <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-1 rounded-full bg-white/90 text-ink">
        {kategoriLabel}
      </span>

      {/* Badge status - atas kanan */}
      {adaPerancangan ? (
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: jumlahSelesai === jumlahKeseluruhan && jumlahKeseluruhan > 0 ? '#27500A' : '#378ADD' }}
        >
          {jumlahSelesai}/{jumlahKeseluruhan} Selesai
        </span>
      ) : (
        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#C8102E' }}>
          Belum Ada
        </span>
      )}

      {/* Nama unit - bawah, atas scrim gelap */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-sm font-bold text-white leading-tight drop-shadow-sm">{unit.namaUnit}</p>
      </div>

      {/* CTA "+ Perancangan" - sentiasa nampak (bukan hover sahaja) kalau belum ada perancangan */}
      {!adaPerancangan && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-full shadow-lg" style={{ backgroundColor: '#C8102E' }}>
            <Plus size={14} /> Perancangan
          </span>
        </div>
      )}
    </button>
  )
}
