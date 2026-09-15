import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, X, Settings, Download, Search } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsYuranTahun, tambahYuranKkgs, padamYuranKkgs } from '../../hooks/useKkgsYuran.js'
import { useKkgsTetapanYuran, simpanTetapanYuran } from '../../hooks/useKkgsTetapanYuran.js'
import { useCetak } from '../../hooks/useCetak.js'
import { kiraPeruntukanYuran, NAMA_BULAN } from './kkgsConstants.js'
import ResitYuranKKGS from './ResitYuranKKGS.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
// Tahun LEPAS + SEMASA + AKAN DATANG - bukan sekadar tahun semasa sahaja
// (KKGS urus rekod berterusan tahun ke tahun, staff perlu boleh
// sediakan/tengok tahun akan datang awal, atau semak sejarah tahun lepas).
const PILIHAN_TAHUN = [TAHUN_SEMASA - 2, TAHUN_SEMASA - 1, TAHUN_SEMASA, TAHUN_SEMASA + 1, TAHUN_SEMASA + 2, TAHUN_SEMASA + 3]

// Lebar lajur tetap (px) - lajur Bil/Nama "melekat" (sticky) semasa skrol
// mendatar merentasi lajur bulan - SAMA teknik dengan Papan RMT. Jadual
// ni HANYA untuk skrin lebar (sm: ke atas) - telefon guna kad (di bawah).
const LEBAR = { bil: 36, nama: 160, bulan: 64 }
const KIRI = { bil: 0, nama: LEBAR.bil }

function WarnaBulan(status) {
  if (status === 'penuh') return { bg: '#0F6E56', teks: '#fff' }
  if (status === 'separuh') return { bg: '#F5C344', teks: '#5C4400' }
  return { bg: 'transparent', teks: '#C9C9C9' }
}

