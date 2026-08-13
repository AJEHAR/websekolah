export default function KadStatistikCetak({ senarai }) {
  return (
    <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${senarai.length}, 1fr)` }}>
      {senarai.map((s) => (
        <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: s.warna ?? '#F1EFE8' }}>
          <p className="text-2xl font-bold">{s.nilai}</p>
          <p className="text-xs mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
