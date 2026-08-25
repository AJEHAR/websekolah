import PrintArea from '../../components/cetak/PrintArea.jsx'
import { NAMA_SEKOLAH } from './rpiConstants.js'

// Satu OPR = satu muka surat A4, gaya infografik ringkas - kepala
// (unit/tajuk/butiran), teks pengurusan, grid gambar, pengesahan.
export default function CetakOPR({ rekod }) {
  const gambarDiisi = (rekod.gambar || []).filter(Boolean)

  return (
    <PrintArea>
      <div
        className="p-8 text-black relative"
        style={{
          width: '210mm', minHeight: '297mm',
          backgroundImage: rekod.latarBelakangUrl ? `url(${rekod.latarBelakangUrl})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="text-center mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmuted">{rekod.unit || NAMA_SEKOLAH}</p>
          <p className="text-2xl font-bold text-black mt-1">{rekod.nama}</p>
          <p className="text-sm text-black mt-1">
            {[rekod.hari, rekod.tarikh, rekod.masa].filter(Boolean).join(' · ')}
          </p>
          <p className="text-sm text-black">{rekod.tempat}</p>
          {rekod.sasaran && <p className="text-xs text-inkmuted mt-1">Sasaran: {rekod.sasaran}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-bold uppercase mb-1">Objektif Program</p>
            <p className="text-xs text-black whitespace-pre-line">{rekod.objektif || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase mb-1">Aktiviti</p>
            <p className="text-xs text-black whitespace-pre-line">{rekod.aktiviti || '-'}</p>
          </div>
        </div>

        {gambarDiisi.length > 0 && (
          <div className={`grid gap-2 mb-4 ${gambarDiisi.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {gambarDiisi.map((g, i) => (
              <img key={i} src={g} alt="" className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-xs font-bold uppercase mb-1">Kekuatan</p>
            <p className="text-[11px] text-black whitespace-pre-line">{rekod.kekuatan || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase mb-1">Kelemahan</p>
            <p className="text-[11px] text-black whitespace-pre-line">{rekod.kelemahan || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase mb-1">Penambahbaikan</p>
            <p className="text-[11px] text-black whitespace-pre-line">{rekod.penambahbaikan || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="text-center">
            {rekod.tandaTanganDisediakanUrl && <img src={rekod.tandaTanganDisediakanUrl} alt="" className="h-14 mx-auto object-contain" />}
            <div className="border-t border-black w-40 mx-auto mt-1"></div>
            <p className="text-xs font-semibold mt-1">{rekod.namaDisediakan || '-'}</p>
            <p className="text-[10px] text-inkmuted">{rekod.jawatanDisediakan}</p>
            <p className="text-[10px] text-inkmuted mt-0.5">Disediakan Oleh</p>
          </div>
          {rekod.disahkanAktif && (
            <div className="text-center">
              {rekod.tandaTanganDisahkanUrl && <img src={rekod.tandaTanganDisahkanUrl} alt="" className="h-14 mx-auto object-contain" />}
              <div className="border-t border-black w-40 mx-auto mt-1"></div>
              <p className="text-xs font-semibold mt-1">{rekod.namaDisahkan || '-'}</p>
              <p className="text-[10px] text-inkmuted">{rekod.jawatanDisahkan}</p>
              <p className="text-[10px] text-inkmuted mt-0.5">Disahkan Oleh</p>
            </div>
          )}
        </div>
      </div>
    </PrintArea>
  )
}
