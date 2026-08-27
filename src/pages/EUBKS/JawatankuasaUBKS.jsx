import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronDown, Users, Save, Eye, X } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useUnitUBKSTahun, kemaskiniUnit } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import ProfilMuridUBKSModal from './ProfilMuridUBKSModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

const CADANGAN_JAWATAN = ['Ketua', 'Naib Ketua', 'Setiausaha', 'Penolong Setiausaha', 'Bendahari', 'AJK']

// Aras carta organisasi - PILIHAN TETAP admin tetapkan terus (bukan
// teka dari teks jawatan bebas - sama corak dengan medan "Jenis" pada
// Kategori UBKS. Nama jawatan setiap unit lain-lain (Pengerusi/Ketua,
// Setiausaha 1/2, dll), tak boleh dipercayai kalau sistem cuba teka
// aras daripada perkataan dalam teks tu sahaja).
const ARAS_CARTA = [
  { nilai: 1, label: 'Aras 1 - Ketua/Pengerusi' },
  { nilai: 2, label: 'Aras 2 - Naib Ketua/Timbalan' },
  { nilai: 3, label: 'Aras 3 - Setiausaha/Bendahari' },
  { nilai: 4, label: 'Aras 4 - AJK' },
  { nilai: 5, label: 'Aras 5 - Ahli Biasa' },
]
const LABEL_ARAS_RINGKAS = { 1: 'Ketua', 2: 'Naib Ketua', 3: 'Setiausaha & Bendahari', 4: 'AJK' }

function arasAhli(a) {
  if (a.aras) return a.aras
  return a.jawatan?.trim() ? 4 : 5 // lalai munasabah untuk data lama (belum pernah tetapkan aras)
}

function NodAhli({ ahli, onKlik }) {
  const inisial = (ahli.nama ?? '?').trim().charAt(0).toUpperCase()
  return (
    <button onClick={() => onKlik(ahli)} className="flex flex-col items-center gap-1.5 w-24">
      <div className="h-11 w-11 rounded-full bg-base border-2 border-border flex items-center justify-center text-sm font-semibold text-inkmuted">
        {inisial}
      </div>
      <span className="text-[11px] text-ink text-center leading-tight line-clamp-2">{ahli.nama}</span>
      {ahli.jawatan?.trim() && <span className="text-[9px] text-brand-red text-center leading-tight">{ahli.jawatan}</span>}
    </button>
  )
}

function CartaOrganisasi({ ahli, onKlikAhli }) {
  const peringkat = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  ahli.forEach((a) => peringkat[arasAhli(a)].push(a))
  const adaJawatan = peringkat[1].length + peringkat[2].length + peringkat[3].length + peringkat[4].length > 0

  if (!adaJawatan) {
    return <p className="text-xs text-inkmuted text-center py-6">Belum ada jawatankuasa dilantik untuk unit ni lagi.</p>
  }

  return (
    <div className="py-4 overflow-x-auto">
      <div className="flex flex-col items-center gap-1 min-w-fit px-2">
        {[1, 2, 3, 4].map((aras) => {
          const kumpulan = peringkat[aras]
          if (kumpulan.length === 0) return null
          return (
            <div key={aras} className="flex flex-col items-center">
              {aras > 1 && <div className="h-5 w-px bg-border" />}
              <p className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide mb-2">{LABEL_ARAS_RINGKAS[aras]}</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 mb-1">
                {kumpulan.map((a) => (
                  <NodAhli key={a.idMurid} ahli={a} onKlik={onKlikAhli} />
                ))}
              </div>
            </div>
          )
        })}
        {peringkat[5].length > 0 && (
          <>
            <div className="h-5 w-px bg-border" />
            <p className="text-[11px] text-inkmuted">+ {peringkat[5].length} ahli biasa (tiada jawatan)</p>
          </>
        )}
      </div>
    </div>
  )
}

