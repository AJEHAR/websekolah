import { createContext, useContext, useEffect, useState } from 'react'
import { getRedirectResult, onAuthStateChanged, signInWithRedirect, signOut } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    // Semak hasil redirect (bila balik dari log masuk Google) - perlu untuk
    // signInWithRedirect. Guna redirect (bukan popup) sebab GitHub Pages hantar
    // header Cross-Origin-Opener-Policy yang block cara Firebase check popup
    // tertutup (auth/cancelled-popup-request).
    getRedirectResult(auth).catch((err) => {
      console.error('Ralat redirect log masuk:', err)
    })

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = () => {
    if (!isFirebaseConfigured) {
      window.alert('Firebase belum disetup lagi. Isi maklumat dalam fail .env dahulu (lihat README).')
      return Promise.resolve()
    }
    return signInWithRedirect(auth, googleProvider)
  }

  const signOutUser = () => {
    if (!isFirebaseConfigured) return Promise.resolve()
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth mesti digunakan dalam <AuthProvider>')
  return ctx
}
