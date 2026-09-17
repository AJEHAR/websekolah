import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, X, Upload, Check, X as XIcon, Pencil, Trash2, Printer } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsClaimSemua, hantarClaimKkgs, kemaskiniClaimKkgs, padamClaimKkgs, putuskanClaimKkgs } from '../../hooks/useKkgsClaim.js'
import { useKkgsProgramTahun } from '../../hooks/useKkgsProgram.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useCetak } from '../../hooks/useCetak.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { JENIS_IMBUHAN_KKGS, PILIHAN_TAHUN_KKGS, TAHUN_SEMASA, PROGRAM_LAIN_ID } from './kkgsConstants.js'
import DropdownCari from './DropdownCari.jsx'
import LaporanClaimKKGS from './LaporanClaimKKGS.jsx'

function tarikhMohonKeTahun(c) {
  const ts = c.tarikhMohon
  if (!ts) return null
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.getFullYear()
}

const TAB = [
  { id: 'imbuhan', label: 'Claim' },
  { id: 'resit', label: 'Resit' },
  { id: 'sumbangan', label: 'Sumbangan' },
]

const WARNA_STATUS = {
  menunggu: { bg: '#FCEFC7', teks: '#8A6D00', label: 'Menunggu' },
  diluluskan: { bg: '#E1F5EE', teks: '#0F6E56', label: 'Selesai' },
  ditolak: { bg: '#FDEAEA', teks: '#C8102E', label: 'Ditolak' },
}

function BadgeStatus({ status }) {
  const w = WARNA_STATUS[status] ?? WARNA_STATUS.menunggu
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: w.bg, color: w.teks }}>{w.label}</span>
}

