/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00e5ff",
        secondary: "#5865F2",
        dark: "#050505",
      },
    },
  },
  plugins: [],
}
