import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useAksesStatus } from '../hooks/useAksesStatus.js'
import { useTetapanPendaftaran } from '../hooks/useTetapanPendaftaran.js'
import { NAV_ITEMS, ADMIN_NAV_ITEM } from '../lib/navConfig.js'
import SideDrawer from './SideDrawer.jsx'

export default function Navbar() {
  const { user, signInWithGoogle, signOutUser } = useAuth()
  const { status, isAdmin } = useAksesStatus(user)
  const { dibuka: pendaftaranDibuka } = useTetapanPendaftaran()

  // Staff belum diluluskan admin (atau belum isi profile lagi) - jangan
  // dedah struktur menu dalaman (nama seksyen/sub-halaman). Cuma "Profil"
  // ditunjukkan supaya dia boleh semak status/isi maklumat sendiri.
  // Admin dikecualikan - status 'admin' ditentukan berasingan. PENTING:
  // semak `user` dulu - useAksesStatus(null) (pengunjung belum log masuk)
  // turut pulangkan status 'belum-profile' (sebab tiada rekod profile),
  // tanpa semakan `user` di sini pengunjung AWAM pun tersalah kena sekat.
  const belumLulus = Boolean(user) && (status === 'menunggu' || status === 'belum-profile' || status === 'disekat')
  const itemAsas = belumLulus ? NAV_ITEMS.filter((l) => l.to === '/profil') : NAV_ITEMS
  const links = isAdmin ? [...itemAsas, ADMIN_NAV_ITEM] : itemAsas
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Group kiri: hamburger (mobile) + logo - sentiasa kekal kiri */}
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={(e) => { e.stopPropagation(); setDrawerOpen(true) }}
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
              {links.map((link) =>
                link.children ? (
                  <div key={link.to} className="relative group">
                    <NavLink
                      to={link.to}
                      end
                      className="px-4 py-2 rounded-card text-sm font-medium text-white/85 hover:bg-white/10 flex items-center gap-1"
                      style={({ isActive }) => (isActive ? { backgroundColor: '#F2C230', color: '#1A1A1A' } : undefined)}
                    >
                      {link.label}
                      <ChevronDown size={14} />
                    </NavLink>
                    <div className="absolute left-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
                      <div className="bg-surface border border-border rounded-card shadow-soft py-1.5 min-w-[200px]">
                        {link.children.map((anak) => (
                          <NavLink
                            key={anak.to}
                            to={anak.to}
                            end
                            className="block px-4 py-2.5 text-sm text-ink hover:bg-base"
                          >
                            {anak.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
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
                )
              )}

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
                <div className="ml-2 flex items-center gap-2">
                  <button
                    onClick={() => signInWithGoogle('login')}
                    title="Untuk staff yang SUDAH ada akaun berdaftar"
                    className="px-4 py-2 rounded-card text-sm font-semibold bg-brand-red hover:opacity-90 transition-opacity"
                  >
                    Log Masuk
                  </button>
                  {pendaftaranDibuka && (
                    <button
                      onClick={() => signInWithGoogle('daftar')}
                      title="Untuk staff BARU yang belum ada akaun"
                      className="px-4 py-2 rounded-card text-sm font-semibold border border-white/30 hover:bg-white/10"
                    >
                      Daftar
                    </button>
                  )}
                </div>
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
        onLogin={() => signInWithGoogle('login')}
        onDaftar={() => signInWithGoogle('daftar')}
        pendaftaranDibuka={pendaftaranDibuka}
        onSignOut={signOutUser}
      />
    </>
  )
}
