module.exports = {
  content: [
    "./editor.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      height: {
        '128': '32rem',
      }

    },
  },
  plugins: [require('@tailwindcss/typography'),],
}
