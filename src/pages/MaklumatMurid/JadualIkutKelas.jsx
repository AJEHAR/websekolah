export default function JadualIkutKelas({ data }) {
  const kelasSenarai = Object.keys(data).sort()
  const semuaNilai = [...new Set(kelasSenarai.flatMap((k) => Object.keys(data[k]).filter((n) => n !== '__jumlah')))].sort()

  if (kelasSenarai.length === 0) return <p className="text-xs text-inkmuted">Tiada data.</p>

  return (
    <div className="overflow-x-auto border border-border rounded-card">
      <table className="text-xs w-full">
        <thead className="bg-base">
          <tr>
            <th className="text-left px-3 py-2 font-semibold text-ink whitespace-nowrap">Kelas</th>
            {semuaNilai.map((n) => (
              <th key={n} className="text-right px-3 py-2 font-semibold text-ink whitespace-nowrap">{n}</th>
            ))}
            <th className="text-right px-3 py-2 font-semibold text-ink whitespace-nowrap">Jumlah</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {kelasSenarai.map((kelas) => (
            <tr key={kelas}>
              <td className="px-3 py-2 text-ink font-medium whitespace-nowrap">{kelas}</td>
              {semuaNilai.map((n) => (
                <td key={n} className="px-3 py-2 text-right text-inkmuted">{data[kelas][n] ?? 0}</td>
              ))}
              <td className="px-3 py-2 text-right font-semibold text-ink">{data[kelas].__jumlah}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
