import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const AdminModeContext = createContext(null)

function kunciStoran(emel) {
  return `mod-admin-dijeda:${emel}`
}

// "Pause as Admin" - kemudahan UI SAHAJA (bukan lapisan keselamatan baru;
// kebenaran sebenar tetap dikawal firestore.rules & senarai peranan di
// admins/{emel}). Bila dijeda, semua BUTANG/PANEL admin di seluruh sistem
// disorok (lihat useIsAdmin.js - isAdmin/isSuperAdmin/adaSeksyen pulangkan
// false semasa dijeda), tapi admin boleh sambung balik bila-bila. Status
// disimpan localStorage KHUSUS emel semasa (bukan peranti) - kekal rentas
// sesi/log masuk semula sehingga admin toggle balik sendiri.
export function AdminModeProvider({ children }) {
  const { user } = useAuth()
  const [dijeda, setDijeda] = useState(false)

  useEffect(() => {
    if (!user?.email) {
      setDijeda(false)
      return
    }
    setDijeda(localStorage.getItem(kunciStoran(user.email)) === '1')
  }, [user?.email])

  const togol = useCallback(() => {
    if (!user?.email) return
    setDijeda((semasa) => {
      const baru = !semasa
      try {
        localStorage.setItem(kunciStoran(user.email), baru ? '1' : '0')
      } catch {
        // localStorage tak boleh diakses (mod peribadi/privasi ketat) -
        // toggle tetap jalan untuk sesi ni, cuma tak berterusan rentas sesi.
      }
      return baru
    })
  }, [user?.email])

  return (
    <AdminModeContext.Provider value={{ dijeda, togol }}>
      {children}
    </AdminModeContext.Provider>
  )
}

export function useAdminMode() {
  const ctx = useContext(AdminModeContext)
  if (!ctx) throw new Error('useAdminMode mesti digunakan dalam <AdminModeProvider>')
  return ctx
}
