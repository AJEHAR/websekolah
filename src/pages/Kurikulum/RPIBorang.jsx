import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { todayISO } from '../../lib/dateUtils.js'
import RPIBahagianA from './RPIBahagianA.jsx'
import RPIBahagianB from './RPIBahagianB.jsx'
import RPIBahagianC from './RPIBahagianC.jsx'

function nilaiAsal(rpi) {
  return {
    muridId: rpi?.muridId ?? null,
    muridNama: rpi?.muridNama ?? '',
    tahunSesi: rpi?.tahunSesi ?? String(new Date().getFullYear()),
    program: rpi?.program ?? 'sekolah-pk',
    tarikhLahir: rpi?.tarikhLahir ?? '',
    umur: rpi?.umur ?? '',
    kelas: rpi?.kelas ?? '',
    kategori: rpi?.kategori ?? '',
    diagnosis: rpi?.diagnosis ?? '',
    pengetahuanSediaAda: rpi?.pengetahuanSediaAda ?? '',
    keupayaan: rpi?.keupayaan ?? '',
    keperluanPerubatan: rpi?.keperluanPerubatan ?? '',
    keperluanPerkhidmatanSokongan: rpi?.keperluanPerkhidmatanSokongan ?? '',
    keperluanAlatSokongan: rpi?.keperluanAlatSokongan ?? '',
    kurikulumDiikuti: rpi?.kurikulumDiikuti ?? '',
    fokusKefungsian: rpi?.fokusKefungsian ?? false,
    fokusAkademik: rpi?.fokusAkademik ?? false,
    cabaranUtama: rpi?.cabaranUtama ?? '',
    matlamatJangkaPanjang: rpi?.matlamatJangkaPanjang ?? '',
    intervensi: rpi?.intervensi ?? [],
    tarikhMula: rpi?.tarikhMula ?? todayISO(),
    tarikhSemak: rpi?.tarikhSemak ?? '',
    imkpk: rpi?.imkpk ?? '',
    sidangPertama: rpi?.sidangPertama ?? { tarikh: '', namaIbuBapa: '', namaGuru: '', disemakOleh: '', disahkanOleh: '' },
    sidangPenilaian: rpi?.sidangPenilaian ?? { tarikh: '', namaIbuBapa: '', namaGuru: '' },
  }
}

export default function RPIBorang({ rpi, senaraiMurid, onSimpan, onBatal }) {
  const [data, setData] = useState(nilaiAsal(rpi))
  const [muridDipilih, setMuridDipilih] = useState(
    rpi?.muridId ? senaraiMurid.find((m) => m.id === rpi.muridId) ?? null : null
  )
  const [ralat, setRalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  function ubahMurid(murid) {
    setMuridDipilih(murid)
    if (murid) {
      setData((d) => ({
        ...d,
        muridId: murid.id,
        muridNama: murid.nama,
        kelas: murid.namaKelas || d.kelas,
        tarikhLahir: murid.tarikhLahir || d.tarikhLahir,
        kategori: murid.kategoriKetidakupayaan || d.kategori,
      }))
    } else {
      setData((d) => ({ ...d, muridId: null, muridNama: '' }))
    }
  }

  async function hantar(e) {
    e.preventDefault()
    setRalat(null)
    if (!data.muridId) return setRalat('Sila pilih murid.')
    if (!data.tahunSesi.trim()) return setRalat('Sila isi Tahun.')

    setMenyimpan(true)
    try {
      await onSimpan(data)
    } catch (err) {
      setRalat(err.message || 'Gagal simpan RPI.')
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <div>
      <button onClick={onBatal} className="flex items-center gap-1 text-xs font-medium text-brand-red mb-4 w-fit">
        <ChevronLeft size={14} /> Kembali ke senarai RPI
      </button>

      <h1 className="text-lg font-bold text-ink mb-1">{rpi ? 'Kemas Kini RPI' : 'RPI Baru'}</h1>
      <p className="text-xs text-inkmuted mb-6">Rancangan Pendidikan Individu Murid Berkeperluan Pendidikan Khas Sekolah Rendah</p>

      <form onSubmit={hantar} className="space-y-8">
        <RPIBahagianA
          data={data}
          onUbah={setData}
          senaraiMurid={senaraiMurid}
          muridDipilih={muridDipilih}
          onPilihMurid={ubahMurid}
        />
        <RPIBahagianB data={data} onUbah={setData} />
        <RPIBahagianC data={data} onUbah={setData} />

        {ralat && <p className="text-sm text-brand-red">{ralat}</p>}

        <div className="flex gap-3 pt-2 pb-8 sticky bottom-0 bg-base py-3">
          <button type="submit" disabled={menyimpan} className="flex-1 sm:flex-none h-12 px-8 rounded-card bg-brand-red text-white text-sm font-semibold disabled:opacity-60">
            {menyimpan ? 'Menyimpan…' : 'Simpan RPI'}
          </button>
          <button type="button" onClick={onBatal} className="h-12 px-5 rounded-card border border-border text-sm font-medium text-ink">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
