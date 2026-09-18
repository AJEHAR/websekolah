import { useEffect, useState } from 'react'
import { Trophy, Radio, Clock, CheckCircle2 } from 'lucide-react'
import { useKkgsAhliSenarai } from '../../hooks/useKkgsAhli.js'
import { useKkgsPilihanRayaSenarai, useSesiPilihanRayaLive } from '../../hooks/useKkgsPilihanRaya.js'
import { useTalliLive } from '../../hooks/useKkgsUndian.js'
import { JAWATAN_URUTAN_PILIHAN_RAYA, JAWATAN_AJK_PILIHAN_RAYA } from './kkgsConstants.js'

// Paparan LIVE Pilihan Raya KKGS - untuk disambung ke TV/projektor semasa
// mesyuarat (bukan untuk staff biasa navigasi). SENGAJA:
//   - READ-ONLY sepenuhnya - TIADA butang admin (buka/tutup pusingan,
//     padam sesi dsb) di sini LANGSUNG, walaupun admin yang buka page ni
//     di laptop admin sendiri - elak tersalah tekan depan khalayak
//     mesyuarat. Kawalan sebenar tetap di page /kkgs/pilihan-raya biasa
//     (dari telefon admin, berasingan).
//   - SEMASA pusingan MASIH 'berjalan', kiraan per-calon SENGAJA
//     disorok (cuma "X/Y staff dah undi" dipaparkan) - elak "bandwagon
//     effect" (staff yang belum undi terpengaruh nampak nama leading di
//     projektor). Keputusan PENUH (menang + pecahan undi) baru
//     didedahkan bila pusingan tu betul-betul DITUTUP oleh admin.
//   - Guna onSnapshot LIVE (useSesiPilihanRayaLive) - skrin projektor tak
//     ada sesiapa nak tekan "refresh" bila admin buat perubahan dari
//     peranti LAIN.
export default function PaparanPilihanRayaKKGS() {
  const { senarai: senaraiAhli, loading: loadingAhli } = useKkgsAhliSenarai()
  const { senarai: senaraiSesi, loading: loadingSenarai } = useKkgsPilihanRayaSenarai()

  // Sesi "utama" untuk dipaparkan - keutamaan sesi yang MEMANG sedang
  // berjalan sekarang, jatuh balik ke sesi paling terkini (ikut tahun)
  // kalau tiada satu pun sedang berjalan (cth. selesai/draf sahaja).
  const sesiUtamaId = senaraiSesi.find((s) => s.status === 'berjalan')?.id ?? senaraiSesi[0]?.id ?? null
  const { sesi, loading: loadingSesi } = useSesiPilihanRayaLive(sesiUtamaId)

  function cariNama(ahliId) {
    return senaraiAhli.find((a) => a.id === ahliId)?.nama ?? '(ahli dipadam)'
  }

  const memuatkan = loadingAhli || loadingSenarai || (sesiUtamaId && loadingSesi)

  return (
    <div className="min-h-dvh bg-[#0B0F0D] text-white flex flex-col">
      <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <p className="text-lg sm:text-2xl font-extrabold tracking-wide">PILIHAN RAYA JAWATANKUASA KKGS</p>
          <p className="text-xs sm:text-sm text-white/50">Kelab Kebajikan Guru &amp; Staf{sesi ? ` — Tahun ${sesi.tahun}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/50">
          <Radio size={16} className="text-[#4FD1A5] animate-pulse" /> PAPARAN LIVE
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        {memuatkan ? (
          <p className="text-white/50 text-lg">Memuatkan…</p>
        ) : !sesi ? (
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white/70">Tiada Pilihan Raya Aktif Buat Masa Ini</p>
            <p className="text-white/40 mt-2">Sila hubungi Setiausaha/Admin KKGS untuk memulakan sesi.</p>
          </div>
        ) : (
          <IsiPaparan sesi={sesi} cariNama={cariNama} />
        )}
      </div>
    </div>
  )
}

function IsiPaparan({ sesi, cariNama }) {
  const pusinganIndeks = sesi.pusinganIndeks ?? -1

  if (pusinganIndeks === -1) {
    return (
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-bold text-white/70">Menunggu Pusingan Pertama Dibuka…</p>
        <p className="text-white/40 mt-2">Jawatan pertama: {JAWATAN_URUTAN_PILIHAN_RAYA[0]}</p>
      </div>
    )
  }

  const jawatanSemasa = JAWATAN_URUTAN_PILIHAN_RAYA[pusinganIndeks]
  const adalahAjk = jawatanSemasa === JAWATAN_AJK_PILIHAN_RAYA

  if (sesi.pusinganStatus === 'berjalan') {
    return <PusinganBerjalan sesiId={sesi.id} jawatan={jawatanSemasa} tamatPada={sesi.pusinganTamatPada} pemenang={sesi.pemenang ?? {}} cariNama={cariNama} />
  }

  // Pusingan ditutup - keputusan jawatan SEMASA didedahkan.
  const pusinganTerakhir = pusinganIndeks === JAWATAN_URUTAN_PILIHAN_RAYA.length - 1
  if (sesi.status === 'selesai' && pusinganTerakhir) {
    return <SemuaKeputusan pemenang={sesi.pemenang ?? {}} cariNama={cariNama} tahun={sesi.tahun} />
  }

  return (
    <KeputusanPusingan
      jawatan={jawatanSemasa}
      adalahAjk={adalahAjk}
      kerusi={adalahAjk ? sesi.bilanganKerusiAjk : 1}
      nilaiPemenang={sesi.pemenang?.[jawatanSemasa]}
      butiran={sesi.butiranPusingan?.[jawatanSemasa]}
      cariNama={cariNama}
      pemenangKeseluruhan={sesi.pemenang ?? {}}
      pusinganTerakhir={pusinganTerakhir}
    />
  )
}

// Ambang "kritikal" (saat) - sama macam page admin, timer besar bertukar
// merah/pulse bila baki sikit sahaja - lebih dramatik di skrin TV.
const AMBANG_KRITIKAL_SAAT = 10

function PusinganBerjalan({ sesiId, jawatan, tamatPada, pemenang, cariNama }) {
  const [kini, setKini] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setKini(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const bakiSaat = Math.max(0, Math.ceil(((tamatPada ?? 0) - kini) / 1000))
  const tamat = bakiSaat <= 0
  const kritikal = !tamat && bakiSaat <= AMBANG_KRITIKAL_SAAT
  const minit = Math.floor(bakiSaat / 60)
  const saat = bakiSaat % 60

  // Cuma perlu JUMLAH pengundi (untuk "X/Y dah undi") - keputusan
  // per-calon SENGAJA tak diambil/dipapar di sini (lihat nota fail).
  const { jumlahPengundi } = useTalliLive(sesiId, jawatan, true)

  const jawatanDiumum = JAWATAN_URUTAN_PILIHAN_RAYA.filter((j) => pemenang[j] !== undefined)

  return (
    <div className="w-full max-w-3xl text-center">
      <p className="text-sm sm:text-base font-semibold text-[#4FD1A5] uppercase tracking-widest mb-2">Sedang Mengundi</p>
      <p className="text-4xl sm:text-6xl font-extrabold mb-6">{jawatan}</p>
      <p className={`text-7xl sm:text-9xl font-black tabular-nums mb-3 ${kritikal ? 'text-brand-red animate-pulse' : 'text-white'}`}>{minit}:{String(saat).padStart(2, '0')}</p>
      <p className="text-white/50 text-sm sm:text-base mb-8">{tamat ? 'Masa tamat - menunggu admin tutup pusingan ini' : 'baki masa pusingan ini'}</p>

      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm sm:text-base">
        <Clock size={16} className="text-white/40" /> {jumlahPengundi} undi telah masuk
      </div>
      <p className="text-white/30 text-xs sm:text-sm mt-6">Keputusan akan diumumkan sebaik pusingan ini ditutup.</p>

      {jawatanDiumum.length > 0 && (
        <div className="mt-10 pt-6 border-t border-white/10 text-left max-w-xl mx-auto space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-2 text-center">Keputusan Diumumkan Setakat Ini</p>
          {jawatanDiumum.map((j) => (
            <BarisRingkasPemenang key={j} jawatan={j} nilai={pemenang[j]} cariNama={cariNama} />
          ))}
        </div>
      )}
    </div>
  )
}

function BarisRingkasPemenang({ jawatan, nilai, cariNama }) {
  const senaraiId = nilai === null ? [] : (Array.isArray(nilai) ? nilai : [nilai])
  return (
    <div className="flex items-center justify-between px-4 py-2 rounded-card bg-white/5 text-sm">
      <span className="text-white/50">{jawatan}</span>
      <span className="font-semibold text-right">
        {senaraiId.length === 0 ? <span className="text-white/40">Tiada calon dapat undi</span> : senaraiId.map((id) => cariNama(id)).join(', ')}
      </span>
    </div>
  )
}

function KeputusanPusingan({ jawatan, adalahAjk, kerusi, nilaiPemenang, butiran, cariNama, pemenangKeseluruhan, pusinganTerakhir }) {
  const senaraiPemenangId = nilaiPemenang === null ? [] : (Array.isArray(nilaiPemenang) ? nilaiPemenang : [nilaiPemenang])
  const jawatanDiumumSebelum = JAWATAN_URUTAN_PILIHAN_RAYA.filter((j) => j !== jawatan && pemenangKeseluruhan[j] !== undefined)

  return (
    <div className="w-full max-w-3xl text-center">
      <p className="text-sm sm:text-base font-semibold text-[#4FD1A5] uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Keputusan Diumumkan</p>
      <p className="text-3xl sm:text-5xl font-extrabold mb-6">{jawatan}</p>

      {senaraiPemenangId.length === 0 ? (
        <p className="text-2xl text-white/50">Tiada calon dapat undi - kerusi kekal kosong.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {senaraiPemenangId.map((id) => (
            <p key={id} className="text-3xl sm:text-5xl font-black flex items-center justify-center gap-3 text-[#FFD24C]">
              <Trophy size={36} /> {cariNama(id)}
            </p>
          ))}
        </div>
      )}

      {butiran && butiran.length > 0 && (
        <div className="max-w-xl mx-auto text-left space-y-2 mb-8">
          {butiran.map((b, i) => {
            const menang = i < kerusi
            const maksUndi = Math.max(1, butiran[0].undi)
            return (
              <div key={b.calonId} className="text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className={menang ? 'font-semibold text-white' : 'text-white/50'}>{cariNama(b.calonId)}</span>
                  <span className="font-bold">{b.undi} undi</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(b.undi / maksUndi) * 100}%`, backgroundColor: menang ? '#4FD1A5' : '#666' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-white/30 text-sm">{pusinganTerakhir ? 'Semua pusingan selesai — keputusan penuh sedia.' : 'Menunggu admin membuka pusingan seterusnya…'}</p>

      {jawatanDiumumSebelum.length > 0 && (
        <div className="mt-10 pt-6 border-t border-white/10 text-left max-w-xl mx-auto space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-2 text-center">Keputusan Sebelum Ini</p>
          {jawatanDiumumSebelum.map((j) => (
            <BarisRingkasPemenang key={j} jawatan={j} nilai={pemenangKeseluruhan[j]} cariNama={cariNama} />
          ))}
        </div>
      )}
    </div>
  )
}

// Papan besar keputusan PENUH - dipaparkan bila SEMUA pusingan dah
// selesai (status 'selesai') - macam "keputusan rasmi" penuh.
function SemuaKeputusan({ pemenang, cariNama, tahun }) {
  return (
    <div className="w-full max-w-3xl text-center">
      <Trophy size={48} className="mx-auto text-[#FFD24C] mb-3" />
      <p className="text-3xl sm:text-5xl font-black mb-1">Keputusan Rasmi</p>
      <p className="text-white/40 mb-8">Jawatankuasa KKGS {tahun}</p>
      <div className="space-y-3 text-left">
        {JAWATAN_URUTAN_PILIHAN_RAYA.map((j) => {
          const nilai = pemenang[j]
          const senaraiId = nilai === null || nilai === undefined ? [] : (Array.isArray(nilai) ? nilai : [nilai])
          return (
            <div key={j} className="p-4 rounded-card bg-white/5 border border-white/10">
              <p className="text-xs font-bold text-[#4FD1A5] uppercase tracking-wide mb-1">{j}</p>
              {senaraiId.length === 0 ? (
                <p className="text-white/40">Tiada calon dapat undi</p>
              ) : (
                senaraiId.map((id) => (
                  <p key={id} className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Trophy size={18} className="text-[#FFD24C]" /> {cariNama(id)}</p>
                ))
              )}
            </div>
          )
        })}
      </div>
      <p className="text-white/30 text-xs sm:text-sm mt-8">Lantikan sebenar ke Jawatankuasa KKGS akan dikemaskini secara manual.</p>
    </div>
  )
}
