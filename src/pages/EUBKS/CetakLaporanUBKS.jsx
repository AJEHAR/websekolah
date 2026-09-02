import PrintArea from '../../components/cetak/PrintArea.jsx'
import { warnaLaporanUnit } from './unitHelpers.js'

// Kotak krim/kuning asal templat rujukan DITUKAR PUTIH (permintaan
// pengguna) - cuma kepala biru "Laporan Aktiviti Perjumpaan" yang kekal
// berwarna, kini boleh ditukar per-unit (unit.warnaLaporan, ditetapkan di
// halaman Unit > Maklumat - lihat unitHelpers.js).
const PUTIH = '#FFFFFF'

function KotakKrim({ children, className = '' }) {
  return (
    <div className={`border border-black text-center py-1 px-2 overflow-hidden ${className}`} style={{ backgroundColor: PUTIH }}>
      <p className="text-[11px] font-bold text-black">{children}</p>
    </div>
  )
}

function BarisJadual({ label, value, flex = 1 }) {
  return (
    <div className="flex border-b border-black last:border-b-0 overflow-hidden" style={{ flex }}>
      <div className="w-24 shrink-0 flex items-center justify-center border-r border-black px-1">
        <p className="text-xs font-medium text-black text-center">{label}</p>
      </div>
      <div className="flex-1 flex items-center px-2 overflow-hidden">
        <p className="text-[11px] text-black leading-snug whitespace-pre-line">{(value || '').trim()}</p>
      </div>
    </div>
  )
}

function GambarSlot({ src }) {
  return (
    <div className="border-2 border-black overflow-hidden flex-1 h-full">
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#EAF3FB]" />}
    </div>
  )
}

function BlokTandatanganCetak({ label, ttdUrl, nama }) {
  return (
    <div className="flex-1">
      <div style={{ backgroundColor: PUTIH }} className="text-center py-1 border-b border-black"><p className="text-[11px] font-bold text-black">{label}</p></div>
      {/* Templat TETAP: (tandatangan) di atas, nama (kecil) di bawah -
          DUA-DUA sentiasa dipaparkan sekali (bukan salah satu sahaja) -
          staff perlu nampak nama walaupun dah ada gambar tandatangan. */}
      <div className="h-12 flex items-center justify-center p-1">
        {ttdUrl && <img src={ttdUrl} alt="" className="h-full object-contain" />}
      </div>
      <p className="text-[10px] text-black text-center pb-1.5 truncate px-1">{nama || '\u00A0'}</p>
    </div>
  )
}

function cubaFormatTarikh(tarikh) {
  if (!tarikh) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(tarikh)) {
    const [t, b, h] = tarikh.split('-')
    return `${h}/${b}/${t}`
  }
  return tarikh
}

