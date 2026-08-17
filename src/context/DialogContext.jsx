import { createContext, useCallback, useContext, useState } from 'react'

const DialogContext = createContext(null)

// Sistem dialog sendiri (konfirmasi/amaran/input teks) - GANTI window.confirm/
// window.alert/window.prompt asli pelayar (kotak kelabu tanpa jenama, tak
// boleh distail, muncul mengejut). API sengaja serupa dengan yang asli -
// semua fungsi pulangkan Promise, jadi tukar dari:
//   if (!window.confirm('Padam X?')) return
// ke:
//   if (!(await konfirm('Padam X?', { bahaya: true }))) return
// ...cuma tukar SATU baris setiap tempat, bukan tulis semula logik borang.
export function DialogProvider({ children }) {
  const [state, setState] = useState(null)
  const [nilaiSoal, setNilaiSoal] = useState('')

  const konfirm = useCallback((mesej, opts = {}) => {
    return new Promise((resolve) => setState({ jenis: 'confirm', mesej, resolve, ...opts }))
  }, [])

  const amaran = useCallback((mesej, opts = {}) => {
    return new Promise((resolve) => setState({ jenis: 'alert', mesej, resolve, ...opts }))
  }, [])

  const soal = useCallback((mesej, nilaiAsal = '', opts = {}) => {
    setNilaiSoal(nilaiAsal)
    return new Promise((resolve) => setState({ jenis: 'prompt', mesej, resolve, ...opts }))
  }, [])

  function tutup(hasil) {
    state.resolve(hasil)
    setState(null)
  }

  return (
    <DialogContext.Provider value={{ konfirm, amaran, soal }}>
      {children}

      {state && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-surface rounded-t-2xl sm:rounded-card w-full sm:max-w-sm p-6 shadow-soft">
            {state.tajuk && <h2 className="text-base font-bold text-ink mb-2">{state.tajuk}</h2>}
            <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{state.mesej}</p>

            {state.jenis === 'prompt' && (
              <input
                autoFocus
                type="text"
                value={nilaiSoal}
                onChange={(e) => setNilaiSoal(e.target.value)}
                className="w-full h-11 px-3 mt-3 rounded-card border border-border bg-base text-sm"
              />
            )}

            <div className="flex gap-3 mt-5">
              {state.jenis !== 'alert' && (
                <button
                  onClick={() => tutup(state.jenis === 'prompt' ? null : false)}
                  className="flex-1 h-11 rounded-card border border-border text-sm font-medium text-ink hover:bg-base"
                >
                  {state.teksBatal ?? 'Batal'}
                </button>
              )}
              <button
                autoFocus={state.jenis === 'alert'}
                onClick={() => tutup(state.jenis === 'prompt' ? nilaiSoal : true)}
                className={`flex-1 h-11 rounded-card text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
                  state.bahaya ? 'bg-brand-red' : 'bg-ink'
                }`}
              >
                {state.teksSah ?? (state.jenis === 'alert' ? 'OK' : 'Ya, Teruskan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog mesti digunakan dalam <DialogProvider>')
  return ctx
}
