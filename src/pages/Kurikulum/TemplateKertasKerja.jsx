import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Pencil, Trash2, Printer, Image as ImageIcon, Save } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useCetak } from '../../hooks/useCetak.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { useKertasKerja, tambahKertasKerja, kemaskiniKertasKerja, padamKertasKerja } from '../../hooks/useKertasKerja.js'
import { useMukaDepanTahunan, dapatkanMukaDepanTahunan } from '../../hooks/useMukaDepanTahunan.js'
import KertasKerjaModal from './KertasKerjaModal.jsx'
import KertasKerjaIsiForm from './KertasKerjaIsiForm.jsx'
import MukaDepanTahunanModal from './MukaDepanTahunanModal.jsx'
import CetakMukaDepan from './CetakMukaDepan.jsx'
import CetakKertasKerjaPenuh from './CetakKertasKerjaPenuh.jsx'

const TAHUN_SEKARANG = String(new Date().getFullYear())

export default function TemplateKertasKerja() {
  const [tab, setTab] = useState('mukaDepan') // 'mukaDepan' | 'kandungan'
  const { senarai, loading, muatSemula } = useKertasKerja()

  return (
    <div>
      <div className="flex gap-1 bg-base rounded-full p-1 w-fit mb-5 overflow-x-auto max-w-full">
        <button
          onClick={() => setTab('mukaDepan')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${tab === 'mukaDepan' ? 'bg-brand-red text-white' : 'text-inkmuted hover:text-ink'}`}
        >
          Muka Depan
        </button>
        <button
          onClick={() => setTab('kandungan')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${tab === 'kandungan' ? 'bg-brand-red text-white' : 'text-inkmuted hover:text-ink'}`}
        >
          Isi Kandungan
        </button>
      </div>

      {tab === 'mukaDepan' && <TabMukaDepan senarai={senarai} loading={loading} muatSemula={muatSemula} />}
      {tab === 'kandungan' && <TabIsiKandungan senarai={senarai} loading={loading} muatSemula={muatSemula} />}
    </div>
  )
}

