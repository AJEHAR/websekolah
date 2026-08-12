import { useState } from 'react'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { JAWATAN_OPTIONS, KATEGORI_OPTIONS } from './constants.js'

export default function ProfileForm({ profile, onSimpan, onBatal }) {
  const [nama, setNama] = useState(profile?.nama ?? '')
  const [ic, setIc] = useState(profile?.ic ?? '')
  const [jawatan, setJawatan] = useState(profile?.jawatan ?? JAWATAN_OPTIONS[0])
  const [kategori, setKategori] = useState(profile?.kategori ?? KATEGORI_OPTIONS[0])
  const [gambarPreview, setGambarPreview] = useState(profile?.gambarURL ?? null)
  const [failGambar, setFailGambar] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  // Buang tanda '-' secara automatik semasa taip - elak isu format tak konsisten
  // (sesetengah orang taip dengan '-', sesetengah tanpa).
  function ubahIc(nilai) {
    setIc(nilai.replace(/-/g, ''))
  }

  function pilihGambar(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setFailGambar(fail)
    setGambarPreview(URL.createObjectURL(fail))
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)

    if (!nama.trim()) {
      setRalat('Sila isi nama.')
      return
    }
    if (!ic.trim()) {
      setRalat('Sila isi No. IC.')
      return
    }
    if (!jawatan) {
      setRalat('Sila pilih jawatan.')
      return
    }
    if (!kategori) {
      setRalat('Sila pilih kategori.')
      return
    }

    setMenyimpan(true)
    try {
      let gambarURL = profile?.gambarURL ?? null
      if (failGambar) {
        const hasil = await muatNaikKeDrive(failGambar, 'profil')
        gambarURL = hasil.url
      }
      await onSimpan({ nama: nama.trim(), ic: ic.trim(), jawatan, kategori, gambarURL })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan profile. Cuba lagi.')
      console.error(err)
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <form onSubmit={hantar} className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <div className="h-24 w-24 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center">
          {gambarPreview ? (
            <img src={gambarPreview} alt="Pratonton gambar profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-inkmuted">Tiada gambar</span>
          )}
        </div>
        <label className="text-sm font-medium text-brand-red cursor-pointer">
          Muat naik gambar <span className="text-inkmuted font-normal">(pilihan)</span>
          <input type="file" accept="image/*" onChange={pilihGambar} className="hidden" />
        </label>
      </div>

      <div>
        <label htmlFor="nama" className="block text-sm font-medium text-ink mb-1">Nama</label>
        <input
          id="nama"
          type="text"
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          placeholder="Nama penuh"
        />
      </div>

      <div>
        <label htmlFor="ic" className="block text-sm font-medium text-ink mb-1">No. IC</label>
        <input
          id="ic"
          type="text"
          required
          value={ic}
          onChange={(e) => ubahIc(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          placeholder="contoh: 900101010000 (tanpa tanda -)"
        />
      </div>

      <div>
        <label htmlFor="jawatan" className="block text-sm font-medium text-ink mb-1">Jawatan</label>
        <select
          id="jawatan"
          required
          value={jawatan}
          onChange={(e) => setJawatan(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {JAWATAN_OPTIONS.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="kategori" className="block text-sm font-medium text-ink mb-1">Kategori</label>
        <select
          id="kategori"
          required
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {KATEGORI_OPTIONS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={menyimpan}
          className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
        >
          {menyimpan ? 'Menyimpan…' : 'Simpan Profile'}
        </button>
        {onBatal && (
          <button
            type="button"
            onClick={onBatal}
            className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  )
}
