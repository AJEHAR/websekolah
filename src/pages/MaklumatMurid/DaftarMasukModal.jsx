import { useState } from 'react'
import { X } from 'lucide-react'
import PemilihMurid from '../../components/PemilihMurid.jsx'
import { gabungAlamat, darjahMurid } from './daftarMasukUtils.js'

function Medan({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm"
      />
    </div>
  )
}

const MEDAN_KOSONG = {
  tarikhMasuk: '', nama: '', jantina: '', bangsa: '', agama: '', noPengenalan: '',
  tarikhLahir: '', bilanganSuratBeranak: '', tempatDiperanakkan: '', darjah: '',
  noKebenaran: '', namaPenjaga: '', persaudaraan: '', pekerjaan: '', alamat: '', sekolahDahulu: '',
}

// Borang Daftar Masuk Murid - SNAPSHOT sepenuhnya (semua medan disimpan
// terus, BUKAN diambil langsung dari rekod Murid semasa). Sengaja begini
// (bukan corak Kertas Kerja/Daftar Keluar yang ambil langsung) sebab ni
// BUKU DAFTAR - rekod SEJARAH kemasukan (cth. "Darjah 1" masa masuk 2020)
// - kalau ambil terus dari Murid semasa, darjah akan tunjuk darjah
// SEKARANG (cth. "Darjah 6" tahun 2026), BUKAN darjah semasa didaftarkan.
//
// Pilih murid (pilihan, bukan wajib) cuma untuk AUTO-ISI pantas (jimat
// taip) - staff tetap boleh taip semua manual terus tanpa pilih murid
// (untuk rekod lama yang muridnya dah tiada dalam senarai Murid semasa).
export default function DaftarMasukModal({ open, rekod, senaraiMurid, onClose, onSimpan }) {
  const [muridDipilih, setMuridDipilih] = useState(null)
  const [medan, setMedan] = useState({ ...MEDAN_KOSONG, ...rekod })
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  function u(kunci, nilai) {
    setMedan((m) => ({ ...m, [kunci]: nilai }))
  }

  function pilihMurid(m) {
    setMuridDipilih(m)
    if (!m) return
    setMedan((med) => ({
      ...med,
      tarikhMasuk: m.tarikhMasukSekolah || med.tarikhMasuk,
      nama: m.nama || med.nama,
      jantina: m.jantina || med.jantina,
      bangsa: m.kaum || med.bangsa,
      agama: m.agama || med.agama,
      noPengenalan: m.noPengenalan || med.noPengenalan,
      tarikhLahir: m.tarikhLahir || med.tarikhLahir,
      darjah: darjahMurid(m) || med.darjah,
      namaPenjaga: m.penjaga1Nama || med.namaPenjaga,
      persaudaraan: m.penjaga1Hubungan || med.persaudaraan,
      pekerjaan: m.penjaga1Pekerjaan || med.pekerjaan,
      alamat: gabungAlamat(m) || med.alamat,
    }))
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!medan.nama.trim()) return setRalat('Sila isi Nama.')

    setMenyimpan(true)
    try {
      await onSimpan({ ...medan, muridId: muridDipilih?.id ?? rekod?.muridId ?? null })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan rekod.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{rekod ? 'Edit Rekod Daftar Masuk' : 'Daftar Masuk Murid'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Auto-isi dari rekod Murid (pilihan)</label>
            <PemilihMurid senaraiMurid={senaraiMurid} muridDipilih={muridDipilih} onPilih={pilihMurid} />
            <p className="text-[11px] text-inkmuted mt-1">Pilih untuk auto-isi pantas, atau biar kosong dan taip semua manual (untuk rekod lama yang murid dah tiada dalam senarai semasa).</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Medan label="Tarikh Masuk" value={medan.tarikhMasuk} onChange={(v) => u('tarikhMasuk', v)} />
            <Medan label="Nama" value={medan.nama} onChange={(v) => u('nama', v)} />
            <Medan label="Jantina" value={medan.jantina} onChange={(v) => u('jantina', v)} />
            <Medan label="Bangsa" value={medan.bangsa} onChange={(v) => u('bangsa', v)} />
            <Medan label="Agama" value={medan.agama} onChange={(v) => u('agama', v)} />
            <Medan label="No. Kad Pengenalan" value={medan.noPengenalan} onChange={(v) => u('noPengenalan', v)} />
            <Medan label="Tarikh Lahir (Diperanakkan)" value={medan.tarikhLahir} onChange={(v) => u('tarikhLahir', v)} />
            <Medan label="Bilangan Surat Beranak" value={medan.bilanganSuratBeranak} onChange={(v) => u('bilanganSuratBeranak', v)} />
            <Medan label="Tempat Diperanakkan" value={medan.tempatDiperanakkan} onChange={(v) => u('tempatDiperanakkan', v)} />
            <Medan label="Darjah" value={medan.darjah} onChange={(v) => u('darjah', v)} placeholder="Darjah SEMASA didaftarkan" />
            <Medan label="No. Kebenaran" value={medan.noKebenaran} onChange={(v) => u('noKebenaran', v)} />
            <Medan label="Nama Penjaga" value={medan.namaPenjaga} onChange={(v) => u('namaPenjaga', v)} />
            <Medan label="Persaudaraan" value={medan.persaudaraan} onChange={(v) => u('persaudaraan', v)} />
            <Medan label="Pekerjaan" value={medan.pekerjaan} onChange={(v) => u('pekerjaan', v)} />
          </div>

          <Medan label="Alamat" value={medan.alamat} onChange={(v) => u('alamat', v)} />
          <Medan label="Sekolah Dahulu" value={medan.sekolahDahulu} onChange={(v) => u('sekolahDahulu', v)} placeholder="Kosongkan kalau bukan pindahan" />

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {menyimpan ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button type="button" onClick={onClose} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
