import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ChevronDown, Users, Save, Eye, X } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useUnitUBKSTahun, kemaskiniUnit } from '../../hooks/useUnitUBKS.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import { kumpulUnitIkutKategori } from './kumpulUnitIkutKategori.js'
import ProfilMuridUBKSModal from './ProfilMuridUBKSModal.jsx'

const TAHUN_SEMASA = new Date().getFullYear()
const PILIHAN_TAHUN = [TAHUN_SEMASA, TAHUN_SEMASA - 1, TAHUN_SEMASA - 2]

const CADANGAN_JAWATAN = ['Pengerusi', 'Naib Pengerusi', 'Setiausaha', 'Penolong Setiausaha', 'Bendahari', 'AJK']

// Aras carta - NOMBOR BEBAS (1 hingga apa-apa pun), admin taip terus,
// TIADA label makna terikat (bukan "Aras 1 = Ketua semestinya") - nombor
// lebih kecil = lebih atas dalam carta. Fleksibel untuk struktur
// jawatankuasa apa-apa bentuk pun, tak dikunci kepada 4-5 tingkat tetap.
function arasAhli(a) {
  return a.aras ?? 99 // ahli ada jawatan tapi belum tetapkan aras (data lama) - letak bawah sekali carta
}

function NodAhli({ ahli, onKlik }) {
  const inisial = (ahli.nama ?? '?').trim().charAt(0).toUpperCase()
  return (
    <button onClick={() => onKlik(ahli)} className="flex flex-col items-center gap-1.5 w-24">
      <div className="h-11 w-11 rounded-full bg-base border-2 border-border flex items-center justify-center text-sm font-semibold text-inkmuted">
        {inisial}
      </div>
      <span className="text-[11px] text-ink text-center leading-tight line-clamp-2">{ahli.nama}</span>
      {ahli.jawatan?.trim() && <span className="text-[9px] font-semibold text-brand-red text-center leading-tight uppercase">{ahli.jawatan}</span>}
    </button>
  )
}

// Carta organisasi - susun ikut nilai ARAS SEBENAR (nombor bebas, bukan
// tingkat tetap) - setiap nilai aras unik jadi satu baris, garis penyambung
// antara baris tunjuk struktur, TANPA label tingkat (nama jawatan di bawah
// setiap nod dah cukup, label tingkat jadi berlebihan/double).
function CartaOrganisasi({ ahli, onKlikAhli }) {
  const berjawatan = ahli.filter((a) => a.jawatan?.trim())
  const ahliBiasa = ahli.filter((a) => !a.jawatan?.trim())

  if (berjawatan.length === 0) {
    return <p className="text-xs text-inkmuted text-center py-6">Belum ada jawatankuasa dilantik untuk unit ni lagi.</p>
  }

  const kumpulan = {}
  berjawatan.forEach((a) => {
    const aras = arasAhli(a)
    if (!kumpulan[aras]) kumpulan[aras] = []
    kumpulan[aras].push(a)
  })
  const arasTersusun = Object.keys(kumpulan).map(Number).sort((x, y) => x - y)

  return (
    <div className="py-4 overflow-x-auto">
      <div className="flex flex-col items-center gap-1 min-w-fit px-2">
        {arasTersusun.map((aras, i) => (
          <div key={aras} className="flex flex-col items-center">
            {i > 0 && <div className="h-5 w-px bg-border" />}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 mb-1">
              {kumpulan[aras].map((a) => (
                <NodAhli key={a.idMurid} ahli={a} onKlik={onKlikAhli} />
              ))}
            </div>
          </div>
        ))}
        {ahliBiasa.length > 0 && (
          <>
            <div className="h-5 w-px bg-border" />
            <p className="text-[11px] text-inkmuted">+ {ahliBiasa.length} ahli biasa (tiada jawatan)</p>
          </>
        )}
      </div>
    </div>
  )
}

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

