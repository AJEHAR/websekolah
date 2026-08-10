export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function tambahHariISO(iso, hari) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + hari)
  return d.toISOString().slice(0, 10)
}

export function formatTarikhPaparan(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTarikhRingkas(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}
