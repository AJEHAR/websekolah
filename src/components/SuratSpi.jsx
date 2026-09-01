import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, ExternalLink, Search } from 'lucide-react'
import { useDialog } from '../context/DialogContext.jsx'
import { useSuratSpi, tambahSuratSpi, kemaskiniSuratSpi, padamSuratSpi } from '../hooks/useSuratSpi.js'
import { JENIS_DOKUMEN, jenisInfo, formatTarikhSurat } from './suratSpiJenis.js'
import SuratSpiModal from './SuratSpiModal.jsx'

// Komponen DIKONGSI antara sub-page KURI dan HEM (juga mana-mana bahagian
// lain nanti) - "seksyen" tentukan koleksi data mana dipapar/disimpan.
// Data TIDAK dikongsi antara seksyen (lihat useSuratSpi.js) - sengaja,
// surat/SPI setiap bahagian selalunya jenis berlainan (cth. SPI Kurikulum
// vs SPI HEM), elak kucar-kacir. Dokumen yang relevan untuk lebih 1
// bahagian kena ditambah berasingan di setiap page (bukan auto-kongsi).
export default function SuratSpi({ seksyen }) {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { senarai, loading, muatSemula } = useSuratSpi(seksyen)

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)
  const [carian, setCarian] = useState('')
  const [jenisTapis, setJenisTapis] = useState('semua')
  const [tahunTapis, setTahunTapis] = useState('semua')

  const senaraiTahun = useMemo(() => {
    const set = new Set(senarai.filter((r) => r.tarikhSurat).map((r) => r.tarikhSurat.slice(0, 4)))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [senarai])

  const disenarai = useMemo(() => {
    return senarai
      .filter((r) => jenisTapis === 'semua' || (r.jenisDokumen ?? 'lain') === jenisTapis)
      .filter((r) => tahunTapis === 'semua' || r.tarikhSurat?.slice(0, 4) === tahunTapis)
      .filter((r) => {
        const q = carian.toLowerCase()
        if (!q) return true
        return r.perkara?.toLowerCase().includes(q) || r.noRujukan?.toLowerCase().includes(q) || r.catatan?.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        // Susun ikut Tarikh Surat (kronologi sebenar dokumen) - fallback
        // ke tarikh dimuat naik untuk rekod lama yang tiada Tarikh Surat.
        const ta = a.tarikhSurat || ''
        const tb = b.tarikhSurat || ''
        if (ta !== tb) return tb.localeCompare(ta)
        return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      })
  }, [senarai, jenisTapis, tahunTapis, carian])

  function bukaTambah() {
    setRekodEdit(null)
    setTunjukBorang(true)
  }

  function bukaEdit(rekod) {
    setRekodEdit(rekod)
    setTunjukBorang(true)
  }

  async function simpan(data) {
    if (rekodEdit) {
      await kemaskiniSuratSpi(rekodEdit.id, data, user.uid)
    } else {
      await tambahSuratSpi(seksyen, data, user.uid)
    }
    setTunjukBorang(false)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam dokumen ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamSuratSpi(id)
    muatSemula()
  }

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">Koleksi Pekeliling, SPI, Surat dan Dokumen Rasmi.</p>

      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <p className="text-xs text-inkmuted">{disenarai.length} / {senarai.length} dokumen</p>
        <button
          onClick={bukaTambah}
          className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
        >
          <Plus size={14} /> Tambah Dokumen
        </button>
      </div>

      {senarai.length > 0 && (
        <div className="space-y-2.5 mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
            <input
              type="text"
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              placeholder="Cari perkara, no. rujukan, atau catatan…"
              className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setJenisTapis('semua')}
                className="h-8 px-3 rounded-full text-xs font-semibold border"
                style={jenisTapis === 'semua' ? { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', color: '#fff' } : { borderColor: '#E5E5E5', color: '#5C5C5C' }}
              >
                Semua
              </button>
              {JENIS_DOKUMEN.map((j) => (
                <button
                  key={j.nilai}
                  onClick={() => setJenisTapis(j.nilai)}
                  className="flex items-center gap-1 h-8 px-3 rounded-full text-xs font-semibold border"
                  style={jenisTapis === j.nilai ? { backgroundColor: j.warna.fg, borderColor: j.warna.fg, color: '#fff' } : { backgroundColor: j.warna.bg, borderColor: j.warna.bg, color: j.warna.fg }}
                >
                  <j.Ikon size={11} /> {j.label}
                </button>
              ))}
            </div>
            {senaraiTahun.length > 0 && (
              <select
                value={tahunTapis}
                onChange={(e) => setTahunTapis(e.target.value)}
                className="h-8 px-2.5 rounded-full border border-border bg-surface text-xs shrink-0"
              >
                <option value="semua">Semua Tahun</option>
                {senaraiTahun.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada dokumen lagi.</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada dokumen sepadan carian/tapisan.</p>
      ) : (
        <div className="space-y-2">
          {disenarai.map((r) => {
            const j = jenisInfo(r.jenisDokumen)
            const tarikh = formatTarikhSurat(r.tarikhSurat)
            return (
              <div key={r.id} className="flex items-start gap-3 p-4 rounded-card border border-border bg-surface">
                <div className="h-10 w-10 rounded-card flex items-center justify-center shrink-0" style={{ backgroundColor: j.warna.bg, color: j.warna.fg }}>
                  <j.Ikon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: j.warna.bg, color: j.warna.fg }}>{j.label}</span>
                    {r.noRujukan && <span className="text-[10px] text-inkmuted">Ruj: {r.noRujukan}</span>}
                    {tarikh && <span className="text-[10px] text-inkmuted">· {tarikh}</span>}
                  </div>
                  <p className="text-sm font-medium text-ink">{r.perkara}</p>
                  {r.catatan && <p className="text-xs text-inkmuted mt-0.5">{r.catatan}</p>}
                  {r.failUrl && (
                    <a
                      href={r.failUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-red mt-1.5"
                    >
                      Lihat Dokumen <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => bukaEdit(r)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => padam(r.id)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <SuratSpiModal
        open={tunjukBorang}
        rekod={rekodEdit}
        onClose={() => { setTunjukBorang(false); setRekodEdit(null) }}
        onSimpan={simpan}
      />
    </div>
  )
}
