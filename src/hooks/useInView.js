import { useEffect, useRef, useState } from 'react'

// Scroll-reveal ringan (IntersectionObserver vanilla - TIADA dependency
// animasi baharu). Pulangkan [ref, sudahKelihatan] - lekatkan ref pada
// elemen, papar/animate bila sudahKelihatan jadi true. Sekali sahaja
// (once=true lalai) - elak elemen "berkelip" keluar-masuk bila pengguna
// scroll naik-turun berulang.
export function useInView({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null)
  const [dalamPandangan, setDalamPandangan] = useState(false)

  useEffect(() => {
    const elemen = ref.current
    if (!elemen) return
    // Fallback selamat - kalau IntersectionObserver tak disokong (jarang
    // berlaku), terus anggap kelihatan supaya kandungan tak tersorok kekal.
    if (typeof IntersectionObserver === 'undefined') {
      setDalamPandangan(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDalamPandangan(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setDalamPandangan(false)
        }
      },
      { threshold }
    )
    observer.observe(elemen)
    return () => observer.disconnect()
  }, [threshold, once])

  return [ref, dalamPandangan]
}
