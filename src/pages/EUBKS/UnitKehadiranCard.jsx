import { Pencil, Users } from 'lucide-react'

export default function UnitKehadiranCard({ unit, rekod, kategoriLabel, onBuka }) {
  const sudahIsi = Boolean(rekod)

  return (
    <div
      className="p-4 rounded-card border-2 bg-surface"
      style={{ borderColor: sudahIsi ? '#378ADD' : '#C8102E' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: sudahIsi ? '#E6F1FB' : '#F1EFE8' }}
          >
            {unit.gambarUnit ? (
              <img src={unit.gambarUnit} alt="" className="h-full w-full object-cover" />
            ) : (
              <Users size={16} style={{ color: sudahIsi ? '#0C447C' : '#888780' }} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{unit.namaUnit}</p>
            <p className="text-xs text-inkmuted truncate">{kategoriLabel}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0 ${!sudahIsi ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: sudahIsi ? '#378ADD' : '#C8102E' }}
        >
          {sudahIsi ? 'Sudah Diisi' : 'Belum Diisi'}
        </span>
      </div>

      {sudahIsi ? (
        <div className="grid grid-cols-3 gap-1 mt-3 text-center">
          <div>
            <p className="text-sm font-bold text-ink">{rekod.jumlahAhli}</p>
            <p className="text-[10px] text-inkmuted">Jumlah Ahli</p>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#27500A' }}>{rekod.jumlahHadir}</p>
            <p className="text-[10px] text-inkmuted">Hadir</p>
          </div>
          <div>
            <p className="text-sm font-bold text-brand-red">{rekod.jumlahTakHadir}</p>
            <p className="text-[10px] text-inkmuted">Tak Hadir</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-inkmuted mt-3">{(unit.ahli ?? []).length} ahli — belum diisi kehadiran.</p>
      )}

      <div className="mt-3 pt-3 border-t border-border">
        {sudahIsi ? (
          <button
            onClick={onBuka}
            className="w-full h-9 rounded-card text-white text-xs font-semibold flex items-center justify-center gap-1"
            style={{ backgroundColor: '#378ADD' }}
          >
            <Pencil size={13} /> Edit
          </button>
        ) : (
          <button onClick={onBuka} className="w-full h-9 rounded-card bg-brand-red text-white text-xs font-semibold">
            Isi Kehadiran
          </button>
        )}
      </div>
    </div>
  )
}
