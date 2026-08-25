import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Settings } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfile } from '../../hooks/useProfile.js'
import { useTakwimUnit } from '../../hooks/useTakwimUnit.js'
import { useTakwimAcara, tambahTakwimAcara, kemaskiniTakwimAcara, padamTakwimAcara } from '../../hooks/useTakwimAcara.js'
import KalendarGrid from './KalendarGrid.jsx'
import PaparanHari from './PaparanHari.jsx'
import PaparanMinggu from './PaparanMinggu.jsx'
import PaparanJadual from './PaparanJadual.jsx'
import TakwimAcaraModal from './TakwimAcaraModal.jsx'
import UrusUnitTakwimModal from './UrusUnitTakwimModal.jsx'

const KINI = new Date()
const HARI_INI_ISO = KINI.toISOString().slice(0, 10)

const MOD_PAPARAN = [
  { kunci: 'hari', label: 'Hari' },
  { kunci: 'minggu', label: 'Minggu' },
  { kunci: 'bulan', label: 'Bulan' },
  { kunci: 'jadual', label: 'Jadual' },
]

export default function TakwimSekolah() {
  const { user } = useOutletContext()
  const { profile } = useProfile(user)
  const { isSuperAdmin } = useIsAdmin(user)
  const { konfirm } = useDialog()

  const { senarai: senaraiUnit, loading: loadingUnit, muatSemula: muatSemulaUnit } = useTakwimUnit()
  const { senarai: senaraiAcara, loading: loadingAcara, muatSemula: muatSemulaAcara } = useTakwimAcara()

  const [mod, setMod] = useState('bulan')
  const [tahun, setTahun] = useState(KINI.getFullYear())
  const [bulan, setBulan] = useState(KINI.getMonth())
  const [tarikhAsas, setTarikhAsas] = useState(HARI_INI_ISO) // untuk paparan Hari/Minggu
  const [unitAktif, setUnitAktif] = useState(new Set())
  const [unitAktifDisediakan, setUnitAktifDisediakan] = useState(false)

  // Sekali sahaja bila senaraiUnit siap dimuat - aktifkan SEMUA unit lalai
  // (paparan penuh dari mula, staff toggle buang kalau nak tapis).
  if (!unitAktifDisediakan && senaraiUnit.length > 0) {
    setUnitAktif(new Set(senaraiUnit.map((u) => u.id)))
    setUnitAktifDisediakan(true)
  }

  const [tunjukAcaraModal, setTunjukAcaraModal] = useState(false)
  const [acaraEdit, setAcaraEdit] = useState(null)
  const [tarikhAwalBaru, setTarikhAwalBaru] = useState(null)
  const [tunjukUnitModal, setTunjukUnitModal] = useState(false)

  function tukarBulan(delta) {
    let b = bulan + delta
    let t = tahun
    if (b < 0) { b = 11; t -= 1 }
    else if (b > 11) { b = 0; t += 1 }
    setBulan(b)
    setTahun(t)
  }

  function togolUnit(id) {
    setUnitAktif((s) => {
      const baru = new Set(s)
      if (baru.has(id)) baru.delete(id)
      else baru.add(id)
      return baru
    })
  }

  function bukaTambah(tarikhIso) {
    setAcaraEdit(null)
    setTarikhAwalBaru(tarikhIso ?? null)
    setTunjukAcaraModal(true)
  }

  function bukaEdit(acara) {
    setAcaraEdit(acara)
    setTarikhAwalBaru(null)
    setTunjukAcaraModal(true)
  }

  async function simpanAcara(data) {
    if (acaraEdit) {
      await kemaskiniTakwimAcara(acaraEdit.id, data, user.uid)
    } else {
      await tambahTakwimAcara(data, user.uid, profile?.nama ?? user.displayName ?? '')
    }
    setTunjukAcaraModal(false)
    setAcaraEdit(null)
    muatSemulaAcara()
  }

  async function padamAcara() {
    if (!(await konfirm('Padam acara ini? Tindakan ini tidak boleh dibatalkan.', { bahaya: true }))) return
    await padamTakwimAcara(acaraEdit.id)
    setTunjukAcaraModal(false)
    setAcaraEdit(null)
    muatSemulaAcara()
  }

  if (loadingUnit || loadingAcara) {
    return <p className="text-sm text-inkmuted">Memuatkan…</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {senaraiUnit.map((u) => (
            <button
              key={u.id}
              onClick={() => togolUnit(u.id)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-full border text-[11px] font-medium transition-opacity"
              style={{
                borderColor: u.warna,
                backgroundColor: unitAktif.has(u.id) ? u.warna : 'transparent',
                color: unitAktif.has(u.id) ? '#fff' : u.warna,
              }}
            >
              {u.namaUnit}
            </button>
          ))}
          {isSuperAdmin && (
            <button onClick={() => setTunjukUnitModal(true)} aria-label="Urus Unit" className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-inkmuted">
              <Settings size={13} />
            </button>
          )}
        </div>
        <button onClick={() => bukaTambah()} className="flex items-center gap-1.5 h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold shrink-0">
          <Plus size={14} /> Tambah Acara
        </button>
      </div>

      <div className="flex gap-1 bg-base rounded-full p-1 w-fit mb-4 overflow-x-auto max-w-full">
        {MOD_PAPARAN.map((m) => (
          <button
            key={m.kunci}
            onClick={() => setMod(m.kunci)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${mod === m.kunci ? 'bg-brand-red text-white' : 'text-inkmuted hover:text-ink'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mod === 'hari' && (
        <PaparanHari
          tarikh={tarikhAsas}
          senaraiAcara={senaraiAcara}
          unitAktif={unitAktif}
          onTukarTarikh={setTarikhAsas}
          onKlikTarikh={bukaTambah}
          onKlikAcara={bukaEdit}
        />
      )}
      {mod === 'minggu' && (
        <PaparanMinggu
          tarikhAsas={tarikhAsas}
          senaraiAcara={senaraiAcara}
          unitAktif={unitAktif}
          onTukarTarikh={setTarikhAsas}
          onKlikTarikh={bukaTambah}
          onKlikAcara={bukaEdit}
        />
      )}
      {mod === 'bulan' && (
        <KalendarGrid
          tahun={tahun}
          bulan={bulan}
          senaraiAcara={senaraiAcara}
          unitAktif={unitAktif}
          onTukarBulan={tukarBulan}
          onKlikTarikh={bukaTambah}
          onKlikAcara={bukaEdit}
        />
      )}
      {mod === 'jadual' && (
        <PaparanJadual
          tahun={tahun}
          bulan={bulan}
          senaraiAcara={senaraiAcara}
          senaraiUnit={senaraiUnit}
          unitAktif={unitAktif}
          onTukarBulan={tukarBulan}
          onKlikTarikh={bukaTambah}
          onKlikAcara={bukaEdit}
        />
      )}

      <TakwimAcaraModal
        open={tunjukAcaraModal}
        acara={acaraEdit}
        tarikhAwal={tarikhAwalBaru}
        senaraiUnit={senaraiUnit}
        onClose={() => { setTunjukAcaraModal(false); setAcaraEdit(null) }}
        onSimpan={simpanAcara}
        onPadam={acaraEdit ? padamAcara : null}
      />

      <UrusUnitTakwimModal
        open={tunjukUnitModal}
        senarai={senaraiUnit}
        user={user}
        onClose={() => setTunjukUnitModal(false)}
        onSelesai={muatSemulaUnit}
      />
    </div>
  )
}
