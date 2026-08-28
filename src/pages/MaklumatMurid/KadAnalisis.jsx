import { warnaCeria } from './paletCeria.js'

// Carta bar mendatar berwarna-warni - setiap kategori dapat warna
// tersendiri (dikitar dari palet ceria), lebar bar berkadar dengan
// peratusan daripada jumlah keseluruhan. Gaya infografik "sekolah ceria"
// - lebih mudah dibaca secara pantas berbanding senarai teks rata.
export default function KadAnalisis({ tajuk, data, nota }) {
  const jumlahSemua = data.reduce((j, d) => j + d.jumlah, 0)
  const maksima = Math.max(1, ...data.map((d) => d.jumlah))

  return (
    <div className="border border-border rounded-card p-4 bg-surface">
      {tajuk && (
        <h4 className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-3">{tajuk}</h4>
      )}
      {data.length === 0 ? (
        <p className="text-xs text-inkmuted">Tiada data.</p>
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => {
            const w = warnaCeria(i)
            const peratus = jumlahSemua > 0 ? Math.round((d.jumlah / jumlahSemua) * 100) : 0
            return (
              <div key={d.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-ink font-medium truncate pr-2">{d.label}</span>
                  <span className="shrink-0">
                    <span className="font-bold text-ink">{d.jumlah}</span>
                    <span className="text-inkmuted"> ({peratus}%)</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-base overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(d.jumlah / maksima) * 100}%`, backgroundColor: w.fg }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
      {nota && <p className="text-[10px] text-inkmuted mt-3">{nota}</p>}
    </div>
  )
}
