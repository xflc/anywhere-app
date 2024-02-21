/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"


  ],  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
}

