import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { padamSemuaDalamKoleksi } from '../../lib/resetData.js'

const DATA_UJIAN = [
  { kunci: 'kehadiran', label: 'Keberadaan Staff' },
  { kunci: 'kumpulanBertugas', label: 'Kumpulan Guru Bertugas' },
  { kunci: 'tugasBertugas', label: 'Tugas Guru Bertugas' },
  { kunci: 'laporan3K', label: 'Laporan 3K' },
  { kunci: 'laporanHarian', label: 'Laporan Harian' },
  { kunci: 'laporanPerhimpunan', label: 'Laporan Perhimpunan' },
  { kunci: 'murid', label: 'Data Murid (boleh import semula dari XLSX)' },
  { kunci: 'daftarMasukMurid', label: 'Daftar Masuk Murid (boleh import semula dari CSV)' },
  { kunci: 'sijilTamat', label: 'Sijil Tamat (boleh import semula dari CSV)' },
  { kunci: 'suratSpi', label: 'Surat/SPI' },
  { kunci: 'kertasKerja', label: 'Kertas Kerja (rekod Tajuk/Anjuran)' },
  { kunci: 'mukaDepanTahunan', label: 'Gambar Muka Depan Kertas Kerja (tahunan)' },
  { kunci: 'kehadiranMurid', label: 'Kehadiran Murid' },
  { kunci: 'hariBelajarRMT', label: 'Hari Belajar RMT' },
  { kunci: 'unitUBKS', label: 'Unit UBKS' },
  { kunci: 'kehadiranUBKS', label: 'Kehadiran UBKS' },
  { kunci: 'perancanganUBKS', label: 'Perancangan UBKS' },
]

const DATA_KONFIGURASI = [
  { kunci: 'blokLaporan3K', label: 'Blok Laporan 3K' },
  { kunci: 'kategoriUBKS', label: 'Kategori UBKS' },
  { kunci: 'tetapan', label: 'Tetapan Sistem (Lajur Murid)' },
  { kunci: 'latarHub', label: 'Latar Belakang Hub' },
  { kunci: 'profiles', label: 'Profile Staff — SEMUA staff kena daftar semula lepas ni' },
  { kunci: 'admins', label: 'Senarai Admin — BOLEH KUNCI ANDA KELUAR dari Panel Admin serta-merta' },
]

export default function ResetDataPage() {
  const { user } = useOutletContext()
  const { isSuperAdmin } = useIsAdmin(user)

  if (!isSuperAdmin) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
        <p className="text-xs text-inkmuted">Bahagian ini khas untuk Admin Penuh.</p>
      </div>
    )
  }

  return <Isi />
}

function Isi() {
  const [dipilih, setDipilih] = useState(new Set())
  const [teksSahkan, setTeksSahkan] = useState('')
  const [memadam, setMemadam] = useState(false)
  const [keputusan, setKeputusan] = useState(null)
  const [ralat, setRalat] = useState(null)

  function toggl(kunci) {
    setDipilih((s) => {
      const baru = new Set(s)
      if (baru.has(kunci)) baru.delete(kunci)
      else baru.add(kunci)
      return baru
    })
    setKeputusan(null)
  }

  const adaPilihKonfigurasi = DATA_KONFIGURASI.some((d) => dipilih.has(d.kunci))
  const frasaSahkan = adaPilihKonfigurasi ? 'PADAM SEMUA' : 'PADAM'
  const bolehPadam = dipilih.size > 0 && teksSahkan === frasaSahkan

  async function padam() {
    setMemadam(true)
    setRalat(null)
    setKeputusan(null)
    const hasil = []
    try {
      for (const kunci of dipilih) {
        const bilangan = await padamSemuaDalamKoleksi(kunci)
        hasil.push({ kunci, bilangan })
      }
      setKeputusan(hasil)
      setDipilih(new Set())
      setTeksSahkan('')
    } catch (err) {
      setRalat(err.message || 'Gagal padam. Sebahagian data mungkin dah dipadam - semak semula.')
    } finally {
      setMemadam(false)
    }
  }

  return (
    <div>
      <div className="flex items-start gap-2 p-3 rounded-card mb-5" style={{ backgroundColor: '#FBEAF0' }}>
        <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: '#72243E' }} />
        <p className="text-xs" style={{ color: '#72243E' }}>
          Untuk fasa ujian sahaja. Tindakan ni <strong>tidak boleh dibatalkan</strong> - pastikan anda benar-benar pasti sebelum padam.
        </p>
      </div>

      <h2 className="text-sm font-semibold text-ink mb-2">Data Ujian / Transaksi</h2>
      <div className="border border-border rounded-card divide-y divide-border mb-6">
        {DATA_UJIAN.map((d) => (
          <label key={d.kunci} className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-base">
            <input type="checkbox" checked={dipilih.has(d.kunci)} onChange={() => toggl(d.kunci)} className="h-4 w-4" />
            <span className="text-ink">{d.label}</span>
          </label>
        ))}
      </div>

      <h2 className="text-sm font-semibold mb-2" style={{ color: '#C8102E' }}>Data Konfigurasi (BAHAYA)</h2>
      <div className="border-2 rounded-card divide-y divide-border mb-6" style={{ borderColor: '#F0997B' }}>
        {DATA_KONFIGURASI.map((d) => (
          <label key={d.kunci} className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-base">
            <input type="checkbox" checked={dipilih.has(d.kunci)} onChange={() => toggl(d.kunci)} className="h-4 w-4 shrink-0" />
            <span className="text-ink">{d.label}</span>
          </label>
        ))}
      </div>

      {dipilih.size > 0 && (
        <div className="p-4 rounded-card border-2 mb-4" style={{ borderColor: '#C8102E' }}>
          <p className="text-sm font-medium text-ink mb-2">
            {dipilih.size} koleksi dipilih untuk dipadam. Taip <strong>{frasaSahkan}</strong> untuk sahkan:
          </p>
          <input
            type="text"
            value={teksSahkan}
            onChange={(e) => setTeksSahkan(e.target.value)}
            placeholder={frasaSahkan}
            className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm mb-3"
          />
          <button
            onClick={padam}
            disabled={!bolehPadam || memadam}
            className="w-full h-12 rounded-card text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ backgroundColor: '#C8102E' }}
          >
            <Trash2 size={16} /> {memadam ? 'Memadam…' : `Padam ${dipilih.size} Koleksi`}
          </button>
        </div>
      )}

      {ralat && <p className="text-sm text-brand-red mb-4">{ralat}</p>}

      {keputusan && (
        <div className="p-4 rounded-card bg-base">
          <p className="text-sm font-semibold text-ink mb-2">Selesai:</p>
          {keputusan.map((k) => (
            <p key={k.kunci} className="text-xs text-inkmuted">{k.kunci}: {k.bilangan} dokumen dipadam</p>
          ))}
        </div>
      )}
    </div>
  )
}
