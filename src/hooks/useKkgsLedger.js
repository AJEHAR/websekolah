import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase.js'

// Ledger (Buku Besar) - GABUNG SEMUA pergerakan wang KKGS dari 3 sumber
// berlainan (kkgsKewangan manual, kkgsYuran bayaran ahli, kkgsClaim
// Imbuhan/Resit/Sumbangan diluluskan) jadi SATU senarai selaras - elak
// gambaran kewangan berpecah. Cuma rekod BENAR-BENAR selesai (Yuran =
// semua rekod bayaran, Claim = status "diluluskan" sahaja) yang dikira.
//
// PENTING (fix bug #1 "Baki bukan sebenar"): hook ni sekarang tarik
// SEMUA TAHUN (bukan satu tahun sahaja) - perlu untuk kira BAKI
// TERKUMPUL sebenar (jumlah semua tahun dari awal hingga tahun dipilih),
// bukan sekadar Masuk-Keluar SATU tahun. `transaksiTahun` (ditapis satu
// tahun) kekal disediakan berasingan untuk paparan Ledger/Laporan yang
// memang patut tunjuk SATU tempoh sahaja.
function tarikhTimestamp(ts) {
  if (!ts) return null
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toISOString().slice(0, 10)
}

export function useKkgsLedger(tahun, aktif = true) {
  const [semuaTransaksi, setSemuaTransaksi] = useState([])
  const [loading, setLoading] = useState(true)

  const muatSemula = useCallback(async () => {
    if (!isFirebaseConfigured || !aktif) {
      setSemuaTransaksi([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [snapKewangan, snapYuran, snapClaim] = await Promise.all([
        getDocs(collection(db, 'kkgsKewangan')),
        getDocs(collection(db, 'kkgsYuran')),
        getDocs(collection(db, 'kkgsClaim')),
      ])

      const gabungan = []

      snapKewangan.docs.forEach((d) => {
        const data = d.data()
        if (!data.tarikh) return
        gabungan.push({
          id: `kewangan_${d.id}`, sumber: 'kewangan', tarikh: data.tarikh, jenis: data.jenis,
          kategori: data.kategori || 'Lain-lain', perkara: data.perkara, jumlah: data.jumlah,
          programNama: data.programNama || '',
        })
      })

      snapYuran.docs.forEach((d) => {
        const data = d.data()
        if (!data.tarikh) return
        gabungan.push({
          id: `yuran_${d.id}`, sumber: 'yuran', tarikh: data.tarikh, jenis: 'masuk',
          kategori: 'Yuran', perkara: `Yuran - ${data.ahliNama}${data.catatan ? ` (${data.catatan})` : ''}`, jumlah: data.jumlah,
        })
      })

      snapClaim.docs.forEach((d) => {
        const data = d.data()
        if (data.status !== 'diluluskan') return
        const tarikh = tarikhTimestamp(data.tarikhKeputusan) || tarikhTimestamp(data.tarikhMohon)
        if (!tarikh) return

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
            programNama: data.programNama || '',
          })
        }
      })

      gabungan.sort((a, b) => (b.tarikh ?? '').localeCompare(a.tarikh ?? ''))
      setSemuaTransaksi(gabungan)
    } finally {
      setLoading(false)
    }
  }, [aktif])

  useEffect(() => {
    muatSemula()
  }, [muatSemula])

  // Ditapis SATU tahun sahaja - untuk paparan Ledger/Laporan (memang
  // patut tunjuk satu tempoh, bukan gabungan sepanjang zaman).
  const transaksiTahun = tahun ? semuaTransaksi.filter((t) => (t.tarikh ?? '').slice(0, 4) === String(tahun)) : []

  return { semuaTransaksi, transaksiTahun, loading, muatSemula }
}

// Kira BAKI TERKUMPUL SEBENAR pada akhir tahun tertentu - baki
// pembukaan + SEMUA transaksi dari tahunPembukaan hingga akhir tahun
// dipilih (BUKAN sekadar satu tahun tu sahaja).
//
// FIX BUG (dashboard "rasa ada bug" - baki tersasar bila tengok tahun
// SEBELUM tahunPembukaan): sebelum ni, kalau tahunSasaran < tahunPembukaan
// (cth. tetapan Baki Pembukaan dibuat berkuat kuasa 2026, tapi staff
// tukar "Tahun" di atas ke 2024 utk semak rekod lama), filter
// `tahunT >= tahunPembukaan` gagal utk SEMUA rekod (sebab tahunSasaran pun
// < tahunPembukaan), jadi transaksiSehinggaTahun jadi KOSONG dan fungsi
// pulangkan bakiPembukaan MENTAH-MENTAH seolah-olah baki pembukaan tu
// dah wujud sejak 2024 - walhal ia cuma sah bermula tahunPembukaan.
// Sekarang: utk tahun SEBELUM tahunPembukaan, baki pembukaan TIDAK
// dikira langsung (belum berkuat kuasa) - cuma jumlah transaksi SEBENAR
// (jika ada direkod awal) yang dikira.
export function kiraBakiTerkumpul(semuaTransaksi, tahunSasaran, bakiPembukaan, tahunPembukaan) {
  if (tahunSasaran < tahunPembukaan) {
    const transaksiSebelumPembukaan = semuaTransaksi.filter((t) => Number((t.tarikh ?? '').slice(0, 4)) <= tahunSasaran)
    const masuk = transaksiSebelumPembukaan.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
    const keluar = transaksiSebelumPembukaan.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
    return masuk - keluar
  }
  const transaksiSehinggaTahun = semuaTransaksi.filter((t) => {
    const tahunT = Number((t.tarikh ?? '').slice(0, 4))
    return tahunT >= tahunPembukaan && tahunT <= tahunSasaran
  })
  const jumlahMasuk = transaksiSehinggaTahun.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const jumlahKeluar = transaksiSehinggaTahun.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  return bakiPembukaan + jumlahMasuk - jumlahKeluar
}

