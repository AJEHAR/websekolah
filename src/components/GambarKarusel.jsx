import { useAutoSlide } from '../hooks/useAutoSlide.js'

// Kulit kad album yg "bergerak" - cycle automatik antara beberapa gambar
// (senarai) setiap `selangMs`, dgn crossfade lembut (bukan tukar terus
// "cut"). Semua gambar dlm senarai dimuatkan sekali (stacked, opacity
// ditoggle) - had `senarai` kpd beberapa gambar sahaja (bukan seluruh
// album) drpd pemanggil, elak muat naik terlalu banyak gambar utk satu kad.
export default function GambarKarusel({ senarai, alt, className = '' }) {
  const indeks = useAutoSlide(senarai.length, 3000)

  if (senarai.length === 0) return null

  return (
    <div className={`absolute inset-0 ${className}`}>
      {senarai.map((url, i) => (
        <img
          key={url}
          src={url}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === indeks ? 'opacity-100' : 'opacity-0'}`}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  )
}
