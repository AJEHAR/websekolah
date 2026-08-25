import PrintArea from '../../components/cetak/PrintArea.jsx'

// Satu kertas kerja = satu muka surat penuh (gambar latar + teks
// bertindih di tengah-bawah, corak biasa muka depan kertas kerja rasmi).
export default function CetakMukaDepan({ senarai, mukaByTahun }) {
  return (
    <PrintArea>
      {senarai.map((r, i) => {
        const gambarUrl = mukaByTahun[r.tahun]?.gambarUrl
        return (
          <div
            key={r.id}
            className={`relative text-black ${i < senarai.length - 1 ? 'print-page-break' : ''}`}
            style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}
          >
            {gambarUrl ? (
              <img src={gambarUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-sm text-black">(Tiada gambar muka depan untuk tahun {r.tahun} - muat naik di tab Muka Depan)</p>
              </div>
            )}
            <div style={{ position: 'absolute', left: '15mm', right: '15mm', bottom: '55mm', textAlign: 'center' }}>
              <p className="text-2xl font-bold text-black leading-snug">{r.tajuk}</p>
              <p className="text-base text-black mt-4">{r.anjuran}</p>
            </div>
          </div>
        )
      })}
    </PrintArea>
  )
}
