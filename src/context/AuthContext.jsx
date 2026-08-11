import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [sedangLogMasuk, setSedangLogMasuk] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Guna signInWithPopup (bukan redirect) - signInWithRedirect gagal senyap
  // di SEMUA browser iOS (Safari & Chrome iOS sekali, sebab kedua-duanya
  // guna enjin WebKit yang sama) bila authDomain (*.firebaseapp.com) berbeza
  // domain dengan domain custom kita (sekolah.syazr.com) - Safari sekat
  // storan pihak ketiga antara dua domain tu. Ni cadangan rasmi Firebase
  // untuk situasi macam ni (custom domain tanpa Firebase Hosting).
  //
  // sedangLogMasuk elak signInWithPopup dipanggil dua kali serentak
  // (contoh: tekan butang dua kali pantas) - punca biasa untuk ralat
  // auth/cancelled-popup-request.
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      window.alert('Firebase belum disetup lagi. Isi maklumat dalam fail .env dahulu (lihat README).')
      return
    }
    if (sedangLogMasuk) return
    setSedangLogMasuk(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        console.error('Ralat log masuk:', err)
        window.alert('Gagal log masuk. Sila cuba lagi.')
      }
    } finally {
      setSedangLogMasuk(false)
    }
  }

  const signOutUser = () => {
    if (!isFirebaseConfigured) return Promise.resolve()
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser, sedangLogMasuk }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth mesti digunakan dalam <AuthProvider>')
  return ctx
}
