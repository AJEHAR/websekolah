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
    <div className="border-2 border-black p-2.5 overflow-hidden" style={{ flex }}>
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

// Gaya 1 - "Kotak Ringkas". TETAP 1 muka A4 SENTIASA (tinggi TETAP
// 297mm, overflow:hidden) - susun atur guna flex-column dengan flex-basis
// berkadar mengikut templat rujukan, supaya kekal isi PENUH muka surat
// tak kira teks sikit/banyak (kotak kekal besar sama, bukan mengecil ikut
// kandungan). Teks lebih panjang dari muat dalam kotak akan dipotong
// (overflow hidden) - PASTIKAN kekal 1 muka surat sahaja bila cetak,
// tidak "melimpah" ke muka surat ke-2.
export default function CetakOPR_Gaya1({ rekod, logo }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)

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
        <div className="flex items-start justify-between mb-2 shrink-0">
          <div className="w-24" />
          <div className="flex-1"><BarisLogo logo={logo} /></div>
          <div className="border-2 border-black px-4 py-2 min-w-[110px] text-center">
            <p className="text-sm font-bold text-black">{rekod.unit || '-'}</p>
          </div>
        </div>

        <p className="text-center text-sm font-bold text-black mb-3 shrink-0">{NAMA_SEKOLAH}</p>

        <div className="grid grid-cols-3 gap-0 border-2 border-black divide-x-2 divide-black mb-2.5 shrink-0">
          <div className="p-2.5 text-center"><p className="text-xs font-bold text-black">Hari : <span className="font-normal">{rekod.hari || ''}</span></p></div>
          <div className="p-2.5 text-center"><p className="text-xs font-bold text-black">Tarikh : <span className="font-normal">{rekod.tarikh || ''}</span></p></div>
          <div className="p-2.5 text-center"><p className="text-xs font-bold text-black">Masa : <span className="font-normal">{rekod.masa || ''}</span></p></div>
        </div>

        <div className="border-2 border-black p-2.5 text-center mb-2.5 shrink-0 overflow-hidden">
          <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-0 border-2 border-black divide-x-2 divide-black mb-2.5 shrink-0">
          <div className="p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
          <div className="p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
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
                <img key={i} src={g.url ?? g} alt="" className="flex-1 border-2 border-black object-cover" style={{ objectPosition: g.posisi ?? '50% 50%' }} />
              ) : (
                <div key={i} className="flex-1 border-2 border-dashed border-gray-300" />
              )
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 shrink-0">
            <div>
              <p className="text-xs font-semibold text-black mb-3">Disediakan Oleh :</p>
              {rekod.tandaTanganDisediakanUrl && <img src={rekod.tandaTanganDisediakanUrl} alt="" className="h-10 object-contain mb-1" />}
              <p className="text-xs font-semibold text-black">{rekod.namaDisediakan || '-'}</p>
              <p className="text-[10px] text-gray-600">{rekod.jawatanDisediakan}</p>
            </div>
            {rekod.disahkanAktif && (
              <div>
                <p className="text-xs font-semibold text-black mb-3">Disahkan Oleh :</p>
                {rekod.tandaTanganDisahkanUrl && <img src={rekod.tandaTanganDisahkanUrl} alt="" className="h-10 object-contain mb-1" />}
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
