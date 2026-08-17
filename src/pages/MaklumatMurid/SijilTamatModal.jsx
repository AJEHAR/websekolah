import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import PemilihMurid from '../../components/PemilihMurid.jsx'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { autoIsiSijil } from './sijilTamatUtils.js'

function Medan({ label, value, onChange, placeholder, autoLabel }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">
        {label}
        {autoLabel && <span className="text-inkmuted font-normal"> (auto-isi, boleh edit)</span>}
      </label>
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
  noKP: '', nama: '', kelas: '', darjah: '', tarikhMasukSekolah: '', tarikhLahir: '', namaPenjaga: '',
  noPendaftaran: '', noSuratBeranak: '', unitBeruniform: '', kelab: '', sukan: '',
  tarikhKeluarSekolah: '', sebabBerhenti: '', kelakuan: '', jumlahKehadiran: '',
}

// Borang Sijil Tamat - pilih murid + tahun tamat -> sistem AUTO-ISI apa
// yang boleh (Maklumat Murid, Daftar Masuk, UBKS ikut tahun) - SEMUA medan
// kekal BOLEH EDIT (bukan read-only) sebab staff kena boleh betulkan kalau
// sistem salah isi. Medan yang memang tiada sumber (Kelakuan, Jumlah
// Kehadiran, Tarikh Keluar, Sebab Berhenti) kosong, staff taip terus.
export default function SijilTamatModal({ open, rekod, senaraiMurid, senaraiDaftarMasuk, onClose, onSimpan }) {
  const [muridDipilih, setMuridDipilih] = useState(null)
  const [tahunTamat, setTahunTamat] = useState(rekod?.tahunTamat ?? '')
  const [medan, setMedan] = useState(MEDAN_KOSONG)
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  const { senarai: unitTahunIni } = useUnitUBKSTahun(tahunTamat)

  // Mula edit rekod sedia ada - isi semula semua medan dari rekod (bukan
  // auto-isi semula, sebab nilai yang DISIMPAN itulah yang muktamad).
  useEffect(() => {
    if (open && rekod) {
      setMuridDipilih(senaraiMurid.find((m) => m.id === rekod.muridId) ?? null)
      setTahunTamat(rekod.tahunTamat ?? '')
      setMedan({ ...MEDAN_KOSONG, ...rekod })
    } else if (open && !rekod) {
      setMuridDipilih(null)
      setTahunTamat('')
      setMedan(MEDAN_KOSONG)
    }
  }, [open, rekod, senaraiMurid])

  // Pilih murid baru (borang TAMBAH sahaja, bukan edit) -> auto-isi terus.
  function pilihMurid(m) {
    setMuridDipilih(m)
    if (!rekod) {
      const rekodDaftarMasuk = senaraiDaftarMasuk.find((d) => d.muridId === m.id) ?? null
      setMedan((med) => ({ ...med, ...autoIsiSijil(m, rekodDaftarMasuk, tahunTamat, unitTahunIni) }))
    }
  }

  // Tahun Tamat diubah (borang TAMBAH sahaja) -> cari semula unit UBKS
  // untuk tahun baru, kemaskini 3 medan kokurikulum sahaja (bukan overwrite
  // medan lain yang mungkin staff dah edit).
  function ubahTahunTamat(nilai) {
    setTahunTamat(nilai)
  }
  useEffect(() => {
    if (!rekod && muridDipilih && tahunTamat) {
      const rekodDaftarMasuk = senaraiDaftarMasuk.find((d) => d.muridId === muridDipilih.id) ?? null
      const auto = autoIsiSijil(muridDipilih, rekodDaftarMasuk, tahunTamat, unitTahunIni)
      setMedan((med) => ({ ...med, unitBeruniform: auto.unitBeruniform, kelab: auto.kelab, sukan: auto.sukan }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitTahunIni])

  if (!open) return null

  function u(kunci, nilai) {
    setMedan((med) => ({ ...med, [kunci]: nilai }))
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!muridDipilih) return setRalat('Sila pilih murid.')
    if (!tahunTamat.trim()) return setRalat('Sila isi Tahun Tamat.')

    setMenyimpan(true)
    try {
      await onSimpan({ muridId: muridDipilih.id, tahunTamat: tahunTamat.trim(), ...medan })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan rekod.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{rekod ? 'Edit Sijil Tamat' : 'Jana Sijil Tamat'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Murid</label>
            <PemilihMurid senaraiMurid={senaraiMurid} muridDipilih={muridDipilih} onPilih={pilihMurid} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tahun Tamat</label>
            <input
              type="text"
              value={tahunTamat}
              onChange={(e) => ubahTahunTamat(e.target.value)}
              placeholder="cth. 2026"
              className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm max-w-[160px]"
            />
          </div>

          {muridDipilih && (
            <>
              <div>
                <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Maklumat Murid</p>
                <div className="grid grid-cols-2 gap-3">
                  <Medan label="No. Kad Pengenalan" value={medan.noKP} onChange={(v) => u('noKP', v)} autoLabel />
                  <Medan label="Nama" value={medan.nama} onChange={(v) => u('nama', v)} autoLabel />
                  <Medan label="Kelas" value={medan.kelas} onChange={(v) => u('kelas', v)} autoLabel />
                  <Medan label="Darjah" value={medan.darjah} onChange={(v) => u('darjah', v)} autoLabel />
                  <Medan label="Tarikh Lahir" value={medan.tarikhLahir} onChange={(v) => u('tarikhLahir', v)} autoLabel />
                  <Medan label="Tarikh Masuk Sekolah" value={medan.tarikhMasukSekolah} onChange={(v) => u('tarikhMasukSekolah', v)} autoLabel />
                  <div className="col-span-2">
                    <Medan label="Nama Ibu Bapa/Penjaga" value={medan.namaPenjaga} onChange={(v) => u('namaPenjaga', v)} autoLabel />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Pendaftaran</p>
                <div className="grid grid-cols-2 gap-3">
                  <Medan label="No. Pendaftaran" value={medan.noPendaftaran} onChange={(v) => u('noPendaftaran', v)} autoLabel placeholder="Dari Daftar Masuk (kalau ada)" />
                  <Medan label="No. Surat Beranak" value={medan.noSuratBeranak} onChange={(v) => u('noSuratBeranak', v)} autoLabel placeholder="Dari Daftar Masuk (kalau ada)" />
                  <Medan label="Tarikh Keluar Sekolah" value={medan.tarikhKeluarSekolah} onChange={(v) => u('tarikhKeluarSekolah', v)} />
                  <Medan label="Sebab Berhenti" value={medan.sebabBerhenti} onChange={(v) => u('sebabBerhenti', v)} />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Kokurikulum (ikut Tahun Tamat)</p>
                <div className="grid grid-cols-1 gap-3">
                  <Medan label="Unit Beruniform" value={medan.unitBeruniform} onChange={(v) => u('unitBeruniform', v)} autoLabel />
                  <Medan label="Kelab" value={medan.kelab} onChange={(v) => u('kelab', v)} autoLabel />
                  <Medan label="Sukan" value={medan.sukan} onChange={(v) => u('sukan', v)} autoLabel />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Penilaian (taip manual)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Medan label="Kelakuan" value={medan.kelakuan} onChange={(v) => u('kelakuan', v)} placeholder="cth. Sangat Baik" />
                  <Medan label="Jumlah Kehadiran" value={medan.jumlahKehadiran} onChange={(v) => u('jumlahKehadiran', v)} placeholder="cth. 190 hari" />
                </div>
              </div>
            </>
          )}

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3 pt-1">
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
