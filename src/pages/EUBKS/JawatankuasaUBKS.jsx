import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronDown, Users, Save, Pencil } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useUnitUBKSTahun, kemaskiniUnit } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import ProfilMuridUBKSModal from './ProfilMuridUBKSModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

// Jawatan lazim - cadangan sahaja, admin boleh taip jawatan lain (medan
// teks bebas, bukan dikunci kepada senarai ni).
const CADANGAN_JAWATAN = ['Ketua', 'Naib Ketua', 'Setiausaha', 'Penolong Setiausaha', 'Bendahari', 'AJK']

// Susun ahli jadi 5 peringkat carta organisasi (padan kata kunci pada
// teks jawatan bebas - bukan senarai tetap, supaya jawatan apa-apa pun
// admin taip masih terkumpul secara munasabah). Peringkat lebih tinggi =
// lebih atas dalam carta.
function peringkatJawatan(jawatan) {
  const j = (jawatan ?? '').toLowerCase().trim()
  if (!j) return 4 // ahli biasa
  if (j.includes('naib') || j.includes('timbalan')) return 1
  if (j.includes('ketua') || j.includes('pengerusi')) return 0
  if (j.includes('setiausaha') || j.includes('bendahari')) return 2
  return 3 // AJK/jawatan lain
}

const LABEL_PERINGKAT = ['Ketua', 'Naib Ketua', 'Setiausaha & Bendahari', 'AJK & Jawatan Lain', 'Ahli Biasa']

function NodAhli({ ahli, onKlik }) {
  const inisial = (ahli.nama ?? '?').trim().charAt(0).toUpperCase()
  return (
    <button onClick={() => onKlik(ahli)} className="flex flex-col items-center gap-1.5 w-24 group">
      <div className="h-11 w-11 rounded-full bg-base border-2 border-border group-hover:border-brand-red flex items-center justify-center text-sm font-semibold text-inkmuted transition-colors">
        {inisial}
      </div>
      <span className="text-[11px] text-ink text-center leading-tight line-clamp-2">{ahli.nama}</span>
    </button>
  )
}

// Carta organisasi ringkas (bukan SVG - susunan CSS bertingkat) - Ketua di
// atas, turun ke Naib Ketua, Setiausaha/Bendahari, AJK, dan "Ahli Biasa"
// dipaparkan sebagai satu kiraan sahaja (elak carta jadi terlalu panjang
// kalau unit ada 20-30 ahli biasa tanpa jawatan).
function CartaOrganisasi({ ahli, onKlikAhli }) {
  const peringkat = [[], [], [], [], []]
  ahli.forEach((a) => peringkat[peringkatJawatan(a.jawatan)].push(a))
  const adaJawatan = peringkat[0].length + peringkat[1].length + peringkat[2].length + peringkat[3].length > 0

  if (!adaJawatan) {
    return <p className="text-xs text-inkmuted text-center py-6">Belum ada jawatankuasa dilantik untuk unit ni lagi.</p>
  }

  return (
    <div className="py-4 overflow-x-auto">
      <div className="flex flex-col items-center gap-1 min-w-fit px-2">
        {peringkat.slice(0, 4).map((kumpulan, i) => {
          if (kumpulan.length === 0) return null
          return (
            <div key={i} className="flex flex-col items-center">
              {i > 0 && <div className="h-5 w-px bg-border" />}
              <p className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide mb-2">{LABEL_PERINGKAT[i]}</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 mb-1">
                {kumpulan.map((a) => (
                  <NodAhli key={a.idMurid} ahli={a} onKlik={onKlikAhli} />
                ))}
              </div>
            </div>
          )
        })}
        {peringkat[4].length > 0 && (
          <>
            <div className="h-5 w-px bg-border" />
            <p className="text-[11px] text-inkmuted">+ {peringkat[4].length} ahli biasa (tiada jawatan)</p>
          </>
        )}
      </div>
    </div>
  )
}

