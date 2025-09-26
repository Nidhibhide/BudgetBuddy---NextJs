const tailwindConfig = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ covers everything in src
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
};

export default tailwindConfig;
