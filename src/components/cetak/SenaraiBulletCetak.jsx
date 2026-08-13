export default function SenaraiBulletCetak({ tajuk, senarai }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-bold uppercase mb-1.5">{tajuk}:</p>
      {senarai.length === 0 ? (
        <p className="text-sm">-</p>
      ) : (
        <ul className="text-sm list-disc pl-5 space-y-0.5">
          {senarai.map((teks, i) => (
            <li key={i}>{teks}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
