import { useState } from 'react'
import { X } from 'lucide-react'
import { todayISO } from '../../lib/dateUtils.js'
import PemilihStrategiPLC from './PemilihStrategiPLC.jsx'
import PemilihAhliKumpulan from './PemilihAhliKumpulan.jsx'
import JadualButiranPerbincangan from './JadualButiranPerbincangan.jsx'

export default function LaporanPLCModal({ open, laporan, profiles, penggunaSendiri, onClose, onSimpan }) {
  const [tajukFokus, setTajukFokus] = useState(laporan?.tajukFokus ?? '')
  const [tarikh, setTarikh] = useState(laporan?.tarikh ?? todayISO())
  const [masa, setMasa] = useState(laporan?.masa ?? '')
  const [tempat, setTempat] = useState(laporan?.tempat ?? '')
  const [namaKumpulan, setNamaKumpulan] = useState(laporan?.namaKumpulan ?? '')
  const [mentorEmel, setMentorEmel] = useState(laporan?.mentorEmel ?? '')
  const [ketuaEmel, setKetuaEmel] = useState(laporan?.ketuaEmel ?? '')
  const [ahli, setAhli] = useState(laporan?.ahli ?? [])
  const [strategi, setStrategi] = useState(laporan?.strategi ?? [])
  const [butiran, setButiran] = useState(laporan?.butiran ?? [{ catatan: '', tindakan: '' }])
  const [disahkanOleh, setDisahkanOleh] = useState(laporan?.disahkanOleh ?? '')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  function cariProfile(emel) {
    return profiles.find((p) => p.emel === emel)
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)

    if (!tajukFokus.trim()) return setRalat('Sila isi Tajuk/Fokus.')
    if (!tarikh) return setRalat('Sila isi tarikh.')
    if (!namaKumpulan.trim()) return setRalat('Sila isi Nama Kumpulan.')

    const mentor = cariProfile(mentorEmel)
    const ketua = cariProfile(ketuaEmel)

    setMenyimpan(true)
    try {
      await onSimpan({
        tajukFokus: tajukFokus.trim(),
        tarikh,
        masa,
        tempat: tempat.trim(),
        namaKumpulan: namaKumpulan.trim(),
        mentorEmel: mentorEmel || null,
        mentorNama: mentor?.nama ?? '',
        mentorIc: mentor?.ic ?? '',
        ketuaEmel: ketuaEmel || null,
        ketuaNama: ketua?.nama ?? '',
        ketuaIc: ketua?.ic ?? '',
        ahli,
        strategi,
        butiran: butiran.filter((b) => b.catatan.trim() || b.tindakan.trim()),
        disediakanOlehEmel: penggunaSendiri.emel,
        disediakanOleh: penggunaSendiri.nama,
        disahkanOleh: disahkanOleh.trim(),
      })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{laporan ? 'Edit Laporan PLC' : 'Laporan PLC Baru'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="tajukFokus" className="block text-sm font-medium text-ink mb-1">Tajuk / Fokus <span className="text-brand-red">*</span></label>
            <input
              id="tajukFokus"
              type="text"
              required
              value={tajukFokus}
              onChange={(e) => setTajukFokus(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tarikhPLC" className="block text-sm font-medium text-ink mb-1">Tarikh <span className="text-brand-red">*</span></label>
              <input
                id="tarikhPLC"
                type="date"
                required
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              />
            </div>
            <div>
              <label htmlFor="masaPLC" className="block text-sm font-medium text-ink mb-1">Masa</label>
              <input
                id="masaPLC"
                type="time"
                value={masa}
                onChange={(e) => setMasa(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tempatPLC" className="block text-sm font-medium text-ink mb-1">Tempat</label>
            <input
              id="tempatPLC"
              type="text"
              value={tempat}
              onChange={(e) => setTempat(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="namaKumpulanPLC" className="block text-sm font-medium text-ink mb-1">Nama Kumpulan <span className="text-brand-red">*</span></label>
            <input
              id="namaKumpulanPLC"
              type="text"
              required
              placeholder="contoh: Kumpulan Bahasa Melayu"
              value={namaKumpulan}
              onChange={(e) => setNamaKumpulan(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="mentorPLC" className="block text-sm font-medium text-ink mb-1">Nama & No.KP Mentor</label>
              <select
                id="mentorPLC"
                value={mentorEmel}
                onChange={(e) => setMentorEmel(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              >
                <option value="">-- Pilih staff --</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.emel}>{p.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ketuaPLC" className="block text-sm font-medium text-ink mb-1">Nama & No.KP Ketua Kumpulan</label>
              <select
                id="ketuaPLC"
                value={ketuaEmel}
                onChange={(e) => setKetuaEmel(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              >
                <option value="">-- Pilih staff --</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.emel}>{p.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <PemilihAhliKumpulan profiles={profiles} dipilih={ahli} onUbah={setAhli} />

          <PemilihStrategiPLC dipilih={strategi} onUbah={setStrategi} />

          <JadualButiranPerbincangan baris={butiran} onUbah={setButiran} />

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Disediakan Oleh</label>
              <div className="min-h-11 py-2.5 px-3 rounded-card border border-border bg-base text-sm text-inkmuted">
                {penggunaSendiri.nama}
              </div>
            </div>
            <div>
              <label htmlFor="disahkanOlehPLC" className="block text-sm font-medium text-ink mb-1">Disahkan Oleh</label>
              <input
                id="disahkanOlehPLC"
                type="text"
                placeholder="Nama pengesah"
                value={disahkanOleh}
                onChange={(e) => setDisahkanOleh(e.target.value)}
                className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
              />
            </div>
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
