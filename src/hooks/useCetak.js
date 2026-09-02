import { useEffect, useState, useRef } from 'react'

// Kongsi logik cetak - set data, tunggu DOM update, panggil window.print(),
// bersihkan lepas dialog cetak ditutup (event 'afterprint').
//
// namaFailFn (pilihan): (dataCetak) => string - jana nama cadangan untuk
// dialog "Simpan sebagai PDF" pelayar. Pelayar guna document.title semasa
// window.print() dipanggil sebagai cadangan nama fail - PUNCA ia sentiasa
// nama sekolah sebelum ni ialah index.html ada <title> STATIK yang tak
// pernah berubah ikut page. Kita tukar document.title SEMENTARA sahaja
// (kembalikan ke asal selepas cetak) supaya tab browser biasa tak terjejas.
export function useCetak(namaFailFn) {
  const [dataCetak, setDataCetak] = useState(null)
  const tajukAsal = useRef(null)

  useEffect(() => {
    function bersih() {
      setDataCetak(null)
      if (tajukAsal.current !== null) {
        document.title = tajukAsal.current
        tajukAsal.current = null
      }
    }
    window.addEventListener('afterprint', bersih)
    return () => window.removeEventListener('afterprint', bersih)
  }, [])

  useEffect(() => {
    if (dataCetak) {
      if (namaFailFn) {
        try {
          const nama = namaFailFn(dataCetak)
          if (nama) {
            tajukAsal.current = document.title
            document.title = nama
          }
        } catch {
          // Gagal jana nama (data tak lengkap dsb) - biar document.title asal, jangan gagalkan cetak.
        }
      }
      const t = setTimeout(() => window.print(), 50)
      return () => clearTimeout(t)
    }
  }, [dataCetak, namaFailFn])

  return [dataCetak, setDataCetak]
}
