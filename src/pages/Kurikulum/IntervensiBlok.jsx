import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { todayISO } from '../../lib/dateUtils.js'

function medanTextarea(label, nilai, onUbah, rows = 2) {
  return (
    <div>
      <label className="block text-xs text-inkmuted mb-1">{label}</label>
      <textarea
        rows={rows}
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
        className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none"
      />
    </div>
  )
}

// satu blok intervensi: { matlamatJangkaPendek, strategiLangkah, bahanAlatan, penilaian, catatan, pencapaian: [{tarikhDari, tarikhHingga, catatan}] }
export default function IntervensiBlok({ index, blok, onUbah, onPadam }) {
  const [terbuka, setTerbuka] = useState(true)

  function ubahMedan(medan, nilai) {
    onUbah({ ...blok, [medan]: nilai })
  }

  function tambahPencapaian() {
    onUbah({ ...blok, pencapaian: [...(blok.pencapaian ?? []), { tarikhDari: todayISO(), tarikhHingga: '', catatan: '' }] })
  }

  function ubahPencapaian(i, medan, nilai) {
    const salinan = [...blok.pencapaian]
    salinan[i] = { ...salinan[i], [medan]: nilai }
    onUbah({ ...blok, pencapaian: salinan })
  }

  function padamPencapaian(i) {
    onUbah({ ...blok, pencapaian: blok.pencapaian.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-base">
        <button type="button" onClick={() => setTerbuka((s) => !s)} className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ChevronDown size={16} className={`transition-transform ${terbuka ? 'rotate-180' : ''}`} />
          Intervensi {index + 1}{blok.matlamatJangkaPendek ? `: ${blok.matlamatJangkaPendek.slice(0, 40)}` : ''}
        </button>
        <button type="button" onClick={onPadam} aria-label="Padam intervensi" className="p-1.5 rounded-card hover:bg-surface text-brand-red">
          <Trash2 size={14} />
        </button>
      </div>

      {terbuka && (
        <div className="p-3 space-y-3">
          {medanTextarea('Matlamat Jangka Pendek', blok.matlamatJangkaPendek, (v) => ubahMedan('matlamatJangkaPendek', v))}
          {medanTextarea('Strategi Intervensi (langkah-langkah aktiviti)', blok.strategiLangkah, (v) => ubahMedan('strategiLangkah', v), 4)}
          {medanTextarea('Cadangan Bahan/Alatan', blok.bahanAlatan, (v) => ubahMedan('bahanAlatan', v))}
          {medanTextarea('Penilaian', blok.penilaian, (v) => ubahMedan('penilaian', v))}
          {medanTextarea('Catatan', blok.catatan, (v) => ubahMedan('catatan', v))}

          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Rekod Pencapaian</label>
            <div className="space-y-2">
              {(blok.pencapaian ?? []).map((p, i) => (
                <div key={i} className="p-2.5 rounded-card border border-border bg-base space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="date"
                        value={p.tarikhDari}
                        onChange={(e) => ubahPencapaian(i, 'tarikhDari', e.target.value)}
                        className="h-9 px-2 rounded-card border border-border bg-surface text-xs"
                      />
                      <span className="text-xs text-inkmuted">hingga</span>
                      <input
                        type="date"
                        value={p.tarikhHingga}
                        onChange={(e) => ubahPencapaian(i, 'tarikhHingga', e.target.value)}
                        className="h-9 px-2 rounded-card border border-border bg-surface text-xs"
                      />
                    </div>
                    <button type="button" onClick={() => padamPencapaian(i)} aria-label="Padam rekod pencapaian" className="p-1.5 rounded-card hover:bg-surface text-brand-red shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={p.catatan}
                    onChange={(e) => ubahPencapaian(i, 'catatan', e.target.value)}
                    placeholder="cth: Murid boleh menulis huruf a dan b dengan bimbingan guru"
                    className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none"
                  />
                </div>
              ))}
            </div>
            <button type="button" onClick={tambahPencapaian} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-red">
              <Plus size={13} /> Tambah Rekod Pencapaian
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
