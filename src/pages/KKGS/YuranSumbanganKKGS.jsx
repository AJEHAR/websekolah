import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, X, Settings, Download } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsYuranTahun, useKkgsYuranAhliTahun, tambahYuranKkgs, padamYuranKkgs } from '../../hooks/useKkgsYuran.js'
import { useKkgsTetapanYuran, simpanTetapanYuran } from '../../hooks/useKkgsTetapanYuran.js'
import { useCetak } from '../../hooks/useCetak.js'
import { adalahJawatankuasaSaya, kiraPeruntukanYuran, NAMA_BULAN } from './kkgsConstants.js'
import ResitYuranKKGS from './ResitYuranKKGS.jsx'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function tahunSemasa() {
  return new Date().getFullYear()
}

function WarnaBulan(status) {
  if (status === 'penuh') return { bg: '#0F6E56', teks: '#fff' }
  if (status === 'separuh') return { bg: '#F5C344', teks: '#5C4400' }
  return { bg: '#EDEDED', teks: '#9A9A9A' }
}

function StripBulan({ bulanList }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {bulanList.map((b) => {
        const w = WarnaBulan(b.status)
        return (
          <div key={b.bulan} title={`${NAMA_BULAN[b.bulan - 1]}: ${b.status === 'penuh' ? 'Penuh' : b.status === 'separuh' ? `RM${b.jumlah}` : 'Belum'}`}
            className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
            style={{ backgroundColor: w.bg, color: w.teks }}
          >
            {NAMA_BULAN[b.bulan - 1].slice(0, 1)}
          </div>
        )
      })}
    </div>
  )
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

function ModalBayar({ open, ahli, tarikCadangan, onTutup, onSimpan }) {
  const [tarikh, setTarikh] = useState(todayISO())
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
      </div>
    </div>
  )
}

