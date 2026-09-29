import { useEffect, useState } from 'react'

// Auto-cycle indeks 0..panjang-1 setiap `selangMs` - dipakai utk kad album
// "bergerak" (tunjuk beberapa gambar dlm album secara automatik, tanpa perlu
// klik buka dulu). Tak buat apa-apa jika panjang <=1 (tiada apa nak cycle).
export function useAutoSlide(panjang, selangMs = 3000) {
  const [indeks, setIndeks] = useState(0)

  useEffect(() => {
    setIndeks(0)
  }, [panjang])

  useEffect(() => {
    if (panjang <= 1) return
    const masa = setInterval(() => setIndeks((i) => (i + 1) % panjang), selangMs)
    return () => clearInterval(masa)
  }, [panjang, selangMs])

  return indeks
}
