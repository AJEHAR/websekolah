import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Trash2, Plus, Star, Check, Search } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useMuridList } from '../../hooks/useMurid.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import { useUnitUBKSSatu, kemaskiniUnit, padamUnit } from '../../hooks/useUnitUBKS.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { useDialog } from '../../context/DialogContext.jsx'
import ProfilMuridUBKSModal from './ProfilMuridUBKSModal.jsx'

// Toast kecil "Tersimpan" - maklum balik ringkas lepas SETIAP tindakan
// simpan (bukan satu butang simpan besar di hujung borang panjang).
function Tersimpan({ tunjuk }) {
  if (!tunjuk) return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0F6E56]">
      <Check size={12} /> Tersimpan
    </span>
  )
}

// Halaman detail SATU unit UBKS - gantikan UnitUBKSModal lama. Prinsip
// reka bentuk: "satu tindakan, satu simpan" - Maklumat (nama/kategori/
// gambar) dan Ahli (tambah/buang/LF/jawatan) adalah DUA bahagian
// SEPENUHNYA berasingan, setiap satu simpan terus ke Firestore bila
// diubah (bukan satu butang "Simpan Perubahan" besar di hujung yang
// senang terlepas pandang & boleh hilangkan kerja kalau tak sempat tekan).
export default function UnitUBKSDetail() {
  const { unitId } = useParams()
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { adaSeksyen } = useIsAdmin(user)
  const isAdmin = adaSeksyen('ubks')
  const { konfirm, amaran } = useDialog()
  const { unit, loading, muatSemula } = useUnitUBKSSatu(unitId)
  const { senarai: muridSenarai } = useMuridList()
  const { senarai: kategoriSenarai } = useKategoriUBKS()

  const [profilDibuka, setProfilDibuka] = useState(null)

  // --- Bahagian 1: Maklumat (nama/kategori/gambar) - setiap medan simpan sendiri ---
  const [namaUnit, setNamaUnit] = useState('')
  const [kategoriUnit, setKategoriUnit] = useState('')
  const [gambarGagal, setGambarGagal] = useState(false)
  const [memuatNaikGambar, setMemuatNaikGambar] = useState(false)
  const [menyimpanNama, setMenyimpanNama] = useState(false)
  const [tersimpanApa, setTersimpanApa] = useState(null) // 'nama' | 'kategori' | 'gambar' | null

  useEffect(() => {
    if (unit) {
      setNamaUnit(unit.namaUnit ?? '')
      setKategoriUnit(unit.kategoriUnit ?? '')
    }
  }, [unit])

  function kilasTersimpan(apa) {
    setTersimpanApa(apa)
    setTimeout(() => setTersimpanApa((s) => (s === apa ? null : s)), 2000)
  }

  async function simpanNama() {
    if (!unit || namaUnit.trim() === unit.namaUnit || !namaUnit.trim()) return
    setMenyimpanNama(true)
    try {
      await kemaskiniUnit(unit.id, { namaUnit: namaUnit.trim() }, user.uid)
      kilasTersimpan('nama')
      muatSemula()
    } finally {
      setMenyimpanNama(false)
    }
  }

  async function ubahKategori(kod) {
    setKategoriUnit(kod)
    if (!unit || kod === unit.kategoriUnit) return
    await kemaskiniUnit(unit.id, { kategoriUnit: kod }, user.uid)
    kilasTersimpan('kategori')
    muatSemula()
  }

  async function pilihGambar(e) {
    const fail = e.target.files?.[0]
    if (!fail || !unit) return
    setMemuatNaikGambar(true)
    setGambarGagal(false)
    try {
      const hasil = await muatNaikKeDrive(fail, 'unitUBKS')
      await kemaskiniUnit(unit.id, { gambarUnit: hasil.url }, user.uid)
      kilasTersimpan('gambar')
      muatSemula()
    } catch (err) {
      await amaran(err.message || 'Gagal muat naik gambar. Sila cuba lagi.')
    } finally {
      setMemuatNaikGambar(false)
      e.target.value = ''
    }
  }

  // --- Bahagian 2: Ahli - setiap tindakan (tambah/buang/LF/jawatan) simpan terus ---
  const [tahunDipilih, setTahunDipilih] = useState('')
  const [carian, setCarian] = useState('')
  const [dipilihSementara, setDipilihSementara] = useState(new Set())
  const [menyimpanAhli, setMenyimpanAhli] = useState(false)

  const senaraiTahun = useMemo(() => {
    const set = new Set()
    muridSenarai.forEach((m) => { if (m.tahunTingkatan?.trim()) set.add(m.tahunTingkatan.trim()) })
    return [...set].sort()
  }, [muridSenarai])

  const ahli = unit?.ahli ?? []
  const idSudahAhli = new Set(ahli.map((a) => a.idMurid))
  const muridTahunIni = muridSenarai.filter(
    (m) => m.tahunTingkatan === tahunDipilih && !idSudahAhli.has(m.idMurid) && m.nama?.toLowerCase().includes(carian.toLowerCase())
  )

  function toggl(idMurid) {
    setDipilihSementara((s) => {
      const baru = new Set(s)
      if (baru.has(idMurid)) baru.delete(idMurid)
      else baru.add(idMurid)
      return baru
    })
  }

  async function simpanAhliBaru(ahliBaru) {
    setMenyimpanAhli(true)
    try {
      await kemaskiniUnit(unit.id, { ahli: ahliBaru }, user.uid)
      muatSemula()
    } finally {
      setMenyimpanAhli(false)
    }
  }

  async function tambahKeUnit() {
    const baru = muridTahunIni
      .filter((m) => dipilihSementara.has(m.idMurid))
      .map((m) => ({ idMurid: m.idMurid, nama: m.nama, tahunTingkatan: m.tahunTingkatan, adalahLF: false, jawatan: '' }))
    setDipilihSementara(new Set())
    await simpanAhliBaru([...ahli, ...baru])
  }

  async function buangAhli(idMurid) {
    await simpanAhliBaru(ahli.filter((m) => m.idMurid !== idMurid))
  }

  async function togglLF(idMurid) {
    await simpanAhliBaru(ahli.map((m) => (m.idMurid === idMurid ? { ...m, adalahLF: !m.adalahLF } : m)))
  }

  async function padamUnitIni() {
    if (!(await konfirm(`Padam unit "${unit.namaUnit}"? Tindakan ini tidak boleh dibatalkan.`, { bahaya: true }))) return
    await padamUnit(unit.id)
    navigate('/eubks/murid-ubks')
  }

  const ahliIkutTahun = {}
  ahli.forEach((m) => {
    const t = m.tahunTingkatan || 'Tiada Tahun'
    if (!ahliIkutTahun[t]) ahliIkutTahun[t] = []
    ahliIkutTahun[t].push(m)
  })

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>
  if (!unit) {
    return (
      <div>
        <p className="text-sm text-inkmuted mb-3">Unit tidak dijumpai.</p>
        <Link to="/eubks/murid-ubks" className="text-sm text-brand-red font-medium">← Kembali ke Murid UBKS</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link to="/eubks/murid-ubks" className="inline-flex items-center gap-1.5 text-xs text-inkmuted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Murid UBKS
      </Link>

      {/* Bahagian 1: Maklumat */}
      <div className="p-4 sm:p-5 rounded-card border border-border bg-surface mb-4">
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-4">Maklumat</p>

        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="h-24 w-24 rounded-card bg-base border border-border overflow-hidden flex items-center justify-center">
            {unit.gambarUnit && !gambarGagal ? (
              <img src={unit.gambarUnit} alt="" className="h-full w-full object-cover" onError={() => setGambarGagal(true)} />
            ) : (
              <span className="text-xs text-inkmuted">Tiada gambar</span>
            )}
          </div>
          {isAdmin && (
            <label className="text-sm font-medium text-brand-red cursor-pointer flex items-center gap-2">
              {memuatNaikGambar ? (
                <span className="text-inkmuted">Memuat naik…</span>
              ) : (
                <>
                  <Upload size={14} /> Tukar gambar unit
                  <input type="file" accept="image/*" onChange={pilihGambar} className="hidden" disabled={memuatNaikGambar} />
                </>
              )}
              <Tersimpan tunjuk={tersimpanApa === 'gambar'} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="namaUnit" className="flex items-center gap-2 text-sm font-medium text-ink mb-1">
              Nama Unit <Tersimpan tunjuk={tersimpanApa === 'nama'} />
            </label>
            <input
              id="namaUnit"
              type="text"
              disabled={!isAdmin}
              value={namaUnit}
              onChange={(e) => setNamaUnit(e.target.value)}
              onBlur={simpanNama}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="kategoriUnit" className="flex items-center gap-2 text-sm font-medium text-ink mb-1">
              Kategori <Tersimpan tunjuk={tersimpanApa === 'kategori'} />
            </label>
            <select
              id="kategoriUnit"
              disabled={!isAdmin}
              value={kategoriUnit}
              onChange={(e) => ubahKategori(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm disabled:opacity-60"
            >
              <option value="">-- Pilih --</option>
              {kategoriSenarai.map((k) => (
                <option key={k.id} value={k.kod}>{k.nama}</option>
              ))}
            </select>
          </div>
        </div>
        {isAdmin && <p className="text-[11px] text-inkmuted mt-2">Nama unit simpan bila awak klik keluar dari kotak tu. Kategori & gambar simpan serta-merta.</p>}
      </div>

      {/* Bahagian 2: Ahli */}
      <div className="p-4 sm:p-5 rounded-card border border-border bg-surface mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-inkmuted uppercase tracking-wide">Ahli ({ahli.length})</p>
          {isAdmin && (
            <p className="text-[10px] text-inkmuted flex items-center gap-1">
              <Star size={11} className="fill-current" style={{ color: '#F2C230' }} /> = Kefungsian Rendah (LF)
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="mb-5 p-3 rounded-card border border-border bg-base">
            <p className="text-xs font-semibold text-ink mb-2">Tambah ahli baru</p>
            <div className="flex gap-2 mb-2 flex-wrap">
              <select
                value={tahunDipilih}
                onChange={(e) => { setTahunDipilih(e.target.value); setDipilihSementara(new Set()) }}
                className="h-10 px-3 rounded-card border border-border bg-surface text-sm"
              >
                <option value="">-- Pilih Tahun --</option>
                {senaraiTahun.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {tahunDipilih && (
                <div className="relative flex-1 min-w-[160px]">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inkmuted" />
                  <input
                    type="text"
                    value={carian}
                    onChange={(e) => setCarian(e.target.value)}
                    placeholder="Cari nama…"
                    className="w-full h-10 pl-8 pr-3 rounded-card border border-border bg-surface text-sm"
                  />
                </div>
              )}
            </div>

            {tahunDipilih && (
              <>
                <div className="max-h-40 overflow-y-auto border border-border rounded-card divide-y divide-border bg-surface mb-2">
                  {muridTahunIni.length === 0 ? (
                    <p className="p-2 text-xs text-inkmuted">Tiada murid lagi untuk tambah (semua dah jadi ahli, atau tiada murid tahun ni).</p>
                  ) : (
                    muridTahunIni.map((m) => (
                      <label key={m.idMurid} className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-base">
                        <input type="checkbox" checked={dipilihSementara.has(m.idMurid)} onChange={() => toggl(m.idMurid)} className="h-4 w-4" />
                        <span className="text-ink">{m.nama}</span>
                      </label>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={tambahKeUnit}
                  disabled={dipilihSementara.size === 0 || menyimpanAhli}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-card bg-ink text-white text-xs font-semibold disabled:opacity-40"
                >
                  <Plus size={14} /> {menyimpanAhli ? 'Menyimpan…' : `Tambah ${dipilihSementara.size > 0 ? `(${dipilihSementara.size})` : ''} ke Unit - Simpan Terus`}
                </button>
              </>
            )}
          </div>
        )}

        {Object.keys(ahliIkutTahun).length === 0 ? (
          <p className="text-xs text-inkmuted">Tiada ahli lagi.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(ahliIkutTahun)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([tahun, senaraiAhli]) => (
                <div key={tahun}>
                  <h4 className="text-[11px] font-semibold text-inkmuted uppercase tracking-wide mb-1">{tahun} ({senaraiAhli.length})</h4>
                  <div className="border border-border rounded-card divide-y divide-border">
                    {senaraiAhli.map((m) => (
                      <div key={m.idMurid} className="flex items-center justify-between px-3 py-2 text-sm">
                        <button
                          onClick={() => setProfilDibuka({ idMurid: m.idMurid, nama: m.nama })}
                          className="text-ink flex items-center gap-1.5 hover:text-brand-red hover:underline text-left"
                        >
                          {m.nama}
                          {m.adalahLF && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#F2C230', color: '#1A1A1A' }}>LF</span>
                          )}
                          {m.jawatan?.trim() && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-red/10 text-brand-red">{m.jawatan}</span>
                          )}
                        </button>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => togglLF(m.idMurid)} aria-label={m.adalahLF ? 'Buang tag LF' : 'Tag sebagai LF'} className="p-1 rounded-card hover:bg-base" style={{ color: m.adalahLF ? '#F2C230' : '#B4B2A9' }}>
                              <Star size={14} className={m.adalahLF ? 'fill-current' : ''} />
                            </button>
                            <button onClick={() => buangAhli(m.idMurid)} aria-label="Buang ahli" className="p-1 rounded-card hover:bg-base text-brand-red">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Zon bahaya */}
      {isAdmin && (
        <button onClick={padamUnitIni} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-brand-red/30 text-brand-red text-sm font-semibold">
          <Trash2 size={15} /> Padam Unit Ini
        </button>
      )}

      <ProfilMuridUBKSModal
        open={Boolean(profilDibuka)}
        idMurid={profilDibuka?.idMurid}
        nama={profilDibuka?.nama}
        onClose={() => setProfilDibuka(null)}
      />
    </div>
  )
}
