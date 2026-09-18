import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Plus, X, Search, CheckSquare, Square, Vote, Radio, Lock, Trophy, Trash2, PlayCircle, Timer, RotateCcw, Settings, Printer, MonitorPlay } from 'lucide-react'
import { useDialog } from '../../context/DialogContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useCetak } from '../../hooks/useCetak.js'
import {
  useKkgsPilihanRayaSenarai, ciptaPilihanRaya, kemaskiniTidakLayakPilihanRaya, kemaskiniTetapanPilihanRaya,
  mulakanPusingan, tutupPusingan, bukaSemulaPusingan, padamPilihanRaya,
} from '../../hooks/useKkgsPilihanRaya.js'
import { hantarUndianPusingan, useUndianSaya, useTalliLive, kiraTallyPusingan } from '../../hooks/useKkgsUndian.js'
import { JAWATAN_URUTAN_PILIHAN_RAYA, JAWATAN_AJK_PILIHAN_RAYA, KERUSI_AJK_LALAI, TEMPOH_UNDI_LALAI_SAAT, TAHUN_SEMASA, labelStatusPilihanRaya } from './kkgsConstants.js'
import LaporanPilihanRayaKKGS from './LaporanPilihanRayaKKGS.jsx'

// Hash string ringkas (djb2) -> integer, untuk jana "seed" PRNG dari
// gabungan ID pengundi + jawatan (rentetan boleh apa-apa panjang).
function hashRentetan(teks) {
  let h = 5381
  for (let i = 0; i < teks.length; i++) h = ((h << 5) + h + teks.charCodeAt(i)) | 0
  return h >>> 0
}

