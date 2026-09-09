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

function Kotak({ label, children }) {
  return (
    <div className="border-2 border-black bg-white/90 p-2 overflow-hidden" style={{ flex: 1 }}>
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

// Gaya 2 - "Kepala Bersempadan" (dulu "Kepala Hijau" - warna latar
// #1B4D2E DIBUANG atas permintaan pengguna, teks tukar putih->hitam
// supaya kekal boleh dibaca; susunan/reka bentuk KEKAL SAMA). TETAP 1
// muka A4 SENTIASA (tinggi TETAP 297mm, overflow:hidden) - lajur kiri (5
// kotak) & kanan (4 gambar) SAMA-SAMA flex:1 mengisi baki ruang penuh,
// kekal besar walaupun teks/gambar sikit. Tajuk "PROGRAM {unit}"/OPR
// {unit} dinamik ikut Unit dipilih.
export default function CetakOPR_Gaya2({ rekod, logo, namaSekolah, subHeader1, subHeader2 }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)
  const unit = rekod.unit || 'PROGRAM'
  const teksSub1 = (subHeader1 || 'Program {Unit}').replace(/\{Unit\}/gi, unit)
  const teksSub2 = (subHeader2 || 'One Page Report (OPR) {Unit}').replace(/\{Unit\}/gi, unit)

  return (
    <PrintArea>
      <div
        className="text-black flex flex-col"
        style={{
          width: '210mm', height: '297mm', overflow: 'hidden',
          backgroundImage: rekod.latarBelakangUrl ? `url(${rekod.latarBelakangUrl})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        {/* Panel putih legap membungkus KESELURUHAN kepala - elak teks
            bertindih terus dengan gambar tema latar belakang. */}
        <div className="p-5 pb-3 shrink-0 bg-white/90">
          <div className="flex items-start justify-between mb-1.5">
            <div className="w-24" />
            <div className="flex-1"><BarisLogo logo={logo} /></div>
            <div className="border-2 border-black px-4 py-2 min-w-[110px] text-center">
              <p className="text-sm font-bold text-black uppercase">{unit}</p>
            </div>
          </div>
          <p className="text-center text-sm font-bold text-black uppercase mb-1">{teksSub1}</p>
          <p className="text-center text-xs font-bold text-black mb-1">{namaSekolah || NAMA_SEKOLAH}</p>
          <p className="text-center text-xs font-bold text-black uppercase mb-2.5">{teksSub2}</p>

          <div className="grid grid-cols-3 gap-2">
            <div className="border-2 border-black p-2 text-center rounded"><p className="text-xs font-bold text-black">Hari : <span className="font-normal">{rekod.hari || ''}</span></p></div>
            <div className="border-2 border-black p-2 text-center rounded"><p className="text-xs font-bold text-black">Tarikh : <span className="font-normal">{rekod.tarikh || ''}</span></p></div>
            <div className="border-2 border-black p-2 text-center rounded"><p className="text-xs font-bold text-black">Masa : <span className="font-normal">{rekod.masa || ''}</span></p></div>
          </div>
        </div>

        <div className="p-5 pt-3 flex-1 flex flex-col min-h-0">
          <div className="border-2 border-black bg-white/90 p-2.5 text-center mb-2.5 shrink-0 overflow-hidden">
            <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-0 border-2 border-black divide-x-2 divide-black mb-3 shrink-0">
            <div className="bg-white/90 p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
            <div className="bg-white/90 p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
          </div>

          <div className="flex-1 flex gap-3 min-h-0 mb-3">
            <div className="flex flex-col gap-2" style={{ flex: 2 }}>
              <Kotak label="Objektif Program:"><SenaraiPeluru teks={rekod.objektif} /></Kotak>
              <Kotak label="Aktiviti"><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
              <Kotak label="Kekuatan"><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
              <Kotak label="Kelemahan"><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
              <Kotak label="Penambahbaikan"><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
            </div>
            {/* Lajur gambar - LEBIH SEMPIT (flex:1 berbanding teks flex:2)
                & setiap gambar nisbah TETAP 4:3 (bukan flex-1 meregang isi
                baki tinggi lagi) - elak gambar jadi terlalu besar/tinggi
                berbanding kotak teks, ikut arahan pengguna. */}
            <div className="flex flex-col gap-2 justify-start" style={{ flex: 0.75 }}>
              {(gambarDiisi.length > 0 ? gambarDiisi : [null, null, null, null]).map((g, i) => (
                g ? (
                  <div key={i} className="border-2 border-black overflow-hidden shrink-0" style={{ aspectRatio: '4 / 3' }}>
                    <img src={g.url ?? g} alt="" className="w-full h-full object-cover" style={{ objectPosition: g.posisi ?? '50% 50%' }} />
                  </div>
                ) : (
                  <div key={i} className="border-2 border-dashed border-gray-300 shrink-0" style={{ aspectRatio: '4 / 3' }} />
                )
              ))}
            </div>
          </div>

          <div className={`grid gap-6 shrink-0 bg-white/90 p-3 rounded ${rekod.disahkanAktif ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="text-center">
              <p className="text-xs font-semibold text-black mb-3">Disediakan Oleh :</p>
              {rekod.tandaTanganDisediakanUrl && <img src={rekod.tandaTanganDisediakanUrl} alt="" className="h-10 object-contain mb-1 mx-auto" />}
              <p className="text-xs font-semibold text-black">{rekod.namaDisediakan || '-'}</p>
              <p className="text-[10px] text-gray-600">{rekod.jawatanDisediakan}</p>
            </div>
            {rekod.disahkanAktif && (
              <div className="text-center">
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
