import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import PemilihStaff from '../../components/PemilihStaff.jsx'

// 5.0 (Jawatankuasa Kerja) sengaja TIADA kotak teks - dalam dokumen sebenar
// seksyen ni cuma "Rujuk LAMPIRAN A" (teks tetap), butiran sebenar staff
// isi terus dalam 2 jadual di bawah (Jawatankuasa Pelaksana + Ahli
// Jawatankuasa), bukan ditaip dalam seksyen ni.
const SEKSYEN = [
  { kunci: 'seksyen1', label: '1.0 Pengenalan / Latar Belakang Program' },
  { kunci: 'seksyen2', label: '2.0 Objektif Program' },
  { kunci: 'seksyen3', label: '3.0 Kumpulan Sasaran' },
  { kunci: 'seksyen4', label: '4.0 Butiran Pelaksanaan Program' },
  { kunci: 'seksyen6', label: '6.0 Atur Cara Program' },
  { kunci: 'seksyen7', label: '7.0 Implikasi Kewangan' },
  { kunci: 'seksyen8', label: '8.0 Penutup' },
]

function BlokStaff({ label, emel, nama, jawatan, tarikh, senaraiStaff, onUbah, tunjukTarikh }) {
  const staffDipilih = emel ? senaraiStaff.find((s) => s.emel === emel) ?? { nama, jawatan, emel } : null
  return (
    <div>
      <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">{label}</p>
      <div className="space-y-3">
        <PemilihStaff
          senaraiStaff={senaraiStaff}
          staffDipilih={staffDipilih}
          onPilih={(s) => onUbah({ emel: s?.emel ?? '', nama: s?.nama ?? '' })}
        />
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Jawatan (boleh taip, tak semestinya ikut profile)</label>
          <input
            type="text"
            value={jawatan}
            onChange={(e) => onUbah({ jawatan: e.target.value })}
            placeholder="cth. Setiausaha Sukan"
            className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm"
          />
        </div>
        {tunjukTarikh && (
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Tarikh</label>
            <input
              type="text"
              value={tarikh}
              onChange={(e) => onUbah({ tarikh: e.target.value })}
              placeholder="cth. 19 Januari 2026"
              className="w-full h-10 px-3 rounded-card border border-border bg-surface text-sm max-w-[220px]"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Jadual "Jawatankuasa Pelaksana" (Pengerusi, Timbalan, dll) - ringkas
// jawatan + nama sahaja, boleh tambah/buang baris (fleksibel, bukan
// dihadkan 5 jawatan tetap - program lain mungkin susun beza).
function JadualJawatankuasaPelaksana({ senarai, onUbah }) {
  function tambah() {
    onUbah([...senarai, { jawatan: '', nama: '' }])
  }
  function ubahBaris(i, medan, nilai) {
    const baru = [...senarai]
    baru[i] = { ...baru[i], [medan]: nilai }
    onUbah(baru)
  }
  function buang(i) {
    onUbah(senarai.filter((_, idx) => idx !== i))
  }
  return (
    <div>
      <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Jawatankuasa Pelaksana</p>
      <div className="space-y-2">
        {senarai.map((b, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              type="text"
              value={b.jawatan}
              onChange={(e) => ubahBaris(i, 'jawatan', e.target.value)}
              placeholder="Jawatan (cth. Pengerusi)"
              className="w-40 shrink-0 h-10 px-2.5 rounded-card border border-border bg-surface text-xs"
            />
            <input
              type="text"
              value={b.nama}
              onChange={(e) => ubahBaris(i, 'nama', e.target.value)}
              placeholder="Nama (cth. Pn. Zuriati binti Che Mohd (Guru Besar))"
              className="flex-1 h-10 px-2.5 rounded-card border border-border bg-surface text-xs"
            />
            <button type="button" onClick={() => buang(i)} aria-label="Buang baris" className="p-2 rounded-card hover:bg-base text-brand-red shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={tambah} className="flex items-center gap-1.5 text-xs font-semibold text-brand-red mt-2">
        <Plus size={14} /> Tambah Jawatan
      </button>
    </div>
  )
}

// Jadual besar "Ahli Jawatankuasa Kerja" (Lampiran A) - Bil (auto ikut
// urutan) / AJK+Ahli / Bidang Tugas / Alatan.
function JadualAhliJawatankuasa({ senarai, onUbah }) {
  function tambah() {
    onUbah([...senarai, { ajk: '', ahli: '', bidangTugas: '', alatan: '' }])
  }
  function ubahBaris(i, medan, nilai) {
    const baru = [...senarai]
    baru[i] = { ...baru[i], [medan]: nilai }
    onUbah(baru)
  }
  function buang(i) {
    onUbah(senarai.filter((_, idx) => idx !== i))
  }
  return (
    <div>
      <p className="text-xs font-bold text-inkmuted uppercase tracking-wide mb-2">Ahli Jawatankuasa Kerja (Lampiran A)</p>
      <div className="space-y-4">
        {senarai.map((b, i) => (
          <div key={i} className="p-3 rounded-card border border-border bg-base">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-inkmuted">Bil. {i + 1}</span>
              <button type="button" onClick={() => buang(i)} aria-label="Buang baris" className="p-1.5 rounded-card hover:bg-surface text-brand-red">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={b.ajk}
                onChange={(e) => ubahBaris(i, 'ajk', e.target.value)}
                placeholder="Nama AJK/Jawatankuasa (cth. PENGURUS TREK/URUSETIA)"
                className="w-full h-10 px-2.5 rounded-card border border-border bg-surface text-xs font-semibold"
              />
              <textarea
                value={b.ahli}
                onChange={(e) => ubahBaris(i, 'ahli', e.target.value)}
                placeholder="Ahli (satu nama satu baris)"
                rows={2}
                className="w-full px-2.5 py-2 rounded-card border border-border bg-surface text-xs resize-none"
              />
              <textarea
                value={b.bidangTugas}
                onChange={(e) => ubahBaris(i, 'bidangTugas', e.target.value)}
                placeholder="Bidang Tugas"
                rows={2}
                className="w-full px-2.5 py-2 rounded-card border border-border bg-surface text-xs resize-none"
              />
              <input
                type="text"
                value={b.alatan}
                onChange={(e) => ubahBaris(i, 'alatan', e.target.value)}
                placeholder="Alatan (pilihan)"
                className="w-full h-10 px-2.5 rounded-card border border-border bg-surface text-xs"
              />
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={tambah} className="flex items-center gap-1.5 text-xs font-semibold text-brand-red mt-3">
        <Plus size={14} /> Tambah AJK
      </button>
    </div>
  )
}

export default function KertasKerjaIsiForm({ data, onUbah, senaraiStaff }) {
  function u(kunci, nilai) {
    onUbah({ ...data, [kunci]: nilai })
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="noRuj" className="block text-sm font-medium text-ink mb-1">No. Rujukan</label>
        <input
          id="noRuj"
          type="text"
          value={data.noRuj ?? ''}
          onChange={(e) => u('noRuj', e.target.value)}
          className="w-full h-11 px-3 rounded-card border border-border bg-surface text-sm max-w-xs"
        />
      </div>

      <BlokStaff
        label='Ditujukan Kepada ("Ybrs")'
        emel={data.ybrsEmel ?? ''}
        nama={data.ybrsNama ?? ''}
        jawatan={data.ybrsJawatan ?? ''}
        senaraiStaff={senaraiStaff}
        onUbah={(perubahan) => onUbah({ ...data, ...Object.fromEntries(Object.entries(perubahan).map(([k, v]) => [`ybrs${k[0].toUpperCase()}${k.slice(1)}`, v])) })}
      />

      {SEKSYEN.map((s) => (
        <div key={s.kunci}>
          <label htmlFor={s.kunci} className="block text-sm font-medium text-ink mb-1">{s.label}</label>
          <textarea
            id={s.kunci}
            rows={5}
            value={data[s.kunci] ?? ''}
            onChange={(e) => u(s.kunci, e.target.value)}
            placeholder="Taip kandungan seksyen ni…"
            className="w-full px-3 py-2 rounded-card border border-border bg-surface text-sm resize-y"
          />
        </div>
      ))}

      <JadualJawatankuasaPelaksana
        senarai={data.jawatankuasaPelaksana ?? []}
        onUbah={(v) => u('jawatankuasaPelaksana', v)}
      />

      <JadualAhliJawatankuasa
        senarai={data.ahliJawatankuasa ?? []}
        onUbah={(v) => u('ahliJawatankuasa', v)}
      />

      <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-border">
        <BlokStaff
          label="Disediakan Oleh"
          emel={data.disediakanEmel ?? ''}
          nama={data.disediakanNama ?? ''}
          jawatan={data.disediakanJawatan ?? ''}
          tarikh={data.disediakanTarikh ?? ''}
          tunjukTarikh
          senaraiStaff={senaraiStaff}
          onUbah={(perubahan) => onUbah({ ...data, ...Object.fromEntries(Object.entries(perubahan).map(([k, v]) => [`disediakan${k[0].toUpperCase()}${k.slice(1)}`, v])) })}
        />
        <BlokStaff
          label="Disemak Oleh"
          emel={data.disemakEmel ?? ''}
          nama={data.disemakNama ?? ''}
          jawatan={data.disemakJawatan ?? ''}
          tarikh={data.disemakTarikh ?? ''}
          tunjukTarikh
          senaraiStaff={senaraiStaff}
          onUbah={(perubahan) => onUbah({ ...data, ...Object.fromEntries(Object.entries(perubahan).map(([k, v]) => [`disemak${k[0].toUpperCase()}${k.slice(1)}`, v])) })}
        />
      </div>
    </div>
  )
}
