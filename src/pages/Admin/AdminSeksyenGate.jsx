export default function AdminSeksyenGate({ adaSeksyen, seksyen, namaSeksyen, children }) {
  if (!adaSeksyen(seksyen)) {
    return (
      <div className="bg-surface border border-border rounded-card p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">Akses Terhad</p>
        <p className="text-xs text-inkmuted">
          Bahagian ini khas untuk Admin Penuh atau Admin Seksyen "{namaSeksyen}".
        </p>
      </div>
    )
  }
  return children
}
