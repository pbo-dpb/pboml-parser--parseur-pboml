module.exports = {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./.github/scripts/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'),],
}
