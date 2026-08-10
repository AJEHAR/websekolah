import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useBlokLaporan3K } from '../../hooks/useBlokLaporan3K.js'
import { useLaporan3KTarikh, simpanLaporan3K } from '../../hooks/useLaporan3K.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { todayISO } from '../../lib/dateUtils.js'
import Laporan3KModal from './Laporan3KModal.jsx'

export default function Laporan3K() {
  const { user } = useOutletContext()
  const [tarikh, setTarikh] = useState(todayISO())
  const { senarai: bloks, loading: loadingBlok } = useBlokLaporan3K()
  const { senarai: rekodSenarai, loading: loadingRekod, muatSemula } = useLaporan3KTarikh(tarikh)
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')

  const [blokDipilih, setBlokDipilih] = useState(null)

  function rekodUntukBlok(blokId) {
    return rekodSenarai.find((r) => r.blokId === blokId)
  }

  async function simpan(data) {
    await simpanLaporan3K(tarikh, blokDipilih.id, blokDipilih.nama, data, user.uid)
    setBlokDipilih(null)
    muatSemula()
  }

  return (
    <div>
      <div className="mb-5 max-w-xs">
        <label htmlFor="tarikh3k" className="block text-xs font-medium text-ink mb-1">Tarikh</label>
        <input
          id="tarikh3k"
          type="date"
          value={tarikh}
          onChange={(e) => setTarikh(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {loadingBlok || loadingRekod ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : bloks.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada blok disetkan lagi. Admin perlu tambah blok dalam Panel Admin.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {bloks.map((b) => {
            const r = rekodUntukBlok(b.id)
            return (
              <button
                key={b.id}
                onClick={() => setBlokDipilih(b)}
                className="text-left p-4 rounded-card border border-border bg-surface hover:border-brand-red transition-colors"
              >
                <p className="text-sm font-semibold text-ink">{b.nama}</p>
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
              </button>
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
    </div>
  )
}
