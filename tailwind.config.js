/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#f97316", // Laranja vibrante da Nordex
          600: "#ea580c", // Laranja mais escuro para o hover (quando passar o mouse)
        },
      },
    },
  },
  plugins: [],
};
