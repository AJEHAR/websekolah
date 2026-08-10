import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useIsAdmin } from '../hooks/useIsAdmin.js'
import { NAV_ITEMS, ADMIN_NAV_ITEM } from '../lib/navConfig.js'
import SideDrawer from './SideDrawer.jsx'

export default function Navbar() {
  const { user, signInWithGoogle, signOutUser } = useAuth()
  const { isAdmin } = useIsAdmin(user)
  const links = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Group kiri: hamburger (mobile) + logo - sentiasa kekal kiri */}
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Buka menu"
                className="lg:hidden flex items-center justify-center h-11 w-11 rounded-card hover:bg-white/10 shrink-0 -ml-2"
              >
                <Menu size={22} />
              </button>

              <Link to="/" className="flex items-center gap-3 min-w-0">
                <img src="/logo.png" alt="Logo SK Pendidikan Khas Kuantan" className="h-10 w-10 object-contain shrink-0" />
                <span className="text-sm font-semibold leading-tight truncate">
                  eCBA4082
                </span>
              </Link>
            </div>

            {/* Group kanan: nav penuh + login - desktop sahaja */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className="px-4 py-2 rounded-card text-sm font-medium transition-colors text-white/85 hover:bg-white/10"
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: '#F2C230', color: '#1A1A1A' } : undefined
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user ? (
                <button
                  onClick={signOutUser}
                  className="ml-2 flex items-center gap-2 px-4 py-2 rounded-card text-sm font-semibold border border-white/20 hover:bg-white/10"
                >
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="h-6 w-6 rounded-full" />
                  )}
                  Log Keluar
                </button>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="ml-2 px-4 py-2 rounded-card text-sm font-semibold bg-brand-red hover:opacity-90 transition-opacity"
                >
                  Log Masuk Google
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        links={links}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
      />
    </>
  )
}
