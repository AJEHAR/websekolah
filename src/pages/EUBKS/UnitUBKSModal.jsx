import { useMemo, useState } from 'react'
import { X, Upload, Trash2, Plus, Star } from 'lucide-react'
import { useMuridList } from '../../hooks/useMurid.js'
import { useKategoriUBKS } from '../../hooks/useKategoriUBKS.js'
import { kemaskiniUnit, padamUnit } from '../../hooks/useUnitUBKS.js'
import { muatNaikKeDrive } from '../../lib/driveUpload.js'

export default function UnitUBKSModal({ unit, isAdmin, user, onClose, onSelesai }) {
  const { senarai: muridSenarai } = useMuridList()
  const { senarai: kategoriSenarai } = useKategoriUBKS()
  const [namaUnit, setNamaUnit] = useState(unit?.namaUnit ?? '')
  const [kategoriUnit, setKategoriUnit] = useState(unit?.kategoriUnit ?? '')
  const [ahli, setAhli] = useState(unit?.ahli ?? [])
  const [gambarUnit, setGambarUnit] = useState(unit?.gambarUnit ?? null)
  const [failGambar, setFailGambar] = useState(null)
  const [tahunDipilih, setTahunDipilih] = useState('')
  const [carian, setCarian] = useState('')
  const [dipilihSementara, setDipilihSementara] = useState(new Set())
  const [menyimpan, setMenyimpan] = useState(false)
  const [statusSimpan, setStatusSimpan] = useState(null)
  const [gambarGagal, setGambarGagal] = useState(false)

  const senaraiTahun = useMemo(() => {
    const set = new Set()
    muridSenarai.forEach((m) => {
      if (m.tahunTingkatan?.trim()) set.add(m.tahunTingkatan.trim())
    })
    return [...set].sort()
  }, [muridSenarai])

  if (!unit) return null

  const idSudahAhli = new Set(ahli.map((a) => a.idMurid))

  const muridTahunIni = muridSenarai.filter(
    (m) =>
      m.tahunTingkatan === tahunDipilih &&
      !idSudahAhli.has(m.idMurid) &&
      m.nama?.toLowerCase().includes(carian.toLowerCase())
  )

  function toggl(idMurid) {
    setDipilihSementara((s) => {
      const baru = new Set(s)
      if (baru.has(idMurid)) baru.delete(idMurid)
      else baru.add(idMurid)
      return baru
    })
  }

  function tambahKeUnit() {
    const baru = muridTahunIni
      .filter((m) => dipilihSementara.has(m.idMurid))
      .map((m) => ({ idMurid: m.idMurid, nama: m.nama, tahunTingkatan: m.tahunTingkatan, adalahLF: false }))
    setAhli((a) => [...a, ...baru])
    setDipilihSementara(new Set())
  }

  function buangAhli(idMurid) {
    setAhli((a) => a.filter((m) => m.idMurid !== idMurid))
  }

  function togglLF(idMurid) {
    setAhli((a) => a.map((m) => (m.idMurid === idMurid ? { ...m, adalahLF: !m.adalahLF } : m)))
  }

  function pilihGambar(e) {
    const fail = e.target.files?.[0]
    if (!fail) return
    setFailGambar(fail)
    setGambarUnit(URL.createObjectURL(fail))
    setGambarGagal(false)
  }

  async function simpan() {
    setMenyimpan(true)
    try {
      let gambarURL = unit.gambarUnit ?? null
      if (failGambar) {
        setStatusSimpan('Memuat naik gambar…')
        const hasil = await muatNaikKeDrive(failGambar, 'unitUBKS')
        gambarURL = hasil.url
      }
      setStatusSimpan('Menyimpan…')
      await kemaskiniUnit(unit.id, { namaUnit: namaUnit.trim(), kategoriUnit, ahli, gambarUnit: gambarURL }, user.uid)
      setStatusSimpan('Berjaya disimpan!')
      onSelesai()
      setTimeout(() => onClose(), 600)
    } catch (err) {
      setStatusSimpan(null)
      window.alert(err.message || 'Gagal simpan. Sila cuba lagi.')
      console.error(err)
    } finally {
      setMenyimpan(false)
    }
  }

  async function padam() {
    if (!window.confirm(`Padam unit "${unit.namaUnit}"? Tindakan ini tidak boleh dibatalkan.`)) return
    await padamUnit(unit.id)
    onSelesai()
    onClose()
  }

  const ahliIkutTahun = {}
  ahli.forEach((m) => {
    const t = m.tahunTingkatan || 'Tiada Tahun'
    if (!ahliIkutTahun[t]) ahliIkutTahun[t] = []
    ahliIkutTahun[t].push(m)
  })

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-ink">Urus Unit</h2>
          <button onClick={onClose} disabled={menyimpan} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted disabled:opacity-40">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="h-24 w-24 rounded-card bg-base border border-border overflow-hidden flex items-center justify-center">
            {gambarUnit && !gambarGagal ? (
              <img src={gambarUnit} alt="" className="h-full w-full object-cover" onError={() => setGambarGagal(true)} />
            ) : gambarUnit && gambarGagal ? (
              <span className="text-[10px] text-inkmuted text-center px-1">Gambar belum sedia, cuba muat semula sekejap lagi</span>
            ) : (
              <span className="text-xs text-inkmuted">Tiada gambar</span>
            )}
          </div>
          {isAdmin && (
            <label className="text-sm font-medium text-brand-red cursor-pointer">
              <Upload size={14} className="inline mr-1" /> Muat naik gambar unit <span className="text-inkmuted font-normal">(pilihan)</span>
              <input type="file" accept="image/*" onChange={pilihGambar} className="hidden" />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label htmlFor="namaUnit" className="block text-sm font-medium text-ink mb-1">Nama Unit</label>
            <input
              id="namaUnit"
              type="text"
              disabled={!isAdmin}
              value={namaUnit}
              onChange={(e) => setNamaUnit(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="kategoriUnit" className="block text-sm font-medium text-ink mb-1">Kategori</label>
            <select
              id="kategoriUnit"
              disabled={!isAdmin}
              value={kategoriUnit}
              onChange={(e) => setKategoriUnit(e.target.value)}
              className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm disabled:opacity-60"
            >
              <option value="">-- Pilih --</option>
              {kategoriSenarai.map((k) => (
                <option key={k.id} value={k.kod}>{k.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-5 p-3 rounded-card border border-border bg-base">
            <p className="text-xs font-semibold text-ink mb-2">Tambah Ahli</p>
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
                <input
                  type="text"
                  value={carian}
                  onChange={(e) => setCarian(e.target.value)}
                  placeholder="Cari nama…"
                  className="flex-1 min-w-0 h-10 px-3 rounded-card border border-border bg-surface text-sm"
                />
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
                        <input
                          type="checkbox"
                          checked={dipilihSementara.has(m.idMurid)}
                          onChange={() => toggl(m.idMurid)}
                          className="h-4 w-4"
                        />
                        <span className="text-ink">{m.nama}</span>
                      </label>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={tambahKeUnit}
                  disabled={dipilihSementara.size === 0}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-card bg-ink text-white text-xs font-semibold disabled:opacity-40"
                >
                  <Plus size={14} /> Tambah {dipilihSementara.size > 0 ? `(${dipilihSementara.size})` : ''} ke Unit
                </button>
              </>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-ink">Ahli Unit ({ahli.length})</p>
            {isAdmin && (
              <p className="text-[10px] text-inkmuted flex items-center gap-1">
                <Star size={11} className="fill-current" style={{ color: '#F2C230' }} /> = Kefungsian Rendah (LF)
              </p>
            )}
          </div>
          {Object.keys(ahliIkutTahun).length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada ahli lagi.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(ahliIkutTahun)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([tahun, senaraiAhli]) => (
                  <div key={tahun}>
                    <h4 className="text-[11px] font-semibold text-inkmuted uppercase tracking-wide mb-1">
                      {tahun} ({senaraiAhli.length})
                    </h4>
                    <div className="border border-border rounded-card divide-y divide-border">
                      {senaraiAhli.map((m) => (
                        <div key={m.idMurid} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="text-ink flex items-center gap-1.5">
                            {m.nama}
                            {m.adalahLF && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#F2C230', color: '#1A1A1A' }}>
                                LF
                              </span>
                            )}
                          </span>
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => togglLF(m.idMurid)}
                                aria-label={m.adalahLF ? 'Buang tag LF' : 'Tag sebagai LF'}
                                className="p-1 rounded-card hover:bg-base"
                                style={{ color: m.adalahLF ? '#F2C230' : '#B4B2A9' }}
                              >
                                <Star size={14} className={m.adalahLF ? 'fill-current' : ''} />
                              </button>
                              <button onClick={() => buangAhli(m.idMurid)} aria-label="Buang ahli" className="p-1 rounded-card hover:bg-base text-brand-red">
                                <X size={14} />
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
          <div className="flex gap-3">
            <button
              onClick={simpan}
              disabled={menyimpan}
              className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60"
            >
              {menyimpan ? statusSimpan : 'Simpan Perubahan'}
            </button>
            <button onClick={padam} aria-label="Padam unit" className="h-12 px-4 rounded-card border border-border text-brand-red">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
