import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Plus, X, RefreshCw, AlertTriangle } from 'lucide-react'
import { namaHari, todayISO } from '../../lib/dateUtils.js'
import { useKumpulanBertugas } from '../../hooks/useKumpulanBertugas.js'
import { useKeberadaanTarikh } from '../../hooks/useKeberadaan.js'
import { useKehadiranTarikh } from '../../hooks/useKehadiranMurid.js'
import { useMuridList } from '../../hooks/useMurid.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import { tambahLaporanHarian, kemaskiniLaporanHarian } from '../../hooks/useLaporanHarian.js'

export default function LaporanHarianForm({ laporan, user, onSelesai, onBatal }) {
  const [minggu, setMinggu] = useState(laporan?.minggu ?? '')
  const [tarikh, setTarikh] = useState(laporan?.tarikh ?? todayISO())
  const [kumpulanId, setKumpulanId] = useState(laporan?.kumpulanBertugasId ?? '')
  const [senaraiGuru, setSenaraiGuru] = useState(laporan?.senaraiGuruBertugas ?? [])
  const [ppmTerpilih, setPpmTerpilih] = useState(() => new Set((laporan?.senaraiPPMBertugas ?? []).map((p) => p.emel)))
  const [ppmDiautoisi, setPpmDiautoisi] = useState(Boolean(laporan))
  const [rumusanGuruMangkir, setRumusanGuruMangkir] = useState(laporan?.rumusanGuruMangkir ?? [])
  const [rumusanMuridSakit, setRumusanMuridSakit] = useState(laporan?.rumusanMuridSakit ?? [])
  const [laporanPDPC, setLaporanPDPC] = useState(laporan?.laporanPDPC ?? '')
  const [kokurikulumAktif, setKokurikulumAktif] = useState(laporan?.kokurikulumAktif ?? false)
  const [butiranKokurikulum, setButiranKokurikulum] = useState(laporan?.butiranKokurikulum ?? '')
  const [laporanPagi, setLaporanPagi] = useState(laporan?.laporanPagi ?? '')
  const [halLain, setHalLain] = useState(laporan?.halLain ?? '')
  const [dilaporkanOlehEmel, setDilaporkanOlehEmel] = useState(laporan?.dilaporkanOlehEmel ?? user.email)
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  const { senarai: kumpulanSenarai } = useKumpulanBertugas()
  const { senarai: keberadaanSenarai } = useKeberadaanTarikh(tarikh)
  const { senarai: kehadiranMuridSenarai } = useKehadiranTarikh(tarikh)
  const { senarai: muridSenarai } = useMuridList()
  const { profiles } = useProfilesList()
  const profilesAktif = profiles.filter((p) => p.status !== 'menunggu')

  const hari = tarikh ? namaHari(tarikh) : ''

  const emelTakHadir = useMemo(() => {
    const set = new Set()
    keberadaanSenarai.forEach((r) => {
      if (r.urusan !== 'Keluar Waktu Bekerja (KWB)') set.add(r.profilEmel)
    })
    return set
  }, [keberadaanSenarai])

  const guruAktif = profilesAktif.filter((p) => p.kategori === 'Guru')
  const ppmKelasAktif = profilesAktif.filter((p) => p.kategori === 'PPM' && p.jenisPPM === 'PPM Kelas')

  const jumlahGuruKeseluruhan = guruAktif.length
  const jumlahGuruHadir = guruAktif.filter((p) => !emelTakHadir.has(p.emel)).length

  const jumlahMuridKeseluruhan = muridSenarai.length
  const jumlahMuridHadir = kehadiranMuridSenarai.reduce((jum, r) => jum + (r.jumlahHadir ?? 0), 0)
  const peratusKehadiranMurid = jumlahMuridKeseluruhan > 0
    ? ((jumlahMuridHadir / jumlahMuridKeseluruhan) * 100).toFixed(1)
    : '0.0'

  const kelasBelumIsi = useMemo(() => {
    const semuaKelas = new Set(muridSenarai.map((m) => m.namaKelas?.trim()).filter(Boolean))
    const kelasDiisi = new Set(kehadiranMuridSenarai.map((r) => r.namaKelas))
    return [...semuaKelas].filter((k) => !kelasDiisi.has(k))
  }, [muridSenarai, kehadiranMuridSenarai])

  useEffect(() => {
    if (ppmDiautoisi || profilesAktif.length === 0) return
    const emelHadir = new Set(
      profilesAktif
        .filter((p) => p.kategori === 'PPM' && p.jenisPPM === 'PPM Kelas' && !emelTakHadir.has(p.emel))
        .map((p) => p.emel)
    )
    setPpmTerpilih(emelHadir)
    setPpmDiautoisi(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilesAktif.length, ppmDiautoisi])

  function segarkanSenaraiPPM() {
    const emelHadir = new Set(ppmKelasAktif.filter((p) => !emelTakHadir.has(p.emel)).map((p) => p.emel))
    setPpmTerpilih(emelHadir)
  }

  function pilihKumpulan(id) {
    setKumpulanId(id)
    const kumpulan = kumpulanSenarai.find((k) => k.id === id)
    if (!kumpulan) {
      setSenaraiGuru([])
      return
    }
    const ahliHadir = (kumpulan.ahli ?? []).filter((a) => !emelTakHadir.has(a.emel))
    setSenaraiGuru(ahliHadir.map((a) => ({ emel: a.emel, nama: a.nama })))
  }

  function togglPPM(emel) {
    setPpmTerpilih((s) => {
      const baru = new Set(s)
      if (baru.has(emel)) baru.delete(emel)
      else baru.add(emel)
      return baru
    })
  }

  function buangGuru(emel) {
    setSenaraiGuru((s) => s.filter((g) => g.emel !== emel))
  }

  function tambahGuruMangkir() {
    setRumusanGuruMangkir((s) => [...s, { emel: '', nama: '', sebab: '' }])
  }
  function ubahGuruMangkir(i, medan, nilai) {
    setRumusanGuruMangkir((s) => {
      const baru = [...s]
      if (medan === 'emel') {
        const p = guruAktif.find((g) => g.emel === nilai)
        baru[i] = { ...baru[i], emel: nilai, nama: p?.nama ?? '' }
      } else {
        baru[i] = { ...baru[i], [medan]: nilai }
      }
      return baru
    })
  }
  function buangGuruMangkir(i) {
    setRumusanGuruMangkir((s) => s.filter((_, idx) => idx !== i))
  }

  function tambahMuridSakit() {
    setRumusanMuridSakit((s) => [...s, { idMurid: '', nama: '', sebab: '', tindakan: '' }])
  }
  function ubahMuridSakit(i, medan, nilai) {
    setRumusanMuridSakit((s) => {
      const baru = [...s]
      if (medan === 'idMurid') {
        const m = muridSenarai.find((mu) => mu.idMurid === nilai)
        baru[i] = { ...baru[i], idMurid: nilai, nama: m?.nama ?? '' }
      } else {
        baru[i] = { ...baru[i], [medan]: nilai }
      }
      return baru
    })
  }
  function buangMuridSakit(i) {
    setRumusanMuridSakit((s) => s.filter((_, idx) => idx !== i))
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)

    if (!minggu) {
      setRalat('Sila isi minggu.')
      return
    }
    if (!tarikh) {
      setRalat('Sila isi tarikh.')
      return
    }
    if (!dilaporkanOlehEmel) {
      setRalat('Sila pilih Dilaporkan Oleh.')
      return
    }

    const kumpulan = kumpulanSenarai.find((k) => k.id === kumpulanId)
    const pelapor = guruAktif.find((g) => g.emel === dilaporkanOlehEmel)

    const data = {
      minggu: Number(minggu),
      tarikh,
      hari,
      jumlahGuruHadir,
      jumlahGuruKeseluruhan,
      jumlahMuridHadir,
      jumlahMuridKeseluruhan,
      peratusKehadiranMurid: Number(peratusKehadiranMurid),
      kumpulanBertugasId: kumpulanId || null,
      kumpulanBertugasNama: kumpulan?.nama ?? null,
      senaraiGuruBertugas: senaraiGuru,
      senaraiPPMBertugas: ppmKelasAktif.filter((p) => ppmTerpilih.has(p.emel)).map((p) => ({ emel: p.emel, nama: p.nama })),
      rumusanGuruMangkir: rumusanGuruMangkir.filter((r) => r.emel && r.sebab.trim()),
      rumusanMuridSakit: rumusanMuridSakit.filter((r) => r.idMurid && r.sebab.trim()),
      laporanPDPC: laporanPDPC.trim(),
      kokurikulumAktif,
      butiranKokurikulum: kokurikulumAktif ? butiranKokurikulum.trim() : '',
      laporanPagi: laporanPagi.trim(),
      halLain: halLain.trim(),
      dilaporkanOlehEmel,
      dilaporkanOleh: pelapor?.nama ?? '',
    }

    setMenyimpan(true)
    try {
      if (laporan) {
        await kemaskiniLaporanHarian(laporan.id, data, user.uid)
      } else {
        await tambahLaporanHarian(data, user.uid)
      }
      onSelesai()
    } catch (err) {
      setRalat(err.message || 'Gagal simpan. Cuba lagi.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div>
      <button onClick={onBatal} className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4">
        <ChevronLeft size={14} /> Kembali ke senarai
      </button>

      <form onSubmit={hantar} className="space-y-4">
        <div className="p-4 rounded-card border border-border bg-surface grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minggu" className="block text-sm font-medium text-ink mb-1">Minggu Ke-</label>
            <input id="minggu" type="number" min="1" required value={minggu} onChange={(e) => setMinggu(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label htmlFor="tarikhHarian" className="block text-sm font-medium text-ink mb-1">Tarikh</label>
            <input id="tarikhHarian" type="date" required value={tarikh} onChange={(e) => setTarikh(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-ink mb-1">Hari</label>
            <div className="h-11 px-3 rounded-card border border-border bg-base text-sm flex items-center text-inkmuted">{hari || '-'}</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface">
          <p className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-3">Kehadiran (auto-kira dari Keberadaan & Kehadiran Murid)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-card bg-base text-center">
              <p className="text-lg font-bold text-ink">{jumlahGuruHadir} / {jumlahGuruKeseluruhan}</p>
              <p className="text-xs text-inkmuted">Kehadiran Guru</p>
            </div>
            <div className="p-3 rounded-card bg-base text-center">
              <p className="text-lg font-bold text-ink">{jumlahMuridHadir} / {jumlahMuridKeseluruhan}</p>
              <p className="text-xs text-inkmuted">Kehadiran Murid ({peratusKehadiranMurid}%)</p>
            </div>
          </div>
          {kelasBelumIsi.length > 0 && (
            <p className="flex items-start gap-1.5 text-xs text-brand-red mt-3">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              {kelasBelumIsi.length} kelas belum isi Kehadiran Murid untuk tarikh ni - jumlah murid hadir di atas belum lengkap.
            </p>
          )}
        </div>

        <div className="p-4 rounded-card border border-border bg-surface">
          <label htmlFor="kumpulan" className="block text-sm font-medium text-ink mb-1">Kumpulan Bertugas Minggu Ini</label>
          <select id="kumpulan" value={kumpulanId} onChange={(e) => pilihKumpulan(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm mb-3">
            <option value="">-- Pilih Kumpulan --</option>
            {kumpulanSenarai.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-inkmuted uppercase tracking-wide">Senarai Guru Bertugas ({senaraiGuru.length})</p>
            {kumpulanId && (
              <button type="button" onClick={() => pilihKumpulan(kumpulanId)} className="flex items-center gap-1 text-xs font-medium text-brand-red">
                <RefreshCw size={11} /> Segarkan
              </button>
            )}
          </div>
          {senaraiGuru.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada guru - pilih kumpulan dulu.</p>
          ) : (
            <div className="space-y-1">
              {senaraiGuru.map((g) => (
                <div key={g.emel} className="flex items-center justify-between px-3 py-2 rounded-card bg-base text-sm">
                  <span className="text-ink">{g.nama}</span>
                  <button type="button" onClick={() => buangGuru(g.emel)} aria-label="Buang" className="text-inkmuted hover:text-brand-red">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-card border border-border bg-surface">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-inkmuted uppercase tracking-wide">
              Senarai PPM Bertugas ({[...ppmTerpilih].length}) - PPM Kelas sahaja
            </p>
            <button type="button" onClick={segarkanSenaraiPPM} className="flex items-center gap-1 text-xs font-medium text-brand-red">
              <RefreshCw size={11} /> Segarkan
            </button>
          </div>
          {ppmKelasAktif.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada PPM Kelas didaftarkan lagi.</p>
          ) : (
            <div className="space-y-1">
              {ppmKelasAktif.map((p) => (
                <label key={p.emel} className="flex items-center gap-2 px-3 py-2 rounded-card bg-base text-sm cursor-pointer">
                  <input type="checkbox" checked={ppmTerpilih.has(p.emel)} onChange={() => togglPPM(p.emel)} className="h-4 w-4" />
                  <span className="text-ink">{p.nama}</span>
                  {emelTakHadir.has(p.emel) && <span className="text-[10px] text-brand-red ml-auto">Tak Hadir</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-card border border-border bg-surface">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-inkmuted uppercase tracking-wide">Rumusan Guru Mangkir</p>
            <button type="button" onClick={tambahGuruMangkir} className="flex items-center gap-1 text-xs font-semibold text-brand-red">
              <Plus size={13} /> Tambah
            </button>
          </div>
          {rumusanGuruMangkir.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada.</p>
          ) : (
            <div className="space-y-2">
              {rumusanGuruMangkir.map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select value={r.emel} onChange={(e) => ubahGuruMangkir(i, 'emel', e.target.value)} className="h-10 px-2 rounded-card border border-border bg-base text-xs flex-1 min-w-0">
                    <option value="">-- Nama Guru --</option>
                    {guruAktif.map((g) => <option key={g.emel} value={g.emel}>{g.nama}</option>)}
                  </select>
                  <input type="text" placeholder="Sebab" value={r.sebab} onChange={(e) => ubahGuruMangkir(i, 'sebab', e.target.value)} className="h-10 px-2 rounded-card border border-border bg-base text-xs flex-1 min-w-0" />
                  <button type="button" onClick={() => buangGuruMangkir(i)} className="p-2 text-brand-red shrink-0"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-card border border-border bg-surface">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-inkmuted uppercase tracking-wide">Rumusan Murid Sakit/Pulang Awal</p>
            <button type="button" onClick={tambahMuridSakit} className="flex items-center gap-1 text-xs font-semibold text-brand-red">
              <Plus size={13} /> Tambah
            </button>
          </div>
          {rumusanMuridSakit.length === 0 ? (
            <p className="text-xs text-inkmuted">Tiada.</p>
          ) : (
            <div className="space-y-2">
              {rumusanMuridSakit.map((r, i) => (
                <div key={i} className="p-2 rounded-card bg-base space-y-1.5">
                  <div className="flex gap-2">
                    <select value={r.idMurid} onChange={(e) => ubahMuridSakit(i, 'idMurid', e.target.value)} className="h-10 px-2 rounded-card border border-border bg-surface text-xs flex-1 min-w-0">
                      <option value="">-- Nama Murid --</option>
                      {muridSenarai.map((m) => <option key={m.idMurid} value={m.idMurid}>{m.nama}</option>)}
                    </select>
                    <button type="button" onClick={() => buangMuridSakit(i)} className="p-2 text-brand-red shrink-0"><X size={14} /></button>
                  </div>
                  <input type="text" placeholder="Sebab" value={r.sebab} onChange={(e) => ubahMuridSakit(i, 'sebab', e.target.value)} className="w-full h-10 px-2 rounded-card border border-border bg-surface text-xs" />
                  <input type="text" placeholder="Tindakan" value={r.tindakan} onChange={(e) => ubahMuridSakit(i, 'tindakan', e.target.value)} className="w-full h-10 px-2 rounded-card border border-border bg-surface text-xs" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-card border border-border bg-surface space-y-4">
          <div>
            <label htmlFor="laporanPDPC" className="block text-sm font-medium text-ink mb-1">Laporan PDPC</label>
            <textarea id="laporanPDPC" rows={3} value={laporanPDPC} onChange={(e) => setLaporanPDPC(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none" />
          </div>

          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-ink">Kokurikulum Minggu Ini</span>
              <button
                type="button"
                onClick={() => setKokurikulumAktif((s) => !s)}
                role="switch"
                aria-checked={kokurikulumAktif}
                className="relative h-7 w-12 rounded-full transition-colors shrink-0"
                style={{ backgroundColor: kokurikulumAktif ? '#C8102E' : '#E5E5E5' }}
              >
                <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-transform shadow" style={{ transform: kokurikulumAktif ? 'translateX(22px)' : 'translateX(4px)' }} />
              </button>
            </label>
            {kokurikulumAktif && (
              <textarea rows={3} placeholder="Butiran kokurikulum minggu ini…" value={butiranKokurikulum} onChange={(e) => setButiranKokurikulum(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none mt-2" />
            )}
          </div>

          <div>
            <label htmlFor="laporanPagi" className="block text-sm font-medium text-ink mb-1">Laporan Pagi</label>
            <textarea id="laporanPagi" rows={3} value={laporanPagi} onChange={(e) => setLaporanPagi(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none" />
          </div>

          <div>
            <label htmlFor="halLain" className="block text-sm font-medium text-ink mb-1">Hal-Hal Lain</label>
            <textarea id="halLain" rows={3} value={halLain} onChange={(e) => setHalLain(e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-base text-sm resize-none" />
          </div>

          <div>
            <label htmlFor="dilaporkanOleh" className="block text-sm font-medium text-ink mb-1">Dilaporkan Oleh</label>
            <select id="dilaporkanOleh" required value={dilaporkanOlehEmel} onChange={(e) => setDilaporkanOlehEmel(e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm">
              <option value="">-- Pilih guru --</option>
              {guruAktif.map((g) => <option key={g.emel} value={g.emel}>{g.nama}</option>)}
            </select>
          </div>
        </div>

        {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={menyimpan} className="flex-1 h-12 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
            {menyimpan ? 'Menyimpan…' : 'Simpan Laporan'}
          </button>
          <button type="button" onClick={onBatal} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
