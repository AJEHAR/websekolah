import { Link } from 'react-router-dom'
import { CalendarCheck, Plus } from 'lucide-react'
import StatistikKeberadaan from './StatistikKeberadaan.jsx'

export default function ProfileView({ profile, onEdit }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="h-24 w-24 rounded-full bg-base border border-border overflow-hidden flex items-center justify-center shrink-0">
          {profile.gambarURL ? (
            <img src={profile.gambarURL} alt={`Gambar ${profile.nama}`} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-inkmuted">Tiada gambar</span>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl font-bold text-ink">{profile.nama}</h1>
          <p className="text-sm text-inkmuted mt-1">{profile.jawatan}</p>
          <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-base border border-border text-inkmuted">
            {profile.kategori}
          </span>

          <dl className="mt-4 text-sm">
            <div className="flex gap-2 justify-center sm:justify-start">
              <dt className="text-inkmuted">No. IC:</dt>
              <dd className="text-ink font-medium">{profile.ic}</dd>
            </div>
          </dl>

          <button
            onClick={onEdit}
            className="mt-4 text-sm font-semibold text-brand-red"
          >
            Kemas kini profile
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-ink mb-3">Akses Pantas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link
            to="/profil/kehadiran"
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-card border border-border bg-surface hover:border-brand-red transition-colors text-center"
          >
            <CalendarCheck size={22} className="text-brand-red" />
            <span className="text-xs font-medium text-ink">Senarai Keberadaan</span>
          </Link>

          <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-card border border-dashed border-border text-center opacity-60">
            <Plus size={22} className="text-inkmuted" />
            <span className="text-xs font-medium text-inkmuted">Akan ditambah</span>
          </div>
        </div>
      </div>

      <StatistikKeberadaan emel={profile.emel} />
    </div>
  )
}
