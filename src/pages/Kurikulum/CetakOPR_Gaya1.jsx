import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'

function SenaraiPeluru({ teks }) {
  const baris = (teks ?? '').split('\n').map((b) => b.trim()).filter(Boolean)
  if (baris.length === 0) return <p className="text-[11px] text-gray-400">-</p>
  return (
    <ul className="text-[11px] text-black leading-snug pl-4 list-disc space-y-0.5">
      {baris.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  )
}

function Kotak({ label, children, flex = 1 }) {
  return (
    <div className="border-2 border-black bg-white/90 p-2.5 overflow-hidden" style={{ flex }}>
      <p className="text-xs font-bold text-black mb-1">{label}</p>
      {children}
    </div>
  )
}

function BarisLogo({ logo }) {
  if (!logo || logo.length === 0) {
    return <img src="/logo-cetak.png" alt="" className="h-14 mx-auto object-contain" />
  }
  return (
    <div className="flex items-center justify-center gap-3">
      {logo.map((url, i) => <img key={i} src={url} alt="" className="h-14 object-contain" />)}
    </div>
  )
}

// Label paparan untuk pill badge seksyen - "seksyen" ialah nilai literal
// 'kurikulum'/'hem'/'koku' (lihat src/App.jsx), TAK sama dengan label
// paparan yang staff biasa nampak di nav (KURI/HEM/KOKU penuh).
function labelSeksyen(seksyen) {
  if (seksyen === 'hem') return 'HEM'
  if (seksyen === 'koku') return 'KOKURIKULUM'
  return 'KURIKULUM'
}

// Chip Hari/Tarikh/Masa - kotak BERASINGAN (bukan satu grid dibahagi),
// penjuru bulat lembut, label hitam atas + nilai BIRU bawah - ikut
// rujukan reka bentuk pengguna.
function ChipMaklumat({ label, nilai }) {
  return (
    <div className="flex-1 bg-white/90 rounded-xl p-2.5 text-center">
      <p className="text-xs font-bold text-black">{label}:</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: '#1D4ED8' }}>{nilai || ''}</p>
    </div>
  )
}

