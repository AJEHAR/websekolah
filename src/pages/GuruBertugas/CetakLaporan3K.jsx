import KepalaSuratCetak from '../../components/cetak/KepalaSuratCetak.jsx'
import RuangTandatangan from '../../components/cetak/RuangTandatangan.jsx'
import PrintArea from '../../components/cetak/PrintArea.jsx'

// kumpulan: [{ tarikh, bloks, rekodSenarai }]
export default function CetakLaporan3K({ kumpulan }) {
  return (
    <PrintArea>
      {kumpulan.map((k, i) => (
        <div key={k.tarikh} className={`p-10 text-black text-sm ${i < kumpulan.length - 1 ? 'print-page-break' : ''}`}>
          <KepalaSuratCetak tajukLaporan="Laporan 3K (Keselamatan, Kebersihan & Disiplin)" />

          <p className="mb-4"><strong>Tarikh:</strong> {k.tarikh}</p>

          {k.bloks.map((b) => {
            const r = k.rekodSenarai.find((rk) => rk.blokId === b.id)
            return (
              <div key={b.id} className="mb-3 border border-black rounded p-2">
                <p className="font-bold text-sm mb-1">{b.nama}</p>
                {r ? (
                  <div className="space-y-0.5 text-xs">
                    <p><strong>Guru:</strong> {r.guru?.nama}</p>
                    <p><strong>Keselamatan:</strong> {r.catatanKeselamatan}</p>
                    <p><strong>Kebersihan:</strong> {r.catatanKebersihan}</p>
                    {b.adaDisiplin && <p><strong>Disiplin:</strong> {r.catatanDisiplin}</p>}
                  </div>
                ) : (
                  <p className="text-xs">Belum diisi</p>
                )}
              </div>
            )
          })}

          <RuangTandatangan senarai={['Guru Bertugas', 'Disemak Oleh']} />
        </div>
      ))}
    </PrintArea>
  )
}
