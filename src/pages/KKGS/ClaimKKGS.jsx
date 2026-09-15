import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, X, Upload, Check, X as XIcon } from 'lucide-react'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsClaimSaya, useKkgsClaimSemua, hantarClaimKkgs, putuskanClaimKkgs } from '../../hooks/useKkgsClaim.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { JENIS_IMBUHAN_KKGS } from './kkgsConstants.js'
import DropdownCari from './DropdownCari.jsx'

const WARNA_STATUS = {
  menunggu: { bg: '#FCEFC7', teks: '#8A6D00', label: 'Menunggu' },
  diluluskan: { bg: '#E1F5EE', teks: '#0F6E56', label: 'Selesai' },
  ditolak: { bg: '#FDEAEA', teks: '#C8102E', label: 'Ditolak' },
}

function BadgeStatus({ status }) {
  const w = WARNA_STATUS[status] ?? WARNA_STATUS.menunggu
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: w.bg, color: w.teks }}>{w.label}</span>
}

// Modal hantar tuntutan - 2 JENIS: "Imbuhan" (jumlah TETAP ikut jenis,
// staff pilih nama & jenis imbuhan sahaja - tiada jumlah ditaip sendiri)
// dan "Resit" (bebas - tujuan+jumlah+upload bukti, macam sebelum ni).
function ModalHantarClaim({ open, senaraiAhli, onTutup, onSelesai, user }) {
  const [jenisClaim, setJenisClaim] = useState('imbuhan')
  const [ahliId, setAhliId] = useState('')
  const [jenisImbuhan, setJenisImbuhan] = useState('')
  const [tujuan, setTujuan] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [fail, setFail] = useState(null)
  const [menghantar, setMenghantar] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  const imbuhanDipilih = JENIS_IMBUHAN_KKGS.find((j) => j.label === jenisImbuhan)

  async function hantar() {
    setRalat(null)
    if (jenisClaim === 'imbuhan') {
      if (!ahliId) return setRalat('Sila pilih nama anda.')
      if (!imbuhanDipilih) return setRalat('Sila pilih jenis imbuhan.')
    } else {
      if (!tujuan.trim()) return setRalat('Sila isi tujuan tuntutan.')
      if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
    }
    setMenghantar(true)
    try {
      let resitUrl = ''
      if (fail) {
        const hasil = await muatNaikKeDrive(fail, 'kkgs')
        resitUrl = hasil.url
      }
      if (jenisClaim === 'imbuhan') {
        const ahli = senaraiAhli.find((a) => a.id === ahliId)
        await hantarClaimKkgs({ jenisClaim: 'imbuhan', ahliId, ahliNama: ahli.nama, jenisImbuhan: imbuhanDipilih.label, jumlah: imbuhanDipilih.jumlah, resitUrl }, user)
      } else {
        await hantarClaimKkgs({ jenisClaim: 'resit', tujuan, jumlah, resitUrl }, user)
      }
      setAhliId(''); setJenisImbuhan(''); setTujuan(''); setJumlah(''); setFail(null)
      onSelesai()
      onTutup()
    } catch (err) {
      setRalat(err.message || 'Gagal hantar tuntutan.')
    } finally {
      setMenghantar(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Hantar Tuntutan</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button type="button" onClick={() => setJenisClaim('imbuhan')} className={`h-10 rounded-card border-2 text-xs font-semibold ${jenisClaim === 'imbuhan' ? 'border-brand-red bg-[#FDEAEA] text-brand-red' : 'border-border text-inkmuted'}`}>Imbuhan</button>
          <button type="button" onClick={() => setJenisClaim('resit')} className={`h-10 rounded-card border-2 text-xs font-semibold ${jenisClaim === 'resit' ? 'border-brand-red bg-[#FDEAEA] text-brand-red' : 'border-border text-inkmuted'}`}>Resit</button>
        </div>

        {jenisClaim === 'imbuhan' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Nama Anda</label>
              <DropdownCari value={ahliId} onChange={setAhliId} pilihan={senaraiAhli.map((a) => ({ id: a.id, label: a.nama }))} placeholder="Pilih nama…" bolehKosong={false} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Jenis Imbuhan</label>
              <DropdownCari
                value={jenisImbuhan}
                onChange={setJenisImbuhan}
                pilihan={JENIS_IMBUHAN_KKGS.map((j) => ({ id: j.label, label: `${j.label} (RM${j.jumlah})` }))}
                placeholder="Pilih jenis…"
                bolehKosong={false}
              />
            </div>
            {imbuhanDipilih && <p className="text-xs text-inkmuted">Jumlah imbuhan: <strong className="text-ink">RM{imbuhanDipilih.jumlah}</strong> (tetap, tak boleh diubah)</p>}
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Bukti/Dokumen Sokongan (pilihan)</label>
              <label className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink cursor-pointer w-fit">
                <Upload size={14} /> {fail ? fail.name : 'Pilih fail…'}
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setFail(e.target.files?.[0] ?? null)} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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

        {ralat && <p className="text-xs text-brand-red mt-3">{ralat}</p>}
        <button onClick={hantar} disabled={menghantar} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menghantar ? 'Menghantar…' : 'Hantar Tuntutan'}
        </button>
      </div>
    </div>
  )
}

export default function ClaimKKGS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const sayaJawatankuasa = adaSeksyen('kkgs')
  const { senarai: senaraiAhli } = useKkgsAhliSenarai()

  const { senarai: claimSaya, loading: loadingSaya, muatSemula: muatSemulaSaya } = useKkgsClaimSaya(user.uid)
  const { senarai: claimSemua, loading: loadingSemua, muatSemula: muatSemulaSemua } = useKkgsClaimSemua(sayaJawatankuasa)
  const [tunjukForm, setTunjukForm] = useState(false)

  const senaraiPapar = sayaJawatankuasa ? claimSemua : claimSaya
  const loading = sayaJawatankuasa ? loadingSemua : loadingSaya

  async function muatSemulaSemuanya() {
    muatSemulaSaya()
    if (sayaJawatankuasa) muatSemulaSemua()
  }

  async function putuskan(claim, status) {
    await putuskanClaimKkgs(claim.id, { status, catatanKeputusan: '' }, user.uid)
    muatSemulaSemuanya()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-inkmuted">{sayaJawatankuasa ? 'Semua tuntutan staff - lulus/tandakan selesai di sini.' : 'Tuntutan anda sahaja.'}</p>
        <button onClick={() => setTunjukForm(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card bg-brand-red text-white text-xs font-semibold shrink-0">
          <Plus size={14} /> Tuntutan Baharu
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senaraiPapar.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada tuntutan lagi.</p>
      ) : (
        <div className="space-y-2">
          {senaraiPapar.map((c) => (
            <div key={c.id} className="p-3.5 rounded-card border border-border bg-surface">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-inkmuted">{c.jenisClaim === 'imbuhan' ? 'Imbuhan' : 'Resit'}</span>
                  <p className="text-sm font-semibold text-ink truncate">{c.jenisClaim === 'imbuhan' ? c.jenisImbuhan : c.tujuan}</p>
                </div>
                <BadgeStatus status={c.status} />
              </div>
              {sayaJawatankuasa && <p className="text-xs text-inkmuted mb-1">{c.jenisClaim === 'imbuhan' ? c.ahliNama : c.pemohonNama}</p>}
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">RM {c.jumlah.toFixed(2)}</p>
                {c.resitUrl && <a href={c.resitUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-red font-medium">Lihat Bukti</a>}
              </div>
              {sayaJawatankuasa && c.status === 'menunggu' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => putuskan(c, 'diluluskan')} className="flex-1 h-9 rounded-card bg-[#0F6E56] text-white text-xs font-semibold flex items-center justify-center gap-1">
                    <Check size={13} /> Selesai
                  </button>
                  <button onClick={() => putuskan(c, 'ditolak')} className="flex-1 h-9 rounded-card border border-brand-red text-brand-red text-xs font-semibold flex items-center justify-center gap-1">
                    <XIcon size={13} /> Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ModalHantarClaim open={tunjukForm} senaraiAhli={senaraiAhli} onTutup={() => setTunjukForm(false)} onSelesai={muatSemulaSemuanya} user={user} />
    </div>
  )
}
