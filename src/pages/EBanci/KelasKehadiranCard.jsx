import { Eye, Pencil, Trash2 } from 'lucide-react'

export default function KelasKehadiranCard({ kelas, rekod, onIsi, onLihat, onPadam }) {
  const sudahIsi = Boolean(rekod)

  return (
    <div
      className="p-4 rounded-card border-2 bg-surface"
      style={{ borderColor: sudahIsi ? '#378ADD' : '#C8102E' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{kelas.namaKelas}</p>
          <p className="text-xs text-inkmuted truncate">{kelas.guru || 'Tiada guru kelas'}</p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0 ${!sudahIsi ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: sudahIsi ? '#378ADD' : '#C8102E' }}
        >
          {sudahIsi ? 'Sudah Diisi' : 'Belum Diisi'}
        </span>
      </div>

      {sudahIsi ? (
        <div className="grid grid-cols-4 gap-1 mt-3 text-center">
          <div>
            <p className="text-sm font-bold text-ink">{rekod.jumlahMurid}</p>
            <p className="text-[10px] text-inkmuted">Jumlah</p>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#27500A' }}>{rekod.jumlahHadir}</p>
            <p className="text-[10px] text-inkmuted">Hadir</p>
          </div>
          <div>
            <p className="text-sm font-bold text-brand-red">{rekod.jumlahTakHadir}</p>
            <p className="text-[10px] text-inkmuted">Tak Hadir</p>
          </div>
          <div>
            <p className="text-sm font-bold text-ink">{rekod.peratusKehadiran}%</p>
            <p className="text-[10px] text-inkmuted">Peratus</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-inkmuted mt-3">{kelas.ahli.length} murid — belum diisi kehadiran.</p>
      )}

      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
        <button onClick={onIsi} className="flex-1 h-9 rounded-card bg-brand-red text-white text-xs font-semibold flex items-center justify-center gap-1">
          {sudahIsi ? <><Pencil size={13} /> Edit</> : 'Isi Kehadiran'}
        </button>
        {sudahIsi && (
          <>
            <button onClick={onLihat} aria-label="Lihat butiran" className="p-2 rounded-card hover:bg-base text-inkmuted">
              <Eye size={16} />
            </button>
            <button onClick={onPadam} aria-label="Padam rekod" className="p-2 rounded-card hover:bg-base text-brand-red">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
