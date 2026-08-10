import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../lib/firebase.js'
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

  function pilihGambar(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setFailGambar(fail)
    setGambarPreview(URL.createObjectURL(fail))
  }

  async function hantar(e) {
    e.preventDefault()
    setMenyimpan(true)
    setRalat(null)
    try {
      let gambarURL = profile?.gambarURL ?? null
      if (failGambar) {
        const path = `profil/${profile?.emel ?? 'baru'}-${Date.now()}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, failGambar)
        gambarURL = await getDownloadURL(storageRef)
      }
      await onSimpan({ nama, ic, jawatan, kategori, gambarURL })
    } catch (err) {
      setRalat('Gagal simpan profile. Cuba lagi.')
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
          Muat naik gambar
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
          onChange={(e) => setIc(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          placeholder="contoh: 900101-01-0000"
        />
      </div>

      <div>
        <label htmlFor="jawatan" className="block text-sm font-medium text-ink mb-1">Jawatan</label>
        <select
          id="jawatan"
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
