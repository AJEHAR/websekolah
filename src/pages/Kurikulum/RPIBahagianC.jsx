function Medan({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm"
      />
    </div>
  )
}

export default function RPIBahagianC({ data, onUbah }) {
  function uSidang1(medan, nilai) {
    onUbah({ ...data, sidangPertama: { ...data.sidangPertama, [medan]: nilai } })
  }
  function uSidang2(medan, nilai) {
    onUbah({ ...data, sidangPenilaian: { ...data.sidangPenilaian, [medan]: nilai } })
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-2">Bahagian C — Perakuan</h2>

      <div className="p-3 rounded-card border border-border bg-surface space-y-3">
        <p className="text-xs font-semibold text-inkmuted uppercase">26. Sidang Pertama</p>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Tarikh Sidang Pertama</label>
          <input type="date" value={data.sidangPertama?.tarikh ?? ''} onChange={(e) => uSidang1('tarikh', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Medan label="a) Nama Ibu Bapa/Penjaga" value={data.sidangPertama?.namaIbuBapa ?? ''} onChange={(v) => uSidang1('namaIbuBapa', v)} />
          <Medan label="b) Nama Guru" value={data.sidangPertama?.namaGuru ?? ''} onChange={(v) => uSidang1('namaGuru', v)} />
          <Medan label="c) Disemak Oleh" value={data.sidangPertama?.disemakOleh ?? ''} onChange={(v) => uSidang1('disemakOleh', v)} />
          <Medan label="d) Disahkan Oleh" value={data.sidangPertama?.disahkanOleh ?? ''} onChange={(v) => uSidang1('disahkanOleh', v)} />
        </div>
        <p className="text-xs text-inkmuted">Tandatangan sebenar dibuat di atas kertas bila laporan ini dicetak.</p>
      </div>

      <div className="p-3 rounded-card border border-border bg-surface space-y-3">
        <p className="text-xs font-semibold text-inkmuted uppercase">27. Sidang Penilaian</p>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Tarikh Sidang Penilaian</label>
          <input type="date" value={data.sidangPenilaian?.tarikh ?? ''} onChange={(e) => uSidang2('tarikh', e.target.value)} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Medan label="a) Nama Ibu Bapa/Penjaga" value={data.sidangPenilaian?.namaIbuBapa ?? ''} onChange={(v) => uSidang2('namaIbuBapa', v)} />
          <Medan label="b) Nama Guru" value={data.sidangPenilaian?.namaGuru ?? ''} onChange={(v) => uSidang2('namaGuru', v)} />
        </div>
      </div>
    </section>
  )
}
