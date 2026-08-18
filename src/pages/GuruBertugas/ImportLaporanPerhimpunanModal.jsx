import { useState } from 'react'
import { X, Download, Upload } from 'lucide-react'
import { tambahLaporanPerhimpunan } from '../../hooks/useLaporanPerhimpunan.js'
import { uraiCSV, muatTurunCSV } from '../../lib/csvUtils.js'
import { namaHari, uraiTarikhIkutFormat, kesanFormatTarikh } from '../../lib/dateUtils.js'

const HEADER = ['Minggu', 'Tarikh', 'Laporan Sivik', 'Hal-Hal Lain', 'Ucapan Pentadbir', 'Nama Pentadbir', 'Dilaporkan Oleh']
const CONTOH_BARIS = [
  ['1', '2026-01-05', 'Contoh laporan sivik minggu ni…', 'Contoh hal-hal lain…', 'Contoh ucapan pentadbir…', 'AHMAD BIN ALI', 'SITI BINTI HASSAN'],
]

// Import pukal CSV - dulu page Admin berasingan, dipindah ke sini (terus
// dalam Laporan Perhimpunan) sebab lebih masuk akal letak dekat feature
// yang berkaitan - staff/admin tak perlu lompat ke Panel Admin untuk kerja
// yang sebenarnya "tambah banyak Laporan Perhimpunan sekali gus". Akses
// kekal admin-sahaja (disemak oleh pemanggil - lihat prop bolehImport).
export default function ImportLaporanPerhimpunanModal({ open, onClose, user, profilesAktif, onSelesai }) {
  const [senaraiPratonton, setSenaraiPratonton] = useState(null)
  const [ralat, setRalat] = useState(null)
  const [mengimport, setMengimport] = useState(false)
  const [progres, setProgres] = useState({ selesai: 0, jumlah: 0 })
  const [selesai, setSelesai] = useState(null)
  const [formatTarikh, setFormatTarikh] = useState('DMY')

  if (!open) return null

  function tutup() {
    setSenaraiPratonton(null)
    setRalat(null)
    setSelesai(null)
    onClose()
  }

  function muatTurunTemplat() {
    muatTurunCSV('templat-laporan-perhimpunan.csv', HEADER, CONTOH_BARIS)
  }

  function cariEmelIkutNama(nama) {
    const p = profilesAktif.find((pr) => pr.nama?.trim().toLowerCase() === nama.trim().toLowerCase())
    return p ? { emel: p.emel, nama: p.nama } : null
  }

  async function pilihFail(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setRalat(null)
    setSelesai(null)
    try {
      const teks = await fail.text()
      const baris = uraiCSV(teks)

      const formatDikesan = kesanFormatTarikh(baris.map((b) => b['Tarikh']))
      setFormatTarikh(formatDikesan)

      const senarai = baris
        .filter((b) => b['Minggu'] && b['Tarikh'])
        .map((b) => {
          const pentadbir = cariEmelIkutNama(b['Nama Pentadbir'] || '')
          const pelapor = cariEmelIkutNama(b['Dilaporkan Oleh'] || '')
          const tarikhISO = uraiTarikhIkutFormat(b['Tarikh'], formatDikesan)
          return {
            minggu: Number(b['Minggu']),
            tarikh: tarikhISO ?? b['Tarikh'],
            hari: tarikhISO ? namaHari(tarikhISO) : '',
            laporanSivik: b['Laporan Sivik'] || '',
            halLain: b['Hal-Hal Lain'] || '',
            ucapanPentadbir: b['Ucapan Pentadbir'] || '',
            namaPentadbirEmel: pentadbir?.emel || '',
            namaPentadbir: pentadbir?.nama || (b['Nama Pentadbir'] || ''),
            dilaporkanOlehEmel: pelapor?.emel || '',
            dilaporkanOleh: pelapor?.nama || (b['Dilaporkan Oleh'] || ''),
            _pentadbirDijumpai: Boolean(pentadbir),
            _pelaporDijumpai: Boolean(pelapor),
            _tarikhSah: Boolean(tarikhISO),
            _tarikhAsal: b['Tarikh'],
          }
        })

      setSenaraiPratonton(senarai)
    } catch (err) {
      setRalat('Gagal baca fail CSV. Pastikan format betul (guna templat).')
      console.error(err)
    }
    e.target.value = ''
  }

  async function sahkanImport() {
    setMengimport(true)
    setRalat(null)
    try {
      const sah = senaraiPratonton.filter((r) => r._tarikhSah)
      let bilangan = 0
      for (const rekod of sah) {
        const { _pentadbirDijumpai, _pelaporDijumpai, _tarikhSah, _tarikhAsal, ...data } = rekod
        await tambahLaporanPerhimpunan(data, user.uid)
        bilangan += 1
        setProgres({ selesai: bilangan, jumlah: sah.length })
      }
      setSelesai({ bilangan, dilangkau: senaraiPratonton.length - sah.length })
      setSenaraiPratonton(null)
      onSelesai?.()
    } catch (err) {
      setRalat(err.message || 'Gagal import. Cuba lagi.')
    } finally {
      setMengimport(false)
    }
  }

  function uraiSemulaDenganFormat(formatBaru) {
    setFormatTarikh(formatBaru)
    setSenaraiPratonton((s) =>
      s.map((r) => {
        const tarikhISO = uraiTarikhIkutFormat(r._tarikhAsal, formatBaru)
        return { ...r, tarikh: tarikhISO ?? r._tarikhAsal, hari: tarikhISO ? namaHari(tarikhISO) : '', _tarikhSah: Boolean(tarikhISO) }
      })
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">Import Laporan Perhimpunan (CSV)</h2>
          <button onClick={tutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-inkmuted mb-4">
          Import pukal rekod Laporan Perhimpunan dari fail CSV (contoh: data tahun lepas/tahun ni). Muat turun templat dulu, isi dalam Excel/Sheets, eksport semula sebagai CSV, kemudian muat naik di sini.
        </p>

        <button
          onClick={muatTurunTemplat}
          className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-sm font-semibold text-ink mb-5"
        >
          <Download size={16} /> Muat Turun Templat CSV
        </button>

        {!senaraiPratonton && !selesai && (
          <label className="flex items-center justify-center gap-2 h-12 rounded-card border-2 border-dashed border-border text-sm font-medium text-inkmuted cursor-pointer hover:border-brand-red hover:text-ink">
            <Upload size={16} /> Muat Naik Fail CSV
            <input type="file" accept=".csv" onChange={pilihFail} className="hidden" />
          </label>
        )}

        {ralat && <p className="text-sm text-brand-red mt-4">{ralat}</p>}

        {senaraiPratonton && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <p className="text-sm font-medium text-ink">{senaraiPratonton.length} rekod dijumpai dalam fail:</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-inkmuted">Format tarikh dikesan:</span>
                <select
                  value={formatTarikh}
                  onChange={(e) => uraiSemulaDenganFormat(e.target.value)}
                  className="h-8 px-2 rounded-card border border-border bg-surface text-xs"
                >
                  <option value="DMY">Hari/Bulan/Tahun (12/1/2026 = 12 Jan)</option>
                  <option value="MDY">Bulan/Hari/Tahun (1/12/2026 = 12 Jan)</option>
                </select>
              </div>
            </div>

            <div className="border border-border rounded-card overflow-x-auto max-h-72 mb-4">
              <table className="text-xs w-full">
                <thead className="bg-base sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Minggu</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Tarikh</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Nama Pentadbir</th>
                    <th className="text-left px-3 py-2 font-semibold text-ink">Dilaporkan Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {senaraiPratonton.map((r, i) => (
                    <tr key={i} style={!r._tarikhSah ? { backgroundColor: '#FBEAF0' } : undefined}>
                      <td className="px-3 py-2 text-inkmuted">{r.minggu}</td>
                      <td className={`px-3 py-2 ${r._tarikhSah ? 'text-inkmuted' : 'text-brand-red font-semibold'}`}>
                        {r._tarikhSah ? `${r.tarikh} (${r.hari})` : `${r.tarikh} - format tarikh tak dikenali`}
                      </td>
                      <td className={`px-3 py-2 ${r._pentadbirDijumpai ? 'text-ink' : 'text-brand-red'}`}>
                        {r.namaPentadbir}{!r._pentadbirDijumpai && ' (tiada dalam Staff)'}
                      </td>
                      <td className={`px-3 py-2 ${r._pelaporDijumpai ? 'text-ink' : 'text-brand-red'}`}>
                        {r.dilaporkanOleh}{!r._pelaporDijumpai && ' (tiada dalam Staff)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-inkmuted mb-4">
              Nama berwarna merah = tak jumpa padanan sebenar dalam senarai Staff (nama tetap disimpan sebagai teks). Baris berlatar merah = tarikh tak dikenali, akan <strong>dilangkau</strong> (tak diimport) - format tarikh diterima: YYYY-MM-DD atau DD/M/YYYY.
            </p>

            {mengimport ? (
              <p className="text-sm text-ink">Mengimport… {progres.selesai} / {progres.jumlah}</p>
            ) : (
              <div className="flex gap-3">
                <button onClick={sahkanImport} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold">
                  Sahkan Import {senaraiPratonton.filter((r) => r._tarikhSah).length} Rekod
                </button>
                <button onClick={() => setSenaraiPratonton(null)} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
                  Batal
                </button>
              </div>
            )}
          </div>
        )}

        {selesai !== null && (
          <div className="mt-5">
            <p className="text-sm font-medium mb-1" style={{ color: '#27500A' }}>{selesai.bilangan} rekod berjaya diimport.</p>
            {selesai.dilangkau > 0 && (
              <p className="text-sm text-brand-red">{selesai.dilangkau} baris dilangkau sebab tarikh tak sah - betulkan dalam CSV dan cuba muat naik semula untuk baris tu sahaja.</p>
            )}
            <button onClick={tutup} className="h-11 px-5 rounded-card bg-brand-red text-white text-sm font-semibold mt-4">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
