import { Link } from 'react-router-dom'
import { MapPin, Phone, Printer, Facebook, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useIsAdmin } from '../hooks/useIsAdmin.js'
import { useTetapanHubungi } from '../hooks/useTetapanHubungi.js'

function KadHubungi({ ikon: Ikon, label, nilai, href }) {
  const isi = (
    <>
      <div className="h-11 w-11 rounded-card bg-base flex items-center justify-center shrink-0 text-brand-red">
        <Ikon size={20} />
      </div>
      <div>
        <p className="text-xs text-inkmuted">{label}</p>
        <p className="text-sm font-semibold text-ink mt-0.5">{nilai}</p>
      </div>
    </>
  )
  const kelas = 'flex items-center gap-3 p-4 rounded-card border border-border bg-surface'
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${kelas} hover:border-brand-red transition-colors`}>
      {isi}
    </a>
  ) : (
    <div className={kelas}>{isi}</div>
  )
}

export default function Hubungi() {
  const { user } = useAuth()
  const { isSuperAdmin } = useIsAdmin(user)
  const { tetapan } = useTetapanHubungi()
  const namaAkaunFB = tetapan.facebook.replace(/\/$/, '').split('/').pop()

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-16">
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-ink">Hubungi Kami</h1>
        <p className="text-inkmuted mt-2 text-sm">Sekolah Kebangsaan Pendidikan Khas Kuantan</p>
        {isSuperAdmin && (
          <Link
            to="/hubungi/tetapan"
            className="inline-flex items-center gap-1.5 mt-4 h-9 px-4 rounded-card border border-border text-xs font-semibold text-ink hover:bg-base"
          >
            <Settings size={14} /> Tetapan Hubungi
          </Link>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <KadHubungi ikon={MapPin} label="Alamat" nilai={tetapan.alamat} />
        <KadHubungi ikon={Phone} label="Telefon" nilai={tetapan.telefon} href={`tel:${tetapan.telefon.replace(/-/g, '')}`} />
        <KadHubungi ikon={Printer} label="Faks" nilai={tetapan.faks} />
        <KadHubungi ikon={Facebook} label="Facebook Rasmi" nilai={`@${namaAkaunFB}`} href={tetapan.facebook} />
      </div>

      <div className="rounded-card border border-border overflow-hidden bg-surface">
        <iframe
          title="Peta lokasi SK Pendidikan Khas Kuantan"
          src={`https://www.google.com/maps?q=${encodeURIComponent(tetapan.alamat)}&output=embed`}
          className="w-full h-72 sm:h-96 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="text-xs text-inkmuted text-center mt-6">
        Untuk pertanyaan berkaitan murid/sekolah, sila hubungi terus talian pejabat di atas semasa waktu pejabat.
      </p>
    </main>
  )
}