function ModalTetapan({ open, tetapan, tahun, onTutup, onSimpan }) {
  const [bilanganBulan, setBilanganBulan] = useState(tetapan.bilanganBulan)
  const [yuranBulanan, setYuranBulanan] = useState(tetapan.yuranBulanan)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    try {
      await onSimpan({ bilanganBulan, yuranBulanan })
      onTutup()
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Tetapan Yuran {tahun}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Bilangan Bulan Dikenakan</label>
            <select value={bilanganBulan} onChange={(e) => setBilanganBulan(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              <option value={10}>10 bulan (Jan - Okt)</option>
              <option value={11}>11 bulan (Jan - Nov)</option>
              <option value={12}>12 bulan (Jan - Dis)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Yuran Setiap Bulan (RM)</label>
            <input type="number" value={yuranBulanan} onChange={(e) => setYuranBulanan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
        </div>
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan Tetapan'}
        </button>
      </div>
    </div>
  )
}

function ModalBayar({ open, ahli, tahun, tarikCadangan, rekodAhli, onTutup, onSimpan, onPadam }) {
  const [tarikh, setTarikh] = useState(`${tahun}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)
  const [jumlah, setJumlah] = useState(tarikCadangan ?? '')
  const [catatan, setCatatan] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function simpan() {
    if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
    setRalat(null)
    setMenyimpan(true)
    try {
      await onSimpan({ ahliId: ahli.id, ahliNama: ahli.nama, tarikh, jumlah, catatan })
      setJumlah(''); setCatatan('')
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Rekod Bayaran - {ahli.nama}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tarikh</label>
            <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Jumlah Dibayar (RM)</label>
            <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            <p className="text-[10px] text-inkmuted mt-1">Sistem AGIH automatik ikut bulan (bulan tak cukup genap ditunjuk sebagai baki).</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Catatan (pilihan)</label>
            <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
        </div>
        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan Bayaran'}
        </button>

        {rekodAhli.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-1.5">
            <p className="text-xs font-semibold text-ink">Sejarah bayaran {tahun}</p>
            {rekodAhli.map((y) => (
              <div key={y.id} className="flex items-center justify-between text-xs">
                <span className="text-ink">{y.tarikh} {y.catatan && `· ${y.catatan}`}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-ink">RM {y.jumlah.toFixed(2)}</span>
                  <button onClick={() => onPadam(y.id)} aria-label="Padam" className="text-brand-red"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Kad ahli - PAPARAN TELEFON (bukan jadual mendatar) - nama TAK PERNAH
// hilang dari pandangan (setiap kad ada nama sendiri, bukan bergantung
// skrol sisi + lajur melekat yang didapati masih menyusahkan di telefon
// sebenar). Status bulan dipaparkan sebagai jalur bulatan kecil (boleh
// tatal dalam kad tu sendiri kalau bulan banyak).
function KadAhliYuran({ ahli, peruntukan, bolehUrus, onKlik, onCetakResit }) {
  return (
    <button
      type="button"
      onClick={() => bolehUrus && onKlik(ahli)}
      className="w-full text-left p-3.5 rounded-card border border-border"
      style={{ backgroundColor: peruntukan.lengkapPenuh ? '#E1F5EE' : '#fff', cursor: bolehUrus ? 'pointer' : 'default' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-ink">
          {ahli.nama}
          {peruntukan.lengkapPenuh && <span className="ml-1.5 text-[10px] font-bold" style={{ color: '#0F6E56' }}>🎉 Lunas</span>}
        </p>
        <p className="text-xs font-bold text-ink shrink-0">RM{peruntukan.jumlahDibayar}/{peruntukan.jumlahDiperlukan}</p>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {peruntukan.bulanList.map((b) => {
          const w = WarnaBulan(b.status)
          return (
            <div key={b.bulan} title={NAMA_BULAN[b.bulan - 1]} className="shrink-0 flex flex-col items-center gap-0.5">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-bold" style={{ backgroundColor: w.bg === 'transparent' ? '#F2F2F2' : w.bg, color: w.teks }}>
                {b.status === 'separuh' ? b.jumlah : b.status === 'penuh' ? '✓' : ''}
              </span>
              <span className="text-[8px] text-inkmuted">{NAMA_BULAN[b.bulan - 1].slice(0, 3)}</span>
            </div>
          )
        })}
      </div>
      {peruntukan.lengkapPenuh && (
        <span
          onClick={(e) => { e.stopPropagation(); onCetakResit(ahli, peruntukan) }}
          className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-brand-red"
        >
          <Download size={13} /> Muat Turun Resit
        </span>
      )}
    </button>
  )
}

// Papan Pembayaran - JADUAL untuk skrin lebar (sm: ke atas), KAD untuk
// telefon (sm:hidden) - jadual mendatar+lajur melekat didapati masih
// menyusahkan pada sesetengah pelayar mobile sebenar (nama terlepas
// pandangan semasa skrol). Ada carian nama untuk cari cepat, dua-dua
// paparan. SATU papan sama untuk semua (nama terus dari Senarai Ahli).
export default function YuranSumbanganKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { adaSeksyen } = useIsAdmin(user)
  const bolehUrus = adaSeksyen('kkgs')
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [carian, setCarian] = useState('')
  const { senarai: senaraiAhli, loading: loadingAhli } = useKkgsAhliSenarai()
  const { senarai: senaraiYuran, loading: loadingYuran, muatSemula } = useKkgsYuranTahun(tahun)
  const { tetapan, loading: loadingTetapan, muatSemula: muatSemulaTetapan } = useKkgsTetapanYuran(tahun)
  const [ahliBayar, setAhliBayar] = useState(null)
  const [tunjukTetapan, setTunjukTetapan] = useState(false)
  const [dataResit, setDataResit] = useCetak()

  function peruntukanAhli(ahli) {
    const bulanMula = ahli.bulanMula ?? 1
    const bulanTamat = Math.min(ahli.bulanTamat ?? tetapan.bilanganBulan, tetapan.bilanganBulan)
    const jumlahDibayar = senaraiYuran.filter((y) => y.ahliId === ahli.id).reduce((j, y) => j + y.jumlah, 0)
    if (bulanMula > bulanTamat) return { bulanList: [], jumlahDiperlukan: 0, jumlahDibayar, lengkapPenuh: false }
    return kiraPeruntukanYuran({ bulanMula, bulanTamat, kadarBulanan: tetapan.yuranBulanan, jumlahDibayar })
  }

  async function simpanTetapan(data) {
    await simpanTetapanYuran(tahun, data, user.uid)
    muatSemulaTetapan()
  }

  async function bayar(data) {
    await tambahYuranKkgs(data, user.uid)
    muatSemula()
  }

  async function padamBayaran(id) {
    if (!(await konfirm('Padam rekod bayaran ni?', { bahaya: true }))) return
    await padamYuranKkgs(id)
    muatSemula()
  }

  function cetakResit(ahli, peruntukan) {
    setDataResit({ ahli, peruntukan, tahun, tetapan })
  }

  const senaraiBulan = Array.from({ length: tetapan.bilanganBulan }, (_, i) => i + 1)
  const disenarai = senaraiAhli.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))

  if (loadingAhli || loadingYuran || loadingTetapan) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="h-11 px-3 rounded-card border border-border bg-surface text-sm">
          {PILIHAN_TAHUN.map((t) => (
            <option key={t} value={t}>{t}{t === TAHUN_SEMASA ? ' (semasa)' : ''}</option>
          ))}
        </select>
        {bolehUrus && (
          <button onClick={() => setTunjukTetapan(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink ml-auto">
            <Settings size={14} /> Tetapan
          </button>
        )}
      </div>
      <p className="text-xs text-inkmuted mb-3">RM{tetapan.yuranBulanan}/bulan × {tetapan.bilanganBulan} bulan{!bolehUrus && ' · Anda boleh LIHAT sahaja.'}</p>

      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">{senaraiAhli.length === 0 ? 'Tiada ahli dalam Senarai Ahli lagi.' : 'Tiada padanan carian.'}</p>
      ) : (
        <>
          {/* PAPARAN KAD - telefon sahaja (sm:hidden) */}
          <div className="sm:hidden space-y-2">
            {disenarai.map((a) => (
              <KadAhliYuran key={a.id} ahli={a} peruntukan={peruntukanAhli(a)} bolehUrus={bolehUrus} onKlik={setAhliBayar} onCetakResit={cetakResit} />
            ))}
          </div>

          {/* PAPARAN JADUAL - skrin lebar sahaja (hidden sm:block) */}
          <div className="hidden sm:block overflow-auto border border-border rounded-card max-h-[70vh]">
            <table className="text-xs border-collapse">
              <thead className="sticky top-0 z-20 bg-base">
                <tr>
                  <th className="sticky z-30 bg-base px-1 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil }}>Bil</th>
                  <th className="sticky z-30 bg-base text-left px-2 py-2 font-semibold text-ink border-b border-r border-border" style={{ left: KIRI.nama, width: LEBAR.nama }}>Nama</th>
                  {senaraiBulan.map((b) => (
                    <th key={b} className="px-1 py-2 font-semibold text-center text-ink border-b border-border" style={{ width: LEBAR.bulan }}>
                      {NAMA_BULAN[b - 1].slice(0, 3)}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-semibold text-center text-ink border-b border-l border-border" style={{ width: 90 }}>Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disenarai.map((a, i) => {
                  const peruntukan = peruntukanAhli(a)
                  const petaBulan = {}
                  peruntukan.bulanList.forEach((b) => { petaBulan[b.bulan] = b })
                  const gayaLunas = peruntukan.lengkapPenuh ? { backgroundColor: '#E1F5EE' } : undefined
                  return (
                    <tr key={a.id} className={bolehUrus ? 'cursor-pointer hover:brightness-95' : ''} style={gayaLunas} onClick={() => bolehUrus && setAhliBayar(a)}>
                      <td className="sticky z-10 text-center px-1 py-2 border-r border-border" style={{ left: KIRI.bil, width: LEBAR.bil, ...(gayaLunas ?? { backgroundColor: '#ffffff' }) }}>{i + 1}</td>
                      <td className="sticky z-10 px-2 py-2 border-r border-border whitespace-nowrap font-medium text-ink" style={{ left: KIRI.nama, width: LEBAR.nama, ...(gayaLunas ?? { backgroundColor: '#ffffff' }) }}>
                        {a.nama}
                        {peruntukan.lengkapPenuh && <span className="ml-1.5 text-[10px] font-bold" style={{ color: '#0F6E56' }}>🎉 Lunas</span>}
                      </td>
                      {senaraiBulan.map((b) => {
                        const info = petaBulan[b]
                        if (!info) return <td key={b} className="text-center px-1 py-2 text-inkmuted" style={{ width: LEBAR.bulan }}>-</td>
                        const w = WarnaBulan(info.status)
                        return (
                          <td key={b} className="text-center px-1 py-2" style={{ width: LEBAR.bulan }}>
                            <span className="inline-block h-6 w-6 rounded-full text-[9px] font-bold leading-6" style={{ backgroundColor: w.bg, color: w.teks }}>
                              {info.status === 'separuh' ? info.jumlah : info.status === 'penuh' ? '✓' : ''}
                            </span>
                          </td>
                        )
                      })}
                      <td className="text-center px-2 py-2 border-l border-border font-semibold text-ink whitespace-nowrap">
                        RM{peruntukan.jumlahDibayar}/{peruntukan.jumlahDiperlukan}
                        {peruntukan.lengkapPenuh && (
                          <button onClick={(e) => { e.stopPropagation(); cetakResit(a, peruntukan) }} aria-label="Muat turun resit" className="ml-1 text-brand-red align-middle">
                            <Download size={12} className="inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-inkmuted mt-3">
        <span className="inline-block h-3 w-3 rounded-full align-middle mr-1" style={{ backgroundColor: '#0F6E56' }} /> Lunas &nbsp;
        <span className="inline-block h-3 w-3 rounded-full align-middle mr-1" style={{ backgroundColor: '#F5C344' }} /> Sebahagian (RM ditunjuk) &nbsp;
        kosong = belum bayar · "-" = luar tempoh keahlian.{bolehUrus && ' Klik/tekan untuk rekod bayaran.'}
      </p>

      {bolehUrus && (
        <>
          <ModalTetapan open={tunjukTetapan} tetapan={tetapan} tahun={tahun} onTutup={() => setTunjukTetapan(false)} onSimpan={simpanTetapan} />
          {ahliBayar && (
            <ModalBayar
              key={ahliBayar.id}
              open
              ahli={ahliBayar}
              tahun={tahun}
              tarikCadangan={tetapan.yuranBulanan}
              rekodAhli={senaraiYuran.filter((y) => y.ahliId === ahliBayar.id)}
              onTutup={() => setAhliBayar(null)}
              onSimpan={bayar}
              onPadam={padamBayaran}
            />
          )}
        </>
      )}
      {dataResit && <ResitYuranKKGS {...dataResit} />}
    </div>
  )
}
