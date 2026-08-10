import { NavLink } from 'react-router-dom'
import { X, Home, Newspaper, Image, Phone, CalendarCheck, User, ShieldCheck, LogIn, LogOut } from 'lucide-react'

const IKON = {
  '/': Home,
  '/berita': Newspaper,
  '/galeri': Image,
  '/hubungi': Phone,
  '/keberadaan': CalendarCheck,
  '/profil': User,
  '/admin': ShieldCheck,
}

export default function SideDrawer({ open, onClose, links, user, onSignIn, onSignOut }) {
  return (
    <>
      {/* Overlay gelap di belakang - tap untuk tutup */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel drawer - slide dari kiri */}
      <aside
        aria-hidden={!open}
        className={`fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-surface z-50 shadow-soft flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3 h-16 px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain shrink-0" />
            <span className="text-sm font-semibold text-ink truncate">SK Pendidikan Khas Kuantan</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="p-2 rounded-card hover:bg-base text-inkmuted shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {links.map((link) => {
            const Ikon = IKON[link.to] ?? Home
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-card text-sm font-medium text-ink hover:bg-base"
                style={({ isActive }) => (isActive ? { backgroundColor: '#F2C230' } : undefined)}
              >
                <Ikon size={18} />
                {link.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          {user ? (
            <div className="flex items-center gap-3 p-2 rounded-card bg-base">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full shrink-0" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-brand-gold flex items-center justify-center shrink-0">
                  <User size={16} className="text-ink" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink truncate">{user.displayName}</p>
                <button
                  onClick={() => { onSignOut(); onClose() }}
                  className="flex items-center gap-1 text-xs font-medium text-brand-red"
                >
                  <LogOut size={13} /> Log Keluar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onSignIn(); onClose() }}
              className="w-full h-12 rounded-full bg-brand-red text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-soft hover:opacity-90 transition-opacity"
            >
              <LogIn size={17} /> Log Masuk dengan Google
            </button>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border shrink-0 text-center">
          <p className="text-[11px] font-medium text-inkmuted">Usaha Tetap Jaya</p>
          <p className="text-[10px] text-inkmuted mt-0.5">
            &copy; {new Date().getFullYear()} SK Pendidikan Khas Kuantan. Hak cipta terpelihara.
          </p>
        </div>
      </aside>
    </>
  )
}
