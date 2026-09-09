import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'

// Opacity kotak kini DINAMIK (kawalan penuh staff, lalai 70%) - Tailwind
// bg-white/90 ni className TETAP (dikompil masa build), tak boleh terima
// nilai sebarangan masa jalan - jadi guna inline style rgba() terus
// supaya betul-betul ikut peratus yang staff tetapkan dalam borang.
function gayaKotak(opacity) {
  return { backgroundColor: `rgba(255,255,255,${(opacity ?? 70) / 100})` }
}

function SenaraiPeluru({ teks }) {
  const baris = (teks ?? '').split('\n').map((b) => b.trim()).filter(Boolean)
  if (baris.length === 0) return <p className="text-[11px] text-gray-400">-</p>
  return (
    <ul className="text-[11px] text-black leading-snug list-none space-y-0.5">
      {baris.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  )
}

// Label tajuk kotak kini TENGAH (text-center) - dulu kiri.
function Kotak({ label, children, flex = 1, opacity }) {
  return (
    <div className="rounded-xl shadow-md p-2.5 overflow-hidden" style={{ flex, ...gayaKotak(opacity) }}>
      <p className="text-xs font-bold text-black mb-1 text-center">{label}</p>
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

function labelSeksyen(seksyen) {
  if (seksyen === 'hem') return 'HEM'
  if (seksyen === 'koku') return 'KOKURIKULUM'
  return 'KURIKULUM'
}

function ChipMaklumat({ label, nilai, opacity }) {
  return (
    <div className="flex-1 rounded-xl shadow-md p-2.5 text-center" style={gayaKotak(opacity)}>
      <p className="text-xs font-bold text-black">{label}:</p>
      <p className="text-xs font-semibold text-black mt-0.5">{nilai || ''}</p>
    </div>
  )
}

// Bingkai gambar - bayang LEBIH KUAT (shadow-lg) berbanding kotak teks
// (shadow-md) - beri hierarki visual "terapung" lebih tinggi, ikut
// permintaan pengguna "kotak gambar tu uplift".
function GambarSlot({ src, posisi, opacity }) {
  return (
    <div className="flex-1 rounded-xl shadow-lg overflow-hidden" style={gayaKotak(opacity)}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover" style={{ objectPosition: posisi ?? '50% 50%' }} /> : <div className="w-full h-full bg-[#EAF3FB]" />}
    </div>
  )
}

// Gaya 1 - "Kotak Ringkas". TETAP 1 muka A4 SENTIASA.
export default function CetakOPR_Gaya1({ rekod, logo, namaSekolah, subHeader1, subHeader2, seksyen }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)
  const unit = rekod.unit || 'PROGRAM'
  const teksSub1 = subHeader1 ? subHeader1.replace(/\{Unit\}/gi, unit) : ''
  const teksSub2 = subHeader2 ? subHeader2.replace(/\{Unit\}/gi, unit) : ''
  const opacity = rekod.kotakOpacity

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
        <div className="relative mb-2.5 shrink-0" style={{ minHeight: '56px' }}>
          <div className="flex items-center justify-center h-14"><BarisLogo logo={logo} /></div>
          {rekod.tunjukSeksyenBadge && (
            <div className="absolute top-0 right-0">
              <span className="rounded-full border border-black bg-white/90 px-3 py-1 text-[10px] font-bold text-black">{labelSeksyen(seksyen)}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl shadow-md p-3 mb-2.5 shrink-0 text-center" style={gayaKotak(opacity)}>
          <p className="text-sm font-bold text-black">{namaSekolah || NAMA_SEKOLAH}</p>
          {teksSub1 && <p className="text-[11px] font-normal text-black uppercase mt-1">{teksSub1}</p>}
          {teksSub2 && <p className="text-[11px] font-normal text-black uppercase mt-0.5">{teksSub2}</p>}
        </div>

        <div className="flex gap-2 mb-2.5 shrink-0">
          <ChipMaklumat label="Hari" nilai={rekod.hari} opacity={opacity} />
          <ChipMaklumat label="Tarikh" nilai={rekod.tarikh} opacity={opacity} />
          <ChipMaklumat label="Masa" nilai={rekod.masa} opacity={opacity} />
        </div>

        <div className="rounded-xl shadow-md p-2.5 text-center mb-2.5 shrink-0 overflow-hidden" style={gayaKotak(opacity)}>
          <p className="text-xs font-bold text-black">Nama Program: <span className="font-normal">{rekod.nama}</span></p>
        </div>

        <div className="flex gap-2 mb-2.5 shrink-0">
          <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Tempat : <span className="font-normal">{rekod.tempat || ''}</span></p></div>
          <div className="flex-1 rounded-xl shadow-md p-2.5 text-center overflow-hidden" style={gayaKotak(opacity)}><p className="text-xs font-bold text-black">Kumpulan Sasaran: <span className="font-normal">{rekod.sasaran || ''}</span></p></div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-2.5 mb-2.5" style={{ flex: 3 }}>
            <Kotak label="Objektif Program:" opacity={opacity}><SenaraiPeluru teks={rekod.objektif} /></Kotak>
            <Kotak label="Aktiviti" opacity={opacity}><SenaraiPeluru teks={rekod.aktiviti} /></Kotak>
          </div>
          <div className="flex gap-2.5 mb-2.5" style={{ flex: 3 }}>
            <Kotak label="Kekuatan" opacity={opacity}><SenaraiPeluru teks={rekod.kekuatan} /></Kotak>
            <Kotak label="Kelemahan" opacity={opacity}><SenaraiPeluru teks={rekod.kelemahan} /></Kotak>
          </div>
          <div className="mb-2.5" style={{ flex: 2 }}>
            <Kotak label="Penambahbaikan" flex="1 1 100%" opacity={opacity}><SenaraiPeluru teks={rekod.penambahbaikan} /></Kotak>
          </div>

          <div className="flex gap-2 mb-3" style={{ flex: 4 }}>
            {(gambarDiisi.length > 0 ? gambarDiisi : [null, null, null, null]).map((g, i) => (
              <GambarSlot key={i} src={g ? (g.url ?? g) : null} posisi={g?.posisi} opacity={opacity} />
            ))}
          </div>

          <div className="flex gap-4 shrink-0">
            <div className={`rounded-xl shadow-md p-3 text-center ${rekod.disahkanAktif ? 'flex-1' : ''}`} style={{ ...gayaKotak(opacity), ...(!rekod.disahkanAktif ? { width: '40%' } : {}) }}>
              <p className="text-xs font-semibold text-black mb-3">Disediakan Oleh :</p>
              {rekod.tandaTanganDisediakanUrl && <img src={rekod.tandaTanganDisediakanUrl} alt="" className="h-10 object-contain mb-1 mx-auto" />}
              <p className="text-xs font-semibold text-black">{rekod.namaDisediakan || '-'}</p>
              <p className="text-[10px] text-gray-600">{rekod.jawatanDisediakan}</p>
            </div>
            {rekod.disahkanAktif && (
              <div className="flex-1 rounded-xl shadow-md p-3 text-center" style={gayaKotak(opacity)}>
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
