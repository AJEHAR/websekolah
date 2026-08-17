import { useState } from 'react'
import { X } from 'lucide-react'
import PemilihMurid from './PemilihMurid.jsx'

export default function PrasidangModal({ open, prasidang, senaraiMurid, onClose, onSimpan }) {
  const [muridDipilih, setMuridDipilih] = useState(
    prasidang?.muridId ? senaraiMurid.find((m) => m.id === prasidang.muridId) ?? null : null
  )
  const [kelas, setKelas] = useState(prasidang?.kelas ?? '')
  const [keupayaanMurid, setKeupayaanMurid] = useState(prasidang?.keupayaanMurid ?? '')
  const [cabaranUtama, setCabaranUtama] = useState(prasidang?.cabaranUtama ?? '')
  const [matlamat, setMatlamat] = useState(prasidang?.matlamat ?? '')
  const [cadanganStrategi, setCadanganStrategi] = useState(prasidang?.cadanganStrategi ?? '')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  function pilihMurid(m) {
    setMuridDipilih(m)
    if (m) setKelas(m.namaKelas || '')
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!muridDipilih) return setRalat('Sila pilih murid.')

    setMenyimpan(true)
    try {
      await onSimpan({
        muridId: muridDipilih.id,
        muridNama: muridDipilih.nama,
        kelas: kelas.trim(),
        keupayaanMurid: keupayaanMurid.trim(),
        cabaranUtama: cabaranUtama.trim(),
        matlamat: matlamat.trim(),
        cadanganStrategi: cadanganStrategi.trim(),
      })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{prasidang ? 'Edit Rumusan Prasidang' : 'Rumusan Prasidang Baru'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Murid <span className="text-brand-red">*</span></label>
            <PemilihMurid senaraiMurid={senaraiMurid} muridDipilih={muridDipilih} onPilih={pilihMurid} />
          </div>

          <div>
            <label htmlFor="kelasPrasidang" className="block text-sm font-medium text-ink mb-1">Kelas</label>
            <input id="kelasPrasidang" type="text" value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
          </div>

          <div>
            <label htmlFor="keupayaanPrasidang" className="block text-sm font-medium text-ink mb-1">Keupayaan Murid</label>
            <textarea id="keupayaanPrasidang" rows={2} value={keupayaanMurid} onChange={(e) => setKeupayaanMurid(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
          </div>

          <div>
            <label htmlFor="cabaranPrasidang" className="block text-sm font-medium text-ink mb-1">Cabaran Utama</label>
            <textarea id="cabaranPrasidang" rows={2} value={cabaranUtama} onChange={(e) => setCabaranUtama(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
          </div>

          <div>
            <label htmlFor="matlamatPrasidang" className="block text-sm font-medium text-ink mb-1">Matlamat</label>
            <textarea id="matlamatPrasidang" rows={2} value={matlamat} onChange={(e) => setMatlamat(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
          </div>

          <div>
            <label htmlFor="strategiPrasidang" className="block text-sm font-medium text-ink mb-1">Cadangan Strategi</label>
            <textarea id="strategiPrasidang" rows={2} value={cadanganStrategi} onChange={(e) => setCadanganStrategi(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
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
