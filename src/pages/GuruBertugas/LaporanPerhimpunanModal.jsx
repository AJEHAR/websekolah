import { useState } from 'react'
import { X } from 'lucide-react'
import { namaHari, todayISO } from '../../lib/dateUtils.js'

export default function LaporanPerhimpunanModal({ open, laporan, profiles, emelSendiri, onClose, onSimpan }) {
  const [minggu, setMinggu] = useState(laporan?.minggu ?? '')
  const [tarikh, setTarikh] = useState(laporan?.tarikh ?? todayISO())
  const [laporanSivik, setLaporanSivik] = useState(laporan?.laporanSivik ?? '')
  const [halLain, setHalLain] = useState(laporan?.halLain ?? '')
  const [ucapanPentadbir, setUcapanPentadbir] = useState(laporan?.ucapanPentadbir ?? '')
  const [namaPentadbirEmel, setNamaPentadbirEmel] = useState(laporan?.namaPentadbirEmel ?? '')
  const [dilaporkanOlehEmel, setDilaporkanOlehEmel] = useState(laporan?.dilaporkanOlehEmel ?? emelSendiri ?? '')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  const hari = tarikh ? namaHari(tarikh) : ''

  function cariNama(emel) {
    return profiles.find((p) => p.emel === emel)?.nama ?? ''
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)

    if (!minggu) {
      setRalat('Sila isi minggu.')
      return
    }
    if (!tarikh) {
      setRalat('Sila isi tarikh.')
      return
    }
    if (!laporanSivik.trim()) {
      setRalat('Sila isi Laporan Sivik.')
      return
    }
    if (!namaPentadbirEmel) {
      setRalat('Sila pilih Nama Pentadbir.')
      return
    }
    if (!dilaporkanOlehEmel) {
      setRalat('Sila pilih Dilaporkan Oleh.')
      return
    }

    setMenyimpan(true)
    try {
      await onSimpan({
        minggu: Number(minggu),
        tarikh,
        hari,
        laporanSivik: laporanSivik.trim(),
        halLain: halLain.trim(),
        ucapanPentadbir: ucapanPentadbir.trim(),
        namaPentadbirEmel,
        namaPentadbir: cariNama(namaPentadbirEmel),
        dilaporkanOlehEmel,
        dilaporkanOleh: cariNama(dilaporkanOlehEmel),
      })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{laporan ? 'Edit Laporan Perhimpunan' : 'Laporan Perhimpunan Baru'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="minggu" className="block text-sm font-medium text-ink mb-1">Minggu Ke-</label>
              <input
                id="minggu"
                type="number"
                min="1"
                required
                value={minggu}
                onChange={(e) => setMinggu(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              />
            </div>
            <div>
              <label htmlFor="tarikhPerhimpunan" className="block text-sm font-medium text-ink mb-1">Tarikh</label>
              <input
                id="tarikhPerhimpunan"
                type="date"
                required
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Hari</label>
            <div className="h-11 px-3 rounded-card border border-border bg-base text-sm flex items-center text-inkmuted">
              {hari || '-'}
            </div>
          </div>

          <div>
            <label htmlFor="laporanSivik" className="block text-sm font-medium text-ink mb-1">Laporan Sivik</label>
            <textarea
              id="laporanSivik"
              required
              rows={4}
              value={laporanSivik}
              onChange={(e) => setLaporanSivik(e.target.value)}
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="halLain" className="block text-sm font-medium text-ink mb-1">Hal-Hal Lain</label>
            <textarea
              id="halLain"
              rows={4}
              value={halLain}
              onChange={(e) => setHalLain(e.target.value)}
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="ucapanPentadbir" className="block text-sm font-medium text-ink mb-1">Ucapan Pentadbir</label>
            <textarea
              id="ucapanPentadbir"
              rows={4}
              value={ucapanPentadbir}
              onChange={(e) => setUcapanPentadbir(e.target.value)}
              className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="namaPentadbir" className="block text-sm font-medium text-ink mb-1">Nama Pentadbir</label>
            <select
              id="namaPentadbir"
              required
              value={namaPentadbirEmel}
              onChange={(e) => setNamaPentadbirEmel(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            >
              <option value="">-- Pilih guru --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.emel}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dilaporkanOleh" className="block text-sm font-medium text-ink mb-1">Dilaporkan Oleh</label>
            <select
              id="dilaporkanOleh"
              required
              value={dilaporkanOlehEmel}
              onChange={(e) => setDilaporkanOlehEmel(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            >
              <option value="">-- Pilih guru --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.emel}>{p.nama}</option>
              ))}
            </select>
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
