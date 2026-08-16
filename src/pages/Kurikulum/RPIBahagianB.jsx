import { Plus } from 'lucide-react'
import IntervensiBlok from './IntervensiBlok.jsx'

function Medan({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function RPIBahagianB({ data, onUbah }) {
  function u(medan, nilai) {
    onUbah({ ...data, [medan]: nilai })
  }

  function tambahIntervensi() {
    onUbah({
      ...data,
      intervensi: [
        ...(data.intervensi ?? []),
        { matlamatJangkaPendek: '', strategiLangkah: '', bahanAlatan: '', penilaian: '', catatan: '', pencapaian: [] },
      ],
    })
  }

  function ubahIntervensi(i, blokBaru) {
    const salinan = [...data.intervensi]
    salinan[i] = blokBaru
    u('intervensi', salinan)
  }

  function padamIntervensi(i) {
    if (!window.confirm('Padam blok intervensi ini beserta semua rekod pencapaiannya?')) return
    u('intervensi', data.intervensi.filter((_, idx) => idx !== i))
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-2">Bahagian B — Fokus RPI</h2>

      <Medan label="16. Kurikulum yang Diikuti">
        <input
          type="text"
          value={data.kurikulumDiikuti}
          onChange={(e) => u('kurikulumDiikuti', e.target.value)}
          placeholder="contoh: KSSR Pendidikan Khas (Masalah Pembelajaran)"
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
      </Medan>

      <Medan label="17. Fokus RPI">
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={data.fokusKefungsian} onChange={(e) => u('fokusKefungsian', e.target.checked)} className="h-4 w-4" />
            a) Kefungsian
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={data.fokusAkademik} onChange={(e) => u('fokusAkademik', e.target.checked)} className="h-4 w-4" />
            b) Akademik
          </label>
        </div>
      </Medan>

      <Medan label="18. Cabaran Utama">
        <textarea rows={2} value={data.cabaranUtama} onChange={(e) => u('cabaranUtama', e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
      </Medan>

      <Medan label="19. Matlamat Jangka Panjang">
        <textarea rows={2} value={data.matlamatJangkaPanjang} onChange={(e) => u('matlamatJangkaPanjang', e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
      </Medan>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-ink">20–22. Intervensi (Matlamat Jangka Pendek, Strategi & Pencapaian)</label>
        </div>
        <div className="space-y-3">
          {(data.intervensi ?? []).map((blok, i) => (
            <IntervensiBlok key={i} index={i} blok={blok} onUbah={(b) => ubahIntervensi(i, b)} onPadam={() => padamIntervensi(i)} />
          ))}
        </div>
        <button type="button" onClick={tambahIntervensi} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-red">
          <Plus size={14} /> Tambah Intervensi
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Medan label="23. Tarikh Mula">
          <input type="date" value={data.tarikhMula} onChange={(e) => u('tarikhMula', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
        </Medan>
        <Medan label="24. Tarikh Semak">
          <input type="date" value={data.tarikhSemak} onChange={(e) => u('tarikhSemak', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
        </Medan>
      </div>

      <Medan label="25. Keputusan Inventori Minat Kerjaya Pendidikan Khas (IMKPK) — Murid Tahun 6">
        <input type="text" value={data.imkpk} onChange={(e) => u('imkpk', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
      </Medan>
    </section>
  )
}