// Carta organisasi PENUH SATU SKRIN - dibuka dari ikon mata pada papan
// unit (bukan bersama accordion senarai ringkas lagi).
function CartaPenuhModal({ unit, kategoriSenarai, onClose, onKlikAhli }) {
  if (!unit) return null
  function labelKategori(kod) {
    return kategoriSenarai.find((k) => k.kod === kod)?.nama ?? kod
  }
  return (
    <div className="fixed inset-0 z-50 bg-surface overflow-y-auto">
      <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between z-10">
        <div>
          <p className="text-sm font-bold text-ink">{unit.namaUnit}</p>
          <p className="text-xs text-inkmuted">{labelKategori(unit.kategoriUnit)} · Tahun {unit.tahunSesi} · Carta Organisasi</p>
        </div>
        <button onClick={onClose} aria-label="Tutup" className="p-2 rounded-card hover:bg-base text-inkmuted">
          <X size={20} />
        </button>
      </div>
      <div className="max-w-3xl mx-auto p-4">
        <CartaOrganisasi ahli={unit.ahli ?? []} onKlikAhli={onKlikAhli} />
      </div>
    </div>
  )
}

// Sub-page Jawatankuasa UBKS - tekan BARIS unit = "slide down" senarai
// ringkas (nama + jawatan, boleh edit terus untuk admin). Tekan ikon MATA
// = buka carta organisasi PENUH satu skrin (paparan visual sahaja, tak
// boleh edit terus - tutup & guna senarai ringkas untuk edit).
export default function JawatankuasaUBKS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const isAdmin = adaSeksyen('ubks')
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading, muatSemula } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()

  const [unitDibuka, setUnitDibuka] = useState(null)
  const [unitCartaPenuh, setUnitCartaPenuh] = useState(null)
  const [draf, setDraf] = useState({}) // { [unitId]: { [idMurid]: {jawatan, aras} } }
  const [menyimpan, setMenyimpan] = useState(null)
  const [profilDibuka, setProfilDibuka] = useState(null)

  function labelKategori(kod) {
    return kategoriSenarai.find((k) => k.kod === kod)?.nama ?? kod
  }

  function ubahDraf(unitId, idMurid, medan, nilai) {
    setDraf((d) => {
      const unitDraf = d[unitId] ?? {}
      const ahliDraf = unitDraf[idMurid] ?? {}
      return { ...d, [unitId]: { ...unitDraf, [idMurid]: { ...ahliDraf, [medan]: nilai } } }
    })
  }

  function nilaiSemasa(unit, idMurid, medan, lalai) {
    const d = draf[unit.id]?.[idMurid]?.[medan]
    if (d !== undefined) return d
    const a = unit.ahli.find((x) => x.idMurid === idMurid)
    return a?.[medan] ?? lalai
  }

  async function simpanUnit(unit) {
    const perubahan = draf[unit.id]
    if (!perubahan) return
    setMenyimpan(unit.id)
    try {
      const ahliBaru = unit.ahli.map((a) => {
        const p = perubahan[a.idMurid]
        if (!p) return a
        return {
          ...a,
          jawatan: (p.jawatan ?? a.jawatan ?? '').trim(),
          aras: p.aras ?? arasAhli(a),
        }
      })
      await kemaskiniUnit(unit.id, { ahli: ahliBaru }, user.uid)
      setDraf((d) => { const s = { ...d }; delete s[unit.id]; return s })
      muatSemula()
    } finally {
      setMenyimpan(null)
    }
  }

  return (
    <div>
      <div className="max-w-[140px] mb-5">
        <label htmlFor="tahunSesi" className="block text-xs font-medium text-ink mb-1">Tahun</label>
        <select
          id="tahunSesi"
          value={tahunSesi}
          onChange={(e) => { setTahunSesi(Number(e.target.value)); setUnitDibuka(null); setDraf({}) }}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
        >
          {PILIHAN_TAHUN.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {!isAdmin && (
        <p className="text-xs text-inkmuted mb-4">Awak boleh lihat jawatankuasa sedia ada. Hanya admin UBKS boleh lantik/tukar jawatan.</p>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : unitSenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada unit untuk tahun {tahunSesi} lagi.</p>
      ) : (
        <div className="space-y-2.5">
          {unitSenarai.map((unit) => {
            const dibuka = unitDibuka === unit.id
            const bilanganJawatan = unit.ahli.filter((a) => a.jawatan?.trim()).length
            const adaDraf = Boolean(draf[unit.id] && Object.keys(draf[unit.id]).length > 0)
            return (
              <div key={unit.id} className="border border-border rounded-card overflow-hidden">
                <div className="w-full flex items-center gap-2 p-3.5">
                  <button onClick={() => setUnitDibuka(dibuka ? null : unit.id)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <Users size={16} className="text-inkmuted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{unit.namaUnit}</p>
                      <p className="text-xs text-inkmuted">{labelKategori(unit.kategoriUnit)} · {unit.ahli.length} ahli · {bilanganJawatan} jawatankuasa dilantik</p>
                    </div>
                  </button>
                  <button onClick={() => setUnitCartaPenuh(unit)} aria-label="Lihat carta organisasi penuh" title="Carta organisasi penuh" className="p-2 rounded-card hover:bg-base text-inkmuted shrink-0">
                    <Eye size={17} />
                  </button>
                  <button onClick={() => setUnitDibuka(dibuka ? null : unit.id)} aria-label={dibuka ? 'Tutup' : 'Buka senarai'} className="p-2 rounded-card hover:bg-base text-inkmuted shrink-0">
                    <ChevronDown size={16} className={`transition-transform ${dibuka ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {dibuka && (
                  <div className="border-t border-border p-3.5">
                    {unit.ahli.length === 0 ? (
                      <p className="text-xs text-inkmuted">Tiada ahli dalam unit ni lagi.</p>
                    ) : (
                      <>
                        {isAdmin && (
                          <p className="text-[11px] text-inkmuted mb-2">Biar kotak jawatan kosong untuk ahli biasa (automatik, tak perlu buat apa-apa). Isi jawatan → pilih Aras baru muncul.</p>
                        )}
                        <div className="space-y-2 mb-3">
                        {unit.ahli.map((a) => (
                          <div key={a.idMurid} className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setProfilDibuka({ idMurid: a.idMurid, nama: a.nama })}
                              className="text-sm text-ink flex-1 min-w-[100px] truncate text-left hover:text-brand-red hover:underline"
                            >
                              {a.nama}
                            </button>
                            {isAdmin ? (
                              <>
                                <input
                                  type="text"
                                  list="cadangan-jawatan-ubks"
                                  value={nilaiSemasa(unit, a.idMurid, 'jawatan', '')}
                                  onChange={(e) => ubahDraf(unit.id, a.idMurid, 'jawatan', e.target.value)}
                                  placeholder="Ahli biasa (tiada jawatan)"
                                  className="h-9 w-40 px-2.5 rounded-card border border-border bg-surface text-xs shrink-0"
                                />
                                {/* Aras cuma relevan kalau ada jawatan - ahli biasa (kotak jawatan
                                    kosong) TAK PERLU sentuh apa-apa, automatik Aras 5. */}
                                {nilaiSemasa(unit, a.idMurid, 'jawatan', '').trim() && (
                                  <select
                                    value={nilaiSemasa(unit, a.idMurid, 'aras', arasAhli(a) === 5 ? 4 : arasAhli(a))}
                                    onChange={(e) => ubahDraf(unit.id, a.idMurid, 'aras', Number(e.target.value))}
                                    className="h-9 px-2 rounded-card border border-border bg-surface text-[11px] shrink-0"
                                  >
                                    {ARAS_CARTA.filter((ar) => ar.nilai < 5).map((ar) => (
                                      <option key={ar.nilai} value={ar.nilai}>{ar.label}</option>
                                    ))}
                                  </select>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-inkmuted shrink-0">{a.jawatan?.trim() || 'Ahli biasa'}</span>
                            )}
                          </div>
                        ))}
                        </div>
                      </>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => simpanUnit(unit)}
                        disabled={!adaDraf || menyimpan === unit.id}
                        className="flex items-center gap-1.5 h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-40"
                      >
                        <Save size={14} /> {menyimpan === unit.id ? 'Menyimpan…' : 'Simpan Jawatankuasa'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <datalist id="cadangan-jawatan-ubks">
        {CADANGAN_JAWATAN.map((j) => (
          <option key={j} value={j} />
        ))}
      </datalist>

      <CartaPenuhModal
        unit={unitCartaPenuh}
        kategoriSenarai={kategoriSenarai}
        onClose={() => setUnitCartaPenuh(null)}
        onKlikAhli={(a) => setProfilDibuka({ idMurid: a.idMurid, nama: a.nama })}
      />

      <ProfilMuridUBKSModal
        open={Boolean(profilDibuka)}
        idMurid={profilDibuka?.idMurid}
        nama={profilDibuka?.nama}
        onClose={() => setProfilDibuka(null)}
      />
    </div>
  )
}