export default function YuranSumbanganKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const [tahun] = useState(tahunSemasa())
  const { senarai: senaraiAhli, loading: loadingAhli } = useKkgsAhliSenarai()
  const sayaJawatankuasa = adalahJawatankuasaSaya(senaraiAhli, user.email)
  const ahliSaya = senaraiAhli.find((a) => (a.emel ?? '').toLowerCase() === (user.email ?? '').toLowerCase())

  // PENTING: dua query BERASINGAN ikut peranan - Jawatankuasa tarik
  // SEMUA rekod tahun tu (tak ditapis), staff biasa tarik rekod SENDIRI
  // sahaja (ditapis ahliId di PERINGKAT QUERY) - peraturan Firestore
  // TOLAK query tanpa tapisan untuk staff biasa (lihat firestore.rules).
  const { senarai: yuranSemua, loading: loadingYuranSemua, muatSemula: muatSemulaSemua } = useKkgsYuranTahun(tahun, sayaJawatankuasa)
  const { senarai: yuranSaya, loading: loadingYuranSaya, muatSemula: muatSemulaSaya } = useKkgsYuranAhliTahun(sayaJawatankuasa ? null : ahliSaya?.id, tahun)
  const senaraiYuran = sayaJawatankuasa ? yuranSemua : yuranSaya
  const loadingYuran = sayaJawatankuasa ? loadingYuranSemua : loadingYuranSaya
  function muatSemula() {
    if (sayaJawatankuasa) muatSemulaSemua()
    else muatSemulaSaya()
  }

  const { tetapan, loading: loadingTetapan, muatSemula: muatSemulaTetapan } = useKkgsTetapanYuran(tahun)
  const [ahliBayar, setAhliBayar] = useState(null)
  const [tunjukTetapan, setTunjukTetapan] = useState(false)
  const [dataResit, setDataResit] = useCetak()

  function peruntukanAhli(ahli) {
    const bulanMula = ahli.bulanMula ?? 1
    const bulanTamat = Math.min(ahli.bulanTamat ?? tetapan.bilanganBulan, tetapan.bilanganBulan)
    const jumlahDibayar = senaraiYuran.filter((y) => y.ahliId === ahli.id).reduce((j, y) => j + y.jumlah, 0)
    if (bulanMula > bulanTamat) return { bulanList: [], jumlahDiperlukan: 0, jumlahDibayar, lengkapPenuh: jumlahDibayar >= 0 }
    return kiraPeruntukanYuran({ bulanMula, bulanTamat, kadarBulanan: tetapan.yuranBulanan, jumlahDibayar })
  }

  async function simpanTetapan(data) {
    await simpanTetapanYuran(tahun, data, user.uid)
    muatSemulaTetapan()
  }

  async function bayar(data) {
    await tambahYuranKkgs(data, user.uid)
    setAhliBayar(null)
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

  if (loadingAhli || loadingYuran || loadingTetapan) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  // Staff BUKAN Jawatankuasa - papar status SENDIRI sahaja.
  if (!sayaJawatankuasa) {
    if (!ahliSaya) {
      return <p className="text-sm text-inkmuted">Emel akaun anda tiada dalam Senarai Ahli KKGS lagi - hubungi Jawatankuasa untuk didaftarkan.</p>
    }
    const peruntukan = peruntukanAhli(ahliSaya)
    return (
      <div>
        <div className="rounded-card border border-border bg-surface p-5 mb-4 text-center">
          <p className="text-xs text-inkmuted">Yuran {tahun} - RM{tetapan.yuranBulanan}/bulan</p>
          <p className="text-2xl font-bold text-ink mt-1">RM {peruntukan.jumlahDibayar.toFixed(2)} <span className="text-sm font-normal text-inkmuted">/ RM {peruntukan.jumlahDiperlukan.toFixed(2)}</span></p>
        </div>
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Status Setiap Bulan</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {peruntukan.bulanList.map((b) => {
            const w = WarnaBulan(b.status)
            return (
              <div key={b.bulan} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: w.bg, color: w.teks }}>
                {NAMA_BULAN[b.bulan - 1]}
              </div>
            )
          })}
        </div>
        {peruntukan.lengkapPenuh && (
          <button onClick={() => cetakResit(ahliSaya, peruntukan)} className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-sm font-semibold">
            <Download size={15} /> Muat Turun Resit Rasmi
          </button>
        )}
        {dataResit && <ResitYuranKKGS {...dataResit} />}
      </div>
    )
  }

  // Jawatankuasa - papan pembayaran penuh.
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-inkmuted">Yuran {tahun}: RM{tetapan.yuranBulanan}/bulan × {tetapan.bilanganBulan} bulan (Jan-{NAMA_BULAN[tetapan.bilanganBulan - 1]})</p>
        <button onClick={() => setTunjukTetapan(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink shrink-0">
          <Settings size={14} /> Tetapan
        </button>
      </div>

      <div className="space-y-2">
        {senaraiAhli.map((a) => {
          const peruntukan = peruntukanAhli(a)
          const rekodAhli = senaraiYuran.filter((y) => y.ahliId === a.id)
          return (
            <details key={a.id} className="rounded-card border border-border bg-surface overflow-hidden">
              <summary className="flex items-center gap-3 p-3.5 cursor-pointer">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{a.nama}</p>
                  <StripBulan bulanList={peruntukan.bulanList} />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-ink">RM{peruntukan.jumlahDibayar} / RM{peruntukan.jumlahDiperlukan}</p>
                  {peruntukan.lengkapPenuh && <span className="text-[10px] font-semibold text-[#0F6E56]">Lengkap</span>}
                </div>
              </summary>
              <div className="border-t border-border p-3 space-y-2">
                <button onClick={() => setAhliBayar(a)} className="flex items-center gap-1.5 h-9 px-3 rounded-card bg-brand-red text-white text-xs font-semibold">
                  <Plus size={13} /> Rekod Bayaran
                </button>
                {peruntukan.lengkapPenuh && (
                  <button onClick={() => cetakResit(a, peruntukan)} className="flex items-center gap-1.5 h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink ml-2">
                    <Download size={13} /> Resit
                  </button>
                )}
                {rekodAhli.length > 0 && (
                  <div className="pt-2 space-y-1">
                    {rekodAhli.map((y) => (
                      <div key={y.id} className="flex items-center justify-between text-xs">
                        <span className="text-ink">{y.tarikh} {y.catatan && `· ${y.catatan}`}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-ink">RM {y.jumlah.toFixed(2)}</span>
                          <button onClick={() => padamBayaran(y.id)} aria-label="Padam" className="text-brand-red"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          )
        })}
      </div>

      <ModalTetapan open={tunjukTetapan} tetapan={tetapan} tahun={tahun} onTutup={() => setTunjukTetapan(false)} onSimpan={simpanTetapan} />
      {ahliBayar && (
        <ModalBayar key={ahliBayar.id} open onTutup={() => setAhliBayar(null)} ahli={ahliBayar} tarikCadangan={tetapan.yuranBulanan} onSimpan={bayar} />
      )}
      {dataResit && <ResitYuranKKGS {...dataResit} />}
    </div>
  )
}
