/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1B33",
          soft: "#1B2C4F",
        },
        paper: {
          DEFAULT: "#F7F8FA",
          dim: "#EBEEF3",
        },
        navy: {
          DEFAULT: "#1F3A63",
          light: "#3E5C8A",
          dark: "#122544",
        },
        amber: {
          DEFAULT: "#B4832F",
          light: "#D9AA5F",
        },
        rule: "#DCE1E9",
        slate: {
          DEFAULT: "#5B6472",
        },
      },
      fontFamily: {
        display: ["'IBM Plex Serif'", "ui-serif", "Georgia", "serif"],
        body: ["'IBM Plex Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27, 36, 48, 0.06), 0 1px 1px rgba(27, 36, 48, 0.04)",
        rail: "inset 1px 0 0 0 #E4E1D8",
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 2s ease-in-out infinite",
        riseIn: "riseIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
