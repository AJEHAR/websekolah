import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, Pencil, X, Printer, Settings } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKkgsKewanganSenarai, tambahKewanganKkgs, kemaskiniKewanganKkgs, padamKewanganKkgs } from '../../hooks/useKkgsKewangan.js'
import { useKkgsLedger, kiraBakiTerkumpul, kiraBakiSemasa, kiraTransaksiDenganBaki, kumpul12Bulan, KATEGORI_KEWANGAN } from '../../hooks/useKkgsLedger.js'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsBakiPembukaan, simpanBakiPembukaan } from '../../hooks/useKkgsBakiPembukaan.js'
import { useKkgsNamaSekolahLaporan, simpanKkgsNamaSekolahLaporan } from '../../hooks/useKkgsTetapanLaporan.js'
import { useKkgsProgramTahun } from '../../hooks/useKkgsProgram.js'
import { useCetak } from '../../hooks/useCetak.js'
import { NAMA_BULAN, PILIHAN_TAHUN_KKGS, TAHUN_SEMASA, PROGRAM_LAIN_ID } from './kkgsConstants.js'
import DropdownCari from './DropdownCari.jsx'
import LaporanKewanganKKGS from './LaporanKewanganKKGS.jsx'

// Tab "Ledger" & "Laporan" digabung jadi SATU (staff minta - kedua-dua
// papar benda sama, cuma satu utk skrin satu lagi utk cetak, jadi tak
// perlu dua tab berasingan lagi).
const TAB = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bukutunai', label: 'Buku Tunai' },
  { id: 'ledger', label: 'Ledger & Laporan' },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function tarikhHariIniDashboard() {
  return new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

function WarnaSumber(sumber) {
  if (sumber === 'yuran') return { bg: '#E6F1FB', teks: '#1D4ED8' }
  if (sumber === 'claim') return { bg: '#FCEFC7', teks: '#8A6D00' }
  return { bg: '#F2F2F2', teks: '#5C5C5C' }
}
function labelSumber(sumber) {
  if (sumber === 'yuran') return 'Yuran'
  if (sumber === 'claim') return 'Claim'
  return 'Manual'
}

// editData (pilihan) - borang jadi mod EDIT kalau diisi (fix bug #6 -
// Buku Tunai dulu tiada butang edit, cuma padam).
function ModalTransaksi({ open, tahun, editData, onTutup, onSimpan }) {
  const [tarikh, setTarikh] = useState(editData?.tarikh ?? todayISO())
  const [perkara, setPerkara] = useState(editData?.perkara ?? '')
  const [jenis, setJenis] = useState(editData?.jenis ?? 'masuk')
  const [kategori, setKategori] = useState(editData?.kategori ?? KATEGORI_KEWANGAN[0])
  const [jumlah, setJumlah] = useState(editData?.jumlah ?? '')
  const [catatan, setCatatan] = useState(editData?.catatan ?? '')
  const [programId, setProgramId] = useState(editData?.programId ?? '')
  const [programLain, setProgramLain] = useState(editData?.programId === PROGRAM_LAIN_ID ? (editData?.programNama ?? '') : '')
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)

  // Senarai Program/Aktiviti diambil ikut TAHUN TARIKH transaksi (bukan
  // tahun page semasa) - elak senarai kosong bila staff rekod transaksi
  // lama/depan yang tahun dia beza dari tahun sedang dilihat.
  const tahunProgram = tarikh ? Number(tarikh.slice(0, 4)) : tahun
  const { senarai: senaraiProgram } = useKkgsProgramTahun(tahunProgram)
  const pilihanProgram = [...senaraiProgram.map((p) => ({ id: p.id, label: p.nama })), { id: PROGRAM_LAIN_ID, label: 'Lain-lain' }]

  if (!open) return null

  const modEdit = Boolean(editData)
  // Amaran (bug #2) - sama konsep dengan ModalBayar Yuran.
  const tahunTarikh = tarikh ? Number(tarikh.slice(0, 4)) : null
  const tahunTakSepadan = tahunTarikh && tahunTarikh !== tahun

  async function simpan() {
    if (!perkara.trim()) return setRalat('Sila isi perkara.')
    if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
    if (!programId) return setRalat('Sila pilih Program/Aktiviti.')
    if (programId === PROGRAM_LAIN_ID && !programLain.trim()) return setRalat('Sila nyatakan Program/Aktiviti (Lain-lain).')
    setRalat(null)
    setMenyimpan(true)
    try {
      const programNama = programId === PROGRAM_LAIN_ID ? programLain.trim() : (senaraiProgram.find((p) => p.id === programId)?.nama ?? '')
      await onSimpan({ tarikh, perkara, jenis, kategori, jumlah, catatan, programId, programNama })
      setPerkara(''); setJumlah(''); setCatatan(''); setProgramId(''); setProgramLain('')
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
          <h3 className="text-sm font-bold text-ink">{modEdit ? 'Edit Transaksi' : 'Rekod Transaksi'}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setJenis('masuk')} className={`h-11 rounded-card border-2 text-sm font-semibold ${jenis === 'masuk' ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]' : 'border-border text-inkmuted'}`}>Masuk</button>
            <button type="button" onClick={() => setJenis('keluar')} className={`h-11 rounded-card border-2 text-sm font-semibold ${jenis === 'keluar' ? 'border-brand-red bg-[#FDEAEA] text-brand-red' : 'border-border text-inkmuted'}`}>Keluar</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tarikh</label>
            <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            {tahunTakSepadan && (
              <p className="text-[11px] text-amber-700 bg-amber-50 rounded-card px-2.5 py-1.5 mt-1.5">
                ⚠️ Tarikh ni tahun <strong>{tahunTarikh}</strong>, bukan <strong>{tahun}</strong> (tahun sedang dilihat). Transaksi TAK akan kelihatan dalam paparan {tahun} ni.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Kategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {KATEGORI_KEWANGAN.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Program/Aktiviti</label>
            <DropdownCari value={programId} onChange={setProgramId} pilihan={pilihanProgram} placeholder="Pilih Program/Aktiviti…" bolehKosong={false} tajuk="Pilih Program/Aktiviti" />
            {programId === PROGRAM_LAIN_ID && (
              <input type="text" value={programLain} onChange={(e) => setProgramLain(e.target.value)} placeholder="Nyatakan Program/Aktiviti…" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm mt-2" />
            )}
            {senaraiProgram.length === 0 && (
              <p className="text-[10px] text-inkmuted mt-1">Tiada Program/Aktiviti direkodkan untuk tahun {tahunProgram} - guna "Lain-lain" atau tambah dulu di page Program/Aktiviti.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Perkara</label>
            <input type="text" value={perkara} onChange={(e) => setPerkara(e.target.value)} placeholder="cth. Sewa dewan" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Jumlah (RM)</label>
            <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Catatan (pilihan)</label>
            <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
        </div>
        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : modEdit ? 'Simpan Perubahan' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

function ModalBakiPembukaan({ open, tetapan, onTutup, onSimpan }) {
  const [bakiPembukaan, setBakiPembukaan] = useState(tetapan.bakiPembukaan)
  const [tahunPembukaan, setTahunPembukaan] = useState(tetapan.tahunPembukaan)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    try {
      await onSimpan({ bakiPembukaan, tahunPembukaan })
      onTutup()
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Baki Pembukaan</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <p className="text-xs text-inkmuted mb-3">Jumlah wang kelab SEBELUM sistem ni mula jejak rekod (cth. baki dari buku tunai fizikal lama). Guna untuk kira Baki Terkumpul SEBENAR - bukan sekadar Masuk-Keluar satu tahun.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Baki Pembukaan (RM)</label>
            <input type="number" value={bakiPembukaan} onChange={(e) => setBakiPembukaan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Berkuat Kuasa Mula Tahun</label>
            <select value={tahunPembukaan} onChange={(e) => setTahunPembukaan(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              {PILIHAN_TAHUN_KKGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

// Nama sekolah dipapar di kepala (letterhead) Laporan Kewangan KKGS yang
// dicetak - kosongkan utk sembunyikan baris tu (tak wajib).
function ModalNamaSekolah({ open, namaSemasa, onTutup, onSimpan }) {
  const [nama, setNama] = useState(namaSemasa)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    try {
      await onSimpan(nama)
      onTutup()
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Nama Sekolah (Laporan)</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <p className="text-xs text-inkmuted mb-3">Dipapar di bahagian atas (letterhead) setiap Laporan Kewangan KKGS yang dicetak/save PDF. Kosongkan kalau tak mahu baris ni dipapar.</p>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Nama Sekolah</label>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. SK Pendidikan Khas Kuantan" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
        </div>
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

function CartaBulanan({ transaksi }) {
  const dataBulan = Array.from({ length: 12 }, (_, i) => {
    const bulan = i + 1
    const masuk = transaksi.filter((t) => t.jenis === 'masuk' && Number(t.tarikh.slice(5, 7)) === bulan).reduce((j, t) => j + t.jumlah, 0)
    const keluar = transaksi.filter((t) => t.jenis === 'keluar' && Number(t.tarikh.slice(5, 7)) === bulan).reduce((j, t) => j + t.jumlah, 0)
    return { bulan, masuk, keluar }
  })
  const maksNilai = Math.max(...dataBulan.flatMap((d) => [d.masuk, d.keluar]), 1)

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 text-[10px]">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#0F6E56' }} /> Masuk</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#C8102E' }} /> Keluar</span>
      </div>
      {/* FIX BUG "graf tak nampak": induk terdekat (lajur setiap bulan) dulu
          TIADA tinggi sebenar (auto/content-fit), jadi `height:'100%'` pada
          div bar di bawah tak dapat apa-apa utk dikira % drpd (CSS - height
          peratus perlu induk yang ada tinggi TETAP, bukan auto) - bar jadi
          hampir 0px walaupun data betul. Fix: lajur (`h-full`) kini ambil
          tinggi PENUH bekas h-32, dan bekas bar guna `flex-1` (bukan
          height:100%) supaya ia mendapat tinggi SEBENAR dari flexbox,
          barulah height:% pada bar sebenar boleh dikira dgn betul. */}
      <div className="flex items-stretch gap-1.5 h-32">
        {dataBulan.map((d) => (
          <div key={d.bulan} className="flex-1 flex flex-col items-center gap-0.5 h-full">
            <div className="w-full flex-1 flex items-end justify-center gap-0.5">
              <div style={{ height: `${(d.masuk / maksNilai) * 100}%`, backgroundColor: '#0F6E56', minHeight: d.masuk > 0 ? 2 : 0 }} className="flex-1 rounded-t-sm" />
              <div style={{ height: `${(d.keluar / maksNilai) * 100}%`, backgroundColor: '#C8102E', minHeight: d.keluar > 0 ? 2 : 0 }} className="flex-1 rounded-t-sm" />
            </div>
            <span className="text-[8px] text-inkmuted">{NAMA_BULAN[d.bulan - 1].slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Pecahan ikut kategori (Yuran/Sumbangan/Imbuhan/Resit/dll) bagi tahun
// dipilih - staff minta ringkasan Dashboard tunjuk SEMUA elemen kewangan
// (bukan sekadar jumlah kasar Masuk/Keluar), termasuk yg datang dari
// Claim (Imbuhan/Resit) & Sumbangan.
function PecahanKategoriDashboard({ transaksi }) {
  const map = {}
  transaksi.forEach((t) => {
    const kunci = `${t.jenis}_${t.kategori}`
    map[kunci] = (map[kunci] || 0) + t.jumlah
  })
  const masuk = Object.entries(map).filter(([k]) => k.startsWith('masuk_')).map(([k, v]) => [k.replace('masuk_', ''), v])
  const keluar = Object.entries(map).filter(([k]) => k.startsWith('keluar_')).map(([k, v]) => [k.replace('keluar_', ''), v])

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-card border border-border bg-surface p-3">
        <p className="text-[10px] font-bold text-inkmuted uppercase tracking-wide mb-2">Pecahan Masuk</p>
        {masuk.length === 0 ? <p className="text-xs text-inkmuted">-</p> : masuk.map(([kat, jum]) => (
          <div key={kat} className="flex justify-between text-xs py-0.5">
            <span className="text-inkmuted">{kat}</span><span className="font-semibold" style={{ color: '#0F6E56' }}>RM {jum.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="rounded-card border border-border bg-surface p-3">
        <p className="text-[10px] font-bold text-inkmuted uppercase tracking-wide mb-2">Pecahan Keluar</p>
        {keluar.length === 0 ? <p className="text-xs text-inkmuted">-</p> : keluar.map(([kat, jum]) => (
          <div key={kat} className="flex justify-between text-xs py-0.5">
            <span className="text-inkmuted">{kat}</span><span className="font-semibold text-brand-red">RM {jum.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Satu "kad" bulan bagi tab Ledger & Laporan (skrin) - struktur SAMA dgn
// muka surat cetak (HalamanBulan dlm LaporanKewanganKKGS.jsx): row
// pertama = Baki Bawa Ke Hadapan, diikuti transaksi sebenar, kemudian
// baris "Jumlah". SEMUA bulan dipapar terbuka (tiada collapse/accordion -
// staff minta "all unhide" supaya senang baca terus).
function KadBulanLedger({ tahun, bulan, senarai, bakiAwalBulan, bakiAkhirBulan, noMula }) {
  const masuk = senarai.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const keluar = senarai.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  const labelBakiBawa = bulan > 1
    ? `Baki Bawa Ke Hadapan (dari ${NAMA_BULAN[bulan - 2]} ${tahun})`
    : `Baki Bawa Ke Hadapan (dari Disember ${tahun - 1} / baki pembukaan)`

  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-base flex-wrap">
        <p className="text-sm font-bold text-ink">{NAMA_BULAN[bulan - 1]} {tahun}</p>
        <p className="text-[11px] text-inkmuted">
          Baki Awal <span className="font-semibold text-ink">RM {bakiAwalBulan.toFixed(2)}</span>
          {' · '}Masuk <span className="font-semibold" style={{ color: '#0F6E56' }}>RM {masuk.toFixed(2)}</span>
          {' · '}Keluar <span className="font-semibold text-brand-red">RM {keluar.toFixed(2)}</span>
          {' · '}Baki Akhir <span className="font-semibold text-ink">RM {bakiAkhirBulan.toFixed(2)}</span>
        </p>
      </div>
      <div className="overflow-x-auto -mx-1 p-1">
        <table className="w-full border-collapse text-xs min-w-[720px]">
          <thead>
            <tr className="text-[10px] text-inkmuted uppercase tracking-wide">
              <th className="text-left px-1.5 py-2 border-b border-border">No</th>
              <th className="text-left px-1.5 py-2 border-b border-border">Tarikh</th>
              <th className="text-left px-1.5 py-2 border-b border-border">Perkara</th>
              <th className="text-left px-1.5 py-2 border-b border-border">Kategori</th>
              <th className="text-left px-1.5 py-2 border-b border-border">Program</th>
              <th className="text-right px-1.5 py-2 border-b border-border">Debit</th>
              <th className="text-right px-1.5 py-2 border-b border-border">Kredit</th>
              <th className="text-right px-1.5 py-2 border-b border-border">Baki</th>
            </tr>
          </thead>
          <tbody>
            {/* Baris Baki Bawa Ke Hadapan - row 1 SETIAP bulan, walaupun
                bulan tu tiada transaksi langsung (sama konsep dgn versi
                cetak - baki tak "hilang" bulan kosong). */}
            <tr className="italic bg-base/60 border-b border-border/60">
              <td className="px-1.5 py-2 text-inkmuted text-center">-</td>
              <td className="px-1.5 py-2 text-inkmuted">-</td>
              <td className="px-1.5 py-2 text-inkmuted" colSpan={3}>{labelBakiBawa}</td>
              <td className="px-1.5 py-2"></td>
              <td className="px-1.5 py-2"></td>
              <td className="px-1.5 py-2 text-right font-semibold text-ink whitespace-nowrap">RM {bakiAwalBulan.toFixed(2)}</td>
            </tr>
            {senarai.length === 0 ? (
              <tr><td colSpan={8} className="px-1.5 py-3 text-center text-inkmuted">Tiada transaksi bulan ini.</td></tr>
            ) : (
              senarai.map((t, i) => {
                const w = WarnaSumber(t.sumber)
                return (
                  <tr key={t.id} className="border-b border-border/60">
                    <td className="px-1.5 py-2 text-inkmuted">{noMula + i}</td>
                    <td className="px-1.5 py-2 whitespace-nowrap">{t.tarikh}</td>
                    <td className="px-1.5 py-2">
                      <p className="font-semibold text-ink">{t.perkara}</p>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5" style={{ backgroundColor: w.bg, color: w.teks }}>{labelSumber(t.sumber)}</span>
                    </td>
                    <td className="px-1.5 py-2 text-inkmuted">{t.kategori}</td>
                    <td className="px-1.5 py-2 text-inkmuted">{t.programNama || '-'}</td>
                    <td className="px-1.5 py-2 text-right font-semibold" style={{ color: '#0F6E56' }}>{t.jenis === 'masuk' ? t.jumlah.toFixed(2) : ''}</td>
                    <td className="px-1.5 py-2 text-right font-semibold text-brand-red">{t.jenis === 'keluar' ? t.jumlah.toFixed(2) : ''}</td>
                    <td className="px-1.5 py-2 text-right font-bold text-ink whitespace-nowrap">RM {t.baki.toFixed(2)}</td>
                  </tr>
                )
              })
            )}
            {senarai.length > 0 && (
              <tr className="bg-base font-bold">
                <td colSpan={5} className="px-1.5 py-2 text-right text-ink">Jumlah {NAMA_BULAN[bulan - 1]} :</td>
                <td className="px-1.5 py-2 text-right" style={{ color: '#0F6E56' }}>{masuk.toFixed(2)}</td>
                <td className="px-1.5 py-2 text-right text-brand-red">{keluar.toFixed(2)}</td>
                <td className="px-1.5 py-2 text-right text-ink whitespace-nowrap">RM {bakiAkhirBulan.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function KewanganKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { adaSeksyen } = useIsAdmin(user)
  const bolehUrus = adaSeksyen('kkgs')
  const [tab, setTab] = useState('dashboard')
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [bulanLaporan, setBulanLaporan] = useState(0) // 0 = tahun penuh
  // Bulan utk tile Dashboard - default bulan SEKARANG, tapi staff boleh
  // tukar (fix bug "tak detect tarikh" - dulu hardcode new Date().getMonth(),
  // jadi transaksi tarikh lama TAK PERNAH kelihatan dlm tile ni).
  const [bulanDashboard, setBulanDashboard] = useState(new Date().getMonth() + 1)

  const { senarai: bukuTunaiSemua, loading: loadingBukuTunai, muatSemula: muatSemulaBukuTunai } = useKkgsKewanganSenarai()
  // semuaTransaksi (SEMUA tahun) perlu untuk Baki Terkumpul (fix bug #1);
  // transaksiTahun (satu tahun) untuk paparan Ledger/Laporan.
  const { semuaTransaksi, transaksiTahun, loading: loadingLedger, muatSemula: muatSemulaLedger } = useKkgsLedger(tahun, true)
  const { tetapan: tetapanBaki, loading: loadingBaki, muatSemula: muatSemulaBaki } = useKkgsBakiPembukaan()
  // Nama Pengerusi/Bendahari SEMASA - utk cetak terus pada ruang
  // tandatangan laporan bulanan (SAHAJA bila laporan utk TAHUN SEMASA -
  // rekod jawatankuasa ni cuma simpan pemegang SEKARANG, tiada sejarah
  // ikut tahun, jadi tak sah dipakai utk laporan tahun lepas/depan).
  const { senarai: ahliSenarai } = useKkgsAhliSenarai()
  const namaPengerusiSemasa = ahliSenarai.find((a) => a.jawatan === 'Pengerusi')?.nama ?? null
  const namaBendahariSemasa = ahliSenarai.find((a) => a.jawatan === 'Bendahari 1')?.nama ?? null
  // Nama sekolah (letterhead laporan) - lihat ModalNamaSekolah di atas.
  const { namaSekolah, muatSemula: muatSemulaNamaSekolah } = useKkgsNamaSekolahLaporan()
  const [tunjukForm, setTunjukForm] = useState(false)
  const [transaksiEdit, setTransaksiEdit] = useState(null)
  const [tunjukTetapanBaki, setTunjukTetapanBaki] = useState(false)
  const [tunjukTetapanNamaSekolah, setTunjukTetapanNamaSekolah] = useState(false)
  const [dataLaporan, setDataLaporan] = useCetak((d) => `Laporan Kewangan KKGS ${d.bulan ? `${NAMA_BULAN[d.bulan - 1]} ${d.tahun}` : `Tahun ${d.tahun}`}`)

  const bukuTunai = bukuTunaiSemua.filter((t) => (t.tarikh ?? '').slice(0, 4) === String(tahun))

  async function muatSemulaSemua() {
    muatSemulaBukuTunai()
    muatSemulaLedger()
  }

  async function simpan(data) {
    if (transaksiEdit) {
      await kemaskiniKewanganKkgs(transaksiEdit.id, data, user.uid)
    } else {
      await tambahKewanganKkgs(data, user.uid)
    }
    setTunjukForm(false)
    setTransaksiEdit(null)
    muatSemulaSemua()
  }

  async function padam(t) {
    if (!(await konfirm('Padam transaksi ni?', { bahaya: true }))) return
    await padamKewanganKkgs(t.id)
    muatSemulaSemua()
  }

  async function simpanTetapanBaki(data) {
    await simpanBakiPembukaan(data, user.uid)
    muatSemulaBaki()
  }

  async function simpanTetapanNamaSekolah(nama) {
    await simpanKkgsNamaSekolahLaporan(nama, user.uid)
    muatSemulaNamaSekolah()
  }

  const jumlahMasukTahun = transaksiTahun.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const jumlahKeluarTahun = transaksiTahun.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  // Baki Terkumpul SEBENAR (fix bug #1) - baki pembukaan + semua tahun
  // dari tahunPembukaan hingga tahun dipilih, BUKAN sekadar satu tahun.
  const bakiTerkumpul = kiraBakiTerkumpul(semuaTransaksi, tahun, tetapanBaki.bakiPembukaan, tetapanBaki.tahunPembukaan)
  // Baki SEMASA (hari ini SEBENAR) - staff minta Dashboard sentiasa tunjuk
  // baki BENAR sekarang, tak kira tahun mana dipilih pada dropdown "Tahun".
  const bakiSemasa = kiraBakiSemasa(semuaTransaksi, tetapanBaki.bakiPembukaan, tetapanBaki.tahunPembukaan)
  // Baki di AWAL tahun dipilih (sebelum transaksi tahun ni bermula) -
  // asas utk baki bergerak (running balance) setiap row Ledger/Laporan.
  const bakiAwalTahun = kiraBakiTerkumpul(semuaTransaksi, tahun - 1, tetapanBaki.bakiPembukaan, tetapanBaki.tahunPembukaan)
  // Ledger tahun ni, tersusun MENAIK ikut tarikh, dgn lajur baki bergerak.
  const transaksiTahunDenganBaki = kiraTransaksiDenganBaki(transaksiTahun, bakiAwalTahun)
  // Kumpul ikut bulan (Jan-Dis, SENTIASA 12) utk tab Ledger & Laporan
  // (skrin) - struktur SAMA dgn versi cetak (row 1 = Baki Bawa Ke
  // Hadapan setiap bulan). `noMula` dikira supaya nombor "No" bersambung
  // (1,2,3…) merentasi SELURUH tahun, bukan reset setiap bulan.
  const kumpulanBulananLedger = kumpul12Bulan(transaksiTahunDenganBaki, bakiAwalTahun)
  let noBerjalanLedger = 1
  const kumpulanBulananLedgerDenganNo = kumpulanBulananLedger.map((k) => {
    const item = { ...k, noMula: noBerjalanLedger }
    noBerjalanLedger += k.senarai.length
    return item
  })
  // Selector "Bulan" (dari tab Laporan asal) kini kawal DUA-DUA paparan
  // skrin (bulan mana nak papar) DAN cetak (cetakLaporan() di bawah).
  const kumpulanUntukPapar = bulanLaporan === 0 ? kumpulanBulananLedgerDenganNo : kumpulanBulananLedgerDenganNo.filter((k) => k.bulan === bulanLaporan)

  const masukBulanDashboard = transaksiTahun.filter((t) => t.jenis === 'masuk' && Number(t.tarikh.slice(5, 7)) === bulanDashboard).reduce((j, t) => j + t.jumlah, 0)
  const keluarBulanDashboard = transaksiTahun.filter((t) => t.jenis === 'keluar' && Number(t.tarikh.slice(5, 7)) === bulanDashboard).reduce((j, t) => j + t.jumlah, 0)

  function cetakLaporan() {
    const transaksiTapis = bulanLaporan === 0 ? transaksiTahunDenganBaki : transaksiTahunDenganBaki.filter((t) => Number(t.tarikh.slice(5, 7)) === bulanLaporan)
    // Nama hanya dicetak kalau laporan utk TAHUN SEMASA - lihat nota di atas.
    const untukTahunSemasa = tahun === TAHUN_SEMASA
    setDataLaporan({
      transaksi: transaksiTapis, tahun, bulan: bulanLaporan === 0 ? null : bulanLaporan, bakiTerkumpul, bakiAwalTahun,
      namaPengerusi: untukTahunSemasa ? namaPengerusiSemasa : null,
      namaBendahari: untukTahunSemasa ? namaBendahariSemasa : null,
      namaSekolah: namaSekolah || null,
    })
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-4 p-1 rounded-card bg-base w-fit overflow-x-auto">
        {TAB.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`h-9 px-3.5 rounded-card text-xs font-semibold shrink-0 ${tab === t.id ? 'bg-brand-red text-white' : 'text-inkmuted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="h-10 px-3 rounded-card border border-border bg-surface text-sm">
          {PILIHAN_TAHUN_KKGS.map((t) => <option key={t} value={t}>{t}{t === TAHUN_SEMASA ? ' (semasa)' : ''}</option>)}
        </select>
        {bolehUrus && tab === 'dashboard' && (
          <button onClick={() => setTunjukTetapanBaki(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
            <Settings size={14} /> Baki Pembukaan
          </button>
        )}
        {bolehUrus && tab === 'ledger' && (
          <button onClick={() => setTunjukTetapanNamaSekolah(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
            <Settings size={14} /> Nama Sekolah (Laporan)
          </button>
        )}
      </div>

      {/* ===== DASHBOARD ===== */}
      {tab === 'dashboard' && (
        (loadingLedger || loadingBaki) ? <p className="text-sm text-inkmuted">Memuatkan…</p> : (
          <div>
            {/* Baki SEMASA - SENTIASA ikut tarikh SEBENAR hari ini, tak
                kira tahun mana staff sedang tengok pada dropdown "Tahun"
                di atas (fix "Dashboard kena pastikan tunjuk baki semasa"). */}
            <div className="rounded-card border-2 border-ink bg-surface p-4 text-center mb-3">
              <p className="text-xs text-inkmuted">Baki Semasa Kelab (hari ini, {tarikhHariIniDashboard()})</p>
              <p className="text-2xl font-extrabold text-ink">RM {bakiSemasa.toFixed(2)}</p>
            </div>
            {tahun !== TAHUN_SEMASA && (
              <div className="rounded-card border border-border bg-surface p-3 text-center mb-3">
                <p className="text-[10px] text-inkmuted">Baki Terkumpul (akhir tahun {tahun} dipilih)</p>
                <p className="text-sm font-bold text-ink">RM {bakiTerkumpul.toFixed(2)}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="rounded-card border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-inkmuted">Bersih {tahun}</p>
                <p className="text-sm font-bold text-ink">RM {(jumlahMasukTahun - jumlahKeluarTahun).toFixed(2)}</p>
              </div>
              <div className="rounded-card border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-inkmuted">Masuk {NAMA_BULAN[bulanDashboard - 1]}</p>
                <p className="text-sm font-bold text-[#0F6E56]">RM {masukBulanDashboard.toFixed(2)}</p>
              </div>
              <div className="rounded-card border border-border bg-surface p-3 text-center">
                <p className="text-[10px] text-inkmuted">Keluar {NAMA_BULAN[bulanDashboard - 1]}</p>
                <p className="text-sm font-bold text-brand-red">RM {keluarBulanDashboard.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <select value={bulanDashboard} onChange={(e) => setBulanDashboard(Number(e.target.value))} className="h-8 px-2.5 rounded-card border border-border bg-surface text-[11px]">
                {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
              </select>
            </div>
            <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Pecahan Ikut Kategori {tahun} (Yuran, Sumbangan, Claim, dll)</p>
            <div className="mb-4">
              <PecahanKategoriDashboard transaksi={transaksiTahun} />
            </div>
            <div className="rounded-card border border-border bg-surface p-4">
              <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-3">Trend Bulanan {tahun}</p>
              <CartaBulanan transaksi={transaksiTahun} />
            </div>
          </div>
        )
      )}

      {/* ===== BUKU TUNAI (manual) ===== */}
      {tab === 'bukutunai' && (
        <div>
          {bolehUrus && (
            <button onClick={() => { setTransaksiEdit(null); setTunjukForm(true) }} className="flex items-center gap-1.5 h-10 px-3 rounded-card bg-brand-red text-white text-xs font-semibold mb-4">
              <Plus size={14} /> Rekod Transaksi
            </button>
          )}
          {loadingBukuTunai ? (
            <p className="text-sm text-inkmuted">Memuatkan…</p>
          ) : bukuTunai.length === 0 ? (
            <p className="text-sm text-inkmuted">Tiada transaksi manual lagi.</p>
          ) : (
            <div className="space-y-2">
              {bukuTunai.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-card border border-border bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{t.perkara}</p>
                    <p className="text-xs text-inkmuted">{t.tarikh} · {t.kategori || 'Lain-lain'}{t.catatan && ` · ${t.catatan}`}</p>
                    {t.programNama && <p className="text-[10px] text-inkmuted mt-0.5">📌 {t.programNama}</p>}
                  </div>
                  <p className="text-sm font-bold shrink-0" style={{ color: t.jenis === 'masuk' ? '#0F6E56' : '#C8102E' }}>{t.jenis === 'masuk' ? '+' : '-'} RM {t.jumlah.toFixed(2)}</p>
                  {bolehUrus && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setTransaksiEdit(t); setTunjukForm(true) }} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><Pencil size={14} /></button>
                      <button onClick={() => padam(t)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== LEDGER & LAPORAN (gabungan - papar ikut bulan di skrin, +
          boleh jana/cetak laporan PDF sama seperti dulu) ===== */}
      {tab === 'ledger' && (
        <div>
          <p className="text-xs text-inkmuted mb-3">Gabungan AUTOMATIK semua pergerakan wang (Yuran + Claim diluluskan + Kewangan manual), disusun ikut bulan dalam tahun {tahun} - setiap bulan bermula dengan baki dibawa ke hadapan dari bulan sebelumnya. Pilih tempoh di bawah untuk papar/cetak.</p>
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <select value={bulanLaporan} onChange={(e) => setBulanLaporan(Number(e.target.value))} className="h-10 px-3 rounded-card border border-border bg-surface text-sm">
              <option value={0}>Tahun Penuh ({tahun})</option>
              {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n} {tahun}</option>)}
            </select>
            <button onClick={cetakLaporan} className="flex items-center gap-1.5 h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold">
              <Printer size={14} /> Jana &amp; Cetak Laporan
            </button>
          </div>
          <div className="rounded-card border border-border bg-surface p-3 mb-4 flex items-center justify-between">
            <p className="text-xs text-inkmuted">Baki Awal {tahun}</p>
            <p className="text-sm font-bold text-ink">RM {bakiAwalTahun.toFixed(2)}</p>
          </div>
          {loadingLedger ? (
            <p className="text-sm text-inkmuted">Memuatkan…</p>
          ) : (
            <div className="space-y-5">
              {kumpulanUntukPapar.map((k) => <KadBulanLedger key={k.bulan} tahun={tahun} {...k} />)}
            </div>
          )}
        </div>
      )}

      {bolehUrus && (
        <>
          <ModalTransaksi key={transaksiEdit?.id ?? 'baru'} open={tunjukForm} tahun={tahun} editData={transaksiEdit} onTutup={() => { setTunjukForm(false); setTransaksiEdit(null) }} onSimpan={simpan} />
          <ModalBakiPembukaan open={tunjukTetapanBaki} tetapan={tetapanBaki} onTutup={() => setTunjukTetapanBaki(false)} onSimpan={simpanTetapanBaki} />
          <ModalNamaSekolah open={tunjukTetapanNamaSekolah} namaSemasa={namaSekolah} onTutup={() => setTunjukTetapanNamaSekolah(false)} onSimpan={simpanTetapanNamaSekolah} />
        </>
      )}
      {dataLaporan && <LaporanKewanganKKGS {...dataLaporan} />}
    </div>
  )
}