// PRNG mulberry32 - deterministik ikut seed (bukan Math.random() yang
// baru setiap panggilan) - PENTING supaya turutan calon KEKAL SAMA bila
// komponen re-render/refresh (bukan "bergerak-gerak" setiap kali).
function prngMulberry32(seed) {
  let a = seed
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Kocok (Fisher-Yates) senarai calon guna seed dari (uid pengundi +
// jawatan) - SETIAP pengundi nampak turutan BERBEZA (hapuskan "position
// bias" - orang malas pilih calon paling atas sahaja), TAPI turutan tu
// KEKAL STABIL untuk pengundi yang SAMA sepanjang pusingan tu (elak
// senarai kelihatan "berubah-ubah" bila skrin refresh - mengelirukan).
// Jawatan lain (pusingan lain) dapat turutan BERLAINAN juga - calon yang
// sama tak "untung" kedudukan atas untuk SEMUA race.
function kocokCalon(senarai, seed) {
  const rng = prngMulberry32(hashRentetan(seed))
  const hasil = [...senarai]
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[hasil[i], hasil[j]] = [hasil[j], hasil[i]]
  }
  return hasil
}

// Cari SAMA ADA ada SERI tepat pada garis potong kerusi (antara calon
// kerusi TERAKHIR yang menang dengan calon PERTAMA yang tersingkir).
// "tally" MESTI tersusun menurun ikut undi (kiraTallyPusingan/
// useTalliLive dah buat ni). Kalau seri jumpa, PULANGKAN senarai SEMUA
// calon yang berkongsi skor pada garis potong tu (admin kena pilih
// manual - sistem TAK boleh pilih sendiri sebab tak adil, cuma
// bergantung urutan Object.entries/insertion, bukan rawak/keputusan
// sengaja). Pulangkan null kalau tiada seri (selamat auto-pilih).
function cariSeriPadaGarisan(tally, kerusi) {
  if (tally.length <= kerusi) return null // semua calon (kalaupun ada) muat dalam kerusi - tiada persaingan garis potong
  const skorGarisan = tally[kerusi - 1]?.undi
  if (!skorGarisan) return null // 0 undi pun - bukan seri "sengit" yang perlu keputusan adil
  const calonSeri = tally.filter((t) => t.undi === skorGarisan)
  return calonSeri.length > 1 ? calonSeri : null
}

function WarnaStatusSesi(status) {
  if (status === 'berjalan') return { bg: '#E1F5EE', teks: '#0F6E56' }
  if (status === 'selesai') return { bg: '#EDEDED', teks: '#555' }
  return { bg: '#FCEFC7', teks: '#8A6D00' } // draf
}

// Cipta sesi Pilihan Raya baharu - tahun + bilangan kerusi AJK KKGS
// (jawatan bernama lain SENTIASA 1 kerusi setiap satu, tak berubah).
function ModalSesiBaharu({ open, tahunCadangan, onTutup, onSimpan }) {
  const [tahun, setTahun] = useState(tahunCadangan)
  const [bilanganKerusiAjk, setBilanganKerusiAjk] = useState(KERUSI_AJK_LALAI)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    try {
      await onSimpan({ tahun, bilanganKerusiAjk })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Pilihan Raya KKGS Baharu</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tahun</label>
            <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Bilangan Kerusi AJK KKGS</label>
            <input type="number" min={1} value={bilanganKerusiAjk} onChange={(e) => setBilanganKerusiAjk(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
            <p className="text-[10px] text-inkmuted mt-1">Jawatan {JAWATAN_URUTAN_PILIHAN_RAYA.filter((j) => j !== JAWATAN_AJK_PILIHAN_RAYA).join(', ')} SENTIASA 1 kerusi setiap satu (tak termasuk dalam bilangan ni).</p>
            {bilanganKerusiAjk < 1 && <p className="text-[10px] text-brand-red mt-1">Mesti sekurang-kurangnya 1 kerusi.</p>}
          </div>
        </div>
        <button onClick={simpan} disabled={menyimpan || bilanganKerusiAjk < 1} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Mencipta…' : 'Cipta Sesi (Draf)'}
        </button>
      </div>
    </div>
  )
}

// Urus SIAPA layak dicalonkan sesi ni - LALAI semua ahli AKTIF layak,
// admin boleh nyahtanda pengecualian manual (cth. ahli baru sahaja jadi
// AJK, belum layak bertanding semula ikut perlembagaan kelab). HANYA
// boleh diubah SEBELUM pusingan pertama bermula.
function ModalTidakLayak({ open, senaraiAhliAktif, tidakLayakSet, onTutup, onSimpan }) {
  const [tidakLayak, setTidakLayak] = useState(new Set(tidakLayakSet))
  const [carian, setCarian] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  const disenarai = senaraiAhliAktif.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))

  function togol(id) {
    setTidakLayak((s) => {
      const baru = new Set(s)
      if (baru.has(id)) baru.delete(id)
      else baru.add(id)
      return baru
    })
  }

  async function simpan() {
    setMenyimpan(true)
    try {
      await onSimpan([...tidakLayak])
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col" style={{ height: '100dvh' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h3 className="text-sm font-bold text-ink">Pengecualian Calon</h3>
        <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
      </div>
      <div className="p-3 border-b border-border shrink-0 space-y-2">
        <p className="text-xs text-inkmuted">LALAI semua ahli aktif LAYAK dicalonkan semua jawatan. Tandakan HANYA ahli yang TAK LAYAK bertanding sesi ni (cth. baru sahaja jadi AJK).</p>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input type="text" value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama…" className="w-full h-10 pl-9 pr-3 rounded-card border border-border bg-base text-sm" />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
        {disenarai.length === 0 ? (
          <p className="text-sm text-inkmuted text-center py-4">Tiada padanan.</p>
        ) : (
          disenarai.map((a) => (
            <button key={a.id} type="button" onClick={() => togol(a.id)} className="w-full flex items-center gap-2.5 p-2.5 rounded-card border border-border text-left">
              {tidakLayak.has(a.id) ? <CheckSquare size={18} className="text-brand-red shrink-0" /> : <Square size={18} className="text-inkmuted shrink-0" />}
              <span className="text-sm font-medium text-ink truncate">{a.nama}</span>
              {tidakLayak.has(a.id) && <span className="text-[10px] text-brand-red ml-auto shrink-0">Tak Layak</span>}
            </button>
          ))
        )}
      </div>
      <div className="p-3 border-t border-border shrink-0">
        <button onClick={simpan} disabled={menyimpan} className="w-full h-11 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : `Simpan (${tidakLayak.size} tak layak)`}
        </button>
      </div>
    </div>
  )
}

// Edit tetapan sesi (bilangan kerusi AJK KKGS) - HANYA boleh diubah
// SEBELUM pusingan pertama bermula (sama sebab macam Pengecualian
// Calon - elak ubah "peraturan permainan" pertengahan pilihan raya).
function ModalTetapanSesi({ open, bilanganKerusiAjkSemasa, onTutup, onSimpan }) {
  const [bilanganKerusiAjk, setBilanganKerusiAjk] = useState(bilanganKerusiAjkSemasa)
  const [menyimpan, setMenyimpan] = useState(false)

  if (!open) return null

  async function simpan() {
    setMenyimpan(true)
    try {
      await onSimpan({ bilanganKerusiAjk })
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface rounded-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Edit Tetapan Sesi</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted"><X size={18} /></button>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Bilangan Kerusi AJK KKGS</label>
          <input type="number" min={1} value={bilanganKerusiAjk} onChange={(e) => setBilanganKerusiAjk(Number(e.target.value))} className="w-full h-11 px-3 rounded-card border border-border bg-base text-sm" />
          {bilanganKerusiAjk < 1 && <p className="text-[10px] text-brand-red mt-1">Mesti sekurang-kurangnya 1 kerusi.</p>}
        </div>
        <button onClick={simpan} disabled={menyimpan || bilanganKerusiAjk < 1} className="w-full h-11 mt-4 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

// Jam undur LIVE - kira baki masa client-side terus dari
// pusinganTamatPada (millis tersimpan di dokumen sesi) - TIADA cron/
// Cloud Function perlu, setiap peranti kira sendiri dari wall-clock
// dia. Bila tamat, cuma papar amaran visual - PENUTUPAN sebenar tetap
// perlu admin tekan butang (elak race kalau > 1 admin buka skrin sama).
// Ambang "kritikal" (saat) - bila baki masa masuk zon ni, jam pulse +
// warna beralih ke amaran supaya orang yang leka/berbual tak terlepas
// (aduan tester: "saya leka borak, tersedar dah 0:03 baki").
const AMBANG_KRITIKAL_SAAT = 10

function JamUndur({ tamatPada }) {
  const [kini, setKini] = useState(Date.now())
  const sudahGetar = useRef(false)
  useEffect(() => {
    const t = setInterval(() => setKini(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const bakiSaat = Math.max(0, Math.ceil(((tamatPada ?? 0) - kini) / 1000))
  const tamat = bakiSaat <= 0
  const kritikal = !tamat && bakiSaat <= AMBANG_KRITIKAL_SAAT
  const minit = Math.floor(bakiSaat / 60)
  const saat = bakiSaat % 60

  // Getar SEKALI sahaja bila masuk zon kritikal (peranti yang sokong
  // sahaja - navigator.vibrate tiada kesan/ralat kalau tak disokong).
  useEffect(() => {
    if (kritikal && !sudahGetar.current) {
      sudahGetar.current = true
      try { navigator.vibrate?.(200) } catch { /* abaikan - bukan kritikal untuk fungsi undi */ }
    }
    if (!kritikal) sudahGetar.current = false
  }, [kritikal])

  return (
    <div className={`text-center py-3 mb-3 rounded-card ${tamat ? 'bg-[#FDEAEA]' : kritikal ? 'bg-[#FDEAEA] animate-pulse' : 'bg-base'}`}>
      <p className={`text-3xl font-extrabold tabular-nums ${tamat || kritikal ? 'text-brand-red' : 'text-ink'}`}>{minit}:{String(saat).padStart(2, '0')}</p>
      <p className="text-[10px] text-inkmuted mt-0.5">{tamat ? 'Masa tamat - tunggu admin tutup pusingan ni' : kritikal ? '⚠️ Masa hampir tamat - hantar undian SEKARANG!' : 'Baki masa pusingan ini'}</p>
    </div>
  )
}

// SATU race jawatan SATU orang - radio pilih SATU calon.
function RaceSatuOrang({ jawatan, calon, nilai, onPilih }) {
  const [carian, setCarian] = useState('')
  const disenarai = calon.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))
  return (
    <div className="p-3.5 rounded-card border border-border bg-surface mb-2.5">
      <p className="text-sm font-bold text-ink mb-1 flex items-center gap-1.5"><Radio size={14} className="text-brand-red" /> {jawatan}</p>
      <p className="text-[10px] text-inkmuted mb-2.5">Susunan calon rawak untuk setiap pengundi (elak bias pilih nama teratas sahaja).</p>
      {calon.length > 5 && (
        <div className="relative mb-2.5">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input type="text" value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama calon…" className="w-full h-9 pl-8 pr-3 rounded-card border border-border bg-base text-xs" />
        </div>
      )}
      <div className="space-y-1.5">
        {calon.length === 0 ? (
          <p className="text-xs text-inkmuted">Tiada calon layak tinggal untuk jawatan ni.</p>
        ) : disenarai.length === 0 ? (
          <p className="text-xs text-inkmuted">Tiada calon sepadan carian.</p>
        ) : disenarai.map((a) => (
          <label key={a.id} className={`flex items-center gap-2.5 p-2.5 rounded-card border text-sm cursor-pointer ${nilai === a.id ? 'border-brand-red bg-[#FDEAEA]' : 'border-border'}`}>
            <input type="radio" name={jawatan} checked={nilai === a.id} onChange={() => onPilih(a.id)} className="h-4 w-4 shrink-0" />
            <span className="text-ink">{a.nama}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Race AJK KKGS - checkbox, MAX bilanganKerusiAjk calon.
function RaceAjk({ calon, nilai, maksimum, onTogol }) {
  const [carian, setCarian] = useState('')
  const disenarai = calon.filter((a) => a.nama.toLowerCase().includes(carian.toLowerCase()))
  return (
    <div className="p-3.5 rounded-card border border-border bg-surface mb-2.5">
      <p className="text-sm font-bold text-ink mb-1 flex items-center gap-1.5"><Vote size={14} className="text-brand-red" /> {JAWATAN_AJK_PILIHAN_RAYA}</p>
      <p className="text-[10px] text-inkmuted mb-1">Susunan calon rawak untuk setiap pengundi (elak bias pilih nama teratas sahaja).</p>
      {/* Sticky - senarai calon AJK KKGS boleh panjang (sehingga 10 nama
          lebih), counter ni kekal kelihatan semasa scroll supaya staff
          tak perlu scroll balik atas untuk tengok baki boleh pilih. */}
      <p className="text-[11px] font-semibold text-ink mb-2.5 sticky top-2 z-10 bg-surface py-1 -mx-1 px-1 rounded">Pilih SEHINGGA {maksimum} calon ({nilai.length}/{maksimum} dipilih).</p>
      {calon.length > 5 && (
        <div className="relative mb-2.5">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input type="text" value={carian} onChange={(e) => setCarian(e.target.value)} placeholder="Cari nama calon…" className="w-full h-9 pl-8 pr-3 rounded-card border border-border bg-base text-xs" />
        </div>
      )}
      <div className="space-y-1.5">
        {disenarai.length === 0 && <p className="text-xs text-inkmuted">Tiada calon sepadan carian.</p>}
        {disenarai.map((a) => {
          const dipilih = nilai.includes(a.id)
          const tersekat = !dipilih && nilai.length >= maksimum
          return (
            <label key={a.id} className={`flex items-center gap-2.5 p-2.5 rounded-card border text-sm cursor-pointer ${dipilih ? 'border-brand-red bg-[#FDEAEA]' : 'border-border'} ${tersekat ? 'opacity-60' : ''}`}>
              <input type="checkbox" checked={dipilih} disabled={tersekat} onChange={() => onTogol(a.id)} className="h-4 w-4 shrink-0" />
              <span className="text-ink">{a.nama}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// Papar tally SATU race (dokumen mentah {calonId, jumlah}).
// jumlahLayakUndi (pilihan) - jumlah TOTAL staff aktif yang layak undi -
// bagi admin nisbah "berapa % dah undi" berbanding cuma jumlah mentah
// (tester: "susah nak agak bila elok tutup pusingan awal drpd timer
// habis, kalau cuma nampak nombor kasar").
function BarisTally({ jawatan, keputusan, jumlahPengundi, kerusi, cariNama, live, jumlahLayakUndi }) {
  const maksUndi = Math.max(1, ...keputusan.map((k) => k.jumlah))
  const peratus = jumlahLayakUndi > 0 ? Math.min(100, Math.round((jumlahPengundi / jumlahLayakUndi) * 100)) : null
  return (
    <div className="p-3.5 rounded-card border border-border bg-surface mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-ink">{jawatan}</p>
        <span className="text-[10px] text-inkmuted flex items-center gap-1">
          {live && <span className="h-1.5 w-1.5 rounded-full bg-[#0F6E56] animate-pulse" />}
          {jumlahLayakUndi > 0 ? `${jumlahPengundi}/${jumlahLayakUndi} staff dah undi (${peratus}%)` : `${jumlahPengundi} undi masuk`}
        </span>
      </div>
      {jumlahLayakUndi > 0 && (
        <div className="h-1.5 rounded-full bg-base overflow-hidden mb-2">
          <div className="h-full rounded-full bg-[#0F6E56]" style={{ width: `${peratus}%` }} />
        </div>
      )}
      {keputusan.length === 0 ? (
        <p className="text-xs text-inkmuted">Belum ada undi masuk.</p>
      ) : (
        <div className="space-y-1.5">
          {keputusan.map((k, i) => {
            const menang = i < kerusi
            return (
              <div key={k.calonId}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className={`font-medium ${menang ? 'text-ink' : 'text-inkmuted'}`}>{menang && <Trophy size={11} className="inline mr-1 text-[#D4A017]" />}{cariNama(k.calonId)}</span>
                  <span className="font-bold text-ink">{k.jumlah}</span>
                </div>
                <div className="h-2 rounded-full bg-base overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(k.jumlah / maksUndi) * 100}%`, backgroundColor: menang ? '#0F6E56' : '#C9C9C9' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PanelTallyLive({ pilihanRayaId, jawatan, kerusi, cariNama, jumlahLayakUndi }) {
  const { keputusan, jumlahPengundi, loading } = useTalliLive(pilihanRayaId, jawatan, true)
  if (loading) return <p className="text-xs text-inkmuted mb-2.5">Memuatkan tally {jawatan}…</p>
  return <BarisTally jawatan={jawatan} keputusan={keputusan} jumlahPengundi={jumlahPengundi} kerusi={kerusi} cariNama={cariNama} live jumlahLayakUndi={jumlahLayakUndi} />
}

// Panel pecah seri - keluar GANTI butang "Tutup Pusingan" biasa bila
// cariSeriPadaGarisan() jumpa seri TEPAT pada garis potong kerusi.
// Sistem TAK auto-pilih (dulu ikut urutan Object.entries semata-mata -
// nampak macam pilih orang PERTAMA walhal cuma kebetulan urutan data,
// BUKAN keputusan sengaja/adil) - admin WAJIB pilih manual (cabutan
// undi / suara mesyuarat) sebelum pusingan boleh ditutup.
function PanelPecahSeri({ calonSeri, kerusiBaki, cariNama, onSahkan, menyimpan }) {
  const [pilih, setPilih] = useState([])

  function togol(id) {
    setPilih((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id)
      if (kerusiBaki === 1) return [id] // 1 kerusi dipertikaikan - kelakuan macam radio (pilih gantikan)
      if (s.length >= kerusiBaki) return s
      return [...s, id]
    })
  }

  return (
    <div className="rounded-card border-2 border-brand-red bg-[#FDEAEA] p-4 space-y-2.5">
      <p className="text-sm font-bold text-brand-red">⚠️ Seri Undi - Perlu Diselesaikan Manual</p>
      <p className="text-xs text-ink">{calonSeri.length} calon seri tepat undi ({calonSeri[0].undi} undi setiap satu) untuk {kerusiBaki} kerusi yang tinggal. Sistem TAK boleh pilih automatik secara adil dalam keadaan ni - admin perlu putuskan secara manual (cth. cabutan undi / suara terbuka mesyuarat) sebelum pusingan ni boleh ditutup.</p>
      <div className="space-y-1.5">
        {calonSeri.map((c) => (
          <label key={c.calonId} className={`flex items-center justify-between gap-2.5 p-2.5 rounded-card border text-sm cursor-pointer bg-white ${pilih.includes(c.calonId) ? 'border-brand-red' : 'border-border'}`}>
            <span className="flex items-center gap-2.5">
              <input type={kerusiBaki === 1 ? 'radio' : 'checkbox'} checked={pilih.includes(c.calonId)} onChange={() => togol(c.calonId)} className="h-4 w-4 shrink-0" />
              <span className="text-ink">{cariNama(c.calonId)}</span>
            </span>
            <span className="text-xs font-bold text-inkmuted">{c.undi} undi</span>
          </label>
        ))}
      </div>
      <button onClick={() => onSahkan(pilih)} disabled={menyimpan || pilih.length !== kerusiBaki} className="w-full h-10 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60">
        {menyimpan ? 'Menyimpan…' : `Sahkan Keputusan (${pilih.length}/${kerusiBaki} dipilih) & Tutup Pusingan`}
      </button>
    </div>
  )
}

// Keputusan diumumkan SETAKAT NI - BERPERINGKAT (bertambah pusingan
// demi pusingan, bukan sekali gus hujung sesi) - telus untuk SEMUA
// staff (bukan admin sahaja), dari medan sesi.pemenang terus (bukan
// baca undian mentah - kekal sulit selamanya).
function PapanPemenang({ pemenang, cariNama }) {
  const jawatanDiumum = JAWATAN_URUTAN_PILIHAN_RAYA.filter((j) => pemenang[j] !== undefined)
  if (jawatanDiumum.length === 0) return null
  return (
    <div className="mb-5">
      <p className="text-sm font-bold text-ink mb-2.5">Keputusan Diumumkan Setakat Ini</p>
      <div className="space-y-2">
        {jawatanDiumum.map((j) => {
          const nilai = pemenang[j]
          // nilai === null bermaksud jawatan SATU orang ditutup TANPA
          // sesiapa dapat undi (bukan array kosong macam AJK KKGS) -
          // kena jadikan senarai kosong eksplisit, bukan [null], supaya
          // tak papar "🏆 (ahli dipadam)" secara salah untuk kes ni.
          const senaraiId = nilai === null ? [] : (Array.isArray(nilai) ? nilai : [nilai])
          return (
            <div key={j} className="p-3 rounded-card border border-[#0F6E56]/30 bg-[#E1F5EE]">
              <p className="text-xs font-bold text-[#0F6E56] uppercase tracking-wide mb-1">{j}</p>
              {senaraiId.length === 0 ? (
                <p className="text-xs text-[#0F6E56]">Tiada calon dapat undi.</p>
              ) : (
                senaraiId.map((id) => (
                  <p key={id} className="text-sm font-semibold text-ink flex items-center gap-1.5"><Trophy size={13} className="text-[#D4A017]" /> {cariNama(id)}</p>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Pilihan Raya KKGS - undian jawatankuasa setiap 2 tahun (KECUALI
// Penasihat, disandang Guru Besar). Undian LIVE, SATU jawatan SATU
// pusingan pada satu masa (bukan semua jawatan sekali gus) - admin
// projek skrin tally, staff undi dari telefon masing-masing dalam
// tempoh masa (timer, boleh admin set setiap pusingan). Pemenang
// pusingan awal AUTOMATIK hilang dari senarai calon pusingan seterusnya
// (elak nama sama menang > 1 jawatan). Draf -> Berjalan (pusingan demi
// pusingan) -> Selesai (semua 6 pusingan tamat, keputusan penuh
// diterbitkan). Lantikan SEBENAR (kemaskini jawatan di kkgsAhli) kekal
// MANUAL di page Jawatankuasa - sesi ni cuma jalankan & terbitkan
// keputusan undian.
export default function PilihanRayaKKGS() {
  const { user } = useOutletContext()
  const { konfirm, amaran } = useDialog()
  const { adaSeksyen } = useIsAdmin(user)
  const bolehUrus = adaSeksyen('kkgs')
  const { senarai: senaraiAhli, loading: loadingAhli } = useKkgsAhliSenarai()
  const { senarai: senaraiSesi, loading: loadingSesi, muatSemula: muatSemulaSesi } = useKkgsPilihanRayaSenarai()
  const [sesiId, setSesiId] = useState(null)
  const [tunjukSesiBaharu, setTunjukSesiBaharu] = useState(false)
  const [tunjukTidakLayak, setTunjukTidakLayak] = useState(false)
  const [tunjukTetapanSesi, setTunjukTetapanSesi] = useState(false)
  const [tempohInput, setTempohInput] = useState(TEMPOH_UNDI_LALAI_SAAT)
  const [memulakan, setMemulakan] = useState(false)
  const [menutup, setMenutup] = useState(false)
  const [membuka, setMembuka] = useState(false)
  const [pilihanSatu, setPilihanSatu] = useState('')
  const [pilihanAjk, setPilihanAjk] = useState([])
  const [menghantar, setMenghantar] = useState(false)
  const [ralatUndi, setRalatUndi] = useState(null)
  const [seriPusingan, setSeriPusingan] = useState(null)
  const [dataCetak, setDataCetak] = useCetak((d) => `Keputusan Pilihan Raya KKGS ${d.tahun}`)

  const sesi = senaraiSesi.find((s) => s.id === sesiId) ?? senaraiSesi[0] ?? null
  const { jawatanSudahUndi, loading: loadingUndiSaya, muatSemula: muatSemulaUndiSaya } = useUndianSaya(sesi?.id, user.uid)

  const pusinganIndeks = sesi?.pusinganIndeks ?? -1
  const jawatanSemasa = pusinganIndeks >= 0 ? JAWATAN_URUTAN_PILIHAN_RAYA[pusinganIndeks] : null
  const adalahPusinganAjk = jawatanSemasa === JAWATAN_AJK_PILIHAN_RAYA
  const pusinganTerakhir = pusinganIndeks === JAWATAN_URUTAN_PILIHAN_RAYA.length - 1

  // Reset pilihan borang bila pusingan bertukar (elak pilihan pusingan
  // LAMA "melekat" bila pusingan BAHARU dibuka).
  useEffect(() => {
    setPilihanSatu('')
    setPilihanAjk([])
    setRalatUndi(null)
    setSeriPusingan(null)
  }, [jawatanSemasa])

  const senaraiAhliAktif = senaraiAhli.filter((a) => a.statusKeahlian === 'aktif')
  const calonLayak = senaraiAhliAktif.filter((a) => !(sesi?.tidakLayak ?? []).includes(a.id))
  // Pemenang pusingan SEBELUM ni (semua jawatan yang dah diumum setakat
  // ni) - dikeluarkan dari senarai calon pusingan SEMASA - INILAH fix
  // "nama sama menang > 1 jawatan sebab orang suka undi nama tu".
  const pemenangSetakatIni = new Set(Object.values(sesi?.pemenang ?? {}).flatMap((v) => (Array.isArray(v) ? v : [v])))
  const calonPusinganIni = calonLayak.filter((a) => !pemenangSetakatIni.has(a.id))
  // Susunan calon DIRAWAKKAN untuk borang undian sahaja (bukan panel
  // admin/tidakLayak/laporan - kekal tersusun ikut nama/undi macam
  // biasa). Seed dari (uid pengundi + jawatan semasa) - lihat kocokCalon()
  // - setiap pengundi nampak turutan BERBEZA (elak bias "pilih atas
  // sahaja"), tapi turutan tu KEKAL SAMA untuk pengundi ni sepanjang
  // pusingan ni (tak "bergerak-gerak" bila skrin refresh).
  const calonUndianDirawak = useMemo(
    () => kocokCalon(calonPusinganIni, `${user.uid}_${jawatanSemasa ?? ''}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jawatanSemasa, user.uid, calonPusinganIni.map((a) => a.id).join(',')],
  )

  function cariNama(ahliId) {
    return senaraiAhli.find((a) => a.id === ahliId)?.nama ?? '(ahli dipadam)'
  }

  async function ciptaSesi({ tahun, bilanganKerusiAjk }) {
    const id = await ciptaPilihanRaya({ tahun, bilanganKerusiAjk }, user.uid)
    setTunjukSesiBaharu(false)
    await muatSemulaSesi()
    setSesiId(id)
  }

  async function simpanTidakLayak(idSenarai) {
    await kemaskiniTidakLayakPilihanRaya(sesi.id, idSenarai, user.uid)
    setTunjukTidakLayak(false)
    muatSemulaSesi()
  }

  async function simpanTetapanSesi(data) {
    await kemaskiniTetapanPilihanRaya(sesi.id, data, user.uid)
    setTunjukTetapanSesi(false)
    muatSemulaSesi()
  }

  async function mulaPusinganSeterusnya() {
    const indeksBaru = pusinganIndeks + 1
    const jawatanBaru = JAWATAN_URUTAN_PILIHAN_RAYA[indeksBaru]
    // Pengawal - elak admin buka pusingan yang mustahil ada pemenang
    // (semua calon dah menang jawatan awal / ditandakan tak layak, atau
    // AJK KKGS disetkan 0 kerusi) - buang masa timer untuk race kosong.
    if (calonPusinganIni.length === 0) {
      await amaran(`Tiada calon layak tinggal untuk jawatan "${jawatanBaru}" - semua calon dah menang jawatan lain atau ditandakan tak layak. Pusingan ni tak boleh dibuka.`, { bahaya: true })
      return
    }
    if (jawatanBaru === JAWATAN_AJK_PILIHAN_RAYA && (sesi.bilanganKerusiAjk ?? 0) < 1) {
      await amaran(`Bilangan kerusi ${JAWATAN_AJK_PILIHAN_RAYA} disetkan 0 - sila kemaskini "Edit Tetapan" dahulu sebelum buka pusingan ni.`, { bahaya: true })
      return
    }
    if (!(await konfirm(`Mula pusingan "${jawatanBaru}" - tempoh ${tempohInput} saat? Staff boleh mula undi serta-merta.`))) return
    setMemulakan(true)
    try {
      await mulakanPusingan(sesi.id, { indeks: indeksBaru, jawatan: jawatanBaru, tempohSaat: tempohInput }, user.uid)
      muatSemulaSesi()
    } finally {
      setMemulakan(false)
    }
  }

  async function tutupPusinganSemasa() {
    setMenutup(true)
    try {
      const tally = await kiraTallyPusingan(sesi.id, jawatanSemasa)
      const kerusi = adalahPusinganAjk ? sesi.bilanganKerusiAjk : 1
      // Seri TEPAT pada garis potong kerusi - JANGAN auto-pilih (dulu
      // ikut urutan Object.entries semata-mata, nampak macam "pilih
      // orang pertama" walhal cuma kebetulan urutan data masuk, BUKAN
      // keputusan sengaja/adil). Papar panel pecah seri, JANGAN tutup
      // pusingan lagi sehingga admin selesaikan manual.
      const calonSeri = cariSeriPadaGarisan(tally, kerusi)
      if (calonSeri) {
        const kerusiSudahPasti = tally.filter((t) => t.undi > calonSeri[0].undi).length
        setSeriPusingan({ tally, calonSeri, kerusiBaki: kerusi - kerusiSudahPasti })
        return
      }
      if (!(await konfirm(`Tutup pusingan "${jawatanSemasa}" & umum pemenang sekarang? Staff TAK BOLEH undi jawatan ni lagi lepas ni.`, { bahaya: true }))) return
      const pemenangBaru = adalahPusinganAjk
        ? tally.filter((t) => t.undi > 0).slice(0, sesi.bilanganKerusiAjk).map((t) => t.calonId)
        : (tally[0]?.calonId ?? null)
      await tutupPusingan(sesi.id, { jawatan: jawatanSemasa, pemenangBaru, butiran: tally, selesaiSesi: pusinganTerakhir }, user.uid)
      muatSemulaSesi()
    } finally {
      setMenutup(false)
    }
  }

  // Admin dah pilih manual pemenang di antara calon yang seri (cabutan
  // undi / suara mesyuarat, di luar sistem ni) - gabungkan dengan calon
  // yang MEMANG dah pasti menang (undi lebih tinggi drpd garis seri),
  // pastu baru tutup pusingan macam biasa.
  async function selesaikanSeri(idTerpilihDaripadaSeri) {
    const { tally, calonSeri } = seriPusingan
    const menangSudahPasti = tally.filter((t) => t.undi > calonSeri[0].undi).map((t) => t.calonId)
    const pemenangBaru = adalahPusinganAjk
      ? [...menangSudahPasti, ...idTerpilihDaripadaSeri]
      : (idTerpilihDaripadaSeri[0] ?? null)
    setMenutup(true)
    try {
      await tutupPusingan(sesi.id, { jawatan: jawatanSemasa, pemenangBaru, butiran: tally, selesaiSesi: pusinganTerakhir }, user.uid)
      setSeriPusingan(null)
      muatSemulaSesi()
    } finally {
      setMenutup(false)
    }
  }

  // Pembetulan - buka SEMULA pusingan yang BARU SAHAJA ditutup (cth.
  // admin tersilap tekan tutup awal). HANYA dibenarkan sisi UI kalau
  // pusingan SETERUSNYA belum dibuka (pusinganStatus masih 'ditutup'
  // untuk pusingan SEMASA ni, bukan sesi dah beralih ke jawatan lain).
  async function bukaSemulaPusinganSemasa() {
    const amaran = sesi.status === 'selesai'
      ? `⚠️ Sesi ${sesi.tahun} ni DAH RASMI SELESAI. Buka semula pusingan "${jawatanSemasa}" akan batalkan status "Selesai" & keputusan pusingan terakhir ni - PASTIKAN belum ada lantikan sebenar dibuat di page Jawatankuasa berdasarkan keputusan ni. Teruskan?`
      : `Buka semula pusingan "${jawatanSemasa}"? Keputusan yang baru diumum untuk jawatan ni akan DIBATALKAN, staff boleh undi lagi.`
    if (!(await konfirm(amaran, { bahaya: true }))) return
    setMembuka(true)
    try {
      await bukaSemulaPusingan(sesi.id, jawatanSemasa, tempohInput, user.uid)
      muatSemulaSesi()
    } finally {
      setMembuka(false)
    }
  }

  // Padam sesi - dibenarkan admin BILA-BILA peringkat, amaran makin
  // tegas kalau dah ada kemajuan sebenar (undi/keputusan) supaya tak
  // padam data sebenar secara tak sengaja.
  async function padamSesi() {
    const adaKemajuan = pusinganIndeks > -1
    const amaran = adaKemajuan
      ? `⚠️ Sesi ${sesi.tahun} ni DAH ADA undian/keputusan sebenar direkodkan. Padam sesi ni akan hilangkan SEMUA keputusan yang dah diumum (undian mentah kekal dalam pangkalan data tapi tak boleh diakses lagi). Teruskan?`
      : `Padam sesi draf ${sesi.tahun}? Tindakan tak boleh dibatalkan.`
    if (!(await konfirm(amaran, { bahaya: true }))) return
    await padamPilihanRaya(sesi.id)
    setSesiId(null)
    muatSemulaSesi()
  }

  function cetakKeputusan() {
    setDataCetak({
      tahun: sesi.tahun,
      status: sesi.status,
      bilanganKerusiAjk: sesi.bilanganKerusiAjk,
      pemenang: sesi.pemenang ?? {},
      butiranPusingan: sesi.butiranPusingan ?? {},
      cariNama,
    })
  }

  function togolAjk(id) {
    setPilihanAjk((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id)
      if (s.length >= sesi.bilanganKerusiAjk) return s
      return [...s, id]
    })
  }

  async function hantar() {
    setRalatUndi(null)
    const calonIds = adalahPusinganAjk ? pilihanAjk : (pilihanSatu ? [pilihanSatu] : [])
    if (calonIds.length === 0) return setRalatUndi(adalahPusinganAjk ? `Sila pilih sekurang-kurangnya 1 calon ${JAWATAN_AJK_PILIHAN_RAYA}.` : 'Sila pilih calon dahulu.')

    // Skrin sahkan sebelum hantar - undian ni MUKTAMAD & tak boleh
    // ubah/batal lepas dihantar, jadi tunjuk balik nama calon dipilih
    // supaya staff pasti sebelum tekan (elak "tersalah tekan").
    const namaDipilih = calonIds.map((id) => cariNama(id)).join(', ')
    if (!(await konfirm(`Sahkan undian anda untuk "${jawatanSemasa}":\n\n${namaDipilih}\n\nSelepas dihantar, undian TAK BOLEH diubah atau dibatalkan. Teruskan?`))) return

    setMenghantar(true)
    try {
      await hantarUndianPusingan(sesi.id, jawatanSemasa, calonIds, user.uid)
      muatSemulaUndiSaya()
    } catch (err) {
      // firestore.rules tolak SEMUA sebab kegagalan (dah undi / pusingan
      // baru ditutup / bukan pusingan semasa lagi) dengan kod generic
      // sama ("permission-denied") - kita tak boleh tahu punca SEBENAR
      // dari kod ralat sahaja. Jadi kita terangkan DUA kemungkinan
      // sebenar (bukan mesej generic tak bermakna) DAN muat semula
      // status terkini serta-merta supaya skrin betulkan diri sendiri
      // (borang akan hilang & papar "sudah undi" kalau itu puncanya).
      setRalatUndi('Gagal hantar undian. Kemungkinan sebab: (1) anda sudah pun mengundi jawatan ini dari peranti/tab lain, atau (2) pusingan ini baru sahaja ditutup oleh admin. Skrin dikemas kini - sila semak status terkini di atas.')
      muatSemulaUndiSaya()
      muatSemulaSesi()
    } finally {
      setMenghantar(false)
    }
  }

  if (loadingAhli || loadingSesi) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  const sudahUndiPusinganIni = jawatanSemasa && jawatanSudahUndi.has(jawatanSemasa)

  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">Undian Jawatankuasa KKGS setiap 2 tahun - LIVE, satu jawatan satu pusingan (ikut timer) - semua jawatan KECUALI Penasihat (disandang Guru Besar).</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={sesi?.id ?? ''} onChange={(e) => setSesiId(e.target.value)} className="h-11 px-3 rounded-card border border-border bg-surface text-sm">
          {senaraiSesi.length === 0 && <option value="">Tiada sesi lagi</option>}
          {senaraiSesi.map((s) => <option key={s.id} value={s.id}>Pilihan Raya {s.tahun} - {labelStatusPilihanRaya(s.status)}</option>)}
        </select>
        {bolehUrus && (
          <button onClick={() => setTunjukSesiBaharu(true)} className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
            <Plus size={14} /> Sesi Baharu
          </button>
        )}
        {/* Buka page "Paparan" (read-only, tiada butang admin) di tab
            baharu - untuk disambung ke TV/projektor semasa mesyuarat.
            Kawalan sebenar (buka/tutup pusingan) tetap di page ni juga,
            biasanya dari telefon admin yang berasingan drpd laptop TV. */}
        <Link to="/kkgs/pilihan-raya/paparan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 h-10 px-3 rounded-card border border-border text-xs font-semibold text-ink">
          <MonitorPlay size={14} /> Buka Paparan TV/Projektor
        </Link>
      </div>

      {!sesi ? (
        <p className="text-sm text-inkmuted">Belum ada sesi Pilihan Raya direkodkan. {bolehUrus && 'Tekan "Sesi Baharu" untuk mula.'}</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: WarnaStatusSesi(sesi.status).bg, color: WarnaStatusSesi(sesi.status).teks }}>{labelStatusPilihanRaya(sesi.status)}</span>
            {jawatanSemasa && (
              <span className="text-xs text-inkmuted">Pusingan {pusinganIndeks + 1}/{JAWATAN_URUTAN_PILIHAN_RAYA.length}: <strong className="text-ink">{jawatanSemasa}</strong> ({sesi.pusinganStatus === 'berjalan' ? 'Sedang Berjalan' : 'Ditutup'})</span>
            )}
            {Object.keys(sesi.pemenang ?? {}).length > 0 && (
              <button onClick={cetakKeputusan} className="ml-auto flex items-center gap-1.5 h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink">
                <Printer size={13} /> Cetak / PDF Keputusan
              </button>
            )}
          </div>

          {/* ADMIN - panel urus sesi */}
          {bolehUrus && (
            <div className="rounded-card border border-border bg-base p-4 mb-5">
              <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-3">Urus Sesi (Admin)</p>

              {pusinganIndeks === -1 && (
                <div className="space-y-2">
                  <p className="text-xs text-inkmuted">{(sesi.tidakLayak ?? []).length} ahli ditandakan TAK LAYAK bertanding sesi ni.</p>
                  <div className="flex items-end gap-2 flex-wrap">
                    <div>
                      <label className="block text-[10px] font-medium text-inkmuted mb-1">Tempoh pusingan (saat)</label>
                      <input type="number" min={10} value={tempohInput} onChange={(e) => setTempohInput(Number(e.target.value))} className="w-24 h-9 px-2 rounded-card border border-border bg-surface text-sm" />
                    </div>
                    <button onClick={mulaPusinganSeterusnya} disabled={memulakan} className="h-9 px-3 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60 flex items-center gap-1.5">
                      <PlayCircle size={14} /> {memulakan ? 'Memulakan…' : `Mula Pusingan Pertama: ${JAWATAN_URUTAN_PILIHAN_RAYA[0]}`}
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button onClick={() => setTunjukTidakLayak(true)} className="h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink">Urus Pengecualian Calon</button>
                    <button onClick={() => setTunjukTetapanSesi(true)} className="h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink flex items-center gap-1"><Settings size={13} /> Edit Tetapan</button>
                    <button onClick={padamSesi} className="h-9 px-3 rounded-card border border-brand-red text-brand-red text-xs font-semibold flex items-center gap-1"><Trash2 size={13} /> Padam Sesi</button>
                  </div>
                </div>
              )}

              {pusinganIndeks >= 0 && sesi.pusinganStatus === 'berjalan' && (
                <div className="space-y-3">
                  <p className="text-xs text-inkmuted flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#0F6E56] animate-pulse" /> Pusingan "{jawatanSemasa}" sedang berjalan - tally LIVE di bawah, kemas kini automatik bila undi masuk.</p>
                  <JamUndur tamatPada={sesi.pusinganTamatPada} />
                  <PanelTallyLive pilihanRayaId={sesi.id} jawatan={jawatanSemasa} kerusi={adalahPusinganAjk ? sesi.bilanganKerusiAjk : 1} cariNama={cariNama} jumlahLayakUndi={senaraiAhliAktif.length} />
                  {seriPusingan ? (
                    <PanelPecahSeri calonSeri={seriPusingan.calonSeri} kerusiBaki={seriPusingan.kerusiBaki} cariNama={cariNama} onSahkan={selesaikanSeri} menyimpan={menutup} />
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={tutupPusinganSemasa} disabled={menutup} className="h-10 px-4 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60 flex items-center gap-1.5"><Lock size={13} /> {menutup ? 'Menyemak…' : `Tutup Pusingan "${jawatanSemasa}" & Umum Pemenang`}</button>
                      <button onClick={padamSesi} className="h-10 px-3 rounded-card border border-brand-red text-brand-red text-xs font-semibold flex items-center gap-1"><Trash2 size={13} /> Padam Sesi</button>
                    </div>
                  )}
                </div>
              )}

              {/* PENTING: sesi.status === 'selesai' disemak DAHULU (else-if
                  keluar sepenuhnya lepas ni) - pusinganStatus pusingan
                  TERAKHIR kekal 'ditutup' buat selama-lamanya (medan ni
                  tak berubah lepas sesi tamat), jadi kalau blok "ditutup"
                  di bawah tak disekat status !== 'selesai', DUA-DUA panel
                  ni akan keluar SERENTAK lepas sesi selesai (bug lama -
                  "Buka Semula" tersangkut kekal muncul walaupun sesi dah
                  rasmi tamat & mungkin dah dilantik manual). */}
              {sesi.status === 'selesai' ? (
                <div className="space-y-2">
                  <p className="text-xs text-inkmuted">Sesi ni dah SELESAI sepenuhnya (semua {JAWATAN_URUTAN_PILIHAN_RAYA.length} pusingan ditutup) - keputusan muktamad di bawah. Lantikan sebenar ke Jawatankuasa KKGS perlu dibuat MANUAL di page Jawatankuasa.</p>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button onClick={bukaSemulaPusinganSemasa} disabled={membuka} className="h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink disabled:opacity-60 flex items-center gap-1.5">
                      <RotateCcw size={13} /> {membuka ? 'Membuka…' : `Buka Semula Pusingan "${jawatanSemasa}" (Pembetulan)`}
                    </button>
                    <button onClick={padamSesi} className="h-9 px-3 rounded-card border border-brand-red text-brand-red text-xs font-semibold flex items-center gap-1"><Trash2 size={13} /> Padam Sesi</button>
                  </div>
                  <p className="text-[10px] text-brand-red">⚠️ Sesi ni dah SELESAI - "Buka Semula" akan batalkan status "Selesai" & keputusan pusingan terakhir. Guna HANYA kalau lantikan sebenar BELUM dibuat berdasarkan keputusan ni.</p>
                </div>
              ) : pusinganIndeks >= 0 && sesi.pusinganStatus === 'ditutup' && (
                <div className="space-y-2">
                  <p className="text-xs text-inkmuted">Pusingan "{jawatanSemasa}" dah ditutup - keputusan di bawah.{!pusinganTerakhir && ' Sedia untuk pusingan seterusnya bila-bila masa.'}</p>
                  {!pusinganTerakhir && (
                    <div className="flex items-end gap-2 flex-wrap">
                      <div>
                        <label className="block text-[10px] font-medium text-inkmuted mb-1">Tempoh pusingan seterusnya (saat)</label>
                        <input type="number" min={10} value={tempohInput} onChange={(e) => setTempohInput(Number(e.target.value))} className="w-24 h-9 px-2 rounded-card border border-border bg-surface text-sm" />
                      </div>
                      <button onClick={mulaPusinganSeterusnya} disabled={memulakan} className="h-9 px-3 rounded-card bg-brand-red text-white text-xs font-semibold disabled:opacity-60 flex items-center gap-1.5">
                        <PlayCircle size={14} /> {memulakan ? 'Memulakan…' : `Mula Pusingan Seterusnya: ${JAWATAN_URUTAN_PILIHAN_RAYA[pusinganIndeks + 1]}`}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button onClick={bukaSemulaPusinganSemasa} disabled={membuka} className="h-9 px-3 rounded-card border border-border text-xs font-semibold text-ink disabled:opacity-60 flex items-center gap-1.5">
                      <RotateCcw size={13} /> {membuka ? 'Membuka…' : `Buka Semula Pusingan "${jawatanSemasa}" (Pembetulan)`}
                    </button>
                    <button onClick={padamSesi} className="h-9 px-3 rounded-card border border-brand-red text-brand-red text-xs font-semibold flex items-center gap-1"><Trash2 size={13} /> Padam Sesi</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <PapanPemenang pemenang={sesi.pemenang ?? {}} cariNama={cariNama} />

          {/* BORANG UNDI - staff (termasuk admin sendiri), HANYA masa pusingan 'berjalan'.
              Untuk admin yang JUGA seorang pengundi, panel "Urus Sesi" di
              atas dan borang undian PERIBADI dia di sini boleh nampak
              bersambung/keliru (tester: "saya tertekan butang admin
              sedangkan niat nak undi"). Bahagian ni sengaja diberi
              pemisah + label besar supaya jelas ini dua konteks BERBEZA. */}
          {sesi.pusinganStatus === 'berjalan' && (
            <div className={bolehUrus ? 'border-t-4 border-brand-red/20 pt-5 mt-1' : ''}>
              {bolehUrus && <p className="text-[10px] font-bold text-brand-red uppercase tracking-wide mb-2">— Undian Peribadi Anda (Bukan Panel Admin) —</p>}
              <p className="text-sm font-bold text-ink mb-1 flex items-center gap-1.5"><Timer size={14} /> Undian Anda - {jawatanSemasa}</p>
              {/* Jaminan kerahsiaan ditunjuk SEBELUM staff pilih calon
                  (bukan lepas hantar sahaja) - supaya staff yakin dulu
                  sebelum tekan, bukan lega selepas fakta. */}
              {!sudahUndiPusinganIni && (
                <p className="text-[11px] text-inkmuted mb-2.5">🔒 Undian anda SULIT - tiada sesiapa (termasuk admin) boleh lihat pilihan anda secara individu, cuma jumlah keseluruhan.</p>
              )}
              <JamUndur tamatPada={sesi.pusinganTamatPada} />
              {loadingUndiSaya ? (
                <p className="text-xs text-inkmuted">Menyemak status undian anda…</p>
              ) : sudahUndiPusinganIni ? (
                <div className="rounded-card border border-[#0F6E56] bg-[#E1F5EE] p-4">
                  <p className="text-sm font-semibold text-[#0F6E56]">✓ Terima kasih, undian anda untuk "{jawatanSemasa}" dah direkodkan.</p>
                  <p className="text-xs text-[#0F6E56] mt-1">Undian anda SULIT - tiada sesiapa (termasuk admin) boleh lihat pilihan anda secara individu. Tunggu pusingan ni ditutup untuk lihat keputusan, kemudian pusingan seterusnya akan dibuka.</p>
                </div>
              ) : (
                <>
                  {adalahPusinganAjk ? (
                    <RaceAjk key={jawatanSemasa} calon={calonUndianDirawak} nilai={pilihanAjk} maksimum={sesi.bilanganKerusiAjk} onTogol={togolAjk} />
                  ) : (
                    <RaceSatuOrang key={jawatanSemasa} jawatan={jawatanSemasa} calon={calonUndianDirawak} nilai={pilihanSatu} onPilih={setPilihanSatu} />
                  )}
                  {ralatUndi && <p className="text-xs text-brand-red mb-2.5">{ralatUndi}</p>}
                  <button onClick={hantar} disabled={menghantar} className="w-full h-11 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
                    {menghantar ? 'Menghantar…' : 'Hantar Undian (Muktamad, Tak Boleh Ubah)'}
                  </button>
                </>
              )}
            </div>
          )}

          {pusinganIndeks === -1 && !bolehUrus && (
            <p className="text-sm text-inkmuted">Undian belum dibuka lagi.</p>
          )}
          {sesi.pusinganStatus === 'ditutup' && sesi.status !== 'selesai' && !bolehUrus && (
            <p className="text-sm text-inkmuted">Pusingan "{jawatanSemasa}" dah ditutup - menunggu admin buka pusingan seterusnya.</p>
          )}
        </>
      )}

      <ModalSesiBaharu open={tunjukSesiBaharu} tahunCadangan={(senaraiSesi[0]?.tahun ?? TAHUN_SEMASA - 2) + 2} onTutup={() => setTunjukSesiBaharu(false)} onSimpan={ciptaSesi} />
      {sesi && (
        <ModalTidakLayak
          open={tunjukTidakLayak}
          senaraiAhliAktif={senaraiAhliAktif}
          tidakLayakSet={new Set(sesi.tidakLayak ?? [])}
          onTutup={() => setTunjukTidakLayak(false)}
          onSimpan={simpanTidakLayak}
        />
      )}
      {sesi && (
        <ModalTetapanSesi
          open={tunjukTetapanSesi}
          bilanganKerusiAjkSemasa={sesi.bilanganKerusiAjk}
          onTutup={() => setTunjukTetapanSesi(false)}
          onSimpan={simpanTetapanSesi}
        />
      )}
      {dataCetak && <LaporanPilihanRayaKKGS {...dataCetak} />}
    </div>
  )
}
