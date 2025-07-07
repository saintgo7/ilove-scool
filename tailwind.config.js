/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'facebook-blue': '#1877F2',
        'facebook-dark': '#42526E',
        'facebook-light': '#F0F2F5',
        'facebook-gray': '#65676B',
        'facebook-green': '#42B883',
      },
      fontFamily: {
        'sans': ['Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'facebook': '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)',
        'facebook-hover': '0 4px 8px rgba(0, 0, 0, .15), 0 12px 24px rgba(0, 0, 0, .15)',
      },
      borderRadius: {
        'facebook': '8px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}