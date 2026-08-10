import { NavLink } from 'react-router-dom'
import { Home, Newspaper, Image, Phone, User } from 'lucide-react'

// Nav utama untuk bottom tab bar (mobile).
// Tambah/kemas kini item di sini apabila page baru dibina.
const tabs = [
  { label: 'Utama', to: '/', icon: Home },
  { label: 'Berita', to: '/berita', icon: Newspaper },
  { label: 'Galeri', to: '/galeri', icon: Image },
  { label: 'Hubungi', to: '/hubungi', icon: Phone },
  { label: 'Profil', to: '/profil', icon: User },
]

export default function BottomTabBar() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-ink border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigasi utama"
    >
      <div className="flex items-stretch justify-around">
        {tabs.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-white/70"
            style={({ isActive }) =>
              isActive ? { color: '#F2C230' } : undefined
            }
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
