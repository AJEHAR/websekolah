import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload, Plus, Trash2 } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfilSekolahAwam, simpanProfilSekolahAwam } from '../../hooks/useProfilSekolahAwam.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'
import { useDialog } from '../../context/DialogContext.jsx'

export default function TetapanProfilSekolahPage() {
  const { user } = useOutletContext()
  const { isSuperAdmin } = useIsAdmin(user)

  if (!isSuperAdmin) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
        <p className="text-xs text-inkmuted">Bahagian ini khas untuk Admin Penuh.</p>
      </div>
    )
  }

  return <Isi user={user} />
}

function Medan({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-ink mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const kelasInput = 'w-full rounded-card border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand-red/30'

// mampatkan=false WAJIB utk gambar yg mesti kekal latar TELUS (lencana/logo
// PNG) - mampatan tukar ke JPEG (tiada sokongan alpha), latar telus jadi
// HITAM PEKAT bila ditukar (bug yg sama macam fail tandatangan digital -
// lihat nota dlm driveUpload.js). Pelan Kawasan/Kecemasan (gambar/peta
// biasa, tiada keperluan telus) kekal dimampatkan spy muat naik laju.
function GambarUpload({ label, url, subfolder, onNaik, mampatkan = true }) {
  const { amaran } = useDialog()
  const [memuat, setMemuat] = useState(false)

  async function pilih(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setMemuat(true)
    try {
      const hasil = await muatNaikKeDrive(fail, subfolder, { mampatkan })
      await onNaik(hasil.url)
    } catch (err) {
      await amaran(err.message || 'Gagal muat naik.')
    } finally {
      setMemuat(false)
      e.target.value = ''
    }
  }

  return (
    <Medan label={label}>
      <div className="h-32 rounded-card bg-base border border-border overflow-hidden flex items-center justify-center mb-2">
        {url ? <img src={url} alt="" className="h-full object-contain" /> : <span className="text-[10px] text-inkmuted">Tiada gambar</span>}
      </div>
      <label className="flex items-center justify-center gap-1.5 h-9 w-fit px-4 rounded-card border border-border text-xs font-medium text-ink cursor-pointer hover:bg-base">
        {memuat ? 'Memuat naik…' : (<><Upload size={13} /> Muat Naik Gambar</>)}
        <input type="file" accept="image/*" onChange={pilih} className="hidden" disabled={memuat} />
      </label>
    </Medan>
  )
}

// Editor senarai teks ringkas (objektif dll) - tambah/buang/edit baris.
function SenaraiTeks({ label, senarai, onTukar }) {
  return (
    <Medan label={label}>
      <div className="space-y-2">
        {senarai.map((butir, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={kelasInput}
              value={butir}
              onChange={(e) => onTukar(senarai.map((b, j) => (j === i ? e.target.value : b)))}
            />
            <button type="button" onClick={() => onTukar(senarai.filter((_, j) => j !== i))} className="shrink-0 h-9 w-9 rounded-card border border-border text-inkmuted hover:bg-base flex items-center justify-center">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onTukar([...senarai, ''])} className="flex items-center gap-1.5 text-xs font-semibold text-brand-red">
          <Plus size={14} /> Tambah Baris
        </button>
      </div>
    </Medan>
  )
}

function Isi({ user }) {
  const { data, loading, muatSemula } = useProfilSekolahAwam()
  const { amaran, makluman } = useDialog()
  const [draf, setDraf] = useState(data)
  const [menyimpan, setMenyimpan] = useState(false)

  useEffect(() => { setDraf(data) }, [data])

  function set(medan, nilai) {
    setDraf((d) => ({ ...d, [medan]: nilai }))
  }

  async function simpanGambar(medan, url) {
    await simpanProfilSekolahAwam({ [medan]: url }, user.uid)
    muatSemula()
  }

  async function simpanTeks() {
    setMenyimpan(true)
    try {
      await simpanProfilSekolahAwam(draf, user.uid)
      await makluman?.('Berjaya disimpan.') ?? null
      muatSemula()
    } catch (err) {
      await amaran(err.message || 'Gagal simpan.')
    } finally {
      setMenyimpan(false)
    }
  }

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  return (
    // SATU bekas lebar tetap (max-w-3xl, ditengahkan) utk SEMUA elemen -
    // tajuk, input, kotak gambar, jadual, senarai - supaya semuanya sama
    // tepi kiri/kanan, tak berselerak (bug sebelum ni: kelasInput dihadkan
    // max-w-2xl tapi GambarUpload/jadual/senarai tiada had lebar langsung,
    // jadi nampak tak selaras - input sempit sebelah kotak gambar penuh
    // lebar). Bekas ini juga elak ruang KOSONG BESAR di kanan pada skrin
    // sangat lebar (bug asal) sambil kekal cukup lebar utk dibaca selesa.
    <div className="max-w-3xl mx-auto">
      <p className="text-xs text-inkmuted mb-5">
        Kandungan di sini dipaparkan pada halaman awam <strong>Maklumat Sekolah → Profil Sekolah</strong> (boleh dilihat sesiapa sahaja, tanpa log masuk).
      </p>

      <h2 className="text-sm font-bold text-ink mb-3 mt-2">Sejarah &amp; Lokasi</h2>
      <Medan label="Sejarah Penubuhan">
        <textarea rows={6} className={kelasInput} value={draf.sejarahPenubuhan} onChange={(e) => set('sejarahPenubuhan', e.target.value)} />
      </Medan>
      <Medan label="URL Embed Google Maps (Google Maps → Kongsi → Benamkan peta → salin src iframe)">
        <input className={kelasInput} value={draf.lokasiMapEmbedUrl} onChange={(e) => set('lokasiMapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
      </Medan>

      <h2 className="text-sm font-bold text-ink mb-3 mt-6">Pelan &amp; Lencana</h2>
      <GambarUpload label="Pelan Kawasan Sekolah" url={draf.pelanKawasanUrl} subfolder="profilSekolah" onNaik={(url) => simpanGambar('pelanKawasanUrl', url)} />
      <GambarUpload label="Pelan Laluan Kecemasan Sekolah" url={draf.pelanKecemasanUrl} subfolder="profilSekolah" onNaik={(url) => simpanGambar('pelanKecemasanUrl', url)} />
      <GambarUpload label="Lencana Sekolah (PNG latar telus disyorkan)" url={draf.lencanaUrl} subfolder="profilSekolah" mampatkan={false} onNaik={(url) => simpanGambar('lencanaUrl', url)} />
      <Medan label="Pereka / Pencipta Lencana">
        <input className={kelasInput} value={draf.penciptaLencana} onChange={(e) => set('penciptaLencana', e.target.value)} />
      </Medan>
      <Medan label="Penerangan Lencana (warna/simbol & maksudnya)">
        <div className="space-y-2">
          {draf.peneranganLencana.map((baris, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${kelasInput} w-28 shrink-0`} placeholder="Simbol/Warna" value={baris.label} onChange={(e) => set('peneranganLencana', draf.peneranganLencana.map((b, j) => (j === i ? { ...b, label: e.target.value } : b)))} />
              <input className={kelasInput} placeholder="Maksud" value={baris.keterangan} onChange={(e) => set('peneranganLencana', draf.peneranganLencana.map((b, j) => (j === i ? { ...b, keterangan: e.target.value } : b)))} />
              <button type="button" onClick={() => set('peneranganLencana', draf.peneranganLencana.filter((_, j) => j !== i))} className="shrink-0 h-9 w-9 rounded-card border border-border text-inkmuted hover:bg-base flex items-center justify-center">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('peneranganLencana', [...draf.peneranganLencana, { label: '', keterangan: '' }])} className="flex items-center gap-1.5 text-xs font-semibold text-brand-red">
            <Plus size={14} /> Tambah Baris
          </button>
        </div>
      </Medan>

      <h2 className="text-sm font-bold text-ink mb-3 mt-6">Lagu Sekolah</h2>
      <Medan label="Judul Lagu">
        <input className={kelasInput} value={draf.laguJudul} onChange={(e) => set('laguJudul', e.target.value)} />
      </Medan>
      <Medan label="Lirik">
        <textarea rows={8} className={kelasInput} value={draf.laguLirik} onChange={(e) => set('laguLirik', e.target.value)} />
      </Medan>
      <Medan label="Pautan Video YouTube">
        <input className={kelasInput} value={draf.laguVideoUrl} onChange={(e) => set('laguVideoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
      </Medan>

      <h2 className="text-sm font-bold text-ink mb-3 mt-6">Visi/Misi/Falsafah</h2>
      <Medan label="Misi KPM"><textarea rows={3} className={kelasInput} value={draf.misiKPM} onChange={(e) => set('misiKPM', e.target.value)} /></Medan>
      <Medan label="Visi KPM"><textarea rows={2} className={kelasInput} value={draf.visiKPM} onChange={(e) => set('visiKPM', e.target.value)} /></Medan>
      <Medan label="Falsafah Pendidikan Kebangsaan"><textarea rows={4} className={kelasInput} value={draf.falsafahKebangsaan} onChange={(e) => set('falsafahKebangsaan', e.target.value)} /></Medan>
      <Medan label="Falsafah Pendidikan Islam"><textarea rows={4} className={kelasInput} value={draf.falsafahIslam} onChange={(e) => set('falsafahIslam', e.target.value)} /></Medan>
      <Medan label="Falsafah Pendidikan Khas"><textarea rows={3} className={kelasInput} value={draf.falsafahKhas} onChange={(e) => set('falsafahKhas', e.target.value)} /></Medan>
      <Medan label="Visi Pendidikan Khas"><textarea rows={2} className={kelasInput} value={draf.visiKhas} onChange={(e) => set('visiKhas', e.target.value)} /></Medan>
      <Medan label="Misi Pendidikan Khas"><textarea rows={3} className={kelasInput} value={draf.misiKhas} onChange={(e) => set('misiKhas', e.target.value)} /></Medan>

      <h2 className="text-sm font-bold text-ink mb-3 mt-6">Objektif</h2>
      <SenaraiTeks label="Objektif Pendidikan Khas" senarai={draf.objektifKhas} onTukar={(s) => set('objektifKhas', s)} />
      <SenaraiTeks label="Objektif Sekolah" senarai={draf.objektifSekolah} onTukar={(s) => set('objektifSekolah', s)} />

      <button
        onClick={simpanTeks}
        disabled={menyimpan}
        className="mt-4 h-11 px-6 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
      >
        {menyimpan ? 'Menyimpan…' : 'Simpan'}
      </button>
    </div>
  )
}
