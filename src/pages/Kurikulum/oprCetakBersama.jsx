// Komponen & fungsi DIKONGSI merentasi SEMUA gaya cetakan OPR (Gaya 1-5).
// PENTING: sebarang pembetulan bug/ciri baharu letak DI SINI sahaja -
// elak ulang kod di setiap fail CetakOPR_GayaN.jsx (itu punca beberapa
// bug lepas ni hanya termaktub di SATU gaya tapi bukan yang lain).

// Opacity kotak DINAMIK (kawalan penuh staff, lalai 70%) - Tailwind
// bg-white/90 ialah className TETAP (dikompil masa build, tak boleh
// terima nilai sebarangan masa jalan) - guna inline style rgba() terus.
export function gayaKotak(opacity) {
  return { backgroundColor: `rgba(255,255,255,${(opacity ?? 70) / 100})` }
}

// Tiada bullet ⚫ langsung (list-none) - staff nyatakan tak nak bullet
// kelihatan sama sekali dalam senarai kandungan.
export function SenaraiPeluru({ teks }) {
  const baris = (teks ?? '').split('\n').map((b) => b.trim()).filter(Boolean)
  if (baris.length === 0) return <p className="text-[11px] text-gray-400">-</p>
  return (
    <ul className="text-[11px] text-black leading-snug list-none space-y-0.5">
      {baris.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  )
}

// Kotak kandungan generik - penjuru bulat, tiada garis hitam (bayang
// sahaja), label TENGAH.
export function Kotak({ label, children, flex = 1, opacity }) {
  return (
    <div className="rounded-xl shadow-md p-2.5 overflow-hidden" style={{ flex, ...gayaKotak(opacity) }}>
      <p className="text-xs font-bold text-black mb-1 text-center">{label}</p>
      {children}
    </div>
  )
}

export function BarisLogo({ logo }) {
  if (!logo || logo.length === 0) {
    return <img src="/logo-cetak.png" alt="" className="h-14 mx-auto object-contain" />
  }
  return (
    <div className="flex items-center justify-center gap-3">
      {logo.map((url, i) => <img key={i} src={url} alt="" className="h-14 object-contain" />)}
    </div>
  )
}

export function labelSeksyen(seksyen) {
  if (seksyen === 'hem') return 'HEM'
  if (seksyen === 'koku') return 'KOKURIKULUM'
  return 'KURIKULUM'
}

// Kepala standard (logo tengah + pill seksyen mengapung + panel Nama
// Sekolah/sub-tajuk) - DIKONGSI oleh Gaya yang guna corak kepala biasa.
// gambarBulat (pilihan) - lencana gambar bulat mengapung di penjuru KIRI
// (cerminan pill badge di kanan) - untuk Gaya "Bucu Highlight".
export function KepalaStandard({ logo, namaSekolah, teksSub1, teksSub2, seksyen, tunjukSeksyenBadge, opacity, namaSekolahLalai, gambarBulat }) {
  return (
    <>
      <div className="relative mb-2.5 shrink-0" style={{ minHeight: '56px' }}>
        {gambarBulat && (
          <div className="absolute top-0 left-0 w-14 h-14 rounded-full overflow-hidden shadow-lg" style={{ border: '3px solid white' }}>
            <img src={gambarBulat} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-center justify-center h-14"><BarisLogo logo={logo} /></div>
        {tunjukSeksyenBadge && (
          <div className="absolute top-0 right-0">
            <span className="rounded-full border border-black bg-white/90 px-3 py-1 text-[10px] font-bold text-black">{labelSeksyen(seksyen)}</span>
          </div>
        )}
      </div>
      <div className="rounded-xl shadow-md p-3 mb-2.5 shrink-0 text-center" style={gayaKotak(opacity)}>
        <p className="text-sm font-bold text-black">{namaSekolah || namaSekolahLalai}</p>
        {teksSub1 && <p className="text-[11px] font-normal text-black uppercase mt-1">{teksSub1}</p>}
        {teksSub2 && <p className="text-[11px] font-normal text-black uppercase mt-0.5">{teksSub2}</p>}
      </div>
    </>
  )
}

export function ChipMaklumat({ label, nilai, opacity }) {
  return (
    <div className="flex-1 rounded-xl shadow-md p-2.5 text-center" style={gayaKotak(opacity)}>
      <p className="text-xs font-bold text-black">{label}:</p>
      <p className="text-xs font-semibold text-black mt-0.5">{nilai || ''}</p>
    </div>
  )
}

// Bingkai gambar - bayang LEBIH KUAT (shadow-lg) berbanding kotak teks
// (shadow-md) - hierarki visual "terapung" lebih tinggi untuk gambar.
// gayaLuar (pilihan) - override flex/lain terus (elak pembalut <div>
// tambahan + height:100% yang terbukti tak boleh harap dalam sesetengah
// enjin cetak).
export function GambarSlot({ src, posisi, opacity, className = 'flex-1 min-h-0', gayaLuar }) {
  return (
    <div className={`${className} rounded-xl shadow-lg overflow-hidden`} style={{ ...gayaKotak(opacity), ...gayaLuar }}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover" style={{ objectPosition: posisi ?? '50% 50%' }} /> : <div className="w-full h-full bg-[#EAF3FB]" />}
    </div>
  )
}

// Blok Hari/Tarikh/Masa (3 chip) - baris standard dikongsi.
export function BarisChip({ rekod, opacity }) {
  return (
    <div className="flex gap-2 mb-2.5 shrink-0">
      <ChipMaklumat label="Hari" nilai={rekod.hari} opacity={opacity} />
      <ChipMaklumat label="Tarikh" nilai={rekod.tarikh} opacity={opacity} />
      <ChipMaklumat label="Masa" nilai={rekod.masa} opacity={opacity} />
    </div>
  )
}

// Blok Tandatangan - kotak BERASINGAN (bukan satu grid dibahagi), kalau
// cuma 1 aktif jadi 40% lebar rapat kiri (bukan regang 100%).
export function BlokTandatangan({ rekod, opacity }) {
  return (
    <div className="flex gap-4 shrink-0">
      <div className={`rounded-xl shadow-md p-3 text-center ${rekod.disahkanAktif ? 'flex-1' : ''}`} style={{ ...gayaKotak(opacity), ...(!rekod.disahkanAktif ? { width: '40%' } : {}) }}>
        <p className="text-xs font-semibold text-black mb-3">Disediakan Oleh :</p>
        {rekod.tandaTanganDisediakanUrl && <img src={rekod.tandaTanganDisediakanUrl} alt="" className="h-10 object-contain mb-1 mx-auto" />}
        <p className="text-xs font-semibold text-black">{rekod.namaDisediakan || '-'}</p>
        <p className="text-[10px] text-gray-600">{rekod.jawatanDisediakan}</p>
      </div>
      {rekod.disahkanAktif && (
        <div className="flex-1 rounded-xl shadow-md p-3 text-center" style={gayaKotak(opacity)}>
          <p className="text-xs font-semibold text-black mb-3">Disahkan Oleh :</p>
          {rekod.tandaTanganDisahkanUrl && <img src={rekod.tandaTanganDisahkanUrl} alt="" className="h-10 object-contain mb-1 mx-auto" />}
          <p className="text-xs font-semibold text-black">{rekod.namaDisahkan || '-'}</p>
          <p className="text-[10px] text-gray-600">{rekod.jawatanDisahkan}</p>
        </div>
      )}
    </div>
  )
}