function TabMukaDepan({ senarai, loading, muatSemula }) {
  const { user } = useOutletContext()
  const { konfirm } = useDialog()
  const [dataCetak, setDataCetak] = useCetak()

  const [tahunAktif, setTahunAktif] = useState(TAHUN_SEKARANG)
  const { muka: mukaTahunAktif, loading: loadingMuka, muatSemula: muatSemulaMuka } = useMukaDepanTahunan(tahunAktif)

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [tunjukMukaDepan, setTunjukMukaDepan] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)

  // Peta gambar semua tahun yang MUNCUL dalam senarai kertas kerja (bukan
  // cuma tahunAktif) - perlukan ni sebab "Cetak Semua" boleh merentasi > 1
  // tahun sekaligus, setiap satu kena gambar tahun MASING-MASING.
  const tahunUnik = [...new Set(senarai.map((r) => r.tahun))]
  const [mukaByTahun, setMukaByTahun] = useState({})

  async function sediakanCetakSemua() {
    const peta = {}
    for (const t of tahunUnik) {
      peta[t] = await dapatkanMukaDepanTahunan(t)
    }
    setMukaByTahun(peta)
    setDataCetak(senarai)
  }

  function bukaTambah() {
    setRekodEdit(null)
    setTunjukBorang(true)
  }

  function bukaEdit(rekod) {
    setRekodEdit(rekod)
    setTunjukBorang(true)
  }

  async function simpan(data) {
    if (rekodEdit) {
      await kemaskiniKertasKerja(rekodEdit.id, data, user.uid)
    } else {
      await tambahKertasKerja(data, user.uid)
    }
    setTunjukBorang(false)
    setRekodEdit(null)
    muatSemula()
  }

  async function padam(id) {
    if (!(await konfirm('Padam kertas kerja ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamKertasKerja(id)
    muatSemula()
  }

  async function cetakSatu(rekod) {
    const muka = await dapatkanMukaDepanTahunan(rekod.tahun)
    setMukaByTahun({ [rekod.tahun]: muka })
    setDataCetak([rekod])
  }

  return (
    <div>
      {/* Setting gambar muka depan tahunan */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-card border border-border bg-surface mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-14 w-10 rounded-card bg-base border border-border overflow-hidden shrink-0 flex items-center justify-center">
            {loadingMuka ? null : mukaTahunAktif?.gambarUrl ? (
              <img src={mukaTahunAktif.gambarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={16} className="text-inkmuted" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Gambar Muka Depan Tahunan</p>
            <p className="text-xs text-inkmuted mt-0.5">
              {loadingMuka ? 'Memuatkan…' : mukaTahunAktif?.gambarUrl ? `Reka bentuk tahun ${tahunAktif} sedia ada.` : `Belum ada gambar untuk tahun ${tahunAktif}.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tahunAktif}
            onChange={(e) => setTahunAktif(e.target.value)}
            className="h-10 w-20 px-2 rounded-card border border-border bg-base text-sm text-center"
          />
          <button
            onClick={() => setTunjukMukaDepan(true)}
            className="h-10 px-4 rounded-card border border-border text-xs font-semibold text-ink"
          >
            {mukaTahunAktif?.gambarUrl ? 'Tukar Gambar' : 'Muat Naik'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-inkmuted">{senarai.length} kertas kerja</p>
        <div className="flex items-center gap-2">
          {senarai.length > 0 && (
            <button onClick={sediakanCetakSemua} className="flex items-center gap-1.5 h-11 px-4 rounded-card border border-border text-xs font-semibold text-ink">
              <Printer size={14} /> Cetak Semua
            </button>
          )}
          <button onClick={bukaTambah} className="flex items-center gap-1.5 h-11 px-4 rounded-card bg-brand-red text-white text-xs font-semibold">
            <Plus size={14} /> Kertas Kerja Baharu
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada kertas kerja lagi.</p>
      ) : (
        <div className="space-y-2">
          {senarai.map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-4 rounded-card border border-border bg-surface">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{r.tajuk}</p>
                <p className="text-xs text-inkmuted mt-0.5">{r.anjuran} · {r.tahun}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => cetakSatu(r)} aria-label="Cetak" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                  <Printer size={15} />
                </button>
                <button onClick={() => bukaEdit(r)} aria-label="Edit" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
                  <Pencil size={15} />
                </button>
                <button onClick={() => padam(r.id)} aria-label="Padam" className="p-1.5 rounded-card hover:bg-base text-brand-red">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <KertasKerjaModal
        open={tunjukBorang}
        rekod={rekodEdit}
        onClose={() => { setTunjukBorang(false); setRekodEdit(null) }}
        onSimpan={simpan}
      />

      <MukaDepanTahunanModal
        open={tunjukMukaDepan}
        tahun={tahunAktif}
        mukaSediaAda={mukaTahunAktif}
        user={user}
        onClose={() => setTunjukMukaDepan(false)}
        onSelesai={muatSemulaMuka}
      />

      {dataCetak && <CetakMukaDepan senarai={dataCetak} mukaByTahun={mukaByTahun} />}
    </div>
  )
}

function TabIsiKandungan({ senarai, loading, muatSemula }) {
  const { user } = useOutletContext()
  const { profiles } = useProfilesList()
  const senaraiStaff = profiles.filter((p) => p.status !== 'menunggu')
  const [dataCetak, setDataCetak] = useCetak()
  const [gambarCetak, setGambarCetak] = useState(null)

  const [rekodDipilihId, setRekodDipilihId] = useState(null)
  const [borang, setBorang] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const [ralat, setRalat] = useState(null)
  const [berjaya, setBerjaya] = useState(false)

  function pilihRekod(id) {
    const rekod = senarai.find((r) => r.id === id)
    setRekodDipilihId(id)
    setBorang(rekod ? { ...rekod } : null)
    setBerjaya(false)
    setRalat(null)
  }

  async function simpan() {
    setRalat(null)
    setBerjaya(false)
    setMenyimpan(true)
    try {
      const { id, ...data } = borang
      await kemaskiniKertasKerja(id, data, user.uid)
      setBerjaya(true)
      muatSemula()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan. Sila cuba lagi.')
    } finally {
      setMenyimpan(false)
    }
  }

  async function cetakPenuh() {
    const muka = await dapatkanMukaDepanTahunan(borang.tahun)
    setGambarCetak(muka?.gambarUrl ?? null)
    setDataCetak(borang)
  }

  if (senarai.length === 0 && !loading) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm text-inkmuted">Tiada kertas kerja lagi. Cipta satu dulu di tab "Muka Depan" (Tajuk + Anjuran), kemudian sambung isi kandungan di sini.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <label htmlFor="pilihKK" className="block text-sm font-medium text-ink mb-1">Pilih Kertas Kerja</label>
        <select
          id="pilihKK"
          value={rekodDipilihId ?? ''}
          onChange={(e) => pilihRekod(e.target.value || null)}
          className="w-full sm:max-w-md h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          <option value="">— Pilih —</option>
          {senarai.map((r) => (
            <option key={r.id} value={r.id}>{r.tajuk} ({r.tahun})</option>
          ))}
        </select>
      </div>

      {borang && (
        <div className="bg-surface border border-border rounded-card p-5 sm:p-6">
          <KertasKerjaIsiForm data={borang} onUbah={setBorang} senaraiStaff={senaraiStaff} />

          {ralat && <p className="text-sm text-brand-red mt-4">{ralat}</p>}
          {berjaya && <p className="text-sm mt-4" style={{ color: '#27500A' }}>Berjaya disimpan.</p>}

          <div className="flex gap-3 mt-6 pt-5 border-t border-border">
            <button
              onClick={simpan}
              disabled={menyimpan}
              className="flex items-center justify-center gap-1.5 flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
            >
              <Save size={16} /> {menyimpan ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              onClick={cetakPenuh}
              className="flex items-center justify-center gap-1.5 h-12 px-5 rounded-card border border-border text-sm font-medium text-ink"
            >
              <Printer size={16} /> Cetak Penuh
            </button>
          </div>
        </div>
      )}

      {dataCetak && <CetakKertasKerjaPenuh rekod={dataCetak} gambarMukaDepan={gambarCetak} />}
    </div>
  )
}
