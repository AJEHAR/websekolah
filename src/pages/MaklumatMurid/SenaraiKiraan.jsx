export default function SenaraiKiraan({ tajuk, data }) {
  const maksima = Math.max(1, ...data.map((d) => d.jumlah))

  return (
    <div>
      {tajuk && <h4 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">{tajuk}</h4>}
      {data.length === 0 ? (
        <p className="text-xs text-inkmuted">Tiada data.</p>
      ) : (
        <div className="space-y-1.5">
          {data.map((d) => (
            <div key={d.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-ink truncate">{d.label}</span>
                <span className="font-semibold text-ink shrink-0 ml-2">{d.jumlah}</span>
              </div>
              <div className="h-1.5 rounded-full bg-base overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-red"
                  style={{ width: `${(d.jumlah / maksima) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
