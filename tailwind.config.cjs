/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.js', './src/**/*.jsx'],
  mode: 'jit',
  theme: {
    fontFamily: {
      lato: "'Lato', sans-serif",
      poppins: "'Poppins', sans-serif",
      inter: "'Inter', sans-serif",
      openSans: "'Open Sans', sans-serif",
    },
    extend: {
      colors: {
        'autowhale-blue': '#176dd2',
        'color-secondary': 'rgb(var(--text-color-secondary) / <alpha-value>)',
        'color-tertiary': 'rgb(var(--text-color-tertiary) / <alpha-value>)',
      },
      backgroundColor: {
        'autowhale-blue': '#176dd2',
        'dark-1st': '#171717',
        'dark-2nd': '#1d1d1d',
        'color-primary': 'rgb(var(--bg-color-primary) / <alpha-value>)',
        'color-secondary': 'rgb(var(--bg-color-secondary) / <alpha-value>)',
        // 'color-tertiary': 'rgb(var(--bg-color-tertiary) / <alpha-value>)',
      },
      borderColor: {
        'color-primary': 'rgb(var(--bg-color-primary) / <alpha-value>)',
        'color-secondary': 'rgb(var(--bg-color-secondary) / <alpha-value>)',
        'color-tertiary': 'rgb(var(--bg-color-tertiary) / <alpha-value>)',
      },
      boxShadow: {
        'soft-xl': '0 20px 27px 0 rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 6px 13px 5px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
