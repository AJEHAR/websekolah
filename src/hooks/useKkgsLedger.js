import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Ledger (Buku Besar) - GABUNG SEMUA pergerakan wang KKGS dari 3 sumber
// berlainan (kkgsKewangan manual, kkgsYuran bayaran ahli, kkgsClaim
// Imbuhan/Resit/Sumbangan diluluskan) jadi SATU senarai selaras - elak
// gambaran kewangan berpecah (Baki Semasa yang TAK termasuk Yuran/Claim
// akan mengelirukan). Cuma rekod BENAR-BENAR selesai (Yuran = semua
// rekod bayaran, Claim = status "diluluskan" sahaja - tuntutan menunggu
// belum benar-benar keluar duit) yang dikira.
function tarikhTimestamp(ts) {
  if (!ts) return null
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toISOString().slice(0, 10)
}

export function useKkgsLedger(tahun, aktif = true) {
  const [transaksi, setTransaksi] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !tahun || !aktif) {
      setTransaksi([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [snapKewangan, snapYuran, snapClaim] = await Promise.all([
        getDocs(collection(db, 'kkgsKewangan')),
        getDocs(query(collection(db, 'kkgsYuran'), where('tahun', '==', Number(tahun)))),
        getDocs(collection(db, 'kkgsClaim')),
      ])

      const gabungan = []

      // 1. Kewangan manual - jenis & kategori terus dari rekod.
      snapKewangan.docs.forEach((d) => {
        const data = d.data()
        if (!data.tarikh || data.tarikh.slice(0, 4) !== String(tahun)) return
        gabungan.push({
          id: `kewangan_${d.id}`, sumber: 'kewangan', tarikh: data.tarikh, jenis: data.jenis,
          kategori: data.kategori || 'Lain-lain', perkara: data.perkara, jumlah: data.jumlah,
        })
      })

      // 2. Yuran - SEMUA rekod bayaran = MASUK (tiada langkah kelulusan).
      snapYuran.docs.forEach((d) => {
        const data = d.data()
        gabungan.push({
          id: `yuran_${d.id}`, sumber: 'yuran', tarikh: data.tarikh, jenis: 'masuk',
          kategori: 'Yuran', perkara: `Yuran - ${data.ahliNama}${data.catatan ? ` (${data.catatan})` : ''}`, jumlah: data.jumlah,
        })
      })

      // 3. Claim (Imbuhan/Resit/Sumbangan) - HANYA status "diluluskan"
      //    (tuntutan "menunggu" belum benar-benar keluar duit lagi).
      snapClaim.docs.forEach((d) => {
        const data = d.data()
        if (data.status !== 'diluluskan') return
        const tarikh = tarikhTimestamp(data.tarikhKeputusan) || tarikhTimestamp(data.tarikhMohon)
        if (!tarikh || tarikh.slice(0, 4) !== String(tahun)) return

        if (data.jenisClaim === 'sumbangan') {
          const masuk = data.arahSumbangan === 'masuk'
          gabungan.push({
            id: `claim_${d.id}`, sumber: 'claim', tarikh, jenis: masuk ? 'masuk' : 'keluar',
            kategori: 'Sumbangan',
            perkara: masuk
              ? `Sumbangan drpd ${data.ahliNama}${data.kepadaSiapa ? ` (untuk ${data.kepadaSiapa})` : ''}`
              : `Sumbangan kepada ${data.ahliNama}`,
            jumlah: data.jumlah,
          })
        } else {
          gabungan.push({
            id: `claim_${d.id}`, sumber: 'claim', tarikh, jenis: 'keluar',
            kategori: data.jenisClaim === 'imbuhan' ? 'Imbuhan' : 'Resit',
            perkara: data.jenisClaim === 'imbuhan' ? `${data.jenisImbuhan} - ${data.ahliNama}` : (data.tujuan || '-'),
            jumlah: data.jumlah,
          })
        }
      })

      gabungan.sort((a, b) => (b.tarikh ?? '').localeCompare(a.tarikh ?? ''))
      setTransaksi(gabungan)
    } finally {
      setLoading(false)
    }
  }, [tahun, aktif])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  return { transaksi, loading, muatSemula }
}

export const KATEGORI_KEWANGAN = ['Yuran', 'Sumbangan', 'Imbuhan', 'Belanja Program', 'Perbelanjaan Pentadbiran', 'Lain-lain']
