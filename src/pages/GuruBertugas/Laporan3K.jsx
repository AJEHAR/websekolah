import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Pencil, Trash2, Plus, Printer } from 'lucide-react'
import { useBlokLaporan3K } from '../../hooks/useBlokLaporan3K.js'
import { useLaporan3KTarikh, simpanLaporan3K, padamLaporan3K, ambilLaporan3KJulat } from '../../hooks/useLaporan3K.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useCetak } from '../../hooks/useCetak.js'
import { todayISO } from '../../lib/dateUtils.js'
import Laporan3KModal from './Laporan3KModal.jsx'
import CetakLaporan3K from './CetakLaporan3K.jsx'

export default function Laporan3K() {
  const { user } = useOutletContext()
  const [tarikh, setTarikh] = useState(todayISO())
  const { senarai: bloks, loading: loadingBlok } = useBlokLaporan3K()
  const { senarai: rekodSenarai, loading: loadingRekod, muatSemula } = useLaporan3KTarikh(tarikh)
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')

  const [blokDipilih, setBlokDipilih] = useState(null)
  const [dataCetak, setDataCetak] = useCetak()
  const [tunjukCetakJulat, setTunjukCetakJulat] = useState(false)
  const [dariTarikh, setDariTarikh] = useState('')
  const [hinggaTarikh, setHinggaTarikh] = useState('')
  const [memuatkanCetak, setMemuatkanCetak] = useState(false)

  function cetakTarikhSemasa() {
    setDataCetak([{ tarikh, bloks, rekodSenarai }])
  }

  async function cetakJulat() {
    if (!dariTarikh || !hinggaTarikh) {
      window.alert('Sila isi Dari Tarikh dan Hingga Tarikh.')
      return
    }
    setMemuatkanCetak(true)
    try {
      const semuaRekod = await ambilLaporan3KJulat(dariTarikh, hinggaTarikh)
      const tarikhUnik = [...new Set(semuaRekod.map((r) => r.tarikh))].sort()
      if (tarikhUnik.length === 0) {
        window.alert('Tiada rekod Laporan 3K dalam julat tarikh tu.')
        return
      }
      const kumpulan = tarikhUnik.map((t) => ({
        tarikh: t,
        bloks,
        rekodSenarai: semuaRekod.filter((r) => r.tarikh === t),
      }))
      setDataCetak(kumpulan)
    } finally {
      setMemuatkanCetak(false)
    }
  }

  function rekodUntukBlok(blokId) {
    return rekodSenarai.find((r) => r.blokId === blokId)
  }

  async function simpan(data) {
    await simpanLaporan3K(tarikh, blokDipilih.id, blokDipilih.nama, data, user.uid)
    setBlokDipilih(null)
    muatSemula()
  }

  async function padam(blokId) {
    if (!window.confirm('Padam rekod Laporan 3K untuk blok dan tarikh ini?')) return
    await padamLaporan3K(tarikh, blokId)
    muatSemula()
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
        <div className="max-w-xs">
          <label htmlFor="tarikh3k" className="block text-xs font-medium text-ink mb-1">Tarikh</label>
          <input
            id="tarikh3k"
            type="date"
            value={tarikh}
            onChange={(e) => setTarikh(e.target.value)}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={cetakTarikhSemasa} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink">
            <Printer size={14} /> Cetak Tarikh Ni
          </button>
          <button onClick={() => setTunjukCetakJulat((s) => !s)} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink">
            <Printer size={14} /> Cetak Julat
          </button>
        </div>
      </div>

      {tunjukCetakJulat && (
        <div className="p-3 rounded-card border border-border bg-surface mb-5 flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="dariTarikh3k" className="block text-xs font-medium text-ink mb-1">Dari Tarikh</label>
            <input id="dariTarikh3k" type="date" value={dariTarikh} onChange={(e) => setDariTarikh(e.target.value)} className="h-10 px-2 rounded-card border border-border bg-base text-xs" />
          </div>
          <div>
            <label htmlFor="hinggaTarikh3k" className="block text-xs font-medium text-ink mb-1">Hingga Tarikh</label>
            <input id="hinggaTarikh3k" type="date" value={hinggaTarikh} onChange={(e) => setHinggaTarikh(e.target.value)} className="h-10 px-2 rounded-card border border-border bg-base text-xs" />
          </div>
          <button onClick={cetakJulat} disabled={memuatkanCetak} className="h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60">
            {memuatkanCetak ? 'Memuatkan…' : 'Cetak'}
          </button>
        </div>
      )}

      {loadingBlok || loadingRekod ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : bloks.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada blok disetkan lagi. Admin perlu tambah blok dalam Panel Admin.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {bloks.map((b) => {
            const r = rekodUntukBlok(b.id)
            return (
              <div key={b.id} className="p-4 rounded-card border border-border bg-surface">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{b.nama}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setBlokDipilih(b)}
                      aria-label={r ? 'Edit rekod' : 'Isi rekod'}
                      className="p-1.5 rounded-card hover:bg-base text-inkmuted"
                    >
                      {r ? <Pencil size={15} /> : <Plus size={15} />}
                    </button>
                    {r && (
                      <button
                        onClick={() => padam(b.id)}
                        aria-label="Padam rekod"
                        className="p-1.5 rounded-card hover:bg-base text-brand-red"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {r ? (
                  <div className="mt-2 text-xs text-inkmuted space-y-1">
                    <p className="text-ink font-medium">{r.guru?.nama}</p>
                    <p className="truncate">Keselamatan: {r.catatanKeselamatan}</p>
                    <p className="truncate">Kebersihan: {r.catatanKebersihan}</p>
                    {b.adaDisiplin && <p className="truncate">Disiplin: {r.catatanDisiplin}</p>}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-brand-red">Belum diisi</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Laporan3KModal
        key={blokDipilih?.id ?? 'kosong'}
        blok={blokDipilih}
        rekod={blokDipilih ? rekodUntukBlok(blokDipilih.id) : null}
        profiles={profilesAktif}
        onClose={() => setBlokDipilih(null)}
        onSimpan={simpan}
      />

      {dataCetak && <CetakLaporan3K kumpulan={dataCetak} />}
    </div>
  )
}