// Replika TEPAT templat "Laporan Aktiviti Perjumpaan" rujukan (versi
// TERKINI - gambar 4-dalam-1-baris MELINTANG di BAWAH, bukan lajur kanan
// lagi - kotak Laporan Aktiviti/Refleksi/PIKeBM/Nilai Sivik jadi LEBAR
// PENUH). Kotak saiz TETAP ikut nisbah templat (bukan regang isi ruang -
// lihat perbincangan reka bentuk sebelum ni). Tinggi keseluruhan
// (297mm + overflow:hidden) kekal sebagai SILING/HAD MAKSIMUM sahaja.
export default function CetakLaporanUBKS({ data, unit, perjumpaan }) {
  const gambar = data.gambar || [null, null, null, null]
  // Sokong SEMUA bentuk data lama (nilaiTeras/nilaiAktiviti asal, ATAU
  // array sivik[] 2-slot dari versi interim, ATAU objek sivik tunggal
  // yang terkini) - cetak terus dari senarai (bypass migrate di borang
  // edit) kena boleh papar semua bentuk dengan betul.
  const sivik = Array.isArray(data.sivik)
    ? (data.sivik[0] ?? { nilai: '', tajuk: '', aktiviti: '' })
    : data.sivik
      ? data.sivik
      : (data.nilaiTeras || data.nilaiAktiviti)
        ? { nilai: data.nilaiTeras || '', tajuk: '', aktiviti: data.nilaiAktiviti || '' }
        : { nilai: '', tajuk: '', aktiviti: '' }

  return (
    <PrintArea>
      <div className="flex flex-col text-black" style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}>
        <div className="text-center py-5 shrink-0" style={{ backgroundColor: warnaLaporanUnit(unit) }}>
          <p className="text-2xl font-extrabold text-white uppercase tracking-wide">Laporan Aktiviti Perjumpaan</p>
        </div>

        <div className="p-6">
          <div className="flex border border-black divide-x divide-black mb-2" style={{ backgroundColor: PUTIH }}>
            <div className="flex-1 text-center py-1.5"><p className="text-[11px] font-bold text-black">Bil. Perjumpaan : <span className="font-normal">{perjumpaan}</span></p></div>
            <div className="flex-1 text-center py-1.5"><p className="text-[11px] font-bold text-black">Tarikh : <span className="font-normal">{cubaFormatTarikh(data.tarikh)}</span></p></div>
            <div className="flex-1 text-center py-1.5"><p className="text-[11px] font-bold text-black">Masa : <span className="font-normal">{data.masa}</span></p></div>
          </div>

          <div className="flex border border-black divide-x divide-black mb-2" style={{ backgroundColor: PUTIH }}>
            <div className="flex-1 text-center py-1.5"><p className="text-[11px] font-bold text-black">Tempat : <span className="font-normal">{data.tempat || ''}</span></p></div>
            <div className="flex-1 text-center py-1.5"><p className="text-[11px] font-bold text-black">Bil. Ahli Hadir : <span className="font-normal">{data.bilAhliHadir || ''}</span></p></div>
          </div>

          <div className="mb-3 border border-black text-center py-2" style={{ backgroundColor: PUTIH }}>
            <p className="text-[11px] font-bold text-black">Guru Penasihat:</p>
            <p className="text-[11px] font-normal text-black">{data.guruPenasihat || ''}</p>
          </div>

          {/* Kotak-kotak LEBAR PENUH - saiz tetap ikut nisbah templat. */}
          <div className="flex flex-col mb-2" style={{ height: '44mm' }}>
            <KotakKrim className="shrink-0">Laporan Aktiviti</KotakKrim>
            <div className="flex-1 border border-t-0 border-black p-2 overflow-hidden">
              <p className="text-[11px] text-black whitespace-pre-line leading-snug">{(data.laporanAktiviti || '').trim()}</p>
            </div>
          </div>

          <div className="flex flex-col mb-2" style={{ height: '26mm' }}>
            <KotakKrim className="shrink-0">Refleksi</KotakKrim>
            <div className="flex-1 border border-t-0 border-black p-2 overflow-hidden">
              <p className="text-[11px] text-black whitespace-pre-line leading-snug">{(data.refleksi || '').trim()}</p>
            </div>
          </div>

          <div className="flex flex-col mb-2" style={{ height: '28mm' }}>
            <KotakKrim className="shrink-0">Sisipan PIKeBM (10 minit)</KotakKrim>
            <div className="flex-1 border border-t-0 border-black flex flex-col">
              <BarisJadual label="Tajuk" value={data.pikebmTajuk} flex={1} />
              <BarisJadual label="Objektif" value={data.pikebmObjektif} flex={1.5} />
            </div>
          </div>

          <div className="flex flex-col mb-3" style={{ height: '32mm' }}>
            <KotakKrim className="shrink-0">Penerapan Nilai Sivik Dalam Kokurikulum</KotakKrim>
            <div className="flex-1 border border-t-0 border-black flex flex-col">
              <BarisJadual label="Nilai Teras" value={[sivik.nilai, sivik.tajuk].filter(Boolean).join(' - ')} flex={1} />
              <BarisJadual label="Aktiviti" value={sivik.aktiviti} flex={2} />
            </div>
          </div>

          {/* Gambar - SATU BARIS MELINTANG (bukan lajur kanan lagi). */}
          <div className="flex gap-2 mb-4" style={{ height: '30mm' }}>
            <GambarSlot src={gambar[0]} />
            <GambarSlot src={gambar[1]} />
            <GambarSlot src={gambar[2]} />
            <GambarSlot src={gambar[3]} />
          </div>

          <div className="flex border border-black divide-x divide-black">
            <BlokTandatanganCetak label="Tandatangan Setiausaha" ttdUrl={data.ttdSetiausahaUrl} nama={data.namaSetiausaha} />
            <BlokTandatanganCetak label="Tandatangan Guru Penasihat" ttdUrl={data.ttdGuruUrl} nama={data.namaGuruTtd} />
            <BlokTandatanganCetak label="Tandatangan GPK Kokurikulum" ttdUrl={data.ttdGPKUrl} nama={data.namaGPK} />
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
