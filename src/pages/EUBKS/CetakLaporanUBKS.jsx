import PrintArea from '../../components/cetak/PrintArea.jsx'

const KRIM = '#FCEFC7'
const BIRU = '#1B0FB0'

function KotakKrim({ children, className = '' }) {
  return (
    <div className={`flex-1 border border-black text-center py-2.5 px-2 overflow-hidden ${className}`} style={{ backgroundColor: KRIM }}>
      <p className="text-xs font-bold text-black">{children}</p>
    </div>
  )
}

function BarisJadual({ label, value }) {
  return (
    <div className="flex border-b border-black last:border-b-0 overflow-hidden" style={{ flex: 1 }}>
      <div className="w-24 shrink-0 flex items-center justify-center border-r border-black px-1">
        <p className="text-xs font-medium text-black text-center">{label}</p>
      </div>
      <div className="flex-1 flex items-center px-2 overflow-hidden">
        <p className="text-[11px] text-black leading-snug">{value || ''}</p>
      </div>
    </div>
  )
}

function GambarSlot({ src }) {
  return (
    <div className="border-2 border-black overflow-hidden flex-1">
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#EAF3FB]" />}
    </div>
  )
}

function BlokTandatanganCetak({ label, ttdUrl, nama }) {
  return (
    <div className="flex-1">
      <div style={{ backgroundColor: KRIM }} className="text-center py-2 border-b border-black"><p className="text-xs font-bold text-black">{label}</p></div>
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

// Replika TEPAT templat "Laporan Aktiviti Perjumpaan" rujukan - TETAP 1
// muka A4 (height:297mm + overflow:hidden), susunan flex berkadar supaya
// kekal isi penuh muka surat tak kira teks sikit/banyak (sama prinsip
// dengan Cetak OPR).
export default function CetakLaporanUBKS({ data, unit, perjumpaan }) {
  const gambar = data.gambar || [null, null, null, null]

  return (
    <PrintArea>
      <div className="flex flex-col text-black" style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}>
        <div className="text-center py-5 shrink-0" style={{ backgroundColor: BIRU }}>
          <p className="text-2xl font-extrabold text-white uppercase tracking-wide">Laporan Aktiviti Perjumpaan</p>
        </div>

        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="flex border border-black divide-x divide-black mb-2 shrink-0" style={{ backgroundColor: KRIM }}>
            <div className="flex-1 text-center py-2"><p className="text-xs font-bold text-black">Bil. Perjumpaan : <span className="font-normal">{perjumpaan}</span></p></div>
            <div className="flex-1 text-center py-2"><p className="text-xs font-bold text-black">Tarikh : <span className="font-normal">{data.tarikh}</span></p></div>
            <div className="flex-1 text-center py-2"><p className="text-xs font-bold text-black">Masa : <span className="font-normal">{data.masa}</span></p></div>
          </div>

          <div className="flex border border-black divide-x divide-black mb-2 shrink-0">
            <KotakKrim className="border-0" >{`Tempat : ${data.tempat || ''}`}</KotakKrim>
            <KotakKrim className="border-0">{`Bil. Ahli Hadir : ${data.bilAhliHadir || ''}`}</KotakKrim>
          </div>

          <div className="mb-3 shrink-0"><KotakKrim>{`Guru Penasihat : ${data.guruPenasihat || ''}`}</KotakKrim></div>

          <div className="flex-1 flex gap-2 min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-col mb-2" style={{ flex: 3 }}>
                <KotakKrim className="shrink-0">Laporan Aktiviti</KotakKrim>
                <div className="flex-1 border border-t-0 border-black p-2 overflow-hidden">
                  <p className="text-[11px] text-black whitespace-pre-line leading-snug">{data.laporanAktiviti}</p>
                </div>
              </div>

              <div className="flex flex-col mb-2" style={{ flex: 1.6 }}>
                <KotakKrim className="shrink-0">Refleksi</KotakKrim>
                <div className="flex-1 border border-t-0 border-black p-2 overflow-hidden">
                  <p className="text-[11px] text-black whitespace-pre-line leading-snug">{data.refleksi}</p>
                </div>
              </div>

              <div className="flex flex-col mb-2" style={{ flex: 1.5 }}>
                <KotakKrim className="shrink-0">Sisipan PIKeBM (10 minit)</KotakKrim>
                <div className="flex-1 border border-t-0 border-black flex flex-col">
                  <BarisJadual label="Tajuk" value={data.pikebmTajuk} />
                  <BarisJadual label="Objektif" value={data.pikebmObjektif} />
                </div>
              </div>

              <div className="flex flex-col" style={{ flex: 1.5 }}>
                <KotakKrim className="shrink-0">Penerapan Nilai Sivik Dalam Kokurikulum</KotakKrim>
                <div className="flex-1 border border-t-0 border-black flex flex-col">
                  <BarisJadual label="Nilai Teras" value={data.nilaiTeras} />
                  <BarisJadual label="Aktiviti" value={data.nilaiAktiviti} />
                </div>
              </div>
            </div>

            <div className="w-[110px] shrink-0 flex flex-col gap-2">
              <GambarSlot src={gambar[0]} />
              <GambarSlot src={gambar[1]} />
              <GambarSlot src={gambar[2]} />
              <GambarSlot src={gambar[3]} />
            </div>
          </div>

          <div className="flex border border-black divide-x divide-black mt-3 shrink-0">
            <BlokTandatanganCetak label="Tandatangan Setiausaha" ttdUrl={data.ttdSetiausahaUrl} nama={data.namaSetiausaha} />
            <BlokTandatanganCetak label="Tandatangan Guru Penasihat" ttdUrl={data.ttdGuruUrl} nama={data.namaGuruTtd} />
            <BlokTandatanganCetak label="Tandatangan GPK Kokurikulum" ttdUrl={data.ttdGPKUrl} nama={data.namaGPK} />
          </div>
        </div>
      </div>
    </PrintArea>
  )
}
