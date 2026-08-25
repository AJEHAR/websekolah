import { useEffect, useRef, useState } from 'react'
import { X, Check, Eraser } from 'lucide-react'

// Alat tandatangan digital (lukis dengan jari/tetikus atas canvas).
// Pulangkan blob PNG (latar telus) melalui onSah(blob).
export default function TandatanganModal({ open, onTutup, onSah }) {
  const canvasRef = useRef(null)
  const [melukis, setMelukis] = useState(false)
  const [adaLukisan, setAdaLukisan] = useState(false)

  useEffect(() => {
    if (open) {
      setAdaLukisan(false)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#1A1A1A'
      }
    }
  }, [open])

  if (!open) return null

  function posEvent(e) {
    const p = e.touches ? e.touches[0] : e
    const r = canvasRef.current.getBoundingClientRect()
    const skalaX = canvasRef.current.width / r.width
    const skalaY = canvasRef.current.height / r.height
    return { x: (p.clientX - r.left) * skalaX, y: (p.clientY - r.top) * skalaY }
  }

  function mula(e) {
    e.preventDefault()
    setMelukis(true)
    setAdaLukisan(true)
    const ctx = canvasRef.current.getContext('2d')
    const pos = posEvent(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function lukis(e) {
    if (!melukis) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const pos = posEvent(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function henti() {
    setMelukis(false)
  }

  function kosongkan() {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setAdaLukisan(false)
  }

  function sahkan() {
    if (!adaLukisan) return
    canvasRef.current.toBlob((blob) => onSah(blob), 'image/png')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface rounded-card w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink">Tandatangan Digital</h3>
          <button onClick={onTutup} aria-label="Tutup" className="p-1.5 rounded-card hover:bg-base text-inkmuted">
            <X size={18} />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={220}
          className="w-full rounded-card border-2 border-dashed border-border bg-white touch-none"
          style={{ touchAction: 'none' }}
          onMouseDown={mula}
          onMouseMove={lukis}
          onMouseUp={henti}
          onMouseLeave={henti}
          onTouchStart={mula}
          onTouchMove={lukis}
          onTouchEnd={henti}
        />
        <p className="text-[11px] text-inkmuted mt-2 text-center">Lukis tandatangan di ruang di atas.</p>

        <div className="flex gap-3 mt-4">
          <button onClick={sahkan} disabled={!adaLukisan} className="flex-1 h-11 rounded-card bg-brand-red text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40">
            <Check size={16} /> Sahkan
          </button>
          <button onClick={kosongkan} className="h-11 px-4 rounded-card border border-border text-sm font-medium text-ink flex items-center gap-1.5">
            <Eraser size={16} /> Kosongkan
          </button>
        </div>
      </div>
    </div>
  )
}
