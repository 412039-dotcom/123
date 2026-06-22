/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.html",
    "./**/*.js"
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // 語意化色票（高質感微光暗黑風）
        surface: '#0b0f12',
        'surface-2': '#0f1720',
        card: '#0b1220',
        muted: '#9aa6b2',
        accent: '#7c3aed',
        glow: '#2a2f48',
        highlight: '#e9d5ff'
      },
      boxShadow: {
        'soft-xl': '0 10px 30px rgba(15,23,42,0.6)',
        'neon-sm': '0 4px 18px rgba(124,58,237,0.18)',
        'neon-md': '0 8px 30px rgba(124,58,237,0.20)'
      },
      backgroundImage: {
        'subtle-glow': 'linear-gradient(180deg, rgba(42,47,72,0.18) 0%, rgba(11,18,32,0.0) 100%)'
      },
      blur: {
        xs: '2px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
};
