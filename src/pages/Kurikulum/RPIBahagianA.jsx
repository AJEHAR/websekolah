import PemilihMurid from './PemilihMurid.jsx'
import { KOD_SEKOLAH, NAMA_SEKOLAH, PROGRAM_PK_OPTIONS } from './rpiConstants.js'

function Medan({ label, wajib, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{wajib && <span className="text-brand-red"> *</span>}
      </label>
      {children}
    </div>
  )
}

function Input(props) {
  return <input {...props} className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm" />
}

export default function RPIBahagianA({ data, onUbah, senaraiMurid, muridDipilih, onPilihMurid }) {
  function u(medan, nilai) {
    onUbah({ ...data, [medan]: nilai })
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-border pb-2">Bahagian A — Maklumat Diri</h2>

      <div className="grid grid-cols-2 gap-3">
        <Medan label="1. Kod Sekolah">
          <div className="h-11 px-3 rounded-card border border-border bg-base text-sm flex items-center text-inkmuted">{KOD_SEKOLAH}</div>
        </Medan>
        <Medan label="2. Tahun" wajib>
          <Input type="text" required value={data.tahunSesi} onChange={(e) => u('tahunSesi', e.target.value)} placeholder="contoh: 2026" />
        </Medan>
      </div>

      <Medan label="3. Nama Sekolah">
        <div className="min-h-11 py-2.5 px-3 rounded-card border border-border bg-base text-sm text-inkmuted">{NAMA_SEKOLAH}</div>
      </Medan>

      <Medan label="4. Program Pendidikan Khas">
        <div className="flex flex-wrap gap-2">
          {PROGRAM_PK_OPTIONS.map((p) => (
            <label key={p.kunci} className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-card border border-border bg-surface cursor-pointer">
              <input type="radio" name="programPK" checked={data.program === p.kunci} onChange={() => u('program', p.kunci)} className="h-3.5 w-3.5" />
              {p.label}
            </label>
          ))}
        </div>
      </Medan>

      <Medan label="5. Nama Murid" wajib>
        <PemilihMurid senaraiMurid={senaraiMurid} muridDipilih={muridDipilih} onPilih={onPilihMurid} />
      </Medan>

      <Medan label="6. Tarikh Lahir">
        <Input type="text" value={data.tarikhLahir} onChange={(e) => u('tarikhLahir', e.target.value)} />
      </Medan>

      <div className="grid grid-cols-2 gap-3">
        <Medan label="7. Umur">
          <Input type="text" value={data.umur} onChange={(e) => u('umur', e.target.value)} />
        </Medan>
        <Medan label="8. Kelas">
          <Input type="text" value={data.kelas} onChange={(e) => u('kelas', e.target.value)} />
        </Medan>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Medan label="9. Kategori">
          <Input type="text" value={data.kategori} onChange={(e) => u('kategori', e.target.value)} />
        </Medan>
        <Medan label="10. Diagnosis">
          <Input type="text" value={data.diagnosis} onChange={(e) => u('diagnosis', e.target.value)} />
        </Medan>
      </div>

      <Medan label="11. Pengetahuan Sedia Ada">
        <textarea rows={2} value={data.pengetahuanSediaAda} onChange={(e) => u('pengetahuanSediaAda', e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
      </Medan>

      <Medan label="12. Keupayaan">
        <textarea rows={2} value={data.keupayaan} onChange={(e) => u('keupayaan', e.target.value)} className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-none" />
      </Medan>

      <Medan label="13. Keperluan Perubatan">
        <Input type="text" value={data.keperluanPerubatan} onChange={(e) => u('keperluanPerubatan', e.target.value)} placeholder="TIADA" />
      </Medan>
      <Medan label="14. Keperluan Perkhidmatan Sokongan">
        <Input type="text" value={data.keperluanPerkhidmatanSokongan} onChange={(e) => u('keperluanPerkhidmatanSokongan', e.target.value)} placeholder="TIADA" />
      </Medan>
      <Medan label="15. Keperluan Alat Sokongan">
        <Input type="text" value={data.keperluanAlatSokongan} onChange={(e) => u('keperluanAlatSokongan', e.target.value)} placeholder="TIADA" />
      </Medan>
    </section>
  )
}
