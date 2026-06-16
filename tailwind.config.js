/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#f37021", dark: "#d85a12", soft: "#fff3e8" },
        fpt: {
          orange: "#f37021",
          "orange-dark": "#d85a12",
          "orange-soft": "#fff3e8",
          blue: "#005baa",
          "blue-dark": "#00478a",
          "blue-soft": "#e8f2ff",
          green: "#46b946",
          "green-dark": "#2f922f",
          "green-soft": "#ebfaeb",
        },
        ink: "#0f172a",
        muted: "#64748b",
      },
      boxShadow: {
        card: "0 8px 30px rgba(15, 23, 42, 0.07)",
        lift: "0 18px 50px rgba(15, 23, 42, 0.14)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
