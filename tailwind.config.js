/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./en.html", "./*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        body: "var(--bg-body)",
        surface: "var(--bg-surface)",
        "surface-hover": "var(--bg-surface-hover)",
        borderColor: "var(--border)",
        primaryText: "var(--text-primary)",
        secondaryText: "var(--text-secondary)",
        tertiaryText: "var(--text-tertiary)",
        brandAccent: "var(--accent)",
        brandFlame: "var(--flame)"
      }
    }
  },
  plugins: [],
};