// Gaya 1 - "Kotak Ringkas". TETAP 1 muka A4 SENTIASA (tinggi TETAP
// 297mm, overflow:hidden) - susun atur guna flex-column dengan flex-basis
// berkadar mengikut templat rujukan, supaya kekal isi PENUH muka surat
// tak kira teks sikit/banyak (kotak kekal besar sama, bukan mengecil ikut
// kandungan). Teks lebih panjang dari muat dalam kotak akan dipotong
// (overflow hidden) - PASTIKAN kekal 1 muka surat sahaja bila cetak,
// tidak "melimpah" ke muka surat ke-2.
export default function CetakOPR_Gaya1({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)
  const unit = rekod.unit || 'PROGRAM'
  // {Unit} dalam sub-tajuk boleh-edit digantikan nama Unit laporan ni.
  // PENTING: TIADA teks lalai lagi (dulu "Program {Unit}" dsb) - kalau
  // tetapan kosong, medan kosong terus (tak papar baris tu langsung),
  // ikut arahan pengguna "jangan hardcode perkataan lain".
  const teksSub1 = subHeader1 ? subHeader1.replace(/\{Unit\}/gi, unit) : ''
  const teksSub2 = subHeader2 ? subHeader2.replace(/\{Unit\}/gi, unit) : ''

  return (
    <PrintArea>
      <div
        className="p-8 text-black flex flex-col"
        style={{
          width: '210mm', height: '297mm', overflow: 'hidden',
          backgroundImage: rekod.latarBelakangUrl ? `url(${rekod.latarBelakangUrl})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        {/* Logo & badge (pill seksyen + Unit) TERAPUNG terus atas latar
            belakang (bukan dalam panel putih Nama Sekolah) - ikut
            keputusan reka bentuk (rujukan gambar pengguna). Pill seksyen
            di atas, badge Unit di bawahnya - dua-dua kekal ada latar
            putih sendiri untuk jelas dibaca. */}
        <div className="flex items-start justify-between mb-2.5 shrink-0">
          <div className="w-24" />
          <div className="flex-1"><BarisLogo logo={logo} /></div>
          <div className="flex flex-col items-end gap-1.5">
            {rekod.tunjukSeksyenBadge && (
              <span className="rounded-full border border-black bg-white/90 px-3 py-1 text-[10px] font-bold text-black">{labelSeksyen(seksyen)}</span>
            )}
            <div className="border-2 border-black bg-white/90 px-4 py-2 min-w-[110px] text-center">
              <p className="text-sm font-bold text-black">{rekod.unit || '-'}</p>
            </div>
          </div>
        </div>

        {/* Panel putih legap - Nama Sekolah (atas, bold, lebih besar) +
            sub-tajuk (bawah, TAK bold, lebih kecil) - susunan & saiz
            diselaraskan (dulu Gaya 2 terbalik/salah saiz - dah dibetulkan
            supaya SAMA dengan Gaya 1). Baris sub-tajuk kosong TAK dipapar
            langsung (bukan kekal ruang kosong). */}
        <div className="bg-white/90 p-3 rounded-xl mb-2.5 shrink-0 text-center">
          <p className="text-sm font-bold text-black">{namaSekolah || NAMA_SEKOLAH}</p>
          {teksSub1 && <p className="text-[11px] font-normal text-black uppercase mt-1">{teksSub1}</p>}
          {teksSub2 && <p className="text-[11px] font-normal text-black uppercase mt-0.5">{teksSub2}</p>}
        </div>

        {/* Chip Hari/Tarikh/Masa - kotak berasingan, penjuru bulat, nilai
            biru - ikut rujukan reka bentuk (bukan grid tunggal dibahagi
            garis lagi). */}
        <div className="flex gap-2 mb-2.5 shrink-0">
          <ChipMaklumat label="Hari" nilai={rekod.hari} />
          <ChipMaklumat label="Tarikh" nilai={rekod.tarikh} />
          <ChipMaklumat label="Masa" nilai={rekod.masa} />
        </div>

        <div className="border-2 border-black bg-white/90 p-2.5 text-center mb-2.5 shrink-0 overflow-hidden">
          <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-0 border-2 border-black divide-x-2 divide-black mb-2.5 shrink-0">
          <div className="bg-white/90 p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
          <div className="bg-white/90 p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
        </div>

        {/* Bahagian bawah ni flex:1 - isi baki ruang muka surat SENTIASA
            (kotak besar walaupun teks sikit), dibahagi ikut nisbah tinggi
            templat rujukan (2 baris kotak 2-lajur ~sama besar, kotak
            Penambahbaikan lebih nipis, gambar ambil baki, tandatangan tetap). */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-2.5 mb-2.5" style={{ flex: 3 }}>
            <Kotak label="Objektif Program:"><SenaraiPeluru teks={rekod.objektif} /></Kotak>
            <Kotak label="Aktiviti"><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
          </div>
          <div className="flex gap-2.5 mb-2.5" style={{ flex: 3 }}>
            <Kotak label="Kekuatan"><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
            <Kotak label="Kelemahan"><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
          </div>
          <div className="mb-2.5" style={{ flex: 2 }}>
            <Kotak label="Penambahbaikan" flex="1 1 100%"><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
          </div>

          <div className="flex gap-2 mb-3" style={{ flex: 4 }}>
            {(gambarDiisi.length > 0 ? gambarDiisi : [null, null, null, null]).map((g, i) => (
              g ? (
                <div key={i} className="flex-1 border-2 border-black overflow-hidden">
                  <img src={g.url ?? g} alt="" className="w-full h-full object-cover" style={{ objectPosition: g.posisi ?? '50% 50%' }} />
                </div>
              ) : (
                <div key={i} className="flex-1 border-2 border-dashed border-gray-300" />
              )
            ))}
          </div>

          <div className={`grid gap-4 shrink-0 ${rekod.disahkanAktif ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="bg-white/90 rounded p-3 text-center">
              <p className="text-xs font-semibold text-black mb-3">Disediakan Oleh :</p>
              {rekod.tandaTanganDisediakanUrl && <img src={rekod.tandaTanganDisediakanUrl} alt="" className="h-10 object-contain mb-1 mx-auto" />}
              <p className="text-xs font-semibold text-black">{rekod.namaDisediakan || '-'}</p>
              <p className="text-[10px] text-gray-600">{rekod.jawatanDisediakan}</p>
            </div>
            {rekod.disahkanAktif && (
              <div className="bg-white/90 rounded p-3 text-center">
                <p className="text-xs font-semibold text-black mb-3">Disahkan Oleh :</p>
                {rekod.tandaTanganDisahkanUrl && <img src={rekod.tandaTanganDisahkanUrl} alt="" className="h-10 object-contain mb-1 mx-auto" />}
                <p className="text-xs font-semibold text-black">{rekod.namaDisahkan || '-'}</p>
                <p className="text-[10px] text-gray-600">{rekod.jawatanDisahkan}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
