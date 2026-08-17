/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema "Moden & Accessible" - berdasarkan logo SK Pendidikan Khas Kuantan
        base: '#FAFAFA',       // background utama
        surface: '#FFFFFF',    // kad / permukaan
        ink: '#1A1A1A',        // navbar, teks utama, hitam dari logo
        inkmuted: '#5C5C5C',   // teks sekunder
        brand: {
          red: '#C8102E',      // aksen merah dari logo
          gold: '#F2C230',     // aksen kuning emas dari logo
        },
        border: '#E5E5E5',
        tint: {
          hujungMinggu: '#F1EFE8', // latar lembut untuk sel hujung minggu (Papan RMT)
          amaran: '#FCEBEB',       // latar lembut untuk sel/medan kosong perlu perhatian (Semakan Murid)
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
