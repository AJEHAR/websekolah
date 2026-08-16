import { FileClock } from 'lucide-react'

// Placeholder sementara untuk sub-page Kurikulum yang struktur/routingnya
// dah sedia tapi pengisian sebenar belum dibina. Tukar terus kandungan
// dalam BorangPLC.jsx / RPI.jsx / RPT.jsx (buang import ni) bila dah nak isi.
export default function PlaceholderKurikulum({ tajuk }) {
  return (
    <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
      <FileClock size={32} className="mx-auto text-inkmuted mb-3" />
      <h2 className="text-base font-bold text-ink">{tajuk}</h2>
      <p className="text-inkmuted mt-2 text-sm">
        Bahagian ni sedang dibina. Pengisian akan ditambah tak lama lagi.
      </p>
    </div>
  )
}
