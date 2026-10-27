/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pageBg: '#F3ECE6',
        pageBgLight: '#F7F2EE',
        cardBg: '#FBF8F5',
        cardBorder: '#EDE4DC',
        terracotta: {
          DEFAULT: '#A8582F',
          hover: '#94491F',
          tint: '#F3DFD2',
        },
        darkGreen: {
          DEFAULT: '#0F3D36',
          darker: '#0B2F2A',
        },
        brandText: {
          primary: '#2B2321',
          secondary: '#6B5F59',
          muted: '#9A8F89',
        },
        status: {
          successText: '#3F7D5B',
          successBg: '#DCEBDD',
          warningText: '#B5651D',
          warningBg: '#F6E1CC',
          dangerText: '#C0392B',
          dangerBg: '#F9D9D5',
        },
        tricolor: {
          saffron: '#E8832A',
          white: '#FFFFFF',
          green: '#1F7A4D',
        },
        chart: {
          submitted: '#0F3D36',
          review: '#A8582F',
          verified: '#E8D9CC',
          issues: '#9A9A9A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '10px',
        pill: '6px',
        sidebar: '22px',
      },
      boxShadow: {
        card: '0 2px 10px rgba(120,80,50,0.06)',
        'card-lift': '0 6px 20px rgba(120,80,50,0.12)',
        dropdown: '0 12px 32px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
