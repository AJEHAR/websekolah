// Pemetaan header Excel (SENARAI KESELURUHAN MURID) <-> kunci medan sistem.
// Susunan ikut turutan asal dalam fail Excel - guna untuk import DAN paparan.
export const SENARAI_MEDAN = [
  ['ID MURID', 'idMurid'],
  ['NAMA', 'nama'],
  ['NO. PENGENALAN', 'noPengenalan'],
  ['JENIS PENGENALAN', 'jenisPengenalan'],
  ['TARIKH LAHIR', 'tarikhLahir'],
  ['STATUS PENGAJIAN', 'statusPengajian'],
  ['TARIKH MASUK SEKOLAH', 'tarikhMasukSekolah'],
  ['TARIKH MASUK KELAS', 'tarikhMasukKelas'],
  ['TAHUN / TINGKATAN', 'tahunTingkatan'],
  ['NAMA KELAS', 'namaKelas'],
  ['STATUS DLP', 'statusDlp'],
  ['JENIS KELAS', 'jenisKelas'],
  ['KETERANGAN ALIRAN', 'keteranganAliran'],
  ['KETERANGAN BIDANG', 'keteranganBidang'],
  ['NAMA GURU KELAS', 'namaGuruKelas'],
  ['JANTINA', 'jantina'],
  ['KAUM', 'kaum'],
  ['AGAMA', 'agama'],
  ['WARGANEGARA', 'warganegara'],
  ['NEGARA ASAL', 'negaraAsal'],
  ['STATUS ASRAMA', 'statusAsrama'],
  ['NAMA ASRAMA', 'namaAsrama'],
  ['STATUS OKU', 'statusOku'],
  ['TARIKH SAH OKU', 'tarikhSahOku'],
  ['NO. PENDAFTARAN OKU', 'noPendaftaranOku'],
  ['TARIKH DAFTAR OKU', 'tarikhDaftarOku'],
  ['TARIKH KAD OKU', 'tarikhKadOku'],
  ['KATEGORI KETIDAKUPAYAAN', 'kategoriKetidakupayaan'],
  ['SUBKATEGORI KETIDAKUPAYAAN', 'subkategoriKetidakupayaan'],
  ['STATUS YATIM', 'statusYatim'],
  ['NO. AKAUN BANK', 'noAkaunBank'],
  ['NAMA BANK', 'namaBank'],
  ['PENJAGA 1', 'penjaga1Nama'],
  ['NO. PENGENALAN PENJAGA 1', 'penjaga1NoPengenalan'],
  ['JNS. PENGENALAN PENJAGA 1', 'penjaga1JenisPengenalan'],
  ['HUBUNGAN PENJAGA 1', 'penjaga1Hubungan'],
  ['PEKERJAAN PENJAGA 1', 'penjaga1Pekerjaan'],
  ['STATUS KERJA PENJAGA 1', 'penjaga1StatusKerja'],
  ['NAMA MAJIKAN PENJAGA 1', 'penjaga1NamaMajikan'],
  ['PENDAPATAN PENJAGA 1', 'penjaga1Pendapatan'],
  ['NO. TEL. PEJABAT PENJAGA 1', 'penjaga1TelPejabat'],
  ['NO. TEL. BIMBIT PENJAGA 1', 'penjaga1TelBimbit'],
  ['TANGGUNGAN', 'tanggungan'],
  ['PENJAGA 2', 'penjaga2Nama'],
  ['NO. PENGENALAN PENJAGA 2', 'penjaga2NoPengenalan'],
  ['JNS. PENGENALAN PENJAGA 2', 'penjaga2JenisPengenalan'],
  ['HUBUNGAN PENJAGA 2', 'penjaga2Hubungan'],
  ['PEKERJAAN PENJAGA 2', 'penjaga2Pekerjaan'],
  ['STATUS KERJA PENJAGA 2', 'penjaga2StatusKerja'],
  ['NAMA MAJIKAN PENJAGA 2', 'penjaga2NamaMajikan'],
  ['PENDAPATAN PENJAGA 2', 'penjaga2Pendapatan'],
  ['NO. TEL. PEJABAT PENJAGA 2', 'penjaga2TelPejabat'],
  ['NO. TEL. BIMBIT PENJAGA 2', 'penjaga2TelBimbit'],
  ['ALAMAT 1', 'alamat1'],
  ['ALAMAT 2', 'alamat2'],
  ['ALAMAT 3', 'alamat3'],
  ['POSKOD', 'poskod'],
  ['BANDAR', 'bandar'],
  ['DAERAH', 'daerah'],
  ['NEGERI', 'negeri'],
]

// header Excel -> kunci medan (untuk parsing import)
export const PEMETAAN_MEDAN = Object.fromEntries(SENARAI_MEDAN)

// kunci medan -> label paparan (untuk UI)
export const LABEL_MEDAN = Object.fromEntries(SENARAI_MEDAN.map(([label, kunci]) => [kunci, label]))
LABEL_MEDAN.statusRMT = 'Status RMT' // medan terbitan - bukan dari Excel, dikira semasa import

// Kumpulan medan ikut kategori - untuk paparan detail murid (bahagi 61 medan
// jadi seksyen senang dibaca, bukan satu senarai panjang).
export const KUMPULAN_MEDAN = [
  {
    tajuk: 'Identiti & Akademik',
    medan: [
      'idMurid', 'nama', 'noPengenalan', 'jenisPengenalan', 'tarikhLahir',
      'statusPengajian', 'tarikhMasukSekolah', 'tarikhMasukKelas', 'tahunTingkatan',
      'namaKelas', 'statusDlp', 'jenisKelas', 'keteranganAliran', 'keteranganBidang',
      'namaGuruKelas', 'jantina', 'kaum', 'agama', 'warganegara', 'negaraAsal',
      'statusAsrama', 'namaAsrama', 'statusRMT',
    ],
  },
  {
    tajuk: 'OKU & Ketidakupayaan',
    medan: [
      'statusOku', 'tarikhSahOku', 'noPendaftaranOku', 'tarikhDaftarOku', 'tarikhKadOku',
      'kategoriKetidakupayaan', 'subkategoriKetidakupayaan', 'statusYatim',
    ],
  },
  {
    tajuk: 'Kewangan',
    medan: ['noAkaunBank', 'namaBank'],
  },
  {
    tajuk: 'Penjaga 1',
    medan: [
      'penjaga1Nama', 'penjaga1NoPengenalan', 'penjaga1JenisPengenalan', 'penjaga1Hubungan',
      'penjaga1Pekerjaan', 'penjaga1StatusKerja', 'penjaga1NamaMajikan', 'penjaga1Pendapatan',
      'penjaga1TelPejabat', 'penjaga1TelBimbit', 'tanggungan',
    ],
  },
  {
    tajuk: 'Penjaga 2',
    medan: [
      'penjaga2Nama', 'penjaga2NoPengenalan', 'penjaga2JenisPengenalan', 'penjaga2Hubungan',
      'penjaga2Pekerjaan', 'penjaga2StatusKerja', 'penjaga2NamaMajikan', 'penjaga2Pendapatan',
      'penjaga2TelPejabat', 'penjaga2TelBimbit',
    ],
  },
  {
    tajuk: 'Alamat',
    medan: ['alamat1', 'alamat2', 'alamat3', 'poskod', 'bandar', 'daerah', 'negeri'],
  },
]