// Satu kad ahli untuk mod edit - nama + jawatan + aras disusun TEGAK
// (bukan sebaris cramped) supaya senang dibaca/diisi kat telefon.
function KadEditAhli({ a, unit, nilaiSemasa, ubahDraf, onKlikProfil }) {
  const jawatanSemasa = nilaiSemasa(unit, a.idMurid, 'jawatan', '')
  const adaJawatan = jawatanSemasa.trim().length > 0

  return (
    <div className="p-3 rounded-card border border-border bg-surface">
      <button
        onClick={() => onKlikProfil({ idMurid: a.idMurid, nama: a.nama })}
        className="text-sm font-medium text-ink text-left hover:text-brand-red hover:underline mb-2 block"
      >
        {a.nama}
      </button>
      <div className="flex gap-2">
        <input
          type="text"
          list="cadangan-jawatan-ubks"
          value={jawatanSemasa}
          onChange={(e) => ubahDraf(unit.id, a.idMurid, 'jawatan', e.target.value)}
          placeholder="Ahli biasa (kosongkan)"
          className="flex-1 min-w-0 h-10 px-3 rounded-card border border-border bg-base text-sm"
        />
        {adaJawatan && (
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor={`aras-${a.idMurid}`} className="text-xs text-inkmuted">Aras</label>
            <input
              id={`aras-${a.idMurid}`}
              type="number"
              min="1"
              value={nilaiSemasa(unit, a.idMurid, 'aras', arasAhli(a) === 99 ? '' : arasAhli(a))}
              onChange={(e) => ubahDraf(unit.id, a.idMurid, 'aras', e.target.value ? Number(e.target.value) : null)}
              placeholder="cth. 1"
              className="w-16 h-10 px-2 rounded-card border border-border bg-base text-sm text-center"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function JawatankuasaUBKS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const isAdmin = adaSeksyen('ubks')
  const [tahunSesi, setTahunSesi] = useState(TAHUN_SEMASA)
  const { senarai: unitSenarai, loading, muatSemula } = useUnitUBKSTahun(tahunSesi)
  const { senarai: kategoriSenarai } = useKategoriUBKS()
  const kumpulan = kumpulUnitIkutKategori(unitSenarai, kategoriSenarai)

  const [unitDibuka, setUnitDibuka] = useState(null)
  const [unitCartaPenuh, setUnitCartaPenuh] = useState(null)
  const [draf, setDraf] = useState({})
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
        const jawatanBaru = (p.jawatan ?? a.jawatan ?? '').trim()
        return {
          ...a,
          jawatan: jawatanBaru,
          aras: jawatanBaru ? (p.aras ?? a.aras ?? 1) : null,
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
        <div className="space-y-6">
          {kumpulan.map((kump) => (
            <div key={kump.kod}>
              <h3 className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">{kump.label} <span className="font-normal normal-case">({kump.units.length})</span></h3>
              <div className="space-y-2.5">
          {kump.units.map((unit) => {
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
                  <div className="border-t border-border bg-base p-3.5">
                    {unit.ahli.length === 0 ? (
                      <p className="text-xs text-inkmuted">Tiada ahli dalam unit ni lagi.</p>
                    ) : !isAdmin ? (
                      <div className="space-y-1.5">
                        {unit.ahli.map((a) => (
                          <div key={a.idMurid} className="flex items-center justify-between px-3 py-2 rounded-card bg-surface border border-border">
                            <button onClick={() => setProfilDibuka({ idMurid: a.idMurid, nama: a.nama })} className="text-sm text-ink hover:text-brand-red hover:underline text-left">
                              {a.nama}
                            </button>
                            <span className="text-xs text-inkmuted">{a.jawatan?.trim() || 'Ahli biasa'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-inkmuted mb-3">Biar kotak jawatan kosong untuk ahli biasa (automatik, tak perlu buat apa-apa). Isi jawatan → kotak Aras (nombor bebas, cth. 1, 2, 3...) muncul di sebelah.</p>
                        <div className="space-y-2 mb-3">
                          {unit.ahli.map((a) => (
                            <KadEditAhli
                              key={a.idMurid}
                              a={a}
                              unit={unit}
                              nilaiSemasa={nilaiSemasa}
                              ubahDraf={ubahDraf}
                              onKlikProfil={setProfilDibuka}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => simpanUnit(unit)}
                          disabled={!adaDraf || menyimpan === unit.id}
                          className="flex items-center gap-1.5 h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-40"
                        >
                          <Save size={14} /> {menyimpan === unit.id ? 'Menyimpan…' : 'Simpan Jawatankuasa'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
              </div>
            </div>
          ))}
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
