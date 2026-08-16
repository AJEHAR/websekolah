import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, X } from 'lucide-react'
import { PINTASAN_PANTAS } from '../lib/pintasanPantas.js'

// Butang terapung global (muncul di SEMUA page) - pintasan terus ke 2 tugas
// harian paling kerap (Daftar Keberadaan, Isi Kehadiran Murid) tanpa perlu
// susur menu penuh. Sengaja TAK disekat ikut status kelulusan admin (staff
// "menunggu" pun nampak butang ni) - kalau tersasar tekan, PenggeraAksesTerhad
// dalam App.jsx dah kendalikan redirect balik ke Utama macam biasa, jadi
// tiada risiko keselamatan, cuma kesederhanaan (tak payah logik tambahan di sini).
//
// Reka bentuk sengaja BEZA daripada FloatingTambahButton.jsx (bulat, merah,
// bottom-6 right-5, guna di Keberadaan Hari Ini/Esok & Admin Staff): butang
// ni segi empat lembut (rounded-card, sepadan gaya butang lain di seluruh
// laman web - bulat sebenarnya kekecualian, bukan corak biasa sistem ni),
// warna emas jenama (bukan merah), dan diletak LEBIH TINGGI (bottom-24)
// supaya di page yang kebetulan ada kedua-dua butang, ia bertindan bersih
// (bertumpuk menegak, bukan bertindih terus). Beza bentuk/warna ni sengaja -
// bulat+merah = "tambah rekod page ni", segi empat+emas = "lompat ke page lain".
export default function ButangTerapung() {
  const [terbuka, setTerbuka] = useState(false)

  return (
    <>
      {terbuka && (
        <button
          aria-label="Tutup pintasan pantas"
          onClick={() => setTerbuka(false)}
          className="fixed inset-0 z-20 cursor-default"
        />
      )}

      <div className="fixed bottom-24 right-5 z-30 flex flex-col items-end gap-2.5">
        {terbuka && (
          <div className="flex flex-col items-end gap-2.5">
            {PINTASAN_PANTAS.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                onClick={() => setTerbuka(false)}
                className="flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-surface border border-border shadow-soft text-sm font-semibold text-ink hover:bg-base transition-colors"
              >
                {p.label}
                <span className="h-9 w-9 rounded-card bg-brand-gold text-ink flex items-center justify-center shrink-0">
                  <p.Ikon size={17} />
                </span>
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={() => setTerbuka((s) => !s)}
          aria-label={terbuka ? 'Tutup pintasan pantas' : 'Buka pintasan pantas'}
          aria-expanded={terbuka}
          className="h-12 w-12 rounded-card bg-brand-gold text-ink shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform"
        >
          {terbuka ? <X size={22} /> : <LayoutGrid size={20} />}
        </button>
      </div>
    </>
  )
}
