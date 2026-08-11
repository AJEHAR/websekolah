import { WARNA_PALET } from './warnaPalet.js'

export default function SenaraiKiraan({ tajuk, data }) {
  const maksima = Math.max(1, ...data.map((d) => d.jumlah))

  return (
    <div>
      {tajuk && <h4 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">{tajuk}</h4>}
      {data.length === 0 ? (
        <p className="text-xs text-inkmuted">Tiada data.</p>
      ) : (
        <div className="space-y-2">
          {data.map((d, i) => {
            const warna = WARNA_PALET[i % WARNA_PALET.length]
            return (
              <div key={d.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: warna.teks }} />
                    <span className="text-ink font-medium truncate">{d.label}</span>
                  </span>
                  <span className="font-bold shrink-0 ml-2" style={{ color: warna.teks }}>{d.jumlah}</span>
                </div>
                <div className="h-2 rounded-full bg-base overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(d.jumlah / maksima) * 100}%`, backgroundColor: warna.teks }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
