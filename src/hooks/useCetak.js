import { useEffect, useState } from 'react'

// Kongsi logik cetak - set data, tunggu DOM update, panggil window.print(),
// bersihkan lepas dialog cetak ditutup (event 'afterprint').
export function useCetak() {
  const [dataCetak, setDataCetak] = useState(null)

  useEffect(() => {
    function bersih() {
      setDataCetak(null)
    }
    window.addEventListener('afterprint', bersih)
    return () => window.removeEventListener('afterprint', bersih)
  }, [])

  useEffect(() => {
    if (dataCetak) {
      const t = setTimeout(() => window.print(), 50)
      return () => clearTimeout(t)
    }
  }, [dataCetak])

  return [dataCetak, setDataCetak]
}
