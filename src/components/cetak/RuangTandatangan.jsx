export default function RuangTandatangan({ senarai }) {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-8 mt-12">
      {senarai.map((label) => (
        <div key={label} className="w-56">
          <div className="border-t border-black pt-1">
            <p className="text-xs">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
