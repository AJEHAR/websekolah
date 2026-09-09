import { useEffect, useState, useRef } from 'react'

// Kongsi logik cetak - set data, tunggu DOM update + SEMUA imej (termasuk
// latar belakang CSS) siap dimuat, panggil window.print(), bersihkan
// lepas dialog cetak ditutup (event 'afterprint').
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
    if (!dataCetak) return
    let batal = false

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

    // PENTING: tunggu SEMUA imej (tag <img> DAN latar belakang CSS
    // background-image) dalam .print-area siap dimuat SEBELUM
    // window.print() - punca "gambar/latar belakang hilang bila cetak"
    // yang dilaporkan ialah delay asal (50ms tetap) tak cukup masa untuk
    // imej JAUH (URL Google Drive dsb) selesai muat turun rangkaian
    // sebelum "snapshot" cetak diambil. Had maksimum 3 saat sebagai
    // jaring keselamatan (elak macet selama-lamanya kalau satu imej gagal
    // dimuat langsung).
    async function tungguImejDanCetak() {
      await new Promise((r) => setTimeout(r, 60)) // tunggu React selesai render dulu
      if (batal) return

      const kawasan = document.querySelector('.print-area')
      const janji = []
      if (kawasan) {
        kawasan.querySelectorAll('img').forEach((img) => {
          if (!img.complete) {
            janji.push(new Promise((r) => { img.onload = r; img.onerror = r }))
          }
        })
        kawasan.querySelectorAll('*').forEach((el) => {
          const bg = getComputedStyle(el).backgroundImage
          if (bg && bg !== 'none') {
            const padan = bg.match(/url\(["']?(.*?)["']?\)/)
            if (padan?.[1]) {
              const pramuat = new Image()
              janji.push(new Promise((r) => { pramuat.onload = r; pramuat.onerror = r; pramuat.src = padan[1] }))
            }
          }
        })
      }

      await Promise.race([
        Promise.all(janji),
        new Promise((r) => setTimeout(r, 3000)),
      ])
      if (!batal) window.print()
    }

    tungguImejDanCetak()
    return () => { batal = true }
  }, [dataCetak, namaFailFn])

  return [dataCetak, setDataCetak]
}
