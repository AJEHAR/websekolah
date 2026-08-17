import { useState } from 'react'
import { X } from 'lucide-react'
import PemilihMurid from '../../components/PemilihMurid.jsx'
import { gabungAlamat, darjahMurid } from './daftarMasukUtils.js'

function MedanAuto({ label, nilai }) {
  return (
    <div>
      <p className="text-xs text-inkmuted mb-0.5">{label}</p>
      <p className="text-sm text-ink font-medium">{nilai || '-'}</p>
    </div>
  )
}

// Borang Daftar Masuk Murid - staff PILIH murid sedia ada (bukan taip
// semula 12 medan yang dah wujud dalam data APDM import - elak data tak
// sepadan antara dua tempat). Cuma 4 medan BAHARU (tiada dalam APDM) yang
// staff perlu taip sendiri. "Bilangan" (lajur pertama buku daftar) auto
// ikut turutan sistem - tak perlu/tak boleh diisi manual di sini.
export default function DaftarMasukModal({ open, rekod, senaraiMurid, onClose, onSimpan }) {
  const [muridDipilih, setMuridDipilih] = useState(
    rekod?.muridId ? senaraiMurid.find((m) => m.id === rekod.muridId) ?? null : null
  )
  const [bilanganSuratBeranak, setBilanganSuratBeranak] = useState(rekod?.bilanganSuratBeranak ?? '')
  const [tempatDiperanakkan, setTempatDiperanakkan] = useState(rekod?.tempatDiperanakkan ?? '')
  const [noKebenaran, setNoKebenaran] = useState(rekod?.noKebenaran ?? '')
  const [sekolahDahulu, setSekolahDahulu] = useState(rekod?.sekolahDahulu ?? '')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!muridDipilih) return setRalat('Sila pilih murid.')

    setMenyimpan(true)
    try {
      await onSimpan({
        muridId: muridDipilih.id,
        muridNama: muridDipilih.nama,
        bilanganSuratBeranak: bilanganSuratBeranak.trim(),
        tempatDiperanakkan: tempatDiperanakkan.trim(),
        noKebenaran: noKebenaran.trim(),
        sekolahDahulu: sekolahDahulu.trim(),
      })
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
            <label className="block text-sm font-medium text-ink mb-1">Nama Murid</label>
            <PemilihMurid senaraiMurid={senaraiMurid} muridDipilih={muridDipilih} onPilih={setMuridDipilih} />
          </div>

          {muridDipilih && (
            <div className="p-3 rounded-card border border-border bg-base grid grid-cols-2 gap-3">
              <MedanAuto label="Tarikh Masuk" nilai={muridDipilih.tarikhMasukSekolah} />
              <MedanAuto label="Jantina" nilai={muridDipilih.jantina} />
              <MedanAuto label="Bangsa" nilai={muridDipilih.kaum} />
              <MedanAuto label="Agama" nilai={muridDipilih.agama} />
              <MedanAuto label="No. Kad Pengenalan" nilai={muridDipilih.noPengenalan} />
              <MedanAuto label="Tarikh Diperanakkan" nilai={muridDipilih.tarikhLahir} />
              <MedanAuto label="Darjah" nilai={darjahMurid(muridDipilih)} />
              <MedanAuto label="Nama Penjaga" nilai={muridDipilih.penjaga1Nama} />
              <MedanAuto label="Persaudaraan" nilai={muridDipilih.penjaga1Hubungan} />
              <MedanAuto label="Pekerjaan" nilai={muridDipilih.penjaga1Pekerjaan} />
              <div className="col-span-2">
                <MedanAuto label="Alamat" nilai={gabungAlamat(muridDipilih)} />
              </div>
              <p className="col-span-2 text-[11px] text-inkmuted italic">
                12 medan di atas diambil terus dari data Murid (import APDM) - tak boleh diubah di sini. Kemaskini di HEM &gt; Import kalau tersilap.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="bilanganSurat" className="block text-sm font-medium text-ink mb-1">Bilangan Surat Beranak</label>
            <input
              id="bilanganSurat"
              type="text"
              value={bilanganSuratBeranak}
              onChange={(e) => setBilanganSuratBeranak(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="tempatDiperanakkan" className="block text-sm font-medium text-ink mb-1">Tempat Diperanakkan</label>
            <input
              id="tempatDiperanakkan"
              type="text"
              value={tempatDiperanakkan}
              onChange={(e) => setTempatDiperanakkan(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="noKebenaran" className="block text-sm font-medium text-ink mb-1">No. Kebenaran</label>
            <input
              id="noKebenaran"
              type="text"
              value={noKebenaran}
              onChange={(e) => setNoKebenaran(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="sekolahDahulu" className="block text-sm font-medium text-ink mb-1">Sekolah Dahulu</label>
            <input
              id="sekolahDahulu"
              type="text"
              value={sekolahDahulu}
              onChange={(e) => setSekolahDahulu(e.target.value)}
              placeholder="Kosongkan kalau murid baharu (bukan pindahan)"
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

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
