import { useEffect, useRef, useState } from 'react'

// Nombor "count-up" ringan (requestAnimationFrame vanilla - TIADA
// dependency animasi baharu). aktif=false -> kekal 0 (guna dgn useInView
// supaya animasi cuma jalan bila kad ni betul-betul masuk skrin).
export function useCountUp(sasaran, { aktif = true, tempoh = 900 } = {}) {
  const [nilai, setNilai] = useState(0)
  const mulaRef = useRef(null)

  useEffect(() => {
    if (!aktif) return
    // Hormati keutamaan "reduced motion" pengguna - terus papar nilai
    // akhir tanpa animasi (sama dasar dgn @media (prefers-reduced-motion)
    // dalam index.css).
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setNilai(sasaran)
      return
    }
    mulaRef.current = null
    let bingkai
    function langkah(cap) {
      if (mulaRef.current === null) mulaRef.current = cap
      const p = Math.min(1, (cap - mulaRef.current) / tempoh)
      // ease-out kuadratik - laju di awal, perlahan mendekati nilai akhir
      setNilai(Math.round(sasaran * (1 - (1 - p) * (1 - p))))
      if (p < 1) bingkai = requestAnimationFrame(langkah)
    }
    bingkai = requestAnimationFrame(langkah)
    return () => cancelAnimationFrame(bingkai)
  }, [sasaran, aktif, tempoh])

  return nilai
}
