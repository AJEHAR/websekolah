import { useEffect, useState } from 'react'
import { URUSAN_OPTIONS, JENIS_MENGIKUT_URUSAN } from './constants.js'
import { muatNaikDokumen } from '../../hooks/useKeberadaan.js'

const KOSONG = {
  profilEmel: '',
  nama: '',
  kategori: '',
  jawatan: '',
  urusan: URUSAN_OPTIONS[0],
  jenis: '',
  jenisLain: '',
  catatan: '',
  tarikhMula: '',
  tarikhTamat: '',
  masaKeluar: '',
  masaKembali: '',
  tempat: '',
  dokumenURL: '',
  dokumenNama: '',
}

export default function KeberadaanForm({ profiles, rekod, emelSendiri, onSimpan, onBatal }) {
  const [data, setData] = useState(rekod ?? KOSONG)
  const [adaJulat, setAdaJulat] = useState(Boolean(rekod && rekod.tarikhTamat !== rekod.tarikhMula))
  const [failDokumen, setFailDokumen] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  const isKWB = data.urusan === 'Keluar Waktu Bekerja (KWB)'
  const senaraiJenis = JENIS_MENGIKUT_URUSAN[data.urusan] ?? []

  function pilihNama(profilEmel) {
    const p = profiles.find((pr) => pr.emel === profilEmel)
    setData((d) => ({
      ...d,
      profilEmel,
      nama: p?.nama ?? '',
      kategori: p?.kategori ?? '',
      jawatan: p?.jawatan ?? '',
    }))
  }

  function ubahUrusan(urusan) {
    setData((d) => ({ ...d, urusan, jenis: '', jenisLain: '', catatan: '', masaKeluar: '', masaKembali: '' }))
    setAdaJulat(false)
  }

  useEffect(() => {
    // Default "Pilih Nama" kepada diri sendiri bila isi borang baru (bukan edit)
    // - staff tak perlu klik dropdown setiap kali, sebab dah login akaun sendiri.
    if (rekod) return
    if (data.profilEmel) return
    if (!emelSendiri) return
    const p = profiles.find((pr) => pr.emel === emelSendiri)
    if (p) {
      setData((d) => ({ ...d, profilEmel: p.emel, nama: p.nama, kategori: p.kategori, jawatan: p.jawatan }))
    }
  }, [profiles, emelSendiri, rekod, data.profilEmel])

  useEffect(() => {
    // Untuk KWB, tarikhTamat sentiasa sama dengan tarikhMula (1 hari sahaja)
    if (isKWB) {
      setData((d) => ({ ...d, tarikhTamat: d.tarikhMula }))
    } else if (!adaJulat) {
      setData((d) => ({ ...d, tarikhTamat: d.tarikhMula }))
    }
  }, [isKWB, adaJulat, data.tarikhMula])

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)

    if (!data.profilEmel) {
      setRalat('Sila pilih nama.')
      return
    }
    if (senaraiJenis.length > 0 && !data.jenis) {
      setRalat(`Sila pilih jenis ${data.urusan}.`)
      return
    }
    if (data.jenis === 'Lain-lain (nyatakan)' && !data.jenisLain.trim()) {
      setRalat('Sila nyatakan jenis.')
      return
    }
    if (!isKWB && !data.catatan.trim()) {
      setRalat(data.urusan === 'Rasmi' ? 'Sila isi catatan nama urusan rasmi.' : 'Sila isi catatan sebab cuti.')
      return
    }
    if (!data.tarikhMula) {
      setRalat('Sila isi tarikh.')
      return
    }
    if (!isKWB && adaJulat && !data.tarikhTamat) {
      setRalat('Sila isi tarikh hingga.')
      return
    }
    if (isKWB && !data.masaKeluar) {
      setRalat('Sila isi masa keluar.')
      return
    }
    if (isKWB && !data.masaKembali) {
      setRalat('Sila isi masa kembali.')
      return
    }
    if (!data.tempat.trim()) {
      setRalat('Sila isi tempat.')
      return
    }

    setMenyimpan(true)
    try {
      let dokumenURL = data.dokumenURL
      let dokumenNama = data.dokumenNama
      if (failDokumen) {
        const hasil = await muatNaikDokumen(failDokumen, data.profilEmel)
        dokumenURL = hasil.url
        dokumenNama = hasil.nama
      }

      await onSimpan({ ...data, tempat: data.tempat.trim(), catatan: data.catatan.trim(), dokumenURL, dokumenNama })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan rekod. Cuba lagi.')
      console.error(err)
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <form onSubmit={hantar} className="space-y-5">
      <div>
        <label htmlFor="nama" className="block text-sm font-medium text-ink mb-1">Nama <span className="text-brand-red">*</span></label>
        <select
          id="nama"
          required
          value={data.profilEmel}
          onChange={(e) => pilihNama(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          <option value="">-- Pilih nama --</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.emel}>{p.nama}</option>
          ))}
        </select>
      </div>

      {data.kategori && (
        <p className="text-xs text-inkmuted -mt-3">
          Kategori: <span className="font-medium text-ink">{data.kategori}</span> · Jawatan: <span className="font-medium text-ink">{data.jawatan}</span>
        </p>
      )}

      <div>
        <label htmlFor="urusan" className="block text-sm font-medium text-ink mb-1">Urusan Keberadaan</label>
        <select
          id="urusan"
          value={data.urusan}
          onChange={(e) => ubahUrusan(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {URUSAN_OPTIONS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {senaraiJenis.length > 0 && (
        <div>
          <label htmlFor="jenis" className="block text-sm font-medium text-ink mb-1">
            Jenis {data.urusan} <span className="text-brand-red">*</span>
          </label>
          <select
            id="jenis"
            required
            value={data.jenis}
            onChange={(e) => setData((d) => ({ ...d, jenis: e.target.value, jenisLain: '' }))}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          >
            <option value="">-- Pilih jenis --</option>
            {senaraiJenis.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
      )}

      {data.jenis === 'Lain-lain (nyatakan)' && (
        <div>
          <label htmlFor="jenisLain" className="block text-sm font-medium text-ink mb-1">Nyatakan <span className="text-brand-red">*</span></label>
          <input
            id="jenisLain"
            type="text"
            required
            value={data.jenisLain}
            onChange={(e) => setData((d) => ({ ...d, jenisLain: e.target.value }))}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
      )}

      {!isKWB && (
        <div>
          <label htmlFor="catatan" className="block text-sm font-medium text-ink mb-1">
            {data.urusan === 'Rasmi' ? 'Catatan (Nama Urusan Rasmi)' : 'Catatan (Sebab Cuti)'} <span className="text-brand-red">*</span>
          </label>
          <input
            id="catatan"
            type="text"
            required
            value={data.catatan}
            onChange={(e) => setData((d) => ({ ...d, catatan: e.target.value }))}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            placeholder={data.urusan === 'Rasmi' ? 'contoh: Mesyuarat JPN' : 'contoh: Demam'}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tarikhMula" className="block text-sm font-medium text-ink mb-1">
            {isKWB ? 'Tarikh' : 'Tarikh Mula'} <span className="text-brand-red">*</span>
          </label>
          <input
            id="tarikhMula"
            type="date"
            required
            value={data.tarikhMula}
            onChange={(e) => setData((d) => ({ ...d, tarikhMula: e.target.value }))}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>

        {!isKWB && adaJulat && (
          <div>
            <label htmlFor="tarikhTamat" className="block text-sm font-medium text-ink mb-1">Tarikh Hingga <span className="text-brand-red">*</span></label>
            <input
              id="tarikhTamat"
              type="date"
              required
              min={data.tarikhMula}
              value={data.tarikhTamat}
              onChange={(e) => setData((d) => ({ ...d, tarikhTamat: e.target.value }))}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>
        )}
      </div>

      {!isKWB && (
        <label className="flex items-center gap-2 text-sm text-inkmuted -mt-2">
          <input
            type="checkbox"
            checked={adaJulat}
            onChange={(e) => setAdaJulat(e.target.checked)}
            className="h-4 w-4"
          />
          Lebih daripada 1 hari?
        </label>
      )}

      {isKWB && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="masaKeluar" className="block text-sm font-medium text-ink mb-1">Masa Keluar <span className="text-brand-red">*</span></label>
            <input
              id="masaKeluar"
              type="time"
              required
              value={data.masaKeluar}
              onChange={(e) => setData((d) => ({ ...d, masaKeluar: e.target.value }))}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>
          <div>
            <label htmlFor="masaKembali" className="block text-sm font-medium text-ink mb-1">Masa Kembali <span className="text-brand-red">*</span></label>
            <input
              id="masaKembali"
              type="time"
              required
              value={data.masaKembali}
              onChange={(e) => setData((d) => ({ ...d, masaKembali: e.target.value }))}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="tempat" className="block text-sm font-medium text-ink mb-1">Tempat <span className="text-brand-red">*</span></label>
        <input
          id="tempat"
          type="text"
          required
          value={data.tempat}
          onChange={(e) => setData((d) => ({ ...d, tempat: e.target.value }))}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
          placeholder="contoh: PPD Kuantan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Dokumen Berkaitan</label>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFailDokumen(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
        {data.dokumenNama && !failDokumen && (
          <p className="text-xs text-inkmuted mt-1">Fail sedia ada: {data.dokumenNama}</p>
        )}
      </div>

      {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={menyimpan}
          className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
        >
          {menyimpan ? 'Menyimpan…' : 'Simpan Rekod'}
        </button>
        <button
          type="button"
          onClick={onBatal}
          className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
