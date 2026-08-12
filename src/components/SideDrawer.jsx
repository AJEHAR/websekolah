import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  X, Home, Newspaper, Image, Phone, CalendarCheck, Users,
  User, ShieldCheck, LogIn, LogOut, ChevronDown, GraduationCap, ClipboardList, Award,
} from 'lucide-react'

const IKON = {
  '/': Home,
  '/berita': Newspaper,
  '/galeri': Image,
  '/hubungi': Phone,
  '/keberadaan': CalendarCheck,
  '/guru-bertugas': Users,
  '/maklumat-murid': GraduationCap,
  '/ebanci': ClipboardList,
  '/eubks': Award,
  '/profil': User,
  '/admin': ShieldCheck,
}

export default function SideDrawer({ open, onClose, links, user, onSignIn, onSignOut }) {
  const location = useLocation()
  const [dibuka, setDibuka] = useState({})

  function toggl(label) {
    setDibuka((s) => ({ ...s, [label]: !s[label] }))
  }

  return (
    <>
      {/* Overlay gelap di belakang - tap untuk tutup. Conditional render
          (bukan opacity+pointer-events) - lebih selamat merentasi Safari/WebKit,
          elak isu "drawer buka lalu terus tertutup" yang berlaku di iPad. */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Panel drawer - slide dari kiri */}
      <aside
        aria-hidden={!open}
        onClick={(e) => e.stopPropagation()}
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

            if (!link.children) {
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
            }

            // Item boleh expand/collapse (accordion) - ada anak page.
            // Auto-terbuka kalau mana-mana anak sepadan dengan lokasi semasa.
            const anakAktif = link.children.some((c) => location.pathname.startsWith(c.to))
            const terbuka = dibuka[link.label] ?? anakAktif

            return (
              <div key={link.label}>
                <div className="flex items-center rounded-card hover:bg-base">
                  <NavLink
                    to={link.to}
                    end
                    onClick={onClose}
                    className="flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium text-ink min-w-0"
                    style={({ isActive }) => (isActive ? { backgroundColor: '#F2C230', borderRadius: '0.5rem' } : undefined)}
                  >
                    <Ikon size={18} />
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                  <button
                    onClick={() => toggl(link.label)}
                    aria-expanded={terbuka}
                    aria-label={terbuka ? `Tutup senarai ${link.label}` : `Buka senarai ${link.label}`}
                    className="px-3 py-3 shrink-0"
                  >
                    <ChevronDown size={16} className={`transition-transform ${terbuka ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {terbuka && (
                  <div className="ml-6 mt-1 mb-1 flex flex-col gap-0.5 border-l border-border pl-3">
                    {link.children.map((anak) => (
                      <NavLink
                        key={anak.to}
                        to={anak.to}
                        end
                        onClick={onClose}
                        className="px-3 py-2.5 rounded-card text-sm text-inkmuted hover:bg-base hover:text-ink"
                        style={({ isActive }) => (isActive ? { backgroundColor: '#F2C230', color: '#1A1A1A' } : undefined)}
                      >
                        {anak.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
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
