// Dibalut "hidden print:block" - tersorok di skrin biasa, cuma muncul bila
// cetak/save PDF (window.print()). Digabung dengan peraturan CSS global
// .print-area dalam index.css - elemen ni SAHAJA yang tercetak, semua lain
// (nav, drawer, senarai) automatik tersorok tanpa perlu ubah page lain.
export default function PrintArea({ children }) {
  return <div className="hidden print:block print-area">{children}</div>
}
