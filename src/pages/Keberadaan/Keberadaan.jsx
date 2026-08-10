import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'
import { useProfilesList } from '../../hooks/useProfilesList.js'
import {
  useKeberadaanTarikh,
  tambahKeberadaan,
  kemaskiniKeberadaan,
  padamKeberadaan,
} from '../../hooks/useKeberadaan.js'
import { todayISO, tambahHariISO } from '../../lib/dateUtils.js'
import KeberadaanForm from './KeberadaanForm.jsx'
import SeksyenTarikh from './SeksyenTarikh.jsx'
import LogKeberadaan from './LogKeberadaan.jsx'

export default function Keberadaan() {
  const { user, signInWithGoogle } = useAuth()
  const { isAdmin } = useIsAdmin(user)
  const { profiles } = useProfilesList()

  const hariIni = todayISO()
  const esok = tambahHariISO(hariIni, 1)

  const senaraiHariIni = useKeberadaanTarikh(hariIni)
  const senaraiEsok = useKeberadaanTarikh(esok)

  const [tunjukBorang, setTunjukBorang] = useState(false)
  const [rekodEdit, setRekodEdit] = useState(null)

  function muatSemuaSemula() {
    senaraiHariIni.muatSemula()
    senaraiEsok.muatSemula()
  }

  async function simpanRekod(data) {
    if (rekodEdit) {
      await kemaskiniKeberadaan(rekodEdit.id, data)
    } else {
      await tambahKeberadaan(data, user)
    }
    setTunjukBorang(false)
    setRekodEdit(null)
    muatSemuaSemula()
  }

  function editRekod(rekod) {
    setRekodEdit(rekod)
    setTunjukBorang(true)
  }

  async function padamRekod(id) {
    if (!window.confirm('Padam rekod keberadaan ini?')) return
    await padamKeberadaan(id)
    muatSemuaSemula()
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-card shadow-soft p-10 text-center">
          <h1 className="text-xl font-bold text-ink">Keberadaan</h1>
          <p className="text-inkmuted mt-2 text-sm">Sila log masuk dengan Google untuk akses halaman ini.</p>
          <button
            onClick={signInWithGoogle}
            className="mt-6 h-12 px-6 rounded-card bg-brand-red text-white text-sm font-semibold"
          >
            Log Masuk dengan Google
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-16 space-y-10">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-ink">Keberadaan</h1>
        <p className="text-inkmuted mt-1 text-sm">Urus dan lihat rekod keberadaan staff.</p>
      </div>

      {/* 1. Isi Borang */}
      <section className="bg-surface border border-border rounded-card shadow-soft p-6 sm:p-8">
        {!tunjukBorang ? (
          <button
            onClick={() => { setRekodEdit(null); setTunjukBorang(true) }}
            className="flex items-center gap-2 text-sm font-semibold text-brand-red"
          >
            <Plus size={18} /> Isi Borang Keberadaan
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-ink">
                {rekodEdit ? 'Kemas Kini Rekod' : 'Isi Borang Keberadaan'}
              </h2>
              <button
                onClick={() => { setTunjukBorang(false); setRekodEdit(null) }}
                aria-label="Tutup borang"
                className="p-1.5 rounded-card hover:bg-base text-inkmuted"
              >
                <X size={18} />
              </button>
            </div>
            <KeberadaanForm
              profiles={profiles}
              rekod={rekodEdit}
              onSimpan={simpanRekod}
              onBatal={() => { setTunjukBorang(false); setRekodEdit(null) }}
            />
          </>
        )}
      </section>

      {/* 2. Keberadaan Hari Ini */}
      <SeksyenTarikh
        tajuk="Keberadaan Hari Ini"
        tarikh={hariIni}
        senarai={senaraiHariIni.senarai}
        loading={senaraiHariIni.loading}
        currentUserEmel={user.email}
        isAdmin={isAdmin}
        onEdit={editRekod}
        onPadam={padamRekod}
      />

      {/* 3. Keberadaan Esok */}
      <SeksyenTarikh
        tajuk="Keberadaan Esok"
        tarikh={esok}
        senarai={senaraiEsok.senarai}
        loading={senaraiEsok.loading}
        currentUserEmel={user.email}
        isAdmin={isAdmin}
        onEdit={editRekod}
        onPadam={padamRekod}
      />

      {/* 4. Log Keberadaan */}
      <LogKeberadaan
        currentUserEmel={user.email}
        isAdmin={isAdmin}
        onEdit={editRekod}
        onPadam={padamRekod}
      />
    </main>
  )
}
