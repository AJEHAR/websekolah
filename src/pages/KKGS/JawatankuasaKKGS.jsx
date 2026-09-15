import { useOutletContext, Link } from 'react-router-dom'
import { Award, ArrowRight } from 'lucide-react'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useKkgsAhliSenarai, kemaskiniAhliKkgs } from '../../hooks/useKkgsAhli.js'
import { JAWATAN_KKGS, JAWATAN_SATU_ORANG, labelJawatan, adalahJawatankuasa } from './kkgsConstants.js'

// Jawatankuasa - dropdown PILIH TERUS ikut jawatan (bukan senarai nama
// lagi) - untuk jawatan SATU ORANG (Penasihat/Pengerusi/Naib
// Pengerusi/Setiausaha/Bendahari 1/Bendahari 2), pilih nama baharu
// AUTOMATIK tanggalkan pemegang lama (jawatan dia kembali "Ahli") - elak
// dua orang pegang jawatan sama serentak. AJK KKGS (ramai orang) guna
// kotak semak (boleh lebih dari satu).
export default function JawatankuasaKKGS() {
  const { user } = useOutletContext()
  const { adaSeksyen } = useIsAdmin(user)
  const bolehUrus = adaSeksyen('kkgs')
  const { senarai, loading, muatSemula } = useKkgsAhliSenarai()

  const jawatanSatuOrang = JAWATAN_KKGS.filter((j) => JAWATAN_SATU_ORANG.includes(j))
  const ajkSemasa = senarai.filter((a) => a.jawatan === 'AJK KKGS')

  async function lantik(jawatan, ahliIdBaharu) {
    const pemegangLama = senarai.find((a) => a.jawatan === jawatan)
    if (pemegangLama && pemegangLama.id !== ahliIdBaharu) {
      await kemaskiniAhliKkgs(pemegangLama.id, { jawatan: 'Ahli' }, user.uid)
    }
    if (ahliIdBaharu) {
      await kemaskiniAhliKkgs(ahliIdBaharu, { jawatan }, user.uid)
    }
    muatSemula()
  }

  async function togolAjk(ahli, checked) {
    await kemaskiniAhliKkgs(ahli.id, { jawatan: checked ? 'AJK KKGS' : 'Ahli' }, user.uid)
    muatSemula()
  }

  if (loading) return <p className="text-sm text-inkmuted">Memuatkan…</p>

  // Staff biasa - paparan SAHAJA (org chart ringkas), tiada dropdown urus.
  if (!bolehUrus) {
    const jawatankuasa = senarai.filter((a) => adalahJawatankuasa(a.jawatan))
    return (
      <div>
        <p className="text-xs text-inkmuted mb-4">Anda boleh LIHAT sahaja - hubungi admin KKGS untuk buat perubahan lantikan.</p>
        {jawatankuasa.length === 0 ? (
          <p className="text-sm text-inkmuted">Belum ada sesiapa dilantik jawatan lagi.</p>
        ) : (
          <div className="space-y-4">
            {JAWATAN_KKGS.filter((j) => j !== 'Ahli').map((jawatan) => {
              const ahliJawatan = jawatankuasa.filter((a) => a.jawatan === jawatan)
              if (ahliJawatan.length === 0) return null
              return (
                <div key={jawatan}>
                  <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">{labelJawatan(jawatan)}</p>
                  <div className="space-y-2">
                    {ahliJawatan.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-3.5 rounded-card border border-border bg-surface">
                        <div className="h-9 w-9 rounded-full bg-base flex items-center justify-center text-inkmuted shrink-0"><Award size={15} /></div>
                        <p className="text-sm font-semibold text-ink truncate">{a.nama}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Admin KKGS - dropdown lantikan.
  return (
    <div>
      <p className="text-xs text-inkmuted mb-4">Pilih nama untuk setiap jawatan - lantikan baharu automatik tanggalkan pemegang lama (jawatan satu orang sahaja).</p>

      <div className="space-y-3 mb-5">
        {jawatanSatuOrang.map((jawatan) => {
          const pemegang = senarai.find((a) => a.jawatan === jawatan)
          return (
            <div key={jawatan} className="flex items-center gap-3 p-3.5 rounded-card border border-border bg-surface">
              <p className="text-sm font-semibold text-ink w-40 shrink-0">{labelJawatan(jawatan)}</p>
              <select
                value={pemegang?.id ?? ''}
                onChange={(e) => lantik(jawatan, e.target.value || null)}
                className="flex-1 h-10 px-3 rounded-card border border-border bg-base text-sm"
              >
                <option value="">- Tiada -</option>
                {senarai.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
              </select>
            </div>
          )
        })}
      </div>

      <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">AJK KKGS (boleh lebih dari seorang)</p>
      <div className="rounded-card border border-border bg-surface divide-y divide-border max-h-80 overflow-y-auto">
        {senarai.map((a) => (
          <label key={a.id} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={a.jawatan === 'AJK KKGS'}
              disabled={JAWATAN_SATU_ORANG.includes(a.jawatan)}
              onChange={(e) => togolAjk(a, e.target.checked)}
              className="h-4 w-4 shrink-0"
            />
            <span className="text-ink flex-1">{a.nama}</span>
            {JAWATAN_SATU_ORANG.includes(a.jawatan) && <span className="text-[10px] text-inkmuted shrink-0">{labelJawatan(a.jawatan)}</span>}
          </label>
        ))}
      </div>
      {ajkSemasa.length === 0 && <p className="text-xs text-inkmuted mt-2">Belum ada AJK dilantik.</p>}

      <Link to="/kkgs/senarai-ahli" className="inline-flex items-center gap-1.5 text-xs text-brand-red font-medium mt-5">
        Urus status keahlian &amp; bulan bayaran (Senarai Ahli) <ArrowRight size={13} />
      </Link>
    </div>
  )
}
