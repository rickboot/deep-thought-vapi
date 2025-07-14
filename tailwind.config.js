/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // "./app/**/*.{js,ts,jsx,tsx,mdx}", // add if using Next.js app dir
  ],
  theme: { extend: {} },
  plugins: [],
};
