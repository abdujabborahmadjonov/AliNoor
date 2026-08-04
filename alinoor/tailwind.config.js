/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--an-bg) / <alpha-value>)',
        panel: 'rgb(var(--an-panel) / <alpha-value>)',
        panel2: 'rgb(var(--an-panel2) / <alpha-value>)',
        ink: 'rgb(var(--an-ink) / <alpha-value>)',
        ink2: 'rgb(var(--an-ink2) / <alpha-value>)',
        ink3: 'rgb(var(--an-ink3) / <alpha-value>)',
        mute: 'rgb(var(--an-mute) / <alpha-value>)',
        faint: 'rgb(var(--an-faint) / <alpha-value>)',
        line: 'rgb(var(--an-line) / <alpha-value>)',
        linestrong: 'rgb(var(--an-lineStrong) / <alpha-value>)',
        accent: 'rgb(var(--an-accent) / <alpha-value>)',
        ember: 'rgb(var(--an-ember) / <alpha-value>)',
        good: 'rgb(var(--an-good) / <alpha-value>)',
        warn: 'rgb(var(--an-warn) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(20,18,15,.03), 0 1px 2px rgba(20,18,15,.04)',
        pop: '0 24px 60px rgba(20,18,15,.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
