export function BarisKecil({ tajuk, data }) {
  if (data.length === 0) return null
  return (
    <div className="mb-3 last:mb-0">
      <h5 className="text-[10px] font-semibold text-inkmuted uppercase tracking-wide mb-1">{tajuk}</h5>
      <div className="divide-y divide-border">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between py-1 text-xs">
            <span className="text-ink truncate pr-2">{d.label}</span>
            <span className="font-semibold text-ink shrink-0">{d.jumlah}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KadKategoriOKU({ kategori, jumlah, jantina, kaum, agama, subkategori }) {
  return (
    <div className="border border-border rounded-card p-3 bg-surface">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-ink">{kategori}</h4>
        <span className="text-xs font-semibold px-2 py-1 rounded-card" style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}>
          {jumlah} murid
        </span>
      </div>
      <BarisKecil tajuk="Jantina" data={jantina} />
      <BarisKecil tajuk="Kaum" data={kaum} />
      <BarisKecil tajuk="Agama" data={agama} />
      <BarisKecil tajuk="Subkategori" data={subkategori} />
    </div>
  )
}
