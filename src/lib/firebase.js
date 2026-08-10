import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Nilai-nilai ini datang dari fail .env (lihat .env.example)
// Dapatkan dari Firebase Console > Project Settings > General > Your apps
//
// NOTA: Firebase Storage TIDAK digunakan - gambar/dokumen disimpan di
// Google Drive melalui Apps Script (lihat src/lib/driveUpload.js).
// Ini bermakna projek Firebase ni boleh kekal pada Spark plan (percuma,
// tiada kad kredit perlu) sepenuhnya - Storage adalah satu-satunya sebab
// projek Firebase perlukan Blaze plan.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Bendera untuk semak sama ada .env sudah diisi dengan config Firebase sebenar.
// Bila false (contoh: masa testing awal sebelum Firebase project disediakan),
// auth/db dibiarkan null - hooks & AuthContext akan "downgrade" dengan
// selamat (papar mesej, bukan crash) bukannya cuba sambung ke Firebase.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)

let app = null
export let auth = null
export let db = null
export let googleProvider = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()

  // Hadkan log masuk kepada domain emel sekolah sahaja (pilihan - tukar/buang ikut keperluan)
  // googleProvider.setCustomParameters({ hd: 'moe-dl.edu.my' })
} else {
  console.warn(
    '[Firebase] .env belum diisi - auth/database dilumpuhkan sementara untuk testing UI. ' +
    'Isi VITE_FIREBASE_* dalam .env untuk aktifkan semula.'
  )
}