// Baki SEMASA kelab (hari ini SEBENAR) - staff minta Dashboard SENTIASA
// tunjuk baki BENAR sekarang, tak kira tahun mana sedang dipilih pada
// dropdown "Tahun" di atas (kiraBakiTerkumpul di atas ikut AKHIR tahun
// dipilih - berguna utk semak rekod lama, tapi BUKAN "baki semasa" kalau
// staff sedang tengok tahun lepas/depan). Had ialah TARIKH SEBENAR hari
// ini (bukan sekadar tahun) - elak kira transaksi bertarikh masa depan
// (kalau ada direkod awal) sebagai sebahagian baki SEKARANG.
export function kiraBakiSemasa(semuaTransaksi, bakiPembukaan, tahunPembukaan) {
  const hariIniISO = new Date().toISOString().slice(0, 10)
  const transaksiSehinggaKini = semuaTransaksi.filter((t) => (t.tarikh ?? '') <= hariIniISO)
  const tahunHariIni = Number(hariIniISO.slice(0, 4))
  if (tahunHariIni < tahunPembukaan) {
    const masuk = transaksiSehinggaKini.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
    const keluar = transaksiSehinggaKini.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
    return masuk - keluar
  }
  const transaksiDikira = transaksiSehinggaKini.filter((t) => Number((t.tarikh ?? '').slice(0, 4)) >= tahunPembukaan)
  const masuk = transaksiDikira.filter((t) => t.jenis === 'masuk').reduce((j, t) => j + t.jumlah, 0)
  const keluar = transaksiDikira.filter((t) => t.jenis === 'keluar').reduce((j, t) => j + t.jumlah, 0)
  return bakiPembukaan + masuk - keluar
}

// Kumpul transaksi (tersusun MENAIK ikut tarikh, dgn lajur `baki` dah
// dikira sebelum sampai sini) ikut SEMUA 12 BULAN (Januari-Disember) -
// SENTIASA 12 kumpulan walaupun sesetengah bulan tiada transaksi langsung.
// Dikongsi antara Laporan Kewangan (versi cetak) DAN tab Ledger (versi
// skrin) - kedua-dua guna struktur bulanan + baki bawa ke hadapan yang
// SAMA (gabungan diminta oleh staff).
export function kumpul12Bulan(transaksi, bakiAwalTahun) {
  const kumpulan = Array.from({ length: 12 }, (_, i) => ({ bulan: i + 1, senarai: [] }))
  transaksi.forEach((t) => {
    const b = Number((t.tarikh ?? '').slice(5, 7))
    if (b >= 1 && b <= 12) kumpulan[b - 1].senarai.push(t)
  })
  let bakiSebelum = bakiAwalTahun
  return kumpulan.map((k) => {
    const bakiAwalBulan = bakiSebelum
    const bakiAkhirBulan = k.senarai.length > 0 ? k.senarai[k.senarai.length - 1].baki : bakiAwalBulan
    bakiSebelum = bakiAkhirBulan
    return { ...k, bakiAwalBulan, bakiAkhirBulan }
  })
}

// Susun transaksi MENAIK ikut tarikh (kronologi - lama ke baru, macam Buku
// Besar/General Ledger sebenar) dan kira BAKI BERGERAK (running balance)
// bagi SETIAP row - baki bermula (bakiAwalTempoh) + kesan kumulatif setiap
// transaksi turut serta (fix bug "Ledger tak macam gambar rujukan" - takde
// lajur Baki sebelum ni).
export function kiraTransaksiDenganBaki(senaraiTransaksi, bakiAwalTempoh) {
  const tersusun = [...senaraiTransaksi].sort((a, b) => {
    const bezaTarikh = (a.tarikh ?? '').localeCompare(b.tarikh ?? '')
    if (bezaTarikh !== 0) return bezaTarikh
    return (a.id ?? '').localeCompare(b.id ?? '')
  })
  let baki = bakiAwalTempoh
  return tersusun.map((t) => {
    baki += t.jenis === 'masuk' ? t.jumlah : -t.jumlah
    return { ...t, baki }
  })
}

export const KATEGORI_KEWANGAN = ['Yuran', 'Sumbangan', 'Imbuhan', 'Belanja Program', 'Perbelanjaan Pentadbiran', 'Lain-lain']
