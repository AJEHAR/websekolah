import { useState } from 'react'
import { X } from 'lucide-react'

export default function TakwimAcaraModal({ open, acara, tarikhAwal, senaraiUnit, onClose, onSimpan, onPadam }) {
  const [tajuk, setTajuk] = useState(acara?.tajuk ?? '')
  const [unitId, setUnitId] = useState(acara?.unitId ?? senaraiUnit[0]?.id ?? '')
  const [tarikhMula, setTarikhMula] = useState(acara?.tarikhMula ?? tarikhAwal ?? '')
  const [tarikhTamat, setTarikhTamat] = useState(acara?.tarikhTamat ?? '')
  const [masa, setMasa] = useState(acara?.masa ?? '')
  const [catatan, setCatatan] = useState(acara?.catatan ?? '')
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!tajuk.trim()) return setRalat('Sila isi Tajuk Acara.')
    if (!unitId) return setRalat('Sila pilih Unit/Panitia.')
    if (!tarikhMula) return setRalat('Sila isi Tarikh Mula.')
    if (tarikhTamat && tarikhTamat < tarikhMula) return setRalat('Tarikh Tamat tak boleh sebelum Tarikh Mula.')

    const unit = senaraiUnit.find((u) => u.id === unitId)
    setMenyimpan(true)
    try {
      await onSimpan({
        tajuk: tajuk.trim(),
        unitId,
        unitNama: unit?.namaUnit ?? '',
        warna: unit?.warna ?? '#999',
        tarikhMula,
        tarikhTamat: tarikhTamat || '',
        masa: masa.trim(),
        catatan: catatan.trim(),
      })
    } catch (err) {
      setRalat(err.message || 'Gagal simpan. Sila cuba lagi.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-md max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">{acara ? 'Edit Acara' : 'Tambah Acara'}</h2>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={hantar} className="space-y-4">
          <div>
            <label htmlFor="tajukAcara" className="block text-sm font-medium text-ink mb-1">Tajuk Acara <span className="text-brand-red">*</span></label>
            <input
              id="tajukAcara"
              type="text"
              value={tajuk}
              onChange={(e) => setTajuk(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>

          <div>
            <label htmlFor="unitAcara" className="block text-sm font-medium text-ink mb-1">Unit / Panitia <span className="text-brand-red">*</span></label>
            <select id="unitAcara" value={unitId} onChange={(e) => setUnitId(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm">
              {senaraiUnit.map((u) => (
                <option key={u.id} value={u.id}>{u.namaUnit}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tarikhMulaAcara" className="block text-sm font-medium text-ink mb-1">Tarikh Mula <span className="text-brand-red">*</span></label>
              <input id="tarikhMulaAcara" type="date" value={tarikhMula} onChange={(e) => setTarikhMula(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
            </div>
            <div>
              <label htmlFor="tarikhTamatAcara" className="block text-sm font-medium text-ink mb-1">Tarikh Tamat</label>
              <input id="tarikhTamatAcara" type="date" value={tarikhTamat} onChange={(e) => setTarikhTamat(e.target.value)} placeholder="Kosongkan jika sehari" className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="masaAcara" className="block text-sm font-medium text-ink mb-1">Masa</label>
            <input id="masaAcara" type="text" value={masa} onChange={(e) => setMasa(e.target.value)} placeholder="cth. 8.00 pagi - 12.00 tengah hari" className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
          </div>

          <div>
            <label htmlFor="catatanAcara" className="block text-sm font-medium text-ink mb-1">Catatan</label>
            <textarea id="catatanAcara" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
          </div>

          {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
              {menyimpan ? 'Menyimpan…' : 'Simpan'}
            </button>
            {acara && onPadam && (
              <button type="button" onClick={onPadam} className="h-12 px-4 rounded-card border border-border text-brand-red">
                Padam
              </button>
            )}
            <button type="button" onClick={onClose} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
