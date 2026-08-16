import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase.js'
import { emelKeDocId } from '../lib/emelUtils.js'

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
  //
  // mod: 'login' | 'daftar' - lepas Google Sign-In berjaya, kita SEMAK
  // dulu (Firestore) sama ada profile dah wujud untuk emel tu, SEBELUM
  // benarkan sesi log masuk diteruskan:
  //   - 'login' tapi TIADA profile wujud -> log keluar semula + ralat
  //     jelas "tiada akaun". Elak orang guna "Log Masuk" untuk cuba
  //     daftar terus (kelirukan pengguna, langgar pemisahan Log Masuk/Daftar).
  //   - 'daftar' tapi pendaftaran DITUTUP (tetapanAwam/pendaftaran) DAN
  //     profile belum wujud -> log keluar semula + ralat "pendaftaran ditutup".
  // Kedua-dua kes 'log keluar semula' ni CUMA kawalan UX (pengalaman
  // pengguna lebih jelas) - kawalan SEBENAR (tak boleh dipintas) tetap di
  // firestore.rules (allow create pada profiles semak pendaftaranDibuka()
  // & emelDisekatSendiri() di server).
  const signInWithGoogle = async (mod = 'login') => {
    if (!isFirebaseConfigured) {
      window.alert('Firebase belum disetup lagi. Isi maklumat dalam fail .env dahulu (lihat README).')
      return
    }
    if (sedangLogMasuk) return
    setSedangLogMasuk(true)
    try {
      const hasil = await signInWithPopup(auth, googleProvider)
      const emel = hasil.user.email
      const docId = emelKeDocId(emel)

      const [snapProfile, snapDisekat, snapAdmin] = await Promise.all([
        getDoc(doc(db, 'profiles', docId)),
        getDoc(doc(db, 'emelDisekat', docId)),
        getDoc(doc(db, 'admins', emel)), // ID dok admin = emel mentah (bukan docId ditukar) - padan useIsAdmin.js
      ])
      const adaProfile = snapProfile.exists()
      const adalahAdmin = snapAdmin.exists()

      // Akaun admin dikecualikan SEPENUHNYA daripada semakan di bawah -
      // status admin sentiasa berasingan/mengatasi aliran kelulusan/sekatan
      // profile staff (konsisten dengan firestore.rules & useAksesStatus.js).
      // Admin juga BOLEH wujud tanpa profile peribadi langsung (rujuk
      // Profile.jsx - "Akaun Admin" tak wajib isi Nama/IC/Jawatan).
      if (adalahAdmin) return

      // Akaun disekat kekal - JANGAN papar ralat generik "tiada akaun" di
      // sini (mengelirukan). Biar sesi log masuk diteruskan supaya
      // Profile.jsx (guna useSekatan) papar mesej "Akaun Disekat" yang
      // lebih jelas (termasuk sebab, kalau admin ada catat).
      if (snapDisekat.exists()) return

      if (mod === 'login' && !adaProfile) {
        await signOut(auth)
        window.alert(
          `Tiada akaun berdaftar untuk emel ini (${emel}).\n\n` +
          'Sekiranya anda staff baru, sila guna butang "Daftar".'
        )
        return
      }

      if (mod === 'daftar' && !adaProfile) {
        const snapTetapan = await getDoc(doc(db, 'tetapanAwam', 'pendaftaran'))
        const dibuka = snapTetapan.exists() ? snapTetapan.data().dibuka !== false : true
        if (!dibuka) {
          await signOut(auth)
          window.alert('Pendaftaran staff baru ditutup buat masa ini. Sila hubungi pentadbir sekolah.')
          return
        }
      }
      // Selebihnya (login dgn profile wujud, atau daftar berjaya) - biar
      // onAuthStateChanged & useAksesStatus uruskan hala tuju seterusnya.
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
