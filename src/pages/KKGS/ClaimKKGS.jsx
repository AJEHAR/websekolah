import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, X, Upload, Check, X as XIcon } from 'lucide-react'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsClaimSaya, useKkgsClaimSemua, hantarClaimKkgs, putuskanClaimKkgs } from '../../hooks/useKkgsClaim.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { adalahJawatankuasaSaya } from './kkgsConstants.js'

const WARNA_STATUS = {
  menunggu: { bg: '#FCEFC7', teks: '#8A6D00', label: 'Menunggu' },
  diluluskan: { bg: '#E1F5EE', teks: '#0F6E56', label: 'Diluluskan' },
  ditolak: { bg: '#FDEAEA', teks: '#C8102E', label: 'Ditolak' },
}

function BadgeStatus({ status }) {
  const w = WARNA_STATUS[status] ?? WARNA_STATUS.menunggu
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: w.bg, color: w.teks }}>{w.label}</span>
}

function ModalHantarClaim({ open, onTutup, onSelesai, user }) {
  const [tujuan, setTujuan] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [fail, setFail] = useState(null)
  const [menghantar, setMenghantar] = useState(false)
  const [ralat, setRalat] = useState(null)

  if (!open) return null

  async function hantar() {
    if (!tujuan.trim()) return setRalat('Sila isi tujuan tuntutan.')
    if (!jumlah || Number(jumlah) <= 0) return setRalat('Sila isi jumlah yang sah.')
    setRalat(null)
    setMenghantar(true)
    try {
      let resitUrl = ''
      if (fail) {
        const hasil = await muatNaikKeDrive(fail, 'kkgs')
        resitUrl = hasil.url
      }
      await hantarClaimKkgs({ tujuan, jumlah, resitUrl }, user)
      setTujuan(''); setJumlah(''); setFail(null)
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
  const { senarai: senaraiAhli } = useKkgsAhliSenarai()
  const sayaJawatankuasa = adalahJawatankuasaSaya(senaraiAhli, user.email)

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
        <p className="text-xs text-inkmuted">{sayaJawatankuasa ? 'Semua tuntutan staff - lulus/tolak di sini.' : 'Tuntutan anda sahaja.'}</p>
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
                <p className="text-sm font-semibold text-ink flex-1">{c.tujuan}</p>
                <BadgeStatus status={c.status} />
              </div>
              {sayaJawatankuasa && <p className="text-xs text-inkmuted mb-1">{c.pemohonNama}</p>}
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">RM {c.jumlah.toFixed(2)}</p>
                {c.resitUrl && <a href={c.resitUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-red font-medium">Lihat Resit</a>}
              </div>
              {sayaJawatankuasa && c.status === 'menunggu' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => putuskan(c, 'diluluskan')} className="flex-1 h-9 rounded-card bg-[#0F6E56] text-white text-xs font-semibold flex items-center justify-center gap-1">
                    <Check size={13} /> Lulus
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

      <ModalHantarClaim open={tunjukForm} onTutup={() => setTunjukForm(false)} onSelesai={muatSemulaSemuanya} user={user} />
    </div>
  )
}