// Borang hantar/edit - reka bentuk BERBEZA ikut tab (bukan togol dalam
// SATU borang lagi) - tab tentukan jenisClaim terus, staff nampak medan
// relevan sahaja untuk tab tu. editData (pilihan) - kalau diisi, borang
// jadi mod EDIT (pra-isi medan + kemaskini rekod sedia ada, bukan cipta
// baharu).
function ModalHantar({ open, jenis, senaraiAhli, tahun, editData, onTutup, onSelesai, user }) {
  const [ahliId, setAhliId] = useState(editData?.ahliId ?? '')
  const [jenisImbuhan, setJenisImbuhan] = useState(editData?.jenisImbuhan ?? '')
  const [tujuan, setTujuan] = useState(editData?.tujuan ?? '')
  const [jumlah, setJumlah] = useState(editData?.jumlah ?? '')
  const [catatan, setCatatan] = useState(editData?.jenisClaim === 'sumbangan' ? (editData?.tujuan ?? '') : '')
  const [fail, setFail] = useState(null)
  const [arahSumbangan, setArahSumbangan] = useState(editData?.arahSumbangan || 'masuk') // 'masuk' | 'keluar'
  const [kepadaSiapa, setKepadaSiapa] = useState(editData?.kepadaSiapa ?? '')
  const [programId, setProgramId] = useState(editData?.programId ?? '')
  const [programLain, setProgramLain] = useState(editData?.programId === PROGRAM_LAIN_ID ? (editData?.programNama ?? '') : '')
  const [menghantar, setMenghantar] = useState(false)
  const [ralat, setRalat] = useState(null)

  // Senarai Program/Aktiviti tahun semasa dilihat (page Tuntutan KKGS) -
  // dikongsi corak sama macam Rekod Transaksi Kewangan.
  const { senarai: senaraiProgram } = useKkgsProgramTahun(tahun)
  const pilihanProgram = [...senaraiProgram.map((p) => ({ id: p.id, label: p.nama })), { id: PROGRAM_LAIN_ID, label: 'Lain-lain' }]

  if (!open) return null

  const modEdit = Boolean(editData)
  const imbuhanDipilih = JENIS_IMBUHAN_KKGS.find((j) => j.label === jenisImbuhan)
  const tajuk = modEdit
    ? 'Edit Rekod'
    : jenis === 'imbuhan' ? 'Hantar Claim (Imbuhan)' : jenis === 'resit' ? 'Hantar Tuntutan Resit' : 'Rekod Sumbangan'

  async function hantar() {
    setRalat(null)
    if (jenis === 'imbuhan') {
      if (!ahliId) return setRalat('Sila pilih nama anda.')
      if (!imbuhanDipilih) return setRalat('Sila pilih jenis imbuhan.')
    } else if (jenis === 'resit') {
      if (!ahliId) return setRalat('Sila pilih nama anda.')
      if (!tujuan.trim()) return setRalat('Sila isi tujuan tuntutan.')
      if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
      if (!programId) return setRalat('Sila pilih Program/Aktiviti.')
      if (programId === PROGRAM_LAIN_ID && !programLain.trim()) return setRalat('Sila nyatakan Program/Aktiviti (Lain-lain).')
    } else {
      if (!ahliId) return setRalat(arahSumbangan === 'masuk' ? 'Sila pilih nama penyumbang.' : 'Sila pilih nama penerima.')
      if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
    }
    setMenghantar(true)
    try {
      let resitUrl = editData?.resitUrl ?? ''
      if (fail) {
        const hasil = await muatNaikKeDrive(fail, 'kkgs')
        resitUrl = hasil.url
      }

      let dataUntukSimpan
      if (jenis === 'imbuhan') {
        const ahli = senaraiAhli.find((a) => a.id === ahliId)
        dataUntukSimpan = { jenisClaim: 'imbuhan', ahliId, ahliNama: ahli.nama, jenisImbuhan: imbuhanDipilih.label, jumlah: imbuhanDipilih.jumlah, resitUrl }
      } else if (jenis === 'resit') {
        const ahli = senaraiAhli.find((a) => a.id === ahliId)
        const programNama = programId === PROGRAM_LAIN_ID ? programLain.trim() : (senaraiProgram.find((p) => p.id === programId)?.nama ?? '')
        dataUntukSimpan = { jenisClaim: 'resit', ahliId, ahliNama: ahli.nama, tujuan: tujuan.trim(), jumlah: Number(jumlah), resitUrl, programId, programNama }
      } else {
        const ahli = senaraiAhli.find((a) => a.id === ahliId)
        dataUntukSimpan = {
          jenisClaim: 'sumbangan', arahSumbangan, ahliId, ahliNama: ahli.nama,
          kepadaSiapa: arahSumbangan === 'masuk' ? kepadaSiapa : '', tujuan: catatan.trim(), jumlah: Number(jumlah), resitUrl,
        }
      }

      if (modEdit) {
        await kemaskiniClaimKkgs(editData.id, dataUntukSimpan)
      } else {
        await hantarClaimKkgs(dataUntukSimpan, user)
      }
      setAhliId(''); setJenisImbuhan(''); setTujuan(''); setJumlah(''); setCatatan(''); setKepadaSiapa(''); setFail(null); setProgramId(''); setProgramLain('')
      onSelesai()
      onTutup()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan.')
    } finally {
      setMenghantar(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">{tajuk}</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>

        {jenis === 'imbuhan' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Nama Anda</label>
              <DropdownCari value={ahliId} onChange={setAhliId} pilihan={senaraiAhli.map((a) => ({ id: a.id, label: a.nama }))} placeholder="Pilih nama…" bolehKosong={false} tajuk="Pilih Nama Anda" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Jenis Imbuhan</label>
              <DropdownCari
                value={jenisImbuhan}
                onChange={setJenisImbuhan}
                pilihan={JENIS_IMBUHAN_KKGS.map((j) => ({ id: j.label, label: `${j.label} (RM${j.jumlah})` }))}
                placeholder="Pilih jenis…"
                bolehKosong={false}
                tajuk="Pilih Jenis Imbuhan"
              />
            </div>
            {imbuhanDipilih && (
              <div className="p-3 rounded-card bg-base">
                <p className="text-xs text-inkmuted">Jumlah imbuhan: <strong className="text-ink">RM{imbuhanDipilih.jumlah}</strong> (tetap, tak boleh diubah)</p>
                <p className="text-[11px] text-inkmuted mt-1">{imbuhanDipilih.keterangan}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Bukti/Dokumen Sokongan (pilihan)</label>
              <label className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink cursor-pointer w-fit">
                <Upload size={14} /> {fail ? fail.name : 'Pilih fail…'}
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setFail(e.target.files?.[0] ?? null)} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {jenis === 'resit' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Nama Anda</label>
              <DropdownCari value={ahliId} onChange={setAhliId} pilihan={senaraiAhli.map((a) => ({ id: a.id, label: a.nama }))} placeholder="Pilih nama…" bolehKosong={false} tajuk="Pilih Nama Anda" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Program/Aktiviti</label>
              <DropdownCari value={programId} onChange={setProgramId} pilihan={pilihanProgram} placeholder="Pilih Program/Aktiviti…" bolehKosong={false} tajuk="Pilih Program/Aktiviti" />
              {programId === PROGRAM_LAIN_ID && (
                <input type="text" value={programLain} onChange={(e) => setProgramLain(e.target.value)} placeholder="Nyatakan Program/Aktiviti…" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm mt-2" />
              )}
              {senaraiProgram.length === 0 && (
                <p className="text-[10px] text-inkmuted mt-1">Tiada Program/Aktiviti direkodkan untuk tahun {tahun} - guna "Lain-lain" atau tambah dulu di page Program/Aktiviti.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Tujuan</label>
              <textarea value={tujuan} onChange={(e) => setTujuan(e.target.value)} rows={2} placeholder="cth. Tuntutan sewa bas lawatan KKGS" className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Jumlah (RM)</label>
              <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Bukti/Resit (pilihan)</label>
              <label className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink cursor-pointer w-fit">
                <Upload size={14} /> {fail ? fail.name : 'Pilih gambar…'}
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setFail(e.target.files?.[0] ?? null)} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {jenis === 'sumbangan' && (
          <div className="space-y-3">
            <p className="text-xs text-inkmuted">Derma/caruman TAMBAHAN kepada KKGS - berasingan daripada Yuran bulanan biasa.</p>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setArahSumbangan('masuk')} className={`h-10 rounded-card border-2 text-xs font-semibold ${arahSumbangan === 'masuk' ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]' : 'border-border text-inkmuted'}`}>Sumbangan Masuk</button>
              <button type="button" onClick={() => setArahSumbangan('keluar')} className={`h-10 rounded-card border-2 text-xs font-semibold ${arahSumbangan === 'keluar' ? 'border-brand-red bg-[#FDEAEA] text-brand-red' : 'border-border text-inkmuted'}`}>Sumbangan Keluar</button>
            </div>

            {arahSumbangan === 'masuk' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Penyumbang (Nama Anda)</label>
                  <DropdownCari value={ahliId} onChange={setAhliId} pilihan={senaraiAhli.map((a) => ({ id: a.id, label: a.nama }))} placeholder="Pilih nama…" bolehKosong={false} tajuk="Pilih Nama Anda" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Kepada Siapa <span className="text-inkmuted font-normal">(pilihan - peruntukan sumbangan ni)</span></label>
                  <input type="text" value={kepadaSiapa} onChange={(e) => setKepadaSiapa(e.target.value)} placeholder="cth. Cikgu Ahmad (sakit) / Program Khairat" className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Penerima</label>
                <DropdownCari value={ahliId} onChange={setAhliId} pilihan={senaraiAhli.map((a) => ({ id: a.id, label: a.nama }))} placeholder="Pilih nama penerima…" bolehKosong={false} tajuk="Pilih Penerima" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink mb-1">Jumlah (RM)</label>
              <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Catatan (pilihan)</label>
              <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder={arahSumbangan === 'masuk' ? 'cth. Sumbangan Program Khairat' : 'cth. Sebab pemberian'} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            </div>
          </div>
        )}

        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={hantar} disabled={menghantar} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menghantar ? 'Menyimpan…' : modEdit ? 'Simpan Perubahan' : jenis === 'sumbangan' ? 'Rekod Sumbangan' : 'Hantar Tuntutan'}
        </button>
      </div>
    </div>
  )
}

export default function ClaimKKGS() {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const { adaSeksyen } = useIsAdmin(user)
  const sayaJawatankuasa = adaSeksyen('kkgs')
  const { senarai: senaraiAhli } = useKkgsAhliSenarai()
  const [tab, setTab] = useState('imbuhan')
  const [tahun, setTahun] = useState(TAHUN_SEMASA)
  const [dataCetak, setDataCetak] = useCetak()

  // SEMUA staff (bukan admin sahaja) nampak SEMUA tuntutan - telus atas
  // permintaan, elak double-claim & staff nampak keadilan taburan.
  // Butang lulus/tolak kekal admin SAHAJA (papar bersyarat di bawah).
  const { senarai: claimSemua, loading, muatSemula: muatSemulaSemua } = useKkgsClaimSemua(true)
  const [tunjukForm, setTunjukForm] = useState(false)
  const [claimEdit, setClaimEdit] = useState(null)

  const senaraiPenuh = claimSemua
  // Tapisan JENIS (tab) + TAHUN (ikut tarikh mohon) - memudahkan semakan
  // (dulu semua tahun bercampur, susah semak rekod tahun tertentu).
  const senaraiPapar = senaraiPenuh.filter((c) => (c.jenisClaim || 'resit') === tab && tarikhMohonKeTahun(c) === tahun)

  async function muatSemulaSemuanya() {
    muatSemulaSemua()
  }

  function cetakLaporan() {
    setDataCetak({ senarai: senaraiPapar, jenis: tab, tahun })
  }

  async function putuskan(claim, status) {
    await putuskanClaimKkgs(claim.id, { status, catatanKeputusan: '' }, user.uid)
    muatSemulaSemuanya()
  }

  // Edit/Padam DIBENARKAN (padan firestore.rules) untuk: admin KKGS BILA-
  // BILA, ATAU pemohon sendiri HANYA semasa status masih "menunggu" (elak
  // ubah rekod selepas diluluskan - dah termaktub dalam Ledger).
  function bolehEditPadam(c) {
    return sayaJawatankuasa || (c.pemohonUid === user.uid && c.status === 'menunggu')
  }

  async function padam(c) {
    const amaran = c.status === 'diluluskan'
      ? `⚠️ Rekod ni DAH DILULUSKAN dan termaktub dalam Ledger/Kewangan. Padam akan UBAH jumlah kewangan lama secara senyap. Teruskan?`
      : 'Padam rekod ni? Tindakan tak boleh dibatalkan.'
    if (!(await konfirm(amaran, { bahaya: true }))) return
    await padamClaimKkgs(c.id)
    muatSemulaSemuanya()
  }

  function editKlik(c) {
    if (c.status === 'diluluskan') {
      konfirm(`⚠️ Rekod ni DAH DILULUSKAN dan termaktub dalam Ledger/Kewangan. Ubah akan UBAH jumlah kewangan lama secara senyap. Teruskan edit?`, { bahaya: true }).then((ok) => {
        if (ok) { setClaimEdit(c); setTunjukForm(true) }
      })
    } else {
      setClaimEdit(c)
      setTunjukForm(true)
    }
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-4 p-1 rounded-card bg-base w-fit">
        {TAB.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-9 px-3.5 rounded-card text-xs font-semibold ${tab === t.id ? 'bg-brand-red text-white' : 'text-inkmuted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="h-10 px-3 rounded-card border border-border bg-surface text-sm">
          {PILIHAN_TAHUN_KKGS.map((t) => <option key={t} value={t}>{t}{t === TAHUN_SEMASA ? ' (semasa)' : ''}</option>)}
        </select>
        <button onClick={cetakLaporan} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
          <Printer size={14} /> Cetak / PDF
        </button>
      </div>

      {tab === 'imbuhan' && (
        <details className="rounded-card border border-border bg-surface mb-4">
          <summary className="px-3.5 py-2.5 text-xs font-semibold text-ink cursor-pointer">📋 Kriteria Imbuhan (tekan untuk lihat)</summary>
          <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-border">
            {JENIS_IMBUHAN_KKGS.map((j) => (
              <div key={j.label} className="text-xs">
                <p className="font-semibold text-ink">{j.label} - RM{j.jumlah}</p>
                <p className="text-inkmuted">{j.keterangan}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-inkmuted">Semua rekod staff - telus untuk semua ahli. {sayaJawatankuasa && 'Anda boleh lulus/tandakan selesai.'}</p>
        <button onClick={() => { setClaimEdit(null); setTunjukForm(true) }} className="flex items-center gap-1.5 h-10 px-3 rounded-card bg-brand-red text-white text-xs font-semibold shrink-0">
          <Plus size={14} /> {tab === 'sumbangan' ? 'Rekod Baharu' : 'Tuntutan Baharu'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senaraiPapar.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada rekod tahun {tahun}.</p>
      ) : (
        <div className="space-y-2">
          {senaraiPapar.map((c) => (
            <div key={c.id} className="p-3.5 rounded-card border border-border bg-surface">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  {c.jenisClaim === 'sumbangan' && (
                    <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: c.arahSumbangan === 'masuk' ? '#0F6E56' : '#C8102E' }}>
                      Sumbangan {c.arahSumbangan === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-ink truncate">{c.jenisClaim === 'imbuhan' ? c.jenisImbuhan : (c.tujuan || (c.jenisClaim === 'sumbangan' ? '-' : '-'))}</p>
                </div>
                <BadgeStatus status={c.status} />
              </div>
              {c.jenisClaim === 'sumbangan' ? (
                <p className="text-xs text-inkmuted mb-1">
                  {c.arahSumbangan === 'masuk' ? (
                    <>Daripada <strong className="text-ink">{c.ahliNama}</strong>{c.kepadaSiapa && <> · Kepada: <strong className="text-ink">{c.kepadaSiapa}</strong></>}</>
                  ) : (
                    <>Kepada <strong className="text-ink">{c.ahliNama}</strong></>
                  )}
                </p>
              ) : (
                <p className="text-xs text-inkmuted mb-1">{c.ahliNama || c.pemohonNama}{c.programNama && ` · 📌 ${c.programNama}`}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">RM {c.jumlah.toFixed(2)}</p>
                {c.resitUrl && <a href={c.resitUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-red font-medium">Lihat Bukti</a>}
              </div>
              {sayaJawatankuasa && c.status === 'menunggu' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => putuskan(c, 'diluluskan')} className="flex-1 h-9 rounded-card bg-[#0F6E56] text-white text-xs font-semibold flex items-center justify-center gap-1">
                    <Check size={13} /> {tab === 'sumbangan' ? 'Terima' : 'Selesai'}
                  </button>
                  <button onClick={() => putuskan(c, 'ditolak')} className="flex-1 h-9 rounded-card border border-brand-red text-brand-red text-xs font-semibold flex items-center justify-center gap-1">
                    <XIcon size={13} /> Tolak
                  </button>
                </div>
              )}
              {bolehEditPadam(c) && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => editKlik(c)} className="flex-1 h-8 rounded-card border border-border text-xs font-semibold text-ink flex items-center justify-center gap-1">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => padam(c)} className="flex-1 h-8 rounded-card border border-brand-red text-brand-red text-xs font-semibold flex items-center justify-center gap-1">
                    <Trash2 size={12} /> Padam
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ModalHantar
        key={claimEdit?.id ?? tab}
        open={tunjukForm}
        jenis={tab}
        senaraiAhli={senaraiAhli}
        tahun={tahun}
        editData={claimEdit}
        onTutup={() => { setTunjukForm(false); setClaimEdit(null) }}
        onSelesai={muatSemulaSemuanya}
        user={user}
      />
      {dataCetak && <LaporanClaimKKGS {...dataCetak} />}
    </div>
  )
}
