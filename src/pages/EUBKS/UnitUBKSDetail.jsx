import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Camera, Trash2, Plus, Star, Check, Search, Users, Award, Pencil, X } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useMuridList } from '../../hooks/useMurid.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
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

// Warna pill kategori - padan kata kunci pada NAMA kategori (sama corak
// dengan sijilTamatUtils.js) supaya unit uniform/kelab/sukan terus dapat
// identiti warna sendiri tanpa admin kena tetapkan warna manual.
function warnaKategori(namaKategori) {
  const n = (namaKategori ?? '').toLowerCase()
  if (n.includes('uniform')) return { bg: '#E1F5EE', fg: '#0F6E56' }
  if (n.includes('kelab')) return { bg: '#EEEDFE', fg: '#534AB7' }
  if (n.includes('sukan')) return { bg: '#FAEEDA', fg: '#854F0B' }
  return { bg: '#F1EFE8', fg: '#5F5E5A' }
}

function Avatar({ nama }) {
  const inisial = (nama ?? '?').trim().charAt(0).toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-base border border-border flex items-center justify-center shrink-0 text-xs font-semibold text-inkmuted">
      {inisial}
    </div>
  )
}

// Satu baris guru penasihat - medan Tahun/Darjah (pilihan, untuk "incharge"
// tahun/darjah tertentu) simpan sendiri bila blur (elak terlalu banyak
// panggilan simpan setiap ketukan kekunci).
function BarisGuru({ guru, isAdmin, onUbahTahunDarjah, onBuang }) {
  const [nilai, setNilai] = useState(guru.tahunDarjah ?? '')
  useEffect(() => { setNilai(guru.tahunDarjah ?? '') }, [guru.tahunDarjah])

  return (
    <div className="flex items-center gap-2 p-2 rounded-card border border-border">
      <Avatar nama={guru.nama} />
      <span className="text-sm text-ink flex-1 min-w-0 truncate">{guru.nama}</span>
      {isAdmin ? (
        <input
          type="text"
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          onBlur={() => nilai !== (guru.tahunDarjah ?? '') && onUbahTahunDarjah(guru.nama, nilai)}
          placeholder="Tahun/Darjah (pilihan)"
          className="h-8 w-36 px-2 rounded-card border border-border bg-surface text-xs shrink-0"
        />
      ) : (
        guru.tahunDarjah && <span className="text-xs text-inkmuted shrink-0">{guru.tahunDarjah}</span>
      )}
      {isAdmin && (
        <button onClick={() => onBuang(guru.nama)} aria-label="Buang guru" className="p-1 rounded-card hover:bg-base text-brand-red shrink-0">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// unit.guruPenasihat rekod LAMA simpan STRING tunggal (ciri asal sebelum
// ni) - rekod BARU simpan ARRAY [{nama, tahunDarjah}] (sokong ramai guru +
// tahun/darjah "incharge" setiap seorang). Fungsi ni normalize dua-dua
// bentuk supaya UI selalu terima array, tak kira rekod lama/baru.
function senaraiGuru(unit) {
  const g = unit?.guruPenasihat
  if (!g) return []
  if (typeof g === 'string') return g.trim() ? [{ nama: g.trim(), tahunDarjah: '' }] : []
  return g
}

// Halaman detail SATU unit UBKS. Prinsip reka bentuk: "satu tindakan,
// satu simpan" (Maklumat & Ahli simpan berasingan, terus ke Firestore
// bila diubah) DAN gaya paparan INFOGRAFIK (kad hero berpusat + kad
// statistik ringkas + pill berwarna) konsisten dengan Profil Murid UBKS &
// Analisis Keberadaan - bukan borang input panjang lagi.
export default function UnitUBKSDetail() {
  const { unitId } = useParams()
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { adaSeksyen } = useIsAdmin(user)
  const isAdmin = adaSeksyen('ubks')
  const { konfirm, amaran } = useDialog()
  const { unit, loading, muatSemula } = useUnitUBKSSatu(unitId)
  const { senarai: muridSenarai } = useMuridList()
  const { profiles: staffSenarai } = useProfilesList()
  const { senarai: kategoriSenarai } = useKategoriUBKS()

  const [profilDibuka, setProfilDibuka] = useState(null)

  // --- Maklumat (nama/kategori/gambar) - paparan pasif, klik pensel untuk edit ---
  const [namaUnit, setNamaUnit] = useState('')
  const [editNama, setEditNama] = useState(false)
  const [kategoriUnit, setKategoriUnit] = useState('')
  const [editKategori, setEditKategori] = useState(false)
  const [gambarGagal, setGambarGagal] = useState(false)
  const [memuatNaikGambar, setMemuatNaikGambar] = useState(false)
  const [tersimpanApa, setTersimpanApa] = useState(null)

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
    setEditNama(false)
    if (!unit || !namaUnit.trim() || namaUnit.trim() === unit.namaUnit) return
    await kemaskiniUnit(unit.id, { namaUnit: namaUnit.trim() }, user.uid)
    kilasTersimpan('nama')
    muatSemula()
  }

  async function ubahKategori(kod) {
    setKategoriUnit(kod)
    setEditKategori(false)
    if (!unit || kod === unit.kategoriUnit) return
    await kemaskiniUnit(unit.id, { kategoriUnit: kod }, user.uid)
    kilasTersimpan('kategori')
    muatSemula()
  }

  async function simpanSenaraiGuru(senaraiBaru) {
    setMenyimpanGuru(true)
    try {
      await kemaskiniUnit(unit.id, { guruPenasihat: senaraiBaru }, user.uid)
      kilasTersimpan('guru')
      muatSemula()
    } finally {
      setMenyimpanGuru(false)
    }
  }

  async function tambahGuru() {
    const guruSedia = senaraiGuru(unit)
    const namaSedia = new Set(guruSedia.map((g) => g.nama))
    const baru = staffSenarai
      .filter((s) => dipilihGuru.has(s.id) && !namaSedia.has(s.nama))
      .map((s) => ({ nama: s.nama, tahunDarjah: '' }))
    setDipilihGuru(new Set())
    setTunjukTambahGuru(false)
    await simpanSenaraiGuru([...guruSedia, ...baru])
  }

  async function buangGuru(nama) {
    await simpanSenaraiGuru(senaraiGuru(unit).filter((g) => g.nama !== nama))
  }

  async function ubahTahunDarjahGuru(nama, tahunDarjah) {
    await simpanSenaraiGuru(senaraiGuru(unit).map((g) => (g.nama === nama ? { ...g, tahunDarjah } : g)))
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

  // --- Guru Penasihat (ramai, dari senarai staff sedia ada) ---
  const [carianGuru, setCarianGuru] = useState('')
  const [dipilihGuru, setDipilihGuru] = useState(new Set())
  const [tunjukTambahGuru, setTunjukTambahGuru] = useState(false)
  const [menyimpanGuru, setMenyimpanGuru] = useState(false)

  // --- Ahli - setiap tindakan simpan terus ---
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
  const semuaMuridDipilih = muridTahunIni.length > 0 && muridTahunIni.every((m) => dipilihSementara.has(m.idMurid))

  function toggl(idMurid) {
    setDipilihSementara((s) => {
      const baru = new Set(s)
      if (baru.has(idMurid)) baru.delete(idMurid)
      else baru.add(idMurid)
      return baru
    })
  }

  function togglSemuaMurid() {
    setDipilihSementara(semuaMuridDipilih ? new Set() : new Set(muridTahunIni.map((m) => m.idMurid)))
  }

  // Senarai staff (guru) yang belum dilantik ke unit ni + padan carian.
  const namaGuruSedia = new Set(senaraiGuru(unit).map((g) => g.nama))
  const staffBolehTambah = staffSenarai.filter(
    (s) => !namaGuruSedia.has(s.nama) && s.nama?.toLowerCase().includes(carianGuru.toLowerCase())
  )
  const semuaGuruDipilih = staffBolehTambah.length > 0 && staffBolehTambah.every((s) => dipilihGuru.has(s.id))

  function togglGuru(id) {
    setDipilihGuru((s) => {
      const baru = new Set(s)
      if (baru.has(id)) baru.delete(id)
      else baru.add(id)
      return baru
    })
  }

  function togglSemuaGuru() {
    setDipilihGuru(semuaGuruDipilih ? new Set() : new Set(staffBolehTambah.map((s) => s.id)))
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

  const namaKategoriPenuh = kategoriSenarai.find((k) => k.kod === unit.kategoriUnit)?.nama ?? unit.kategoriUnit
  const wKategori = warnaKategori(namaKategoriPenuh)
  const jumlahLF = ahli.filter((a) => a.adalahLF).length
  const jumlahJawatan = ahli.filter((a) => a.jawatan?.trim()).length

  return (
    <div className="max-w-2xl">
      <Link to="/eubks/murid-ubks" className="inline-flex items-center gap-1.5 text-xs text-inkmuted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Murid UBKS
      </Link>

      {/* Kad hero - infografik identiti unit */}
      <div className="rounded-card border border-border bg-surface p-6 mb-4 text-center">
        <div className="relative inline-block mb-3">
          <div className="h-24 w-24 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center mx-auto">
            {unit.gambarUnit && !gambarGagal ? (
              <img src={unit.gambarUnit} alt="" className="h-full w-full object-cover" onError={() => setGambarGagal(true)} />
            ) : (
              <Users size={26} className="text-inkmuted" />
            )}
          </div>
          {isAdmin && (
            <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-ink flex items-center justify-center cursor-pointer border-2 border-surface">
              {memuatNaikGambar ? (
                <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
              <input type="file" accept="image/*" onChange={pilihGambar} className="hidden" disabled={memuatNaikGambar} />
            </label>
          )}
        </div>
        <Tersimpan tunjuk={tersimpanApa === 'gambar'} />

        {editNama && isAdmin ? (
          <input
            autoFocus
            type="text"
            value={namaUnit}
            onChange={(e) => setNamaUnit(e.target.value)}
            onBlur={simpanNama}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            className="text-lg font-bold text-ink text-center bg-transparent border-b-2 border-brand-red focus:outline-none mb-1 w-full max-w-xs mx-auto block"
          />
        ) : (
          <button
            onClick={() => isAdmin && setEditNama(true)}
            className="flex items-center gap-1.5 mx-auto mb-1 group"
            disabled={!isAdmin}
          >
            <h1 className="text-lg font-bold text-ink">{unit.namaUnit}</h1>
            {isAdmin && <Pencil size={13} className="text-inkmuted opacity-0 group-hover:opacity-100" />}
          </button>
        )}
        <Tersimpan tunjuk={tersimpanApa === 'nama'} />

        <div className="mt-2">
          {editKategori && isAdmin ? (
            <select
              autoFocus
              value={kategoriUnit}
              onChange={(e) => ubahKategori(e.target.value)}
              onBlur={() => setEditKategori(false)}
              className="h-8 px-2 rounded-full border border-border bg-surface text-xs mx-auto"
            >
              <option value="">-- Pilih --</option>
              {kategoriSenarai.map((k) => (
                <option key={k.id} value={k.kod}>{k.nama}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => isAdmin && setEditKategori(true)}
              disabled={!isAdmin}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: wKategori.bg, color: wKategori.fg }}
            >
              {namaKategoriPenuh || 'Tiada kategori'}
            </button>
          )}
        </div>
        <Tersimpan tunjuk={tersimpanApa === 'kategori'} />
        <p className="text-[11px] text-inkmuted mt-2">Tahun sesi {unit.tahunSesi}</p>

        <div className="mt-4 pt-4 border-t border-border text-left">
          <label className="flex items-center gap-2 text-xs font-medium text-inkmuted mb-2">
            Guru Penasihat <Tersimpan tunjuk={tersimpanApa === 'guru'} />
          </label>

          {senaraiGuru(unit).length === 0 ? (
            <p className="text-xs text-inkmuted mb-2">Belum ada guru penasihat dilantik.</p>
          ) : (
            <div className="space-y-1.5 mb-2">
              {senaraiGuru(unit).map((g) => (
                <BarisGuru key={g.nama} guru={g} isAdmin={isAdmin} onUbahTahunDarjah={ubahTahunDarjahGuru} onBuang={buangGuru} />
              ))}
            </div>
          )}

          {isAdmin && !tunjukTambahGuru && (
            <button onClick={() => setTunjukTambahGuru(true)} className="flex items-center gap-1.5 h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink">
              <Plus size={13} /> Tambah Guru
            </button>
          )}

          {isAdmin && tunjukTambahGuru && (
            <div className="p-3 rounded-card bg-base">
              <div className="relative mb-2">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inkmuted" />
                <input
                  type="text"
                  value={carianGuru}
                  onChange={(e) => setCarianGuru(e.target.value)}
                  placeholder="Cari nama staff…"
                  className="w-full h-9 pl-8 pr-3 rounded-card border border-border bg-surface text-sm"
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-border rounded-card divide-y divide-border bg-surface mb-2">
                {staffBolehTambah.length === 0 ? (
                  <p className="p-2 text-xs text-inkmuted">Tiada staff lagi untuk tambah.</p>
                ) : (
                  <>
                    <label className="flex items-center gap-2 p-2 text-xs font-semibold cursor-pointer hover:bg-base border-b border-border">
                      <input type="checkbox" checked={semuaGuruDipilih} onChange={togglSemuaGuru} className="h-4 w-4" />
                      <span className="text-ink">Pilih Semua ({staffBolehTambah.length})</span>
                    </label>
                    {staffBolehTambah.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-base">
                        <input type="checkbox" checked={dipilihGuru.has(s.id)} onChange={() => togglGuru(s.id)} className="h-4 w-4" />
                        <span className="text-ink">{s.nama}</span>
                      </label>
                    ))}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={tambahGuru}
                  disabled={dipilihGuru.size === 0 || menyimpanGuru}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-card bg-ink text-white text-xs font-semibold disabled:opacity-40"
                >
                  <Plus size={13} /> {menyimpanGuru ? 'Menyimpan…' : `Tambah ${dipilihGuru.size > 0 ? `(${dipilihGuru.size})` : ''}`}
                </button>
                <button onClick={() => { setTunjukTambahGuru(false); setDipilihGuru(new Set()); setCarianGuru('') }} className="h-9 px-3 rounded-card border border-border text-xs font-medium text-ink">
                  Batal
                </button>
              </div>
            </div>
          )}
          <p className="text-[10px] text-inkmuted mt-2">Digunakan untuk auto-isi Laporan Aktiviti Perjumpaan unit ni. Isi "Tahun/Darjah" kalau guru tu incharge satu tahun/darjah tertentu sahaja.</p>
        </div>
      </div>

      {/* Kad statistik - infografik ringkasan ahli */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-card p-3.5 text-center" style={{ backgroundColor: '#E1F5EE' }}>
          <div className="h-8 w-8 rounded-full bg-[#0F6E56] flex items-center justify-center mx-auto mb-1.5">
            <Users size={14} className="text-white" />
          </div>
          <p className="text-lg font-bold text-ink leading-none">{ahli.length}</p>
          <p className="text-[10px] text-inkmuted mt-1">Ahli</p>
        </div>
        <div className="rounded-card p-3.5 text-center" style={{ backgroundColor: '#FAEEDA' }}>
          <div className="h-8 w-8 rounded-full bg-[#BA7517] flex items-center justify-center mx-auto mb-1.5">
            <Star size={14} className="text-white fill-current" />
          </div>
          <p className="text-lg font-bold text-ink leading-none">{jumlahLF}</p>
          <p className="text-[10px] text-inkmuted mt-1">LF</p>
        </div>
        <div className="rounded-card p-3.5 text-center" style={{ backgroundColor: '#FCEBEB' }}>
          <div className="h-8 w-8 rounded-full bg-brand-red flex items-center justify-center mx-auto mb-1.5">
            <Award size={14} className="text-white" />
          </div>
          <p className="text-lg font-bold text-ink leading-none">{jumlahJawatan}</p>
          <p className="text-[10px] text-inkmuted mt-1">Jawatankuasa</p>
        </div>
      </div>

      {/* Ahli */}
      <div className="p-4 sm:p-5 rounded-card border border-border bg-surface mb-4">
        <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-4">Senarai Ahli</p>

        {isAdmin && (
          <div className="mb-5 p-3 rounded-card bg-base">
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
                    <>
                      <label className="flex items-center gap-2 p-2 text-xs font-semibold cursor-pointer hover:bg-base border-b border-border">
                        <input type="checkbox" checked={semuaMuridDipilih} onChange={togglSemuaMurid} className="h-4 w-4" />
                        <span className="text-ink">Pilih Semua ({muridTahunIni.length})</span>
                      </label>
                      {muridTahunIni.map((m) => (
                        <label key={m.idMurid} className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-base">
                          <input type="checkbox" checked={dipilihSementara.has(m.idMurid)} onChange={() => toggl(m.idMurid)} className="h-4 w-4" />
                          <span className="text-ink">{m.nama}</span>
                        </label>
                      ))}
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={tambahKeUnit}
                  disabled={dipilihSementara.size === 0 || menyimpanAhli}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-card bg-ink text-white text-xs font-semibold disabled:opacity-40"
                >
                  <Plus size={14} /> {menyimpanAhli ? 'Menyimpan…' : `Tambah ${dipilihSementara.size > 0 ? `(${dipilihSementara.size})` : ''} ke Unit`}
                </button>
              </>
            )}
          </div>
        )}

        {Object.keys(ahliIkutTahun).length === 0 ? (
          <p className="text-xs text-inkmuted">Tiada ahli lagi.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(ahliIkutTahun)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([tahun, senaraiAhli]) => (
                <div key={tahun}>
                  <h4 className="text-[11px] font-semibold text-inkmuted uppercase tracking-wide mb-1.5">{tahun} ({senaraiAhli.length})</h4>
                  <div className="space-y-1.5">
                    {senaraiAhli.map((m) => (
                      <div key={m.idMurid} className="flex items-center gap-2.5 px-3 py-2 rounded-card border border-border hover:bg-base">
                        <Avatar nama={m.nama} />
                        <button
                          onClick={() => setProfilDibuka({ idMurid: m.idMurid, nama: m.nama })}
                          className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap text-left hover:text-brand-red"
                        >
                          <span className="text-sm text-ink truncate">{m.nama}</span>
                          {m.adalahLF && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FAEEDA', color: '#854F0B' }}>LF</span>
                          )}
                          {m.jawatan?.trim() && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-red/10 text-brand-red">{m.jawatan}</span>
                          )}
                        </button>
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
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
