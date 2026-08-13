export default function KadAnalisis({ tajuk, data, nota }) {
  return (
    <div className="border border-border rounded-card p-3 bg-surface">
      {tajuk && (
        <h4 className="text-xs font-semibold text-inkmuted uppercase tracking-wide mb-2">{tajuk}</h4>
      )}
      {data.length === 0 ? (
        <p className="text-xs text-inkmuted">Tiada data.</p>
      ) : (
        <div className="divide-y divide-border">
          {data.map((d) => (
            <div key={d.label} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-ink truncate pr-2">{d.label}</span>
              <span className="font-bold text-ink shrink-0">{d.jumlah}</span>
            </div>
          ))}
        </div>
      )}
      {nota && <p className="text-[10px] text-inkmuted mt-2">{nota}</p>}
    </div>
  )
}
