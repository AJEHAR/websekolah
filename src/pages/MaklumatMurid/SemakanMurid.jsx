import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Upload, Search, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useMuridList } from '../../hooks/useMurid.js'
import { useLajurMuridTetapan, lajurKelihatan } from '../../hooks/useLajurMuridTetapan.js'
import { SENARAI_MEDAN } from './muridFields.js'
import ImportXlsxModal from './ImportXlsxModal.jsx'

export default function SemakanMurid() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const { senarai, loading, muatSemula } = useMuridList()
  const { tetapan } = useLajurMuridTetapan()

  const [carian, setCarian] = useState('')
  const [tunjukImport, setTunjukImport] = useState(false)

  const lajurNampak = SENARAI_MEDAN.filter(([, kunci]) => lajurKelihatan(tetapan, kunci))

  const disenarai = senarai.filter((m) =>
    `${m.nama ?? ''} ${m.namaKelas ?? ''}`.toLowerCase().includes(carian.toLowerCase())
  )

  const analisisKelas = useMemo(() => {
    const hasil = {}
    senarai.forEach((m) => {
      const kelas = m.namaKelas?.trim() || 'Tiada Kelas'
      if (!hasil[kelas]) hasil[kelas] = { jumlahMurid: 0, jumlahKosong: 0, muridTakLengkap: 0 }
      hasil[kelas].jumlahMurid += 1
      let kosongMuridIni = 0
      lajurNampak.forEach(([, kunci]) => {
        if (!m[kunci]) {
          hasil[kelas].jumlahKosong += 1
          kosongMuridIni += 1
        }
      })
      if (kosongMuridIni > 0) hasil[kelas].muridTakLengkap += 1
    })
    return Object.entries(hasil)
      .map(([kelas, d]) => ({ kelas, ...d }))
      .sort((a, b) => b.jumlahKosong - a.jumlahKosong)
  }, [senarai, lajurNampak])

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs text-inkmuted">{senarai.length} murid</p>
        {adaSeksyen('murid') && (
          <button
            onClick={() => setTunjukImport(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-red px-3 py-2 rounded-card shrink-0"
          >
            <Upload size={14} /> Import XLSX
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          type="text"
          value={carian}
          onChange={(e) => setCarian(e.target.value)}
          placeholder="Cari nama atau kelas…"
          className="w-full h-11 pl-9 pr-3 rounded-card border border-border bg-surface text-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-inkmuted">Memuatkan…</p>
      ) : disenarai.length === 0 ? (
        <p className="text-sm text-inkmuted mb-8">
          {senarai.length === 0 ? 'Tiada murid lagi - admin boleh import fail XLSX.' : 'Tiada murid dijumpai.'}
        </p>
      ) : (
        <div className="overflow-auto border border-border rounded-card mb-8 max-h-[70vh]">
          <table className="text-xs w-full">
            <thead className="bg-base sticky top-0 z-10">
              <tr>
                {lajurNampak.map(([label, kunci]) => (
                  <th key={kunci} className="text-left px-3 py-2 font-semibold text-ink whitespace-nowrap border-b border-border">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {disenarai.map((m) => (
                <tr key={m.id}>
                  {lajurNampak.map(([, kunci]) => (
                    <td
                      key={kunci}
                      className={`px-3 py-2 whitespace-nowrap ${
                        !m[kunci] ? 'bg-[#FCEBEB] text-brand-red font-semibold' : 'text-ink'
                      }`}
                    >
                      {m[kunci] || 'TIADA DATA'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold text-ink mb-3">Kelengkapan Data Ikut Kelas</h3>
        <div className="border border-border rounded-card overflow-hidden divide-y divide-border">
          {analisisKelas.map((k) => (
            <div key={k.kelas} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{k.kelas}</p>
                <p className="text-xs text-inkmuted">{k.jumlahMurid} murid</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {k.jumlahKosong === 0 ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-700" />
                    <span className="text-sm font-semibold text-green-700">Lengkap</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-brand-red" />
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-red">{k.jumlahKosong} medan kosong</p>
                      <p className="text-xs text-inkmuted">{k.muridTakLengkap} murid tak lengkap</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ImportXlsxModal
        open={tunjukImport}
        onClose={() => setTunjukImport(false)}
        user={user}
        senaraiSediaAda={senarai}
        onSelesai={muatSemula}
      />
    </div>
  )
}
