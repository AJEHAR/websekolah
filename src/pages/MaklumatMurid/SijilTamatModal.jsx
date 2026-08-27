import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import PemilihMurid from '../../components/PemilihMurid.jsx'
import { useUnitUBKSTahun } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import { autoIsiSijil } from './sijilTamatUtils.js'

function Medan({ label, value, onChange, placeholder, autoLabel, list }) {
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
        list={list}
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

const TAHUN_SEMASA = String(new Date().getFullYear())

// Borang Sijil Tamat - pilih murid + tahun tamat -> sistem AUTO-ISI apa
// yang boleh (Maklumat Murid, Daftar Masuk, UBKS ikut tahun) - SEMUA medan
// kekal BOLEH EDIT (bukan read-only) sebab staff kena boleh betulkan kalau
// sistem salah isi. Medan yang memang tiada sumber (Kelakuan, Jumlah
// Kehadiran, Tarikh Keluar, Sebab Berhenti) kosong, staff taip terus.
export default function SijilTamatModal({ open, rekod, senaraiMurid, senaraiDaftarMasuk, onClose, onSimpan }) {
  const [muridDipilih, setMuridDipilih] = useState(null)
  // Lalai ke TAHUN SEMASA (bukan kosong) untuk rekod BARU - "Tahun Tamat"
  // kosong buat auto-isi UBKS senyap tak keluar apa-apa (sebab carian unit
  // UBKS perlukan tahun yang sah) tapi tiada penanda "wajib" pada medan
  // ni, jadi staff senang tertinggal isi. Rekod SEDIA ADA (edit) kekal
  // guna nilai tersimpan, tak diubah paksa.
  const [tahunTamat, setTahunTamat] = useState(rekod?.tahunTamat ?? TAHUN_SEMASA)
  const [medan, setMedan] = useState(MEDAN_KOSONG)
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  const { senarai: unitTahunIni } = useUnitUBKSTahun(tahunTamat)
  const { senarai: senaraiKategoriUBKS } = useKategoriUBKS()

  // Mula edit rekod sedia ada - isi semula semua medan dari rekod (bukan
  // auto-isi semula, sebab nilai yang DISIMPAN itulah yang muktamad).
  useEffect(() => {
    if (open && rekod) {
      setMuridDipilih(senaraiMurid.find((m) => m.id === rekod.muridId) ?? null)
      setTahunTamat(rekod.tahunTamat ?? '')
      setMedan({ ...MEDAN_KOSONG, ...rekod })
    } else if (open && !rekod) {
      setMuridDipilih(null)
      setTahunTamat(TAHUN_SEMASA)
      setMedan(MEDAN_KOSONG)
    }
  }, [open, rekod, senaraiMurid])

  // Pilih murid baru (borang TAMBAH sahaja, bukan edit) -> auto-isi terus.
  function pilihMurid(m) {
    setMuridDipilih(m)
    if (!rekod) {
      const rekodDaftarMasuk = senaraiDaftarMasuk.find((d) => d.muridId === m.id) ?? null
      setMedan((med) => ({ ...med, ...autoIsiSijil(m, rekodDaftarMasuk, tahunTamat, unitTahunIni, senaraiKategoriUBKS) }))
    }
  }

  // Tahun Tamat diubah (borang TAMBAH sahaja) -> cari semula unit UBKS
  // untuk tahun baru, kemaskini 3 medan kokurikulum sahaja (bukan overwrite
  // medan lain yang mungkin staff dah edit). DEPS betul: muridDipilih +
  // tahunTamat + unitTahunIni SEMUA - sebelum ni cuma [unitTahunIni] jadi
  // effect boleh terlepas kemaskini kalau tahunTamat tukar tapi unitTahunIni
  // punya rujukan array belum berubah lagi (race condition halus).
  useEffect(() => {
    if (rekod || !muridDipilih || !tahunTamat) return
    const rekodDaftarMasuk = senaraiDaftarMasuk.find((d) => d.muridId === muridDipilih.id) ?? null
    const auto = autoIsiSijil(muridDipilih, rekodDaftarMasuk, tahunTamat, unitTahunIni, senaraiKategoriUBKS)
    setMedan((med) => ({ ...med, unitBeruniform: auto.unitBeruniform, kelab: auto.kelab, sukan: auto.sukan }))
  }, [rekod, muridDipilih, tahunTamat, unitTahunIni, senaraiDaftarMasuk, senaraiKategoriUBKS])

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
            <label className="block text-xs font-medium text-ink mb-1">
              Tahun Tamat <span className="text-inkmuted font-normal">(auto tahun semasa, boleh tukar)</span>
            </label>
            <input
              type="text"
              value={tahunTamat}
              onChange={(e) => setTahunTamat(e.target.value)}
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
                  <Medan label="Unit Beruniform" value={medan.unitBeruniform} onChange={(v) => u('unitBeruniform', v)} autoLabel placeholder="Dari UBKS (kalau murid ahli tahun ni)" list="cadangan-unit-ubks" />
                  <Medan label="Kelab" value={medan.kelab} onChange={(v) => u('kelab', v)} autoLabel placeholder="Dari UBKS (kalau murid ahli tahun ni)" list="cadangan-unit-ubks" />
                  <Medan label="Sukan" value={medan.sukan} onChange={(v) => u('sukan', v)} autoLabel placeholder="Dari UBKS (kalau murid ahli tahun ni)" list="cadangan-unit-ubks" />
                </div>
                {/* Cadangan mentaip - SEMUA unit UBKS tahun ni yang murid
                    tu ahli (tak kira kategori), supaya walaupun heuristik
                    kategori tersasar, staff senang pilih terus tanpa taip
                    penuh. Datalist = cadangan sahaja, medan kekal teks
                    bebas (boleh taip apa-apa pun). */}
                <datalist id="cadangan-unit-ubks">
                  {unitTahunIni
                    .filter((un) => un.ahli?.some((a) => a.idMurid === muridDipilih?.id))
                    .map((un) => (
                      <option key={un.id} value={un.namaUnit} />
                    ))}
                </datalist>
                {tahunTamat && !medan.unitBeruniform && !medan.kelab && !medan.sukan && (() => {
                  const unitAhliDia = unitTahunIni.filter((un) => un.ahli?.some((a) => a.idMurid === muridDipilih?.id))
                  if (unitAhliDia.length === 0) {
                    return (
                      <p className="text-xs text-brand-red mt-2 font-medium">
                        ⚠ Tiada rekod keahlian UBKS dijumpai untuk murid ni pada tahun {tahunTamat} (unit UBKS tahun {tahunTamat} yang wujud: {unitTahunIni.length}). Taip manual kalau perlu.
                      </p>
                    )
                  }
                  const kategoriTiadaJenis = unitAhliDia
                    .map((un) => senaraiKategoriUBKS.find((k) => k.kod === un.kategoriUnit))
                    .filter((k) => k && !k.jenis)
                  if (kategoriTiadaJenis.length > 0) {
                    return (
                      <p className="text-xs text-brand-red mt-2 font-medium">
                        ⚠ Murid ni ahli "{unitAhliDia[0].namaUnit}" (kategori "{kategoriTiadaJenis[0].nama}") tapi kategori tu <strong>belum ditetapkan Jenis</strong> - pergi Panel Admin → Kategori UBKS, pilih "Jenis" (Unit Beruniform/Kelab/Sukan) untuk kategori tu, baru auto-isi ni berfungsi. Buat sekali sahaja, semua murid kategori sama akan terus berfungsi lepas tu.
                      </p>
                    )
                  }
                  return (
                    <p className="text-xs text-inkmuted mt-2">
                      Murid ni ahli unit UBKS tahun {tahunTamat}, tapi jenis kategori tu bukan Unit Beruniform/Kelab/Sukan (cth. ditetapkan "Lain-lain"). Cuba taip terus (cadangan akan muncul) kalau perlu masukkan juga.
                    </p>
                  )
                })()}
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