// Sub-page BERASINGAN daripada "Murid UBKS" - fokus KHUSUS lantik
// jawatankuasa bagi ahli sesuatu unit, dipaparkan sebagai CARTA ORGANISASI
// (bukan senarai rata) supaya struktur (Ketua > Naib Ketua > Setiausaha/
// Bendahari > AJK > Ahli) senang dibaca sekali pandang. Edit jawatan
// kekal ada, disorok dalam suis "Edit" berasingan supaya carta kekal
// bersih untuk sekadar rujuk.
export default function JawatankuasaUBKS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const isAdmin = adaSeksyen('ubks')
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading, muatSemula } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()

  const [unitDibuka, setUnitDibuka] = useState(null)
  const [modEdit, setModEdit] = useState({}) // { [unitId]: bool }
  const [draf, setDraf] = useState({})
  const [menyimpan, setMenyimpan] = useState(null)
  const [profilDibuka, setProfilDibuka] = useState(null)

  function labelKategori(kod) {
    return kategoriSenarai.find((k) => k.kod === kod)?.nama ?? kod
  }

  function ubahJawatan(unitId, idMurid, nilai) {
    setDraf((d) => ({ ...d, [unitId]: { ...(d[unitId] ?? {}), [idMurid]: nilai } }))
  }

  function jawatanSemasa(unit, idMurid) {
    if (draf[unit.id]?.[idMurid] !== undefined) return draf[unit.id][idMurid]
    return unit.ahli.find((a) => a.idMurid === idMurid)?.jawatan ?? ''
  }

  async function simpanUnit(unit) {
    const perubahan = draf[unit.id]
    if (!perubahan) { setModEdit((m) => ({ ...m, [unit.id]: false })); return }
    setMenyimpan(unit.id)
    try {
      const ahliBaru = unit.ahli.map((a) =>
        perubahan[a.idMurid] !== undefined ? { ...a, jawatan: perubahan[a.idMurid].trim() } : a
      )
      await kemaskiniUnit(unit.id, { ahli: ahliBaru }, user.uid)
      setDraf((d) => { const s = { ...d }; delete s[unit.id]; return s })
      setModEdit((m) => ({ ...m, [unit.id]: false }))
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
        <p className="text-xs text-inkmuted mb-4">Awak boleh lihat carta jawatankuasa sedia ada. Hanya admin UBKS boleh lantik/tukar jawatan.</p>
      )}

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : unitSenarai.length === 0 ? (
        <p className="text-sm text-inkmuted">Tiada unit untuk tahun {tahunSesi} lagi.</p>
      ) : (
        <div className="space-y-2.5">
          {unitSenarai.map((unit) => {
            const dibuka = unitDibuka === unit.id
            const editing = Boolean(modEdit[unit.id])
            const bilanganJawatan = unit.ahli.filter((a) => a.jawatan?.trim()).length
            const adaDraf = Boolean(draf[unit.id] && Object.keys(draf[unit.id]).length > 0)
            return (
              <div key={unit.id} className="border border-border rounded-card overflow-hidden">
                <button
                  onClick={() => setUnitDibuka(dibuka ? null : unit.id)}
                  className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-base"
                >
                  <Users size={16} className="text-inkmuted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate">{unit.namaUnit}</p>
                    <p className="text-xs text-inkmuted">{labelKategori(unit.kategoriUnit)} · {unit.ahli.length} ahli · {bilanganJawatan} jawatankuasa dilantik</p>
                  </div>
                  <ChevronDown size={16} className={`text-inkmuted shrink-0 transition-transform ${dibuka ? 'rotate-180' : ''}`} />
                </button>

                {dibuka && (
                  <div className="border-t border-border">
                    {unit.ahli.length === 0 ? (
                      <p className="text-xs text-inkmuted p-3.5">Tiada ahli dalam unit ni lagi.</p>
                    ) : !editing ? (
                      <>
                        <CartaOrganisasi ahli={unit.ahli} onKlikAhli={(a) => setProfilDibuka({ idMurid: a.idMurid, nama: a.nama })} />
                        {isAdmin && (
                          <div className="p-3.5 pt-0">
                            <button
                              onClick={() => setModEdit((m) => ({ ...m, [unit.id]: true }))}
                              className="flex items-center gap-1.5 h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink"
                            >
                              <Pencil size={13} /> Edit Jawatankuasa
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-3.5">
                        <div className="space-y-2 mb-3">
                          {unit.ahli.map((a) => (
                            <div key={a.idMurid} className="flex items-center gap-2">
                              <button
                                onClick={() => setProfilDibuka({ idMurid: a.idMurid, nama: a.nama })}
                                className="text-sm text-ink flex-1 min-w-0 truncate text-left hover:text-brand-red hover:underline"
                              >
                                {a.nama}
                              </button>
                              <input
                                type="text"
                                list="cadangan-jawatan-ubks"
                                value={jawatanSemasa(unit, a.idMurid)}
                                onChange={(e) => ubahJawatan(unit.id, a.idMurid, e.target.value)}
                                placeholder="Tiada jawatan"
                                className="h-9 w-40 px-2.5 rounded-card border border-border bg-surface text-xs shrink-0"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => simpanUnit(unit)}
                            disabled={menyimpan === unit.id}
                            className="flex items-center gap-1.5 h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-40"
                          >
                            <Save size={14} /> {menyimpan === unit.id ? 'Menyimpan…' : 'Simpan & Tutup Edit'}
                          </button>
                          {adaDraf && (
                            <button
                              onClick={() => { setDraf((d) => { const s = { ...d }; delete s[unit.id]; return s }); setModEdit((m) => ({ ...m, [unit.id]: false })) }}
                              className="h-10 px-4 rounded-card border border-border text-xs font-semibold text-inkmuted"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </div>
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

      <ProfilMuridUBKSModal
        open={Boolean(profilDibuka)}
        idMurid={profilDibuka?.idMurid}
        nama={profilDibuka?.nama}
        onClose={() => setProfilDibuka(null)}
      />
    </div>
  )
}
