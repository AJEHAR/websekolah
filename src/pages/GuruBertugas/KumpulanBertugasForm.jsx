import { useState } from 'react'
import { Search } from 'lucide-react'
import { WARNA_PILIHAN } from './constants.js'

export default function KumpulanBertugasForm({ kumpulan, profiles, onSimpan, onBatal }) {
  const [nama, setNama] = useState(kumpulan?.nama ?? '')
  const [warna, setWarna] = useState(
    WARNA_PILIHAN.find((w) => w.bg === kumpulan?.warnaBg) ?? WARNA_PILIHAN[0]
  )
  const [ahliDipilih, setAhliDipilih] = useState(kumpulan?.ahli ?? [])
  const [carian, setCarian] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)

  const profilDisenarai = profiles.filter((p) =>
    (p.nama ?? '').toLowerCase().includes(carian.toLowerCase())
  )

  function togglAhli(p) {
    setAhliDipilih((sedia) => {
      const wujud = sedia.some((a) => a.emel === p.emel)
      if (wujud) return sedia.filter((a) => a.emel !== p.emel)
      return [...sedia, { emel: p.emel, nama: p.nama, jawatan: p.jawatan }]
    })
  }

  async function hantar(e) {
    e.preventDefault()
    setMenyimpan(true)
    try {
      await onSimpan({
        nama,
        warnaBg: warna.bg,
        warnaTeks: warna.teks,
        ahli: ahliDipilih,
      })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <form onSubmit={hantar} className="space-y-5">
      <div>
        <label htmlFor="namaKumpulan" className="block text-sm font-medium text-ink mb-1">Nama Kumpulan <span className="text-brand-red">*</span></label>
        <input
          id="namaKumpulan"
          type="text"
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="contoh: Kumpulan 1"
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">Warna Kumpulan</label>
        <div className="flex flex-wrap gap-2">
          {WARNA_PILIHAN.map((w) => (
            <button
              key={w.nama}
              type="button"
              onClick={() => setWarna(w)}
              aria-label={w.nama}
              className="h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{
                backgroundColor: w.bg,
                color: w.teks,
                outline: warna.nama === w.nama ? `2px solid ${w.teks}` : 'none',
                outlineOffset: '2px',
              }}
            >
              {w.nama}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Ahli Kumpulan {ahliDipilih.length > 0 && `(${ahliDipilih.length} dipilih)`}
        </label>
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            type="text"
            value={carian}
            onChange={(e) => setCarian(e.target.value)}
            placeholder="Cari nama staff…"
            className="w-full h-10 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        <div className="max-h-48 overflow-y-auto border border-border rounded-card divide-y divide-border">
          {profilDisenarai.length === 0 ? (
            <p className="p-3 text-xs text-inkmuted">Tiada staff dijumpai.</p>
          ) : (
            profilDisenarai.map((p) => {
              const dipilih = ahliDipilih.some((a) => a.emel === p.emel)
              return (
                <label key={p.id} className="flex items-center gap-3 p-2.5 text-sm cursor-pointer hover:bg-base">
                  <input
                    type="checkbox"
                    checked={dipilih}
                    onChange={() => togglAhli(p)}
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="text-ink">{p.nama}</span>
                  <span className="text-xs text-inkmuted">{p.jawatan}</span>
                </label>
              )
            })
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={menyimpan}
          className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
        >
          {menyimpan ? 'Menyimpan…' : 'Simpan Kumpulan'}
        </button>
        <button type="button" onClick={onBatal} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
          Batal
        </button>
      </div>
    </form>
  )
}
