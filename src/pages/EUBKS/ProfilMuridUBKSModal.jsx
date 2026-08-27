import { useEffect, useState } from 'react'
import { X, Users, Award, Star } from 'lucide-react'
import { ambilSemuaUnitUBKS } from '../../hooks/useUnitUBKS.js'
import { ambilKehadiranUnit } from '../../hooks/useKehadiranUBKS.js'

// Profil UBKS seorang murid - dipanggil dari mana-mana senarai nama murid
// dalam modul UBKS (cth. "Ahli Unit" dalam UnitUBKSModal). Tunjuk SEMUA
// unit yang dia PERNAH sertai (rentas tahun), jawatankuasa (kalau
// dilantik - lihat Jawatankuasa UBKS), dan peratus kehadiran setiap unit.
//
// SAMBUNGAN MASA DEPAN: bahagian "Peranan Lain" di bawah adalah tempat
// letak pautan ke modul jawatankuasa LAIN yang belum dibina (cth.
// Pengawas, Ketua Tingkatan) - reka bentuk kad di sini sengaja generik
// (bukan spesifik UBKS sahaja) supaya senang tambah sumber baru nanti
// tanpa ubah struktur modal ni.
export default function ProfilMuridUBKSModal({ idMurid, nama, open, onClose }) {
  const [memuatkan, setMemuatkan] = useState(true)
  const [keahlian, setKeahlian] = useState([]) // [{ unit, ahliEntry, kehadiran: {jumlahRekod, jumlahHadir} }]

  useEffect(() => {
    if (!open || !idMurid) return
    let batal = false
    setMemuatkan(true)
    ;(async () => {
      const semuaUnit = await ambilSemuaUnitUBKS()
      const unitDisertai = semuaUnit.filter((u) => u.ahli?.some((a) => a.idMurid === idMurid))

      const denganKehadiran = await Promise.all(
        unitDisertai.map(async (unit) => {
          const ahliEntry = unit.ahli.find((a) => a.idMurid === idMurid)
          const rekodKehadiran = await ambilKehadiranUnit(unit.id)
          const rekodMelibatkanDia = rekodKehadiran.filter((r) => r.senaraiKehadiran?.some((k) => k.idMurid === idMurid))
          const jumlahHadir = rekodMelibatkanDia.filter((r) => r.senaraiKehadiran.find((k) => k.idMurid === idMurid)?.hadir).length
          return { unit, ahliEntry, kehadiran: { jumlahRekod: rekodMelibatkanDia.length, jumlahHadir } }
        })
      )

      denganKehadiran.sort((a, b) => Number(b.unit.tahunSesi) - Number(a.unit.tahunSesi))
      if (!batal) {
        setKeahlian(denganKehadiran)
        setMemuatkan(false)
      }
    })()
    return () => { batal = true }
  }, [open, idMurid])

  if (!open) return null

  const jumlahJawatan = keahlian.filter((k) => k.ahliEntry?.jawatan?.trim()).length

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[88vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0">
              <Users size={19} className="text-brand-red" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink truncate">{nama}</p>
              <p className="text-xs text-inkmuted">Profil UBKS</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted shrink-0">
            <X size={18} />
          </button>
        </div>

        {memuatkan ? (
          <p className="text-sm text-inkmuted">Memuatkan…</p>
        ) : keahlian.length === 0 ? (
          <p className="text-sm text-inkmuted text-center py-8">Murid ni belum pernah jadi ahli mana-mana unit UBKS.</p>
        ) : (
          <>
            {/* Ringkasan besar atas - gaya infografik sama dengan Analisis Keberadaan */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-card p-4 flex items-center gap-3" style={{ backgroundColor: '#0F6E561A' }}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#0F6E56' }}>
                  <Users size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-ink leading-none">{keahlian.length}</p>
                  <p className="text-[11px] text-inkmuted mt-1">unit disertai</p>
                </div>
              </div>
              <div className="rounded-card p-4 flex items-center gap-3" style={{ backgroundColor: '#D977061A' }}>
                <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#D97706' }}>
                  <Award size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-ink leading-none">{jumlahJawatan}</p>
                  <p className="text-[11px] text-inkmuted mt-1">jawatankuasa dipegang</p>
                </div>
              </div>
            </div>

            {/* Kad setiap unit - jawatan, LF, kehadiran */}
            <div className="space-y-3 mb-2">
              {keahlian.map(({ unit, ahliEntry, kehadiran }) => {
                const peratus = kehadiran.jumlahRekod > 0 ? Math.round((kehadiran.jumlahHadir / kehadiran.jumlahRekod) * 100) : null
                return (
                  <div key={unit.id} className="p-3.5 rounded-card border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{unit.namaUnit}</p>
                        <p className="text-[11px] text-inkmuted">Tahun {unit.tahunSesi}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {ahliEntry?.adalahLF && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            <Star size={10} /> LF
                          </span>
                        )}
                        {ahliEntry?.jawatan?.trim() && (
                          <span className="text-[10px] font-semibold text-brand-red bg-brand-red/10 px-2 py-1 rounded-full">
                            {ahliEntry.jawatan}
                          </span>
                        )}
                      </div>
                    </div>

                    {peratus === null ? (
                      <p className="text-[11px] text-inkmuted">Tiada rekod kehadiran lagi untuk unit ni.</p>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-inkmuted">Kehadiran</span>
                          <span className="font-semibold text-ink">{kehadiran.jumlahHadir}/{kehadiran.jumlahRekod} perjumpaan ({peratus}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-base overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${peratus}%`, backgroundColor: peratus >= 80 ? '#0F6E56' : peratus >= 50 ? '#D97706' : '#C8102E' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Tempat letak pautan modul lain (Pengawas, dll) - belum dibina */}
            <p className="text-[11px] text-inkmuted text-center pt-3 border-t border-border mt-3">
              Peranan lain (Pengawas, Ketua Tingkatan, dll) akan dipaparkan di sini apabila modul berkenaan dibina.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
