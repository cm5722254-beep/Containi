/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        docker: {
          blue: '#0db7ed',
          dark: '#086dd7',
          navy: '#0b192e',
        },
      },
    },
  },
  plugins: [],
};
