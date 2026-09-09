import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'

// Tiada bullet ⚫ langsung (list-none) - staff nyatakan tak nak bullet
// kelihatan sama sekali dalam senarai kandungan.
function SenaraiPeluru({ teks }) {
  const baris = (teks ?? '').split('\n').map((b) => b.trim()).filter(Boolean)
  if (baris.length === 0) return <p className="text-[11px] text-gray-400">-</p>
  return (
    <ul className="text-[11px] text-black leading-snug list-none space-y-0.5">
      {baris.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  )
}

// SEMUA kotak kandungan - penjuru BULAT (rounded-xl) + latar lut sinar,
// SAMA gaya dengan panel header (bucu bulat + transparent) - ikut arahan
// pengguna "semua kotak sama seperti header".
function Kotak({ label, children }) {
  return (
    <div className="border-2 border-black bg-white/90 rounded-xl p-2 overflow-hidden" style={{ flex: 1 }}>
      <p className="text-xs font-bold text-black mb-1">{label}</p>
      {children}
    </div>
  )
}

function BarisLogo({ logo }) {
  if (!logo || logo.length === 0) {
    return <img src="/logo-cetak.png" alt="" className="h-14 mx-auto object-contain" />
  }
  // justify-center sentiasa - 1 gambar ATAU sehingga 3, tersusun tengah
  // sama rata (gap konsisten), bukan tersasar ke kiri/kanan.
  return (
    <div className="flex items-center justify-center gap-3">
      {logo.map((url, i) => <img key={i} src={url} alt="" className="h-14 object-contain" />)}
    </div>
  )
}

function labelSeksyen(seksyen) {
  if (seksyen === 'hem') return 'HEM'
  if (seksyen === 'koku') return 'KOKURIKULUM'
  return 'KURIKULUM'
}

function ChipMaklumat({ label, nilai }) {
  return (
    <div className="flex-1 bg-white/90 rounded-xl p-2.5 text-center">
      <p className="text-xs font-bold text-black">{label}:</p>
      <p className="text-xs font-semibold text-black mt-0.5">{nilai || ''}</p>
    </div>
  )
}

// Gaya 2 - "Kepala Bersempadan". TETAP 1 muka A4 SENTIASA (tinggi TETAP
// 297mm, overflow:hidden pada bekas utama).
export default function CetakOPR_Gaya2({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)
  const unit = rekod.unit || 'PROGRAM'
  const teksSub1 = subHeader1 ? subHeader1.replace(/\{Unit\}/gi, unit) : ''
  const teksSub2 = subHeader2 ? subHeader2.replace(/\{Unit\}/gi, unit) : ''

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
        <div className="p-5 pb-3 shrink-0">
          {/* Logo BENAR-BENAR di tengah muka surat - badge/pill diletak
              MENGAPUNG (absolute) di penjuru kanan, DIKELUARKAN daripada
              aliran flex supaya tak jejaskan titik tengah logo (dulu logo
              "tersasar" sebab ruang kiri/kanan tak seimbang - dibetulkan). */}
          <div className="relative mb-2.5" style={{ minHeight: '56px' }}>
            <div className="flex items-center justify-center h-14"><BarisLogo logo={logo} /></div>
            {rekod.tunjukSeksyenBadge && (
              <div className="absolute top-0 right-0">
                <span className="rounded-full border border-black bg-white/90 px-3 py-1 text-[10px] font-bold text-black">{labelSeksyen(seksyen)}</span>
              </div>
            )}
          </div>

          <div className="bg-white/90 rounded-xl p-3 mb-2.5 text-center">
            <p className="text-sm font-bold text-black">{namaSekolah || NAMA_SEKOLAH}</p>
            {teksSub1 && <p className="text-[11px] font-normal text-black uppercase mt-1">{teksSub1}</p>}
            {teksSub2 && <p className="text-[11px] font-normal text-black uppercase mt-0.5">{teksSub2}</p>}
          </div>

          <div className="flex gap-2">
            <ChipMaklumat label="Hari" nilai={rekod.hari} />
            <ChipMaklumat label="Tarikh" nilai={rekod.tarikh} />
            <ChipMaklumat label="Masa" nilai={rekod.masa} />
          </div>
        </div>

        <div className="p-5 pt-3 flex-1 flex flex-col min-h-0">
          <div className="border-2 border-black bg-white/90 rounded-xl p-2.5 text-center mb-2.5 shrink-0 overflow-hidden">
            <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
          </div>

          <div className="flex gap-2 mb-3 shrink-0">
            <div className="flex-1 border-2 border-black bg-white/90 rounded-xl p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
            <div className="flex-1 border-2 border-black bg-white/90 rounded-xl p-2.5 text-center overflow-hidden"><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
          </div>

          {/* PENTING: overflow-hidden pada DUA-DUA baris ni - punca bug
              "gambar bertindan kotak sign" ialah lajur gambar (nisbah 4:3
              TETAP) boleh jadi LEBIH TINGGI daripada ruang diperuntukkan
              (nisbah tetap tak kira ruang tersedia), tiada overflow-hidden
              dulu = ia melimpah ke bawah, tindih kotak tandatangan. */}
          <div className="flex-1 flex gap-3 min-h-0 mb-3 overflow-hidden">
            <div className="flex flex-col gap-2 min-h-0" style={{ flex: 2 }}>
              <Kotak label="Objektif Program:"><SenaraiPeluru teks={rekod.objektif} /></Kotak>
              <Kotak label="Aktiviti"><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
              <Kotak label="Kekuatan"><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
              <Kotak label="Kelemahan"><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
              <Kotak label="Penambahbaikan"><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
            </div>
            <div className="flex flex-col gap-2 justify-start overflow-hidden" style={{ flex: 0.75 }}>
              {(gambarDiisi.length > 0 ? gambarDiisi : [null, null, null, null]).map((g, i) => (
                g ? (
                  <div key={i} className="border-2 border-black rounded-xl overflow-hidden shrink-0" style={{ aspectRatio: '4 / 3' }}>
                    <img src={g.url ?? g} alt="" className="w-full h-full object-cover" style={{ objectPosition: g.posisi ?? '50% 50%' }} />
                  </div>
                ) : (
                  <div key={i} className="border-2 border-dashed border-gray-300 rounded-xl shrink-0" style={{ aspectRatio: '4 / 3' }} />
                )
              ))}
            </div>
          </div>

          <div className={`grid gap-4 shrink-0 ${rekod.disahkanAktif ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="bg-white/90 rounded-xl p-3 text-center">
              <p className="text-xs font-semibold text-black mb-3">Disediakan Oleh :</p>
              {rekod.tandaTanganDisediakanUrl && <img src={rekod.tandaTanganDisediakanUrl} alt="" className="h-10 object-contain mb-1 mx-auto" />}
              <p className="text-xs font-semibold text-black">{rekod.namaDisediakan || '-'}</p>
              <p className="text-[10px] text-gray-600">{rekod.jawatanDisediakan}</p>
            </div>
            {rekod.disahkanAktif && (
              <div className="bg-white/90 rounded-xl p-3 text-center">
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
