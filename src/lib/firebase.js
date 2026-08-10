import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Nilai-nilai ini datang dari fail .env (lihat .env.example)
// Dapatkan dari Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Bendera untuk semak sama ada .env sudah diisi dengan config Firebase sebenar.
// Bila false (contoh: masa testing awal sebelum Firebase project disediakan),
// auth/db/storage dibiarkan null - hooks & AuthContext akan "downgrade" dengan
// selamat (papar mesej, bukan crash) bukannya cuba sambung ke Firebase.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

let app = null
export let auth = null
export let db = null
export let storage = null
export let googleProvider = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  googleProvider = new GoogleAuthProvider()

  // Hadkan log masuk kepada domain emel sekolah sahaja (pilihan - tukar/buang ikut keperluan)
  // googleProvider.setCustomParameters({ hd: 'moe-dl.edu.my' })
} else {
  console.warn(
    '[Firebase] .env belum diisi - auth/database dilumpuhkan sementara untuk testing UI. ' +
    'Isi VITE_FIREBASE_* dalam .env untuk aktifkan semula.'
  )
}
