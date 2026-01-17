/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'retro': ['"Press Start 2P"', 'cursive'],
        'pixel': ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
}
