import { useMemo, useState } from 'react'
import { Copy, Check, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import { useKehadiranTarikh } from '../../hooks/useKehadiranMurid.js'
import { todayISO, formatTarikhPaparan, namaHari } from '../../lib/dateUtils.js'
import { useDialog } from '../../context/DialogContext.jsx'

const LABEL_KATEGORI = {
  PRASEKOLAH: 'MBK Prasekolah',
  ASRAMA: 'MBK Asrama',
  HARIAN: 'MBK Harian',
}

// Salin ke clipboard dengan fallback - navigator.clipboard.writeText() kadang
// gagal senyap di sesetengah browser desktop (dasar keselamatan/permission).
async function salinTeks(teks) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(teks)
      return true
    }
  } catch (err) {
    console.warn('Clipboard API gagal, cuba fallback', err)
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = teks
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const berjaya = document.execCommand('copy')
    document.body.removeChild(textarea)
    return berjaya
  } catch (err) {
    console.error('Fallback salin pun gagal', err)
    return false
  }
}

export default function LaporanBanci() {
  const { amaran } = useDialog()
  const [tarikh, setTarikh] = useState(todayISO())
  const { senarai: muridSenarai, loading: loadingMurid } = useMuridList()
  const { senarai: kehadiranSenarai, loading: loadingKehadiran } = useKehadiranTarikh(tarikh)
  const [disalinSenarai, setDisalinSenarai] = useState(false)
  const [disalinPapan, setDisalinPapan] = useState(false)

  const semuaKelas = useMemo(() => {
    const set = new Set()
    muridSenarai.forEach((m) => {
      if (m.namaKelas?.trim()) set.add(m.namaKelas.trim())
    })
    return [...set].sort()
  }, [muridSenarai])

  const kelasSudahIsi = new Set(kehadiranSenarai.map((r) => r.namaKelas))
  const kelasBelumIsi = semuaKelas.filter((k) => !kelasSudahIsi.has(k))

  const mesejWhatsapp = `Kelas yang disenaraikan sila isi banci dengan segera:\n\n${kelasBelumIsi
    .map((k) => `- ${k}`)
    .join('\n')}`

  async function salinSenarai() {
    const berjaya = await salinTeks(mesejWhatsapp)
    if (berjaya) {
      setDisalinSenarai(true)
      setTimeout(() => setDisalinSenarai(false), 2000)
    } else {
      await amaran('Gagal salin. Sila salin manual daripada kotak teks tu.')
    }
  }

  const statistik = useMemo(() => {
    const kategori = {
      PRASEKOLAH: { bilangan: 0, hadir: 0 },
      ASRAMA: { bilangan: 0, hadir: 0 },
      HARIAN: { bilangan: 0, hadir: 0 },
    }
    kehadiranSenarai.forEach((rekod) => {
      rekod.senaraiMurid.forEach((m) => {
        const k = kategori[m.kategoriBanci] ? m.kategoriBanci : 'HARIAN'
        kategori[k].bilangan += 1
        if (m.hadir) kategori[k].hadir += 1
      })
    })
    return kategori
  }, [kehadiranSenarai])

  const keseluruhan = Object.values(statistik).reduce(
    (jumlah, k) => ({ bilangan: jumlah.bilangan + k.bilangan, hadir: jumlah.hadir + k.hadir }),
    { bilangan: 0, hadir: 0 }
  )

  function peratus(hadir, bilangan) {
    return bilangan > 0 ? ((hadir / bilangan) * 100).toFixed(1) : '0.0'
  }

  const teksPapan = [
    'SK PENDIDIKAN KHAS KUANTAN',
    'DATA ENROLMEN MBK',
    `Tarikh: ${tarikh}  |  Hari: ${namaHari(tarikh)}`,
    '',
    ...Object.entries(statistik).map(([k, v]) =>
      `${LABEL_KATEGORI[k]}: ${v.bilangan} murid, ${v.hadir} hadir, ${v.bilangan - v.hadir} tak hadir, ${peratus(v.hadir, v.bilangan)}%`
    ),
    '',
    `KESELURUHAN: ${keseluruhan.bilangan} murid, ${keseluruhan.hadir} hadir, ${keseluruhan.bilangan - keseluruhan.hadir} tak hadir, ${peratus(keseluruhan.hadir, keseluruhan.bilangan)}%`,
  ].join('\n')

  async function salinPapan() {
    const berjaya = await salinTeks(teksPapan)
    if (berjaya) {
      setDisalinPapan(true)
      setTimeout(() => setDisalinPapan(false), 2000)
    } else {
      await amaran('Gagal salin. Sila salin manual daripada papan tu.')
    }
  }

  return (
    <div>
      <div className="mb-5 max-w-xs">
        <label htmlFor="tarikhBanci" className="block text-xs font-medium text-ink mb-1">Tarikh</label>
        <input
          id="tarikhBanci"
          type="date"
          value={tarikh}
          onChange={(e) => setTarikh(e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {(loadingMurid || loadingKehadiran) ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : (
        <>
          {/* Kotak salin untuk WhatsApp - cuma muncul kalau ada kelas belum isi */}
          {kelasBelumIsi.length > 0 && (
            <section className="mb-5">
              <div className="p-3 rounded-card border border-border bg-base">
                <pre className="text-xs text-ink whitespace-pre-wrap font-sans mb-3">{mesejWhatsapp}</pre>
                <button
                  onClick={salinSenarai}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-card bg-brand-red text-white text-xs font-semibold"
                >
                  {disalinSenarai ? <><Check size={14} /> Disalin!</> : <><Copy size={14} /> Salin untuk WhatsApp</>}
                </button>
              </div>
            </section>
          )}

          {/* Status ringkas - bukan gate, papan tetap papar walau data belum lengkap */}
          <div className="flex items-center gap-2 mb-4 text-xs">
            {kelasBelumIsi.length === 0 ? (
              <><CheckCircle2 size={16} className="text-green-700" /> <span className="text-green-700 font-medium">Semua kelas dah isi kehadiran</span></>
            ) : (
              <><AlertTriangle size={16} className="text-brand-red" /> <span className="text-brand-red font-medium">{kelasBelumIsi.length} kelas belum isi - data papan di bawah belum lengkap</span></>
            )}
          </div>

          {/* Papan Banci Kehadiran - SENTIASA papar, walaupun data kosong/belum lengkap */}
          <section className="border-2 border-border rounded-card p-6 bg-surface">
            <div className="text-center mb-5">
              <h2 className="text-base font-bold text-ink">SK PENDIDIKAN KHAS KUANTAN</h2>
              <h3 className="text-sm font-semibold text-ink">Data Enrolmen MBK</h3>
            </div>

            <div className="flex justify-between text-xs mb-4">
              <span><strong>Tarikh:</strong> {formatTarikhPaparan(tarikh)}</span>
              <span><strong>Hari:</strong> {namaHari(tarikh)}</span>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="text-xs w-full border border-border">
                <thead>
                  <tr className="bg-base">
                    <th className="border border-border px-2 py-2 text-left">Kategori</th>
                    <th className="border border-border px-2 py-2">Bilangan MBK</th>
                    <th className="border border-border px-2 py-2">MBK Hadir</th>
                    <th className="border border-border px-2 py-2">MBK Tidak Hadir</th>
                    <th className="border border-border px-2 py-2">Peratus Kehadiran MBK</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statistik).map(([k, v]) => (
                    <tr key={k}>
                      <td className="border border-border px-2 py-2 font-medium text-ink">{LABEL_KATEGORI[k]}</td>
                      <td className="border border-border px-2 py-2 text-center">{v.bilangan}</td>
                      <td className="border border-border px-2 py-2 text-center">{v.hadir}</td>
                      <td className="border border-border px-2 py-2 text-center">{v.bilangan - v.hadir}</td>
                      <td className="border border-border px-2 py-2 text-center">{peratus(v.hadir, v.bilangan)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto mb-5">
              <table className="text-xs w-full border border-border">
                <thead>
                  <tr className="bg-base">
                    <th className="border border-border px-2 py-2">Bilangan MBK Keseluruhan</th>
                    <th className="border border-border px-2 py-2">MBK Hadir Keseluruhan</th>
                    <th className="border border-border px-2 py-2">MBK Tidak Hadir Keseluruhan</th>
                    <th className="border border-border px-2 py-2">Peratus Kehadiran MBK Keseluruhan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-semibold">
                    <td className="border border-border px-2 py-2 text-center">{keseluruhan.bilangan}</td>
                    <td className="border border-border px-2 py-2 text-center">{keseluruhan.hadir}</td>
                    <td className="border border-border px-2 py-2 text-center">{keseluruhan.bilangan - keseluruhan.hadir}</td>
                    <td className="border border-border px-2 py-2 text-center">{peratus(keseluruhan.hadir, keseluruhan.bilangan)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={salinPapan}
              className="flex items-center gap-1.5 h-9 px-4 rounded-card border border-border text-xs font-semibold text-ink"
            >
              {disalinPapan ? <><Check size={14} /> Disalin!</> : <><Copy size={14} /> Salin Papan (teks)</>}
            </button>
          </section>
        </>
      )}
    </div>
  )
}
